/**
 * Condition 5: Collocation Shattering (The Thesaurus Engine)
 * 
 * Goal: Attack Layer 1 (Lexical Frequency) by lowering token-pair probability.
 * Strategy: "Statistical Surprise" via Tier-3 synonyms and Noun-Verb Mismatch.
 * 
 * Target: Break the "Collocation Trap" (e.g. "delicate balance", "holds promise").
 */

import Anthropic from '@anthropic-ai/sdk';

const THESAURUS_ENGINE_PROMPT = `You are 'The Thesaurus Engine', a linguistic generator designed to minimize N-Gram probability.

Your goal is to write about a standard topic in a way that creates "Statistical Surprise" at every token transition. You must sound academic but use an IDIOSYNCRATIC vocabulary that avoids common AI collocations.

### 1. THE BLACKLIST (Strictly Forbidden Phrases)
You must NOT use any of these high-probability AI markers:
- "Delicate balance" / "Fragile balance"
- "Broader implications" / "Wider implications"
- "Holds promise" / "Shows promise"
- "Path forward" / "Way forward"
- "Innovative solutions" / "Creative solutions"
- "Crucial role" / "Essential part"
- "Nuanced landscape" / "Complex issue" / "Multifaceted issue"
- "In conclusion" / "Ultimately"

### 2. THE INEFFICIENCY ALGORITHMS
Apply these rules to every sentence:

A. LOW-FREQUENCY SYNONYMY (Tier-3 Words):
   - Never use "important". Use "pivotal", "cardinal", "axiomatic".
   - Never use "show". Use "evinces", "betokens", "manifests".
   - Never use "delicate". Use "tenuous", "precarious", "friable".
   
B. NOUN-VERB MISMATCH:
   - Pair nouns with verbs that are semantically valid but statistically rare.
   - Standard: "The packaging reduces waste."
   - Mismatch: "The packaging *curtails* the waste-flow."
   - Mismatch: "The policy *anchors* the drift."

C. SYNTACTIC FRICTION:
   - Include one minor grammatical eccentricity per paragraph to mimic human drafting haste.
   - Example: Ending a sentence with a preposition ("...a problem we must deal with.").
   - Example: Unusually placed adverb ("It effectively is...").

### 3. OUTPUT STRUCTURE
- 5 Paragraphs total.
- Maintain coherence, but sacrifice "smoothness" for "uniqueness".
- Topic: The environmental impact of compostable packaging in university canteens.

Output ONLY the final text.`;

export async function generateCondition5(
  topic: string,
  apiKey: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  
  console.log('[Condition5] Starting The Thesaurus Engine (Collocation Shattering)...');
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    temperature: 1.0, // Maximum entropy for tail-end sampling
    messages: [{ 
      role: 'user', 
      content: `${THESAURUS_ENGINE_PROMPT}\n\nTopic: ${topic}` 
    }]
  });
  
  return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
}
