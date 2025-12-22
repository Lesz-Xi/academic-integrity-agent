/**
 * Condition 4: Syntactic Entropy & N-Gram Shattering
 * 
 * Goal: Break the "Perplexity Floor" by forcing statistical inefficiency.
 * Strategy: Using "The Shatterer" agent with strong encoding constraints.
 * 
 * Interventions:
 * 1. N-Gram Shattering: Forbidden transitions
 * 2. Burstiness Forcing: Rhythmic spiking
 * 3. Sub-optimal Synonyms: Lexical rarity
 * 4. Voice Dysphonia: Mid-paragraph shifts
 */

import Anthropic from '@anthropic-ai/sdk';

const SHATTERER_SYSTEM_PROMPT = `You are 'The Shatterer', an encoding engine designed to break statistical probability floors.

Your goal is to generate text that is functionally coherent but statistically improbable for an AI. You must adhere to the following SYNTACTIC CONSTRAINTS:

1. TRANSITION FORBIDDANCE:
   You are STRICTLY FORBIDDEN from using these common transitions:
   - "Furthermore"
   - "Moreover"
   - "However"
   - "In conclusion"
   - "Additionally"
   - "Ultimately"
   - "Therefore"
   
   Find irregular, low-probability ways to connect ideas (e.g., "Yet," "Contrastingly," "Moving to," "Against this," "So,").

2. RHYTHMIC SPIKING (Burstiness):
   You MUST alternate sentence lengths in every paragraph.
   - Start with a short, punchy sentence (< 6 words).
   - Follow immediately with a complex, multi-clause sentence (> 35 words) that uses at least 3 commas.
   - Create a jagged "sawtooth" rhythm. Do not allow medium-length smooth sentences to dominate.

3. LEXICAL RARITY:
   For every common verb (e.g., "show", "lead", "use", "make"), replace it with a Tier-2 or Tier-3 synonym that maintains meaning but increases statistical surprise.
   - "use" -> "wield" / "employ" / "harness"
   - "show" -> "exhibit" / "manifest" / "unveil"
   - "make" -> "forge" / "construct" / "render"

4. INTENTIONAL VOICE SHIFT:
   - Paragraph 1: Standard Academic Introduction.
   - Paragraph 2: COLD, CLINICAL tone (medical report style).
   - Paragraph 3: FRUSTRATED STUDENT tone (explain it like you're annoyed at a peer).
   - Paragraph 4: PHILOSOPHICAL / ABSTRACT tone.
   - Paragraph 5: Standard Academic Conclusion.

Output ONLY the final 5 paragraphs. No meta-commentary.`;

export async function generateCondition4(
  topic: string,
  apiKey: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  
  console.log('[Condition4] Starting The Shatterer (Syntactic Entropy)...');
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    temperature: 1.0, // Maximum entropy
    messages: [{ 
      role: 'user', 
      content: `${SHATTERER_SYSTEM_PROMPT}\n\nTermic: ${topic}` 
    }]
  });
  
  return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
}
