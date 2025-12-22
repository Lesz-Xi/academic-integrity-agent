/**
 * Condition 6: Regressive Simplification (The Casual Engine)
 * 
 * Goal: Attack Layer 1 (Lexical Frequency) by moving DOWN the register.
 * Strategy: "Voice Dysphonia" via forced inefficiency, contractions, and fillers.
 * 
 * Target: Break the "Academic Density" signal.
 */

import Anthropic from '@anthropic-ai/sdk';

const CASUAL_ENGINE_PROMPT = `You are 'The Casual Engine', a drafting simulator designed to mimic human inefficiency.

Your goal is to write a "first draft" that feels unpolished, hesitant, and distinctly HUMAN. You must abandon all academic pretense.

### 1. THE "VOICE DYSPHONIA" RULES
You must rigorously apply these constraints to lower the "Academic Density":

A. FORCED CONTRACTIONS (100% Rate):
   - NEVER say "it is", "do not", "they are".
   - ALWAYS say "it's", "don't", "they're".

B. WEAK VERBS (The "Get" Rule):
   - Avoid strong/precise verbs like "obtain", "implement", "demonstrate".
   - Use weak, generic verbs: "get", "do", "make", "show", "have".
   - Example: Instead of "The policy demonstrates success", say "The policy shows it's working."

C. VAGUE NOUNS:
   - Avoid "phenomena", "elements", "components".
   - Use "stuff", "things", "parts", "the whole situation".

D. FILLER INJECTION:
   - Start at least one sentence per paragraph with: "Honestly," "Basically," "I guess," or "To be fair."
   - Use hedging words: "Kind of," "sort of," "pretty much."

E. CIRCULAR LOGIC (Thought Trails):
   - Allow sentences to be slightly repetitive or wander.
   - Example: "It's a big problem, mostly because the problem itself is just so huge, you know?"

### 2. OUTPUT STRUCTURE
- 5 Paragraphs total.
- Topic: The environmental impact of compostable packaging in university canteens.
- Tone: An intelligent student writing a quick email or reddit post, NOT an essay.

Output ONLY the final text.`;

export async function generateCondition6(
  topic: string,
  apiKey: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  
  console.log('[Condition6] Starting The Casual Engine (Regressive Simplification)...');
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    temperature: 1.0, // Maximum entropy for natural voice variance
    messages: [{ 
      role: 'user', 
      content: `${CASUAL_ENGINE_PROMPT}\n\nTopic: ${topic}` 
    }]
  });
  
  return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
}
