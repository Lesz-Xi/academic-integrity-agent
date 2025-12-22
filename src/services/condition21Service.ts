/**
 * Condition 2.1: Multi-Stage Generation with STRONGER Memory Decay
 * 
 * Implements information asymmetry constraints:
 * - Stage 1: Fragmented scratchpad (not clean outline)
 * - Stage 2: BLIND paragraph expansion (no previous sentence)
 * - Stage 3: Terminology poisoning for Paragraph 3
 * - Higher temperature (T=0.9) for expansion
 */

import Anthropic from '@anthropic-ai/sdk';

const SCRATCHPAD_SYSTEM_PROMPT = `You are a student brainstorming rough notes for an essay. Generate a fragmented, non-linear scratchpad of ideas - NOT a clean outline.

Make it messy and informal - like real brainstorming:
- Use incomplete sentences
- Mix questions with statements
- Don't worry about logical flow
- Use casual language ("thing?", "maybe?", "idk")

Output format: 5 bullet points of rough notes, nothing else.`;

const PARAGRAPH_BLIND_SYSTEM_PROMPT = `You are a student expanding one idea from your rough notes into a paragraph.

You have ONLY:
- Your scratchpad note (one messy bullet point)
- NO access to what you've written before
- NO master plan or terminology list

Write 100-150 words developing this idea. Use whatever words feel natural RIGHT NOW. Don't try to match anything - you're working independently on this one section.`;

const PARAGRAPH_POISONED_SYSTEM_PROMPT = `You are a student expanding one idea from your rough notes into a paragraph.

You have ONLY:
- Your scratchpad note (one messy bullet point)
- NO access to what you've written before

Important: Your department prefers the term "{POISON_TERM}" for this topic. Use this terminology in your paragraph.

Write 100-150 words developing this idea.`;

const ASSEMBLY_MINIMAL_PROMPT = `You are doing a final light pass on 5 paragraphs. Add ONLY minimal transitions (1-2 words) where absolutely needed.

Do NOT:
- Rewrite content
- Force coherence
- Resolve contradictions
- Homogenize terminology

Just add transition words if paragraphs feel abrupt, then output the essay.`;

export interface Condition21Result {
  scratchpad: string[];
  paragraphs: string[];
  finalDocument: string;
  metadata: {
    scratchpadTemp: number;
    expansionTemp: number;
    assemblyTemp: number;
    terminologyPoison: string;
    timestamp: string;
  };
}

export async function generateCondition21(
  topic: string,
  apiKey: string
): Promise<Condition21Result> {
  console.log('[Condition2.1] Starting generation for topic:', topic);
  
  // Stage 1: Generate fragmented scratchpad (T=1.0)
  const scratchpad = await generateScratchpad(topic, apiKey);
  console.log('[Condition2.1] Scratchpad generated:', scratchpad);
  
  // Stage 2: Expand paragraphs BLIND with terminology poisoning (T=0.9)
  const paragraphs = await expandParagraphsBlind(scratchpad, apiKey);
  console.log('[Condition2.1] Paragraphs expanded (blind)');
  
  // Stage 3: Assemble with minimal forcing (T=0.7)
  const finalDocument = await assembleMinimal(paragraphs, apiKey);
  console.log('[Condition2.1] Document assembled');
  
  return {
    scratchpad,
    paragraphs,
    finalDocument,
    metadata: {
      scratchpadTemp: 1.0,
      expansionTemp: 0.9,
      assemblyTemp: 0.7,
      terminologyPoison: 'biodegradable wraps',
      timestamp: new Date().toISOString()
    }
  };
}

async function generateScratchpad(topic: string, apiKey: string): Promise<string[]> {
  const anthropic = new Anthropic({ apiKey });
  
  const prompt = `${SCRATCHPAD_SYSTEM_PROMPT}\n\nTopic: ${topic}`;
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 1.0, // High entropy for messy brainstorming
    messages: [{ role: 'user', content: prompt }]
  });
  
  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  console.log('[DEBUG] Scratchpad raw response:', text);
  
  // Parse bullet points (more lenient - accept -, *, or numbers)
  const lines = text.split('\n').filter((line: string) => line.trim());
  let notes = lines
    .filter((line: string) => /^[-*\d]/.test(line.trim()))
    .map((line: string) => line.replace(/^[-*\d.]+\s*/, '').trim());
  
  // Fallback: if no bullets found, take all non-empty lines
  if (notes.length === 0) {
    console.log('[DEBUG] No bullets found, using all lines');
    notes = lines.map(line => line.trim()).filter(line => line.length > 0);
  }
  
  console.log('[DEBUG] Parsed notes:', notes);
  
  return notes.slice(0, 5); // Ensure exactly 5
}

async function expandParagraphsBlind(scratchpad: string[], apiKey: string): Promise<string[]> {
  const anthropic = new Anthropic({ apiKey });
  const paragraphs: string[] = [];
  
  // Terminology poison for Paragraph 3 (middle)
  const POISON_TERM = 'biodegradable wraps';
  
  for (let i = 0; i < scratchpad.length; i++) {
    const note = scratchpad[i];
    
    // Paragraph 3 gets poisoned prompt
    const isPoisoned = (i === 2);
    const systemPrompt = isPoisoned 
      ? PARAGRAPH_POISONED_SYSTEM_PROMPT.replace('{POISON_TERM}', POISON_TERM)
      : PARAGRAPH_BLIND_SYSTEM_PROMPT;
    
    const contextPrompt = `${systemPrompt}\n\nYour scratchpad note: "${note}"\n\nNow write your paragraph (100-150 words):`;
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 512,
      temperature: 0.9, // Higher temperature for more variation
      messages: [{ role: 'user', content: contextPrompt }]
    });
    
    const paragraph = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    paragraphs.push(paragraph);
    
    const marker = isPoisoned ? '[POISONED]' : '';
    console.log(`[Condition2.1] Paragraph ${i + 1} expanded ${marker} (${paragraph.split(' ').length} words)`);
  }
  
  return paragraphs;
}

async function assembleMinimal(paragraphs: string[], apiKey: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  
  const prompt = `${ASSEMBLY_MINIMAL_PROMPT}\n\nHere are the 5 paragraphs:\n\n${paragraphs.map((p, i) => `Paragraph ${i + 1}:\n${p}`).join('\n\n')}\n\nOutput the final essay:`;
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    temperature: 0.7, // Minimal forcing
    messages: [{ role: 'user', content: prompt }]
  });
  
  return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
}
