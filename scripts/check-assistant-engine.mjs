import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual engine module. Only its browser/model transport is stubbed:
// the stub deliberately retains a backend lock when a frontend iterator is
// abandoned, matching WebLLM 0.2.85's worker stream behavior.
const sourcePath =
  process.env.ASSISTANT_ENGINE_SOURCE || "lib/assistant-engine.ts";
const source = fs
  .readFileSync(path.resolve(sourcePath), "utf8")
  .replaceAll("import.meta.url", '"https://example.test/engine.js"');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function bounded(promise, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Timed out: ${label}`)),
          2000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function flush() {
  for (let i = 0; i < 12; i += 1) await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
}

function fixture(name, { early = false, malformed = false } = {}) {
  const initialization = deferred();
  if (!early) initialization.resolve();
  return {
    name,
    initialization,
    started: deferred(),
    first: deferred(),
    draining: deferred(),
    eof: deferred(),
    text: malformed
      ? '{"answer":"Stopped unfinished answer'
      : JSON.stringify({ answer: `${name} grounded answer.`, evidence: [1] }),
  };
}

function harness(fixtures) {
  const calls = [];
  const engines = [];
  const requests = [];
  const tokens = [];
  class FakeWorker {
    constructor() {
      this.terminated = false;
    }
    terminate() {
      this.terminated = true;
    }
  }
  class FakeEngine {
    constructor(worker) {
      this.worker = worker;
      this.locked = false;
      this.waiters = [];
      this.interrupts = 0;
      this.interrupted = false;
      engines.push(this);
      this.chat = { completions: { create: this.create.bind(this) } };
    }
    async reload() {
      assert.equal(this.worker.terminated, false);
    }
    interruptGenerate() {
      this.interrupted = true;
      this.interrupts += 1;
    }
    async create() {
      const entry = fixtures[calls.length];
      assert.ok(entry, "Unexpected model request");
      calls.push(entry.name);
      if (this.locked)
        await new Promise((resolve) => this.waiters.push(resolve));
      this.locked = true;
      entry.started.resolve();
      await entry.initialization.promise;
      const local = this;
      let step = 0;
      return {
        [Symbol.asyncIterator]() {
          return this;
        },
        async next() {
          if (step++ === 0) {
            // WebLLM resets its interrupt flag as stream initialization starts.
            local.interrupted = false;
            await entry.first.promise;
            if (local.worker.terminated) throw new Error("Worker terminated");
            return {
              done: false,
              value: { choices: [{ delta: { content: entry.text } }] },
            };
          }
          entry.draining.resolve();
          await entry.eof.promise;
          if (local.worker.terminated) throw new Error("Worker terminated");
          local.locked = false;
          local.waiters.splice(0).forEach((resolve) => resolve());
          return { done: true, value: undefined };
        },
        async return() {
          // Returning the frontend proxy does not return the hidden backend
          // generator, so the real backend lock stays held.
          return { done: true, value: undefined };
        },
      };
    }
  }
  const module = { exports: {} };
  const actualModules = new Map();
  const context = vm.createContext({
    module,
    exports: module.exports,
    console,
    URL,
    Worker: FakeWorker,
    window: { isSecureContext: true },
    navigator: {
      gpu: {
        requestAdapter: async () => ({ features: new Set(["shader-f16"]) }),
      },
    },
    setTimeout: (callback, ms) => {
      const timer = setTimeout(callback, ms);
      timer.unref();
      return timer;
    },
    clearTimeout,
    require: (id) => {
      if (id === "@mlc-ai/web-llm") return { WebWorkerMLCEngine: FakeEngine };
      if (id === "./assistant-knowledge")
        return {
          needsPrivateData: () => false,
          buildGroundingContext: () => "[1] OBSERVED: saved public evidence.",
        };
      if (id === "./assistant-draft") {
        if (!actualModules.has(id)) {
          const actual = { exports: {} };
          const output = ts.transpileModule(
            fs.readFileSync(path.resolve("lib/assistant-draft.ts"), "utf8"),
            {
              compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2020,
                esModuleInterop: true,
              },
            },
          ).outputText;
          const load = new vm.Script(
            `(function(exports, require, module) {\n${output}\n})`,
            { filename: "assistant-draft.fixture.cjs" },
          ).runInContext(context);
          load(actual.exports, context.require, actual);
          actualModules.set(id, actual.exports);
        }
        return actualModules.get(id);
      }
      throw new Error(`Unexpected fixture import: ${id}`);
    },
  });
  new vm.Script(compiled, {
    filename: "assistant-engine.fixture.cjs",
  }).runInContext(context);
  const api = module.exports;
  return {
    api,
    calls,
    engines,
    tokens,
    ask(name) {
      const result = api.streamLocalReply({
        question: name,
        history: [],
        evidence: [
          {
            id: "fixture-1",
            content: "Action: Validate the saved public evidence.",
            sources: [],
          },
        ],
        onToken: (text) => tokens.push({ name, text }),
      });
      // Preserve rejection for assertions while preventing timing-dependent
      // unhandled-rejection warnings during explicit cancellation.
      void result.catch(() => undefined);
      requests.push(result);
      return result;
    },
    async close() {
      await api.unloadLocalAI();
      await Promise.allSettled(requests);
    },
  };
}

async function stopThenNext({ early = false } = {}) {
  const first = fixture("stopped", { early, malformed: true });
  const second = fixture("next");
  const h = harness([first, second]);
  try {
    await h.api.loadLocalAI(() => undefined);
    const stopped = h.ask("stopped");
    await bounded(first.started.promise, "first generation starts");
    h.api.interruptLocalAI();
    await assert.rejects(bounded(stopped, "Stop settles immediately"), {
      name: "AbortError",
    });
    const next = h.ask("next");
    await flush();
    assert.deepEqual(
      h.calls,
      ["stopped"],
      "New generation started before old stream drained",
    );
    first.initialization.resolve();
    first.first.resolve();
    await bounded(first.draining.promise, "stopped stream silently drains");
    assert.equal(h.tokens.length, 0, "Stopped content leaked into the UI");
    assert.ok(h.engines[0].interrupts >= 2, "Early stop must be reasserted");
    assert.deepEqual(h.calls, ["stopped"], "Queue advanced before backend EOF");
    first.eof.resolve();
    await bounded(second.started.promise, "next generation waits for drain");
    second.first.resolve();
    second.eof.resolve();
    const answer = await bounded(next, "next generation completes");
    assert.match(answer, /next grounded answer/);
    assert.match(answer, /\[1\]/);
    assert.ok(h.tokens.every((token) => token.name === "next"));
    assert.equal(h.engines[0].locked, false, "Backend lock was not released");
  } finally {
    await h.close();
  }
}

async function unloadThenReload() {
  const first = fixture("unloaded", { early: true, malformed: true });
  const second = fixture("fresh");
  const h = harness([first, second]);
  try {
    await h.api.loadLocalAI(() => undefined);
    const old = h.ask("unloaded");
    await bounded(first.started.promise, "old generation starts");
    await h.api.unloadLocalAI();
    await assert.rejects(bounded(old, "unload cancels response"), {
      name: "AbortError",
    });
    assert.equal(h.engines[0].worker.terminated, true);
    await h.api.loadLocalAI(() => undefined);
    const fresh = h.ask("fresh");
    await bounded(
      second.started.promise,
      "fresh engine ignores abandoned tail",
    );
    assert.equal(h.engines.length, 2);
    second.first.resolve();
    second.eof.resolve();
    assert.match(
      await bounded(fresh, "fresh generation completes"),
      /fresh grounded/,
    );
    first.initialization.resolve();
    first.first.resolve();
    await flush();
    assert.ok(h.tokens.every((token) => token.name === "fresh"));
  } finally {
    await h.close();
  }
}

async function stopAgainWhileQueued() {
  const first = fixture("stopped", { malformed: true });
  const last = fixture("last");
  const h = harness([first, last]);
  try {
    await h.api.loadLocalAI(() => undefined);
    const old = h.ask("stopped");
    await bounded(first.started.promise, "first queued scenario starts");
    h.api.interruptLocalAI();
    await assert.rejects(old, { name: "AbortError" });
    const queued = h.ask("cancelled-while-queued");
    await flush();
    h.api.interruptLocalAI();
    await assert.rejects(queued, { name: "AbortError" });
    const latest = h.ask("last");
    await flush();
    assert.deepEqual(h.calls, ["stopped"]);
    first.first.resolve();
    await bounded(first.draining.promise, "first queued scenario drains");
    first.eof.resolve();
    await bounded(last.started.promise, "latest request skips cancelled queue");
    last.first.resolve();
    last.eof.resolve();
    assert.match(
      await bounded(latest, "latest response completes"),
      /last grounded/,
    );
    assert.deepEqual(h.calls, ["stopped", "last"]);
    assert.ok(h.tokens.every((token) => token.name === "last"));
  } finally {
    await h.close();
  }
}

async function workerFailureThenReload() {
  const first = fixture("failed", { early: true });
  const second = fixture("recovered");
  const h = harness([first, second]);
  try {
    await h.api.loadLocalAI(() => undefined);
    const old = h.ask("failed");
    await bounded(first.started.promise, "worker failure scenario starts");
    h.engines[0].worker.onerror(new Error("Fixture worker failure"));
    await assert.rejects(
      bounded(old, "worker failure settles response"),
      /worker stopped/,
    );
    assert.equal(h.engines[0].worker.terminated, true);
    await h.api.loadLocalAI(() => undefined);
    const recovered = h.ask("recovered");
    await bounded(second.started.promise, "reload clears failed drain tail");
    second.first.resolve();
    second.eof.resolve();
    assert.match(
      await bounded(recovered, "recovered response completes"),
      /recovered grounded/,
    );
    first.initialization.resolve();
    first.first.resolve();
    await flush();
    assert.ok(h.tokens.every((token) => token.name === "recovered"));
  } finally {
    await h.close();
  }
}

async function rejectUnsupportedDraftBeforeDisplay() {
  const unsafe = fixture("unsafe");
  const safe = fixture("accepted-after-guard");
  unsafe.text = JSON.stringify({
    answer: "Weak stock or margins should not lower collection priority.",
    evidence: [1],
  });
  const h = harness([unsafe, safe]);
  try {
    await h.api.loadLocalAI(() => undefined);
    const result = h.ask("unsafe");
    await bounded(unsafe.started.promise, "guarded generation starts");
    unsafe.first.resolve();
    unsafe.eof.resolve();
    await assert.rejects(bounded(result, "unsafe draft is rejected"), {
      name: "EvidenceError",
    });
    assert.equal(
      h.tokens.length,
      0,
      "An unchecked draft leaked into the UI before grounding validation",
    );
    assert.equal(h.engines[0].locked, false);
    const accepted = h.ask("accepted-after-guard");
    await bounded(
      safe.started.promise,
      "valid request after rejected draft starts",
    );
    safe.first.resolve();
    safe.eof.resolve();
    assert.match(
      await bounded(accepted, "valid response after rejected draft completes"),
      /accepted-after-guard grounded answer/,
    );
    assert.ok(
      h.tokens.every((token) => token.name === "accepted-after-guard"),
      "Rejected draft affected a subsequent response",
    );
  } finally {
    await h.close();
  }
}

await stopThenNext();
await stopThenNext({ early: true });
await unloadThenReload();
await stopAgainWhileQueued();
await workerFailureThenReload();
await rejectUnsupportedDraftBeforeDisplay();
console.log(
  "PASS: actual assistant engine — Stop/immediate next, early Stop, queued Stop, silent EOF drain, stale-token suppression, unload/fresh reload, worker failure/reload, and unsafe-draft rejection before display.",
);
