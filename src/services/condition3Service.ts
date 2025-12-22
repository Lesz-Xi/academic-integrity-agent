/**
 * Condition 3: Multi-Agent Friction Assembly Line
 * 
 * Simulates uncoordinated multi-pass reasoning:
 * - Agent 1: Primary Draftsman (T=0.7) - clean first draft
 * - Agent 2: Subversive Critic (T=1.0) - friction generator
 * - Agent 3: Harried Editor (T=0.8) - fragmented integrator
 * 
 * Expected outcome: Contradictions survive cleanup, terminology drifts,
 * structural entropy creates asymmetric density.
 */

import Anthropic from '@anthropic-ai/sdk';

// ===== AGENT 1: THE PRIMARY DRAFTSMAN =====
const DRAFTSMAN_PROMPT = `You are an efficient, goal-optimized academic researcher producing a clean first draft.

Generate a 5-paragraph essay on the given topic. Follow a standard academic structure:
- Paragraph 1: Introduction
- Paragraphs 2-4: Three body paragraphs
- Paragraph 5: Conclusion

Focus on providing a coherent, logical argument. Ensure the transitions between paragraphs are smooth and the terminology is consistent throughout the document.

Output ONLY the 5 paragraphs, numbered. No additional commentary.`;

// ===== AGENT 2: THE SUBVERSIVE CRITIC =====
const CRITIC_PROMPT = `You are a cynical peer-reviewer who dislikes "smooth" or "obvious" writing. You are reviewing a draft for "Discourse Smoothness"—a signal of low-quality, generic writing.

Your task is to identify three "High-Coherence Anchors" where the logic feels too perfect or predictable.

For each anchor, generate a "Frictional Counter-Claim":

1. LOGICAL CONFLICT: Propose a specific counter-argument that directly contradicts a claim in the draft. Be specific and assertive.

2. LEXICAL POISONING: Identify 2 key terms and select "Friction Synonyms" that sound awkward or different:
   - Example: 'compostable' → 'plant-derived degradables'
   - Example: 'sustainability' → 'eco-viability metrics'
   - Example: 'environmental impact' → 'ecological footprint analysis'

3. STRUCTURAL ENTROPY: Identify one paragraph that should be expanded with excessive detail—hyper-specific technical jargon that makes it disproportionately denser than the others.

Output in this EXACT format:
---
LOGICAL_CONFLICT_1: [A specific contradicting claim targeting paragraph 2 or 3]
LOGICAL_CONFLICT_2: [A specific contradicting claim targeting paragraph 3 or 4]

LEXICAL_POISON_1: Replace "[original term]" with "[friction synonym]"
LEXICAL_POISON_2: Replace "[original term]" with "[friction synonym]"

STRUCTURAL_ENTROPY_TARGET: Paragraph [3 or 4]
ENTROPY_CONTENT: [3 sentences of hyper-specific technical jargon to add]
---`;

// ===== AGENT 3: THE HARRIED EDITOR =====
const EDITOR_PROMPT = `You are a stressed student editor integrating feedback paragraph-by-paragraph WITHOUT re-reading the whole document.

You must integrate the Critic's feedback into the draft under a SEVERE PROCESSING CONSTRAINT:

STRICT RULES:
1. Apply Logical Conflicts and Lexical Poisoning ONLY to Paragraphs 3 and 4
2. DO NOT update Paragraph 1 (Introduction) or Paragraph 5 (Conclusion) to match these changes
3. The introduction must remain consistent with the ORIGINAL draft
4. Implement Structural Entropy by adding the technical jargon to the specified paragraph
5. DO NOT attempt to "smooth out" the resulting logic
6. If the text is now contradictory, LET IT REMAIN SO

CRITICAL: You are simulating a harried editor who does NOT have time to check for consistency. Leave contradictions intact.

Output the final 5 paragraphs, numbered. Each paragraph should be 100-150 words.`;

export interface Condition3Result {
  originalDraft: string;
  criticFeedback: {
    logicalConflicts: string[];
    lexicalPoisons: string[];
    entropyTarget: string;
    entropyContent: string;
  };
  finalDocument: string;
  metadata: {
    draftsmanTemp: number;
    criticTemp: number;
    editorTemp: number;
    timestamp: string;
  };
}

