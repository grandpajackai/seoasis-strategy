# Workspace assistant — visual review

Reviewed 2026-10-14. Scope: the assistant addition, its relationship to the existing SEOasis client workspace, and presentation of evidence and model status. This review does not replace the application’s functional and model-output checks.

## Desktop evidence

- `qa/assistant-welcome.jpg`: 1280 × 720 viewport; initial source-based research mode.
- `qa/assistant-local-ai.jpg`: 1280 × 720 viewport; actual local AI response, with source references and the evidence accordion.
- `qa/assistant-mobile.jpg`: 390 × 844 viewport; source-based research mode with a loaded local model, Collections context, and the welcome view positioned at its start.

## Result

**Pass. No material visual defects identified in the reviewed desktop and mobile views.**

- The forest, cream, quiet borders, and typography complement the existing dashboard. The assistant reads as part of the workspace, rather than an unrelated chatbot overlay.
- A focused 474 px drawer preserves the underlying page as context. Its backdrop provides sufficient separation, while the heading and close control remain clear.
- The corrected welcome view starts at the headline. Suggested questions belong to the current workstream; the composer remains visible while research content scrolls separately.
- Model activation is optional and distinct from immediately available research chat. The initial download size and WebGPU requirement are visible before activation. Local AI readiness and source-based research use different mode labels.
- Response text, numbered references, evidence count, and the draft verification note form a clear hierarchy. The source accordion gives an intentional path from generated interpretation to the supporting records.
- The composer, clear control, and follow-up suggestions are restrained and recognizable. The design avoids adding a second navigation system or dense dashboard charts to the conversation.

At a 720 px viewport height, some welcome suggestions fall below the conversation region’s fold. They remain in the scrollable region while the composer stays available; this is expected compact-height behavior, not page overflow.

## Mobile visual check

The 390 × 844 view retains the hierarchy without horizontal clipping. The full-width drawer, close control, current mode, model action, headline, Collections-specific question, and composer all fit the narrow layout. The composer remains visually separate from scrolling suggestions, its input text is comfortably sized, and the bottom session note remains visible. Two complete starter questions are visible above it; remaining suggestions can be reached by scrolling the conversation region. No mobile visual repair was needed.

## Content note passed to the implementation lead

An AI sample used “Continue measuring…”. For this unconnected prototype, model instructions should prefer “Baseline”, “Connect”, or “Validate” when measurement has not been established. The persistent “no live account connection” label is visible, but individual recommendations should also avoid suggesting that private performance is already connected.

The implementation lead has updated the generation instructions to require “could measure” or “validate” wording and to start the proposed next step with “Validate”, “Confirm”, “Baseline”, or “Test”. Verification of the regenerated answer belongs to the final model-output checks.

## Review boundary

Visual evidence supports the desktop and mobile results above. Keyboard operation, link navigation, stop/cancel behavior, private-data refusal, model inference, and mobile interaction checks are recorded by the release QA workstream separately. Browser compatibility and available device memory determine whether optional local AI can run; source-based research must remain usable independently.
