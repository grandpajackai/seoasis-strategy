/**
 * Reject a small set of observed unsafe implications before accepting an AI
 * draft. This is a regression guard, not a general semantic-entailment test.
 */
export function assertGroundedDraft(text: string): void {
  const normalized = text.toLowerCase().replace(/[’‘]/g, "'");
  const sentences = normalized
    .split(/[.!?](?:\s|$)|\n+/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const reject = (reason: string): never => {
    const error = new Error(
      `The AI draft could not be supported by the workspace evidence: ${reason}. Use the source-based summary.`,
    );
    error.name = "EvidenceError";
    throw error;
  };

  for (const sentence of sentences) {
    const commercialRisk =
      /\b(?:weak|shallow|unavailable|out[- ]of[- ]stock|insufficient|limited)\b/.test(
        sentence,
      ) &&
      /\b(?:stock|inventory|assortment|margin|economics|metrics|products)\b/.test(
        sentence,
      );
    const existingIntentCovered =
      /\bexisting (?:pages?|urls?|collections?)\b.{0,70}\b(?:already )?(?:satisf(?:y|ies)|cover(?:s)?|serv(?:e|es))\b.{0,45}\b(?:demand|intent|need)\b/.test(
        sentence,
      );
    if (
      (commercialRisk || existingIntentCovered) &&
      /\b(?:should not|shouldn't|must not|mustn't|do not|don't)\s+(?:assume|consider|treat)\b.{0,180}\b(?:poor|low|lower|weak)\s+(?:commercial\s+)?priority\b/.test(
        sentence,
      )
    )
      reject("a commercial-priority caveat was reversed");
    if (
      commercialRisk &&
      /\b(?:collection|cluster|category|new page)\b/.test(sentence) &&
      /\b(?:should not|shouldn't|must not|mustn't|does not|doesn't|do not|don't)\s+(?:lower|reduce|decrease)\b.{0,40}\bpriority\b/.test(
        sentence,
      )
    )
      reject("weak commercial inputs were said not to lower priority");

    const validation = /\b(?:validation|validat(?:e|es|ed|ing))\b/.test(
      sentence,
    );
    if (validation) {
      const guaranteedConstraints =
        /\b(?:ensures?|guarantees?)\b.{0,70}\bconstraints\b.{0,25}\b(?:are |have been |will be )?met\b/.exec(
          sentence,
        );
      if (
        guaranteedConstraints &&
        !negatedBefore(sentence, guaranteedConstraints.index)
      )
        reject(
          "validation was presented as a guarantee that constraints are met",
        );
      const prematureValidation =
        /\b(?:prior to|before)\s+(?:any\s+)?(?:data (?:gathering|collection)|(?:gathering|collecting)\s+(?:the\s+)?(?:account\s+)?data)\b/.exec(
          sentence,
        );
      if (
        prematureValidation &&
        !negatedBefore(sentence, prematureValidation.index) &&
        !/\b(?:cannot|can't|does not|doesn't|do not|don't|should not|shouldn't|never)\b.{0,90}\bvalidat/.test(
          sentence,
        ) &&
        !/\bvalidat\w*\b.{0,60}\b(?:cannot|can't|does not|doesn't|should not|shouldn't|never)\b/.test(
          sentence,
        )
      )
        reject(
          "account validation was placed before collecting its required inputs",
        );
    }

    const outcome =
      /\b(?:revenue|clicks?|traffic|rankings?|conversions?)\b/.test(sentence) &&
      /\b(?:seo|organic|search|schema|uplift|growth|increase|improve(?:ment)?|boost|lift)\b/.test(
        sentence,
      );
    if (outcome) {
      for (const guarantee of sentence.matchAll(/\bguarantee(?:s|d|ing)?\b/g)) {
        if (
          !negatedBefore(sentence, guarantee.index || 0) &&
          !/\b(?:is|are|would be|can be)\s+(?:not|never)\s+(?:supported|assumed|claimed|promised)\b/.test(
            sentence,
          )
        )
          reject("an unmeasured SEO outcome was guaranteed");
      }
    }
  }
}

/** Recognize nearby negative cautions without treating remote negation as proof. */
function negatedBefore(sentence: string, index: number): boolean {
  const before =
    sentence
      .slice(Math.max(0, index - 85), index)
      .split(/[;,:]|\band\b|\bbut\b/)
      .pop() || "";
  return /\b(?:no|not|never|cannot|can't|don't|doesn't|won't|without|avoid)\s+(?:[a-z'-]+\s+){0,4}$/.test(
    before,
  );
}
