import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync("lib/assistant-draft.ts", "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const module = { exports: {} };
new vm.Script(code).runInNewContext({ module, exports: module.exports });
const { assertGroundedDraft } = module.exports;

const rejected = [
  "You should not assume a high-intent cluster is a poor commercial priority if these metrics are weak or existing pages already satisfy demand.",
  "To validate stock, margin, and search intent before a Shopify collection-page pilot ensures commercial constraints are met prior to data gathering, reducing risk of invalid assumptions.",
  "Validation occurs prior to data gathering.",
  "Validate the account before collecting account data.",
  "Weak stock or margins should not lower collection priority.",
  "This schema guarantees a 20% uplift in organic clicks.",
  "Organic revenue growth is guaranteed.",
  "SEO guarantees revenue uplift. Stock constraints are not verified.",
  "Stock is not weak and SEO guarantees revenue uplift.",
];
for (const draft of rejected) {
  assert.throws(
    () => assertGroundedDraft(draft),
    (error) => error?.name === "EvidenceError",
    `Reject observed unsafe implication: ${draft}`,
  );
}

const accepted = [
  "A high-intent cluster can still be a poor commercial priority if inventory is shallow, margin is weak or existing pages already satisfy demand.",
  "Do not assume high search intent guarantees commercial value. Validate stock, margin and existing-page fit.",
  "Weak margin may lower priority; use account inputs before choosing a pilot.",
  "Weak stock should not lower priority of fixing inventory data.",
  "Gather account data, then validate stock, margin and search intent before a collection-page pilot.",
  "Validation cannot ensure commercial constraints are met before gathering account data.",
  "Account validation cannot happen prior to data gathering.",
  "Do not validate an account before collecting account data.",
  "Before data gathering, agree the account's scope and owner.",
  "No schema guarantees a 20% uplift in organic clicks.",
  "SEO does not guarantee revenue growth.",
  "We cannot guarantee organic revenue uplift.",
  "Guaranteed organic revenue growth is not supported by this dataset.",
  "Could clearer collection links improve qualified visits? This is an opportunity to test, with no uplift forecast.",
  "Compare search intent, existing collection coverage, in-stock assortment and margin using authorized account inputs. Optimize a useful existing page or pilot one viable distinct assortment.",
  "Next grounded answer.",
];
for (const draft of accepted) {
  assert.doesNotThrow(
    () => assertGroundedDraft(draft),
    `Keep legitimate boundary or grounded answer: ${draft}`,
  );
}
console.log(
  `PASS: ${rejected.length} known reversed/guaranteed implications rejected; ${accepted.length} grounded answers and legitimate cautions accepted. Narrow regression guard, not general entailment verification.`,
);