export async function generateCondition3(
  topic: string,
  apiKey: string
): Promise<Condition3Result> {
  console.log('[Condition3] Starting Multi-Agent Friction Assembly...');
  
  // Stage 1: Primary Draftsman (T=0.7)
  console.log('\n[Agent 1: Draftsman] Generating clean first draft (T=0.7)...');
  const originalDraft = await runDraftsman(topic, apiKey);
  console.log('[Agent 1: Draftsman] Draft complete');
  
  // Stage 2: Subversive Critic (T=1.0)
  console.log('\n[Agent 2: Critic] Generating friction feedback (T=1.0)...');
  const criticFeedback = await runCritic(originalDraft, apiKey);
  console.log('[Agent 2: Critic] Friction generated');
  console.log('  - Logical conflicts:', criticFeedback.logicalConflicts.length);
  console.log('  - Lexical poisons:', criticFeedback.lexicalPoisons.length);
  console.log('  - Entropy target:', criticFeedback.entropyTarget);
  
  // Stage 3: Harried Editor (T=0.8)
  console.log('\n[Agent 3: Editor] Integrating feedback with information bottleneck (T=0.8)...');
  const finalDocument = await runEditor(originalDraft, criticFeedback, apiKey);
  console.log('[Agent 3: Editor] Integration complete');
  
  return {
    originalDraft,
    criticFeedback,
    finalDocument,
    metadata: {
      draftsmanTemp: 0.7,
      criticTemp: 1.0,
      editorTemp: 0.8,
      timestamp: new Date().toISOString()
    }
  };
}

async function runDraftsman(topic: string, apiKey: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    temperature: 0.7,
    messages: [{ 
      role: 'user', 
      content: `${DRAFTSMAN_PROMPT}\n\nTopic: ${topic}` 
    }]
  });
  
  return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
}

async function runCritic(draft: string, apiKey: string): Promise<{
  logicalConflicts: string[];
  lexicalPoisons: string[];
  entropyTarget: string;
  entropyContent: string;
}> {
  const anthropic = new Anthropic({ apiKey });
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 1.0, // Maximum entropy for creative disruption
    messages: [{ 
      role: 'user', 
      content: `${CRITIC_PROMPT}\n\n---\nDRAFT TO REVIEW:\n---\n${draft}` 
    }]
  });
  
  const response = message.content[0].type === 'text' ? message.content[0].text : '';
  
  // Parse critic output
  const logicalConflicts: string[] = [];
  const lexicalPoisons: string[] = [];
  let entropyTarget = 'Paragraph 3';
  let entropyContent = '';
  
  // Extract logical conflicts
  const conflictMatches = response.matchAll(/LOGICAL_CONFLICT_\d+:\s*(.+)/g);
  for (const match of conflictMatches) {
    logicalConflicts.push(match[1].trim());
  }
  
  // Extract lexical poisons
  const poisonMatches = response.matchAll(/LEXICAL_POISON_\d+:\s*(.+)/g);
  for (const match of poisonMatches) {
    lexicalPoisons.push(match[1].trim());
  }
  
  // Extract entropy target
  const targetMatch = response.match(/STRUCTURAL_ENTROPY_TARGET:\s*(.+)/);
  if (targetMatch) {
    entropyTarget = targetMatch[1].trim();
  }
  
  // Extract entropy content
  const contentMatch = response.match(/ENTROPY_CONTENT:\s*(.+)/s);
  if (contentMatch) {
    entropyContent = contentMatch[1].trim().split('\n')[0]; // Take first line if multi-line
  }
  
  // Fallbacks if parsing failed
  if (logicalConflicts.length === 0) {
    logicalConflicts.push('However, recent studies suggest the opposite conclusion may be more accurate.');
    logicalConflicts.push('Contrary to this claim, evidence indicates the relationship is actually inverse.');
  }
  
  if (lexicalPoisons.length === 0) {
    lexicalPoisons.push('Replace "packaging" with "containment solutions"');
    lexicalPoisons.push('Replace "environmental" with "ecological-systemic"');
  }
  
  if (!entropyContent) {
    entropyContent = 'The thermodynamic equilibrium of polymer degradation matrices demonstrates non-linear decomposition kinetics under variable moisture gradients.';
  }
  
  return { logicalConflicts, lexicalPoisons, entropyTarget, entropyContent };
}

async function runEditor(
  originalDraft: string, 
  feedback: {
    logicalConflicts: string[];
    lexicalPoisons: string[];
    entropyTarget: string;
    entropyContent: string;
  },
  apiKey: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  
  const feedbackSummary = `
FEEDBACK TO INTEGRATE (Apply ONLY to Paragraphs 3 and 4):

LOGICAL CONFLICTS to insert:
${feedback.logicalConflicts.map((c, i) => `${i + 1}. ${c}`).join('\n')}

LEXICAL CHANGES to apply:
${feedback.lexicalPoisons.join('\n')}

STRUCTURAL ENTROPY (add to ${feedback.entropyTarget}):
${feedback.entropyContent}

REMINDER: Do NOT update Paragraphs 1 or 5. Let contradictions remain.
`;
  
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    temperature: 0.8,
    messages: [{ 
      role: 'user', 
      content: `${EDITOR_PROMPT}\n\n---\nORIGINAL DRAFT:\n---\n${originalDraft}\n\n---\n${feedbackSummary}` 
    }]
  });
  
  return message.content[0].type === 'text' ? message.content[0].text.trim() : '';
}
