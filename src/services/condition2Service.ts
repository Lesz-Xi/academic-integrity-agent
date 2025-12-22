/**
 * Condition 2: Multi-Stage Generation with Memory Decay
 * 
 * Implements bounded rationality constraints:
 * - Stage 1: Outline with high entropy (T=1.0)
 * - Stage 2: Isolated paragraph expansion (only outline sentence + last sentence of previous)
 * - Stage 3: Minimal assembly (T=0.7)
 */

import Anthropic from '@anthropic-ai/sdk';

const OUTLINE_SYSTEM_PROMPT = `You are drafting an academic essay outline. Generate exactly 5 sentences, where each sentence will become the topic sentence for one paragraph.

Make the outline messy and organic - like a real student brainstorming. Don't overthink connections between points. Let ideas flow naturally without perfect logical sequencing.

Output format: 5 numbered sentences, nothing else.`;

const PARAGRAPH_SYSTEM_PROMPT = `You are a student expanding one point from your outline into a full paragraph.

You have:
1. Your outline point (the main idea for this paragraph)
2. The last sentence from your previous paragraph (if this isn't the first paragraph)

You do NOT have:
- The full text of previous paragraphs
- A master terminology list
- Instructions to maintain consistency

Write 100-150 words expanding on your outline point. Use whatever terminology feels natural. Don't worry about matching previous word choices - just develop the idea authentically.`;

const ASSEMBLY_SYSTEM_PROMPT = `You are a student doing a final light polish on your essay. You have 5 paragraphs.

Add minimal transitions between paragraphs if needed, but:
- Do NOT rewrite the content
- Do NOT force coherence where it doesn't exist
- Do NOT resolve contradictions or tensions
- Do NOT homogenize terminology

Just add 1-2 transition words/phrases where absolutely necessary and output the final essay.`;

export interface Condition2Result {
  outline: string[];
  paragraphs: string[];
  finalDocument: string;
  metadata: {
    outlineTemp: number;
    expansionTemp: number;
    assemblyTemp: number;
    timestamp: string;
  };
}

export async function generateCondition2(
  topic: string,
  apiKey: string
): Promise<Condition2Result> {
  console.log('[Condition2] Starting generation for topic:', topic);
  
  // Stage 1: Generate outline (T=1.0)
  const outline = await generateOutline(topic, apiKey);
  console.log('[Condition2] Outline generated:', outline);
  
  // Stage 2: Expand paragraphs with memory decay (T=0.8)
  const paragraphs = await expandParagraphs(outline, apiKey);
  console.log('[Condition2] Paragraphs expanded');
  
  // Stage 3: Assemble with minimal forcing (T=0.7)
  const finalDocument = await assembleDocument(paragraphs, apiKey);
  console.log('[Condition2] Document assembled');
  
  return {
    outline,
    paragraphs,
    finalDocument,
    metadata: {
      outlineTemp: 1.0,
      expansionTemp: 0.8,
      assemblyTemp: 0.7,
      timestamp: new Date().toISOString()
    }
  };
}

async function generateOutline(topic: string, apiKey: string): Promise<string[]> {
  const anthropic = new Anthropic({ apiKey });
  
  const prompt = `${OUTLINE_SYSTEM_PROMPT}\n\nTopic: ${topic}`;
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 1.0, // High entropy for messy planning
    messages: [{ role: 'user', content: prompt }]
  });
  
  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  
  // Parse numbered sentences
  const lines = text.split('\n').filter((line: string) => line.trim());
  const sentences = lines
    .filter((line: string) => /^\d+\./.test(line))
    .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());
  
  return sentences.slice(0, 5); // Ensure exactly 5
}

async function expandParagraphs(outline: string[], apiKey: string): Promise<string[]> {
  const anthropic = new Anthropic({ apiKey });
  const paragraphs: string[] = [];
  
  for (let i = 0; i < outline.length; i++) {
    const outlinePoint = outline[i];
    const lastSentence = i > 0 ? getLastSentence(paragraphs[i - 1]) : null;
    
    // Build context: ONLY outline point + last sentence
    let contextPrompt = `${PARAGRAPH_SYSTEM_PROMPT}\n\nOutline point: ${outlinePoint}`;
    
    if (lastSentence) {
      contextPrompt += `\n\nLast sentence from previous paragraph: "${lastSentence}"`;
    } else {
      contextPrompt += `\n\n(This is the first paragraph, so there's no previous context.)`;
    }
    
    contextPrompt += `\n\nNow write your paragraph (100-150 words):`;
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 512,
      temperature: 0.8, // Moderate variation
      messages: [{ role: 'user', content: contextPrompt }]
    });
    
    const paragraph = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    paragraphs.push(paragraph);
    
    console.log(`[Condition2] Paragraph ${i + 1} expanded (${paragraph.split(' ').length} words)`);
  }
  
  return paragraphs;
}

async function assembleDocument(paragraphs: string[], apiKey: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  
  const prompt = `${ASSEMBLY_SYSTEM_PROMPT}\n\nHere are the 5 paragraphs:\n\n${paragraphs.map((p, i) => `Paragraph ${i + 1}:\n${p}`).join('\n\n')}\n\nOutput the final essay with minimal transitions:`;
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    temperature: 0.7, // Minimal forcing
    messages: [{ role: 'user', content: prompt }]
  });
  
  return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
}

function getLastSentence(paragraph: string): string {
  const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences[sentences.length - 1].trim();
}
