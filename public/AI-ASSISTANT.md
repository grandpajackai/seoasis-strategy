# Workspace assistant

This feature helps a reviewer discuss the dashboard’s public research, understand evidence, prepare client assessments, and explore proposed work. It preserves the distinction between SEOasis as an agency example and its Shopify client frameworks.

## Two explicit modes

- **Research:** browser-local retrieval and extractive summaries from the existing JSON research. No language model is involved. This is the immediate, broadly compatible way to inspect findings and sources.
- **Local AI:** genuine model generation through WebLLM in a dedicated browser worker, grounded in retrieved research and a short conversation history. The user enables this mode before model assets download. No model request is sent to a hosted inference API.

The zero API bill comes from using the visitor’s device for inference. GitHub Pages continues to serve the static application. No secret, paid API credential, proxy, account, or backend is introduced. Model downloads use the public locations configured by the pinned official WebLLM package. First use needs approximately 500 MB of downloads and roughly 2 GB of available GPU memory. A supported GPU/browser, sufficient storage, and access to the public model host are required; model files may be reused from browser cache.

## Grounding and evidence

`lib/assistant-knowledge.ts` indexes concise records from the research, synthesis, backlog, roadmap, and source ledger. Retrieval combines the question, relevant follow-up context, and the current section. Each evidence card retains its classification, confidence, section, and validated source records. The model receives a bounded evidence excerpt rather than the entire corpus.

`lib/assistant-engine.ts` loads Qwen3.5 0.8B through WebLLM’s prebuilt mapping, using f16 when supported and f32 otherwise. It retains the model’s hybrid-state configuration and disables thinking output. It limits context and output, streams the response, and supports cancellation. Stopped streams drain silently to release the worker’s model lock; subsequent requests wait for that drain before starting. A timeout resets the worker so it can be reloaded. `lib/assistant-worker.ts` runs inference away from the UI thread. Model code is loaded on demand; visiting the dashboard does not download model weights. First setup can take a few minutes, depending on the connection and device.

The system instructions preserve evidence classifications, attributed marketing claims, the agency/client distinction, and unavailable-data limits. A constrained JSON response requires evidence numbers from the supplied records. The application labels generated analysis INFERRED and attaches a documented next action from a cited record, when one is available. The UI takes source URLs from the ledger and safely renders model text. Retrieved citations make the response inspectable; they do not prove that every generated statement is correct. Generated responses remain drafts for human verification.

Actual private-performance questions are routed to a source-based internal-access explanation. No GSC, GA4, Shopify, Merchant Center, Asana, live ranking, or AI visibility connection exists. Unknown topics should return an evidence limitation rather than a fabricated answer. The assistant cannot execute account changes, post messages, or change the dashboard backlog.

## Privacy and state

Questions and generated answers are held in tab memory. Closing and reopening the drawer retains that session; reloading clears it. Clear conversation removes the current session history. Model assets may remain in the browser’s cache. Research data is the same public snapshot already published with the dashboard. The assistant does not fine-tune or train a model, collect private client data, upload chat history, or perform live browsing.

## Primary implementation references

Reviewed 14 October 2026:

- [WebLLM getting started](https://webllm.mlc.ai/docs/user/get_started.html): browser-local WebGPU inference and installation.
- [WebLLM basic usage](https://webllm.mlc.ai/docs/user/basic_usage.html): model loading, progress, caching considerations, and streaming generation.
- [WebLLM workers](https://webllm.mlc.ai/docs/user/advanced_usage.html): the official worker handler and frontend engine pattern.
- [Official model configuration](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts): model identifiers, artifact URLs, and memory estimates. The deployed app uses the pinned package’s matching configuration.

## Verification

See `QA-REPORT.md` for the actual release checks and their limits. Local AI availability is detected on the visitor’s device. A working Research mode is not proof that model inference ran; runtime generation checks must be recorded separately.
