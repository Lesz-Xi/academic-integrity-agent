import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { Mode, GenerationResponse, DetectionMetrics, ChatMessage } from '../types';
import { ESSAY_MODE_PROMPT } from '../prompts/modeA_essay';
import { CS_MODE_PROMPT } from '../prompts/modeB_cs';
import { PARAPHRASE_MODE_PROMPT } from '../prompts/modeC_paraphrase';
import { POLISH_MODE_PROMPT } from '../prompts/modeD_polish';
import { CASUAL_MODE_PROMPT } from '../prompts/modeE_casual';
import { analyzeBurstiness } from './burstinessAnalyzer';
import { estimatePerplexity, detectForbiddenPhrases } from './perplexityEstimator';
import { analyzeCitations } from './citationAnalyzer';
import { analyzeTextRisk, SentenceRisk, RiskFactor } from './sentenceRiskAnalyzer';
import { applySurgicalEdits } from './surgicalEditor';
import { StyleRAGService } from './styleRAGService';

// Helper to get env variables in both Vite (browser) and Node (test script) environments
const getEnv = (key: string) => {
  // Check process.env first (Node.js)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Check import.meta.env (Vite)
  // @ts-ignore - import.meta is meta-property
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return '';
};

// API Keys - Support both .env and .env.local via Vite or dotenv
const CLAUDE_API_KEY = getEnv('VITE_CLAUDE_API_KEY');

// Initialize Claude client (for Essay & CS modes)
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

// Initialize Gemini clients (for Paraphrase mode - with failover support)
// Support standard and backup keys for Gemini
const GEMINI_API_KEYS = [
  getEnv('VITE_GEMINI_API_KEY'),
  getEnv('VITE_GEMINI_API_KEY_BACKUP')
].filter(Boolean); // Remove empty keys

// Primary Gemini API key (used as fallback reference)

const MODE_PROMPTS: Record<Mode, string> = {
  essay: ESSAY_MODE_PROMPT,
  cs: CS_MODE_PROMPT,
  paraphrase: PARAPHRASE_MODE_PROMPT,
  polish: POLISH_MODE_PROMPT,
  casual: CASUAL_MODE_PROMPT
};

/**
 * Generate academic content using mode-specific prompts
 * @param searchEnabled - If true, search web for sources and inject into context
 * @param length - Target essay length (short/medium/long)
 */
export async function generateContent(
  mode: Mode,
  input: string,
  additionalInstructions: string = '',
  onChunk?: (text: string) => void,
  searchEnabled: boolean = false,
  length: 'short' | 'medium' | 'long' = 'medium',
  userId?: string,
  signal?: AbortSignal
): Promise<GenerationResponse> {
  
  const basePrompt = MODE_PROMPTS[mode];
  let customInstructions = '';
  let evasionProtocol = '';
  let stylePrototypesContext = '';

  // Style-RAG Phase: Fetch user stylistic fingerprints
  if (userId) {
    try {
      const prototypes = await StyleRAGService.getStylePrototypes(userId);
      stylePrototypesContext = StyleRAGService.formatPrototypesForPrompt(prototypes);
      console.log(`[AcademicIntegrityService] Injected ${prototypes.length} stylistic prototypes for user ${userId}`);
    } catch (error) {
      console.warn('[AcademicIntegrityService] Style-RAG failed:', error);
    }
  }
  
  // Custom Instructions (Additional Instructions) are prioritized at the top
  if (additionalInstructions) {
    customInstructions = `CUSTOM USER INSTRUCTIONS (HIGHEST PRIORITY):\n${additionalInstructions}\n\n`;
  }

  // AUTO-APPEND: Humanization + Anti-RLHF + Burstiness for paraphrase mode
  // Based on Grammarly detection analysis: casual markers + varied structure = lower AI scores
  if (mode === 'paraphrase') {
    const wordCount = input.trim().split(/\s+/).length;
    let instruction = '';
    
    // PHASE 1: Run citation analysis (deliberation step)
    const citationAnalysis = analyzeCitations(input);
    const citationCount = citationAnalysis.citations.length;
    const riskLevel = citationAnalysis.overallRisk;
    const factAnchors = citationAnalysis.factAnchors;
    
    console.log(`[AcademicIntegrityService] Citation Analysis: ${citationCount} citations, Risk: ${riskLevel}`);
    
    // Build constraint context from citations
    let constraintContext = '';
    if (citationCount > 0) {
      constraintContext = `\nCITATION CONSTRAINTS (These facts are anchored - preserve meaning):
${factAnchors.slice(0, 5).map(a => `- ${a.citation.text}: "${a.fact.substring(0, 80)}..."`).join('\n')}`;
    }
    
    // EVASION PROTOCOL v7.0 - COMPOSITION MODE
    evasionProtocol = `ADAPTIVE SCHOLARLY COMPOSER (v7.0 - COMPOSITION MODE):

YOU ARE NOT PARAPHRASING. You are COMPOSING new prose that expresses the same facts.

COMPOSITION PRINCIPLES:
1. EXTRACT FACTS FIRST: Identify each claim/fact in the input and its citation anchor.
2. COMPOSE NEW PROSE: Write as if these are YOUR ideas, expressed YOUR way.
3. PRESERVE CITATION MEANING: Facts tied to citations CANNOT change semantically.
4. INJECT HUMANITY: Add personal voice - "I think", "we noticed", "honestly".

BANNED VOCABULARY (NEVER USE):
- "framework" → "structure" / "setup"
- "holistic" → "complete" / "full"  
- "feasibility" → "viability" / "workability"
- "furthermore/moreover/additionally" → DELETE or "Also"
- "crucial/significant" → "key" / "important"
- "paradigm" → "model" / "approach"
- "systematic comparison" → "direct look at" / "careful check"
- "implications" → "effects" / "results"

ANTI-ROBOTIC TACTICS:
1. FIRST-PERSON: Use "I/we" at least once per paragraph.
2. RHETORICAL QUESTIONS: Add 1-2 per section ("Why does this matter?").
3. CREATIVE GRAMMAR: One intentional fragment or run-on per paragraph.
4. BREAK SMOOTH FLOW: Use "Look," "Here's the thing," "Anyway,".
5. DE-JARGONIZE: Replace technical terms with plain language.
6. IMPERFECTIONS: Add minor redundancies ("basically what this means is...").

STRUCTURAL RULES:
- 1:3 RATIO: 1 short sentence (<7 words) for every 3 long ones (>20 words).
- NO RULE OF THREE: Use 2 or 4 items in lists, never 3.
- END WITH FRAGMENTS: Every paragraph ends with 1-4 word punch.
${constraintContext}

PRE-OUTPUT AUDIT: Before outputting, check for mechanical precision and impersonal tone. Sabotage if detected.`;
    
    if (wordCount < 200) {
      // SHORT TEXT
      instruction = `${evasionProtocol}\n\nBURSTINESS: Include 2+ very short sentences (under 5 words). Add 1 rhetorical question.`;
    } else if (wordCount < 600) {
      // MEDIUM TEXT
      instruction = `${evasionProtocol}\n\nBURSTINESS: Create 3-4 short sentences (under 6 words). Add 2 rhetorical questions. Use "I think" or "We noticed" at least once.`;
    } else {
      // LONG TEXT
      instruction = `${evasionProtocol}\n\nBURSTINESS: At least 15% of sentences under 6 words. Add 3+ rhetorical questions distributed across sections. Use first-person in each major paragraph.`;
    }
    
    // Only append if not already present
    if (instruction && !customInstructions.toLowerCase().includes('humanize')) {
      customInstructions = customInstructions 
        ? `${customInstructions}${instruction}\n\n`
        : `CUSTOM USER INSTRUCTIONS (HIGHEST PRIORITY):\n${instruction}\n\n`;
    }
  }

  // Prepend custom instructions to the base prompt for maximum weight
  // Append custom instructions to the end of the base prompt for maximum influence (recency bias)
  const systemInstruction = basePrompt + "\n\n" + (customInstructions || "") + "\n\n" + (stylePrototypesContext || "");

  let searchContext = '';
  
  // Check abort before expensive search operation
  if (signal?.aborted) {
    throw new Error('Generation cancelled by user');
  }
  
  // Search integration (only for essay and cs modes)
  if (searchEnabled && (mode === 'essay' || mode === 'cs')) {
    try {
      const { searchAndSelectSources } = await import('./searchService');
      const searchResult = await searchAndSelectSources(input, 10, 5);
      
      if (searchResult && searchResult.sources.length > 0) {
        searchContext = searchResult.formattedContext;
        console.log(`[AcademicIntegrityService] Search found ${searchResult.sources.length} sources`);
      }
    } catch (error) {
      console.warn('[AcademicIntegrityService] Search failed, proceeding without sources:', error);
    }
  }
  
  // Build user message with search context if available
  let userMessage = input;
  
  if (searchContext) {
    userMessage = `${searchContext}\n\n---\n\nUSER REQUEST:\n${input}`;
  }
  
  // Inject length instructions (only for content generation modes, not paraphrase)
  if (mode !== 'paraphrase' && mode !== 'polish') {
    const lengthTargets = {
      short: '400-500 words',      // Normal: exact match to user request
      medium: '1,000-1,500 words', // Medium: Standard essay
      long: '2,000-3,000 words'    // Long: Deep research
    };
    userMessage += `\n\nIMPORTANT: Target length is ${lengthTargets[length]}. Ensure the response meets this requirement.`;
  } else if (mode === 'paraphrase') {
    // For paraphrase mode: output length should match input length, and output ONLY the result
    userMessage += `\n\nCRITICAL OUTPUT RULES:
1. Output ONLY the paraphrased/humanized text. No explanations, no reasoning, no commentary.
2. Do NOT include phrases like "Here is the paraphrased text" or "The user has requested..."
3. Output length should be similar to the input length (this is paraphrase, not expansion).
4. Start directly with the transformed content.`;
  } else if (mode === 'polish') {
     userMessage += `\n\nLENGTH & FORMATTING:
- Maintain roughly the same length as the input.
- DENSITY RESTORATION: If input is fragmented/choppy, CONSOLIDATE into dense paragraphs.
- Prioritize clear, standard English.
- CRITICAL: Do NOT add transition words (Therefore, However, Thus) to improve flow. Keep connection logic implicit.`;
  } else if (mode === 'casual') {
    userMessage += `\n\nLENGTH & FORMATTING:
- Keep it concise but natural.
- Don't worry about being too short or too long, just make it flow.`;
  }
  
  if (additionalInstructions) {
    userMessage += `\n\nAdditional Instructions: ${additionalInstructions}`;
  }

  // SUFFIX-WEIGHTING: Inject Evasion rules at the VERY end for maximum model attention
  if (mode === 'paraphrase' && evasionProtocol) {
    userMessage += `\n\n${evasionProtocol}`;
  }

  
  let fullResponse = '';

  try {
    // HYBRID MODEL SELECTION: Gemini for paraphrase/polish/casual, Claude for essay/CS
    if (mode === 'paraphrase' || mode === 'polish' || mode === 'casual') {
      // Use Gemini for paraphrase mode with automatic failover
      let lastError: Error | null = null;
      
      for (let keyIndex = 0; keyIndex < GEMINI_API_KEYS.length; keyIndex++) {
        const apiKey = GEMINI_API_KEYS[keyIndex];
        console.log(`[AcademicIntegrityService] Using Gemini 2.5 Flash Lite (Paraphrase Mode) - Key ${keyIndex + 1}/${GEMINI_API_KEYS.length}`);
        
        try {
          // Dynamic temperature scaling based on input length
          const inputWordCount = input.trim().split(/\s+/).length;
          let dynamicTemperature = 1.0; // High creativity for short texts (evasion)
          if (inputWordCount >= 1500) {
            dynamicTemperature = 0.85; // Long texts need stability
          } else if (inputWordCount >= 500) {
            dynamicTemperature = 0.9; // Medium texts balanced
          }
          console.log(`[AcademicIntegrityService] Input: ${inputWordCount} words → Temperature: ${dynamicTemperature}`);
          
          const geminiClient = new GoogleGenAI({ apiKey });
          const chat = geminiClient.chats.create({
            model: 'gemini-2.5-flash-lite-preview-09-2025',
            config: {
              systemInstruction: systemInstruction,
              temperature: dynamicTemperature,
              topK: 80,
              topP: 0.95,
              maxOutputTokens: 4096
            }
          });
          
          const result = await chat.sendMessageStream({ message: userMessage });
          
          for await (const chunk of result) {
            // Check for abort during streaming
            if (signal?.aborted) {
              throw new Error('Generation cancelled by user');
            }
            
            if (chunk.text) {
              fullResponse += chunk.text;
              if (onChunk) onChunk(chunk.text);
            }
          }
          
          // Success - break out of retry loop
          lastError = null;
          break;
        } catch (error: any) {
          lastError = error;
          const status = error.status || (error.response ? error.response.status : null);
          const isRetryable = 
            status === 429 || // Rate limit
            status >= 500 || // Server errors
            error.message?.includes('429') || 
            error.message?.includes('quota') ||
            error.message?.includes('network') ||
            error.message?.includes('fetch failed');

          if (isRetryable) {
            console.warn(`[AcademicIntegrityService] Key ${keyIndex + 1} failed (Status: ${status}), trying next key... Error:`, error.message);
            fullResponse = ''; // Reset for retry
            continue;
          }
          
          // For client errors (400, 401, etc), fail immediately
          console.error(`[AcademicIntegrityService] Non-retryable error on Key ${keyIndex + 1}:`, error);
          throw error;
        }
      }
      
      // If all keys failed
      if (lastError && fullResponse === '') {
        console.error('[AcademicIntegrityService] All API keys exhausted.');
        throw lastError; // Throw the last error encountered
      }
    } else {
      // Use Claude Sonnet 4.5 for essay and CS modes (better quality)
      console.log('[AcademicIntegrityService] Using Claude Sonnet 4.5 (Essay/CS Mode)');
      
      // Dynamic temperature scaling based on input length
      const inputWordCount = input.trim().split(/\s+/).length;
      let dynamicTemperature = 1.0; 
      if (inputWordCount >= 1500) {
        dynamicTemperature = 0.85;
      } else if (inputWordCount >= 500) {
        dynamicTemperature = 0.9;
      }
      console.log(`[AcademicIntegrityService] Claude Input: ${inputWordCount} words → Temperature: ${dynamicTemperature}`);

      const stream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemInstruction,
        messages: [
          { role: 'user', content: userMessage }
        ],
        temperature: dynamicTemperature
      }, {
        signal: signal  // Pass AbortSignal to Anthropic SDK
      });

      for await (const event of stream) {
        // Check for abort during streaming
        if (signal?.aborted) {
          throw new Error('Generation cancelled by user');
        }
        
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const text = event.delta.text;
          fullResponse += text;
          if (onChunk) onChunk(text);
        }
      }
    }
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle errors from both providers
    if (error.status === 401 || error.message?.includes('401')) {
      throw new Error('Invalid API key. Please check your .env.local file.');
    }
    if (error.status === 429 || error.message?.includes('429')) {
      throw new Error('Rate limit exceeded. Please wait and try again.');
    }
    if (error.status === 402) {
      throw new Error('Insufficient Claude credits. Please add more credits at console.anthropic.com');
    }
    
    throw new Error(`API error: ${error.message || 'Unknown error'}`);
  }
  
  // Analyze the generated text
  const metrics = analyzeText(fullResponse);
  
  // Generate warnings based on metrics
  const warnings: string[] = [];
  
  if (metrics.burstiness.score === 'LOW') {
    warnings.push('Low burstiness detected. Text may appear AI-generated.');
  }
  
  if (metrics.perplexity.score === 'LOW') {
    warnings.push('Low perplexity detected. Consider using less predictable word choices.');
  }
  
  const forbiddenPhrases = detectForbiddenPhrases(fullResponse);
  if (forbiddenPhrases.length > 0) {
    warnings.push(`Forbidden LLM phrases detected: ${forbiddenPhrases.join(', ')}`);
  }
  
  if (metrics.overallRisk === 'HIGH') {
    warnings.push('CRITICAL: High detection risk. Strongly recommend regenerating.');
  }
  
  // Phase 3: Human-in-the-Loop - Analyze sentences for flagging
  let humanEditFlags = undefined;
  let editStats = undefined;
  
  if (mode === 'paraphrase') {
    const riskReport = analyzeTextRisk(fullResponse);
    
    // Collect HIGH and MEDIUM risk sentences for user review
    const flaggedSentences = riskReport.sentences.filter(
      (s: SentenceRisk) => s.riskLevel === 'HIGH' || s.riskLevel === 'MEDIUM'
    );
    
    if (flaggedSentences.length > 0) {
      humanEditFlags = flaggedSentences.map((s: SentenceRisk) => ({
        sentence: s.sentence,
        index: s.index,
        riskLevel: s.riskLevel as 'HIGH' | 'MEDIUM',
        issues: s.riskFactors.map((f: RiskFactor) => f.description),
        suggestion: s.suggestion || null
      }));
      
      warnings.push(`${riskReport.highRiskCount} sentence(s) flagged for human review.`);
    }
    
    editStats = {
      totalSentences: riskReport.sentences.length,
      highRisk: riskReport.highRiskCount,
      mediumRisk: riskReport.mediumRiskCount,
      lowRisk: riskReport.lowRiskCount
    };
    
    console.log(`[AcademicIntegrityService] Sentence Analysis: ${riskReport.highRiskCount} high-risk, ${riskReport.mediumRiskCount} medium-risk`);
  }
  
  return {
    text: fullResponse,
    metrics,
    warnings,
    humanEditFlags,
    editStats
  };
}

/**
 * Analyze text for AI detection metrics
 */
export function analyzeText(text: string): DetectionMetrics {
  const burstiness = analyzeBurstiness(text);
  const perplexity = estimatePerplexity(text);
  
  // Calculate overall risk
  let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  let riskInterpretation: string;
  
  const riskScore = 
    (burstiness.score === 'LOW' ? 2 : burstiness.score === 'MEDIUM' ? 1 : 0) +
    (perplexity.score === 'LOW' ? 2 : perplexity.score === 'MEDIUM' ? 1 : 0);
  
  if (riskScore >= 3) {
    overallRisk = 'HIGH';
    riskInterpretation = '🚨 High detection risk. Turnitin may flag this as AI-generated.';
  } else if (riskScore >= 1) {
    overallRisk = 'MEDIUM';
    riskInterpretation = '⚠️ Moderate detection risk. Consider regenerating or manual edits.';
  } else {
    overallRisk = 'LOW';
    riskInterpretation = '✅ Low detection risk. Text exhibits human-like characteristics.';
  }
  
  return {
    burstiness,
    perplexity,
    overallRisk,
    riskInterpretation
  };
}

/**
 * Stream chat conversation (for interactive mode)
 */
export async function streamChat(
  mode: Mode,
  history: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> {
  
  const systemPrompt = MODE_PROMPTS[mode];
  
  // Convert history to Claude message format
  const messages = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
    content: msg.text
  }));
  
  let fullResponse = '';

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
      temperature: 1.0
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        fullResponse += text;
        onChunk(text);
      }
    }
  } catch (error: any) {
    console.error('Claude API Error:', error);
    onChunk(`I apologize, but I encountered an error: ${error.message || 'Unknown error'}`);
  }

  return fullResponse;
}

/**
 * Generate content using Surgical Editing (v8.0 Preservation-Based Humanization)
 * Only modifies high-risk sentences while preserving original human patterns.
 * 
 * @param input - Original text to surgically edit
 * @param editThreshold - 'HIGH' for minimal edits, 'MEDIUM' for more aggressive
 * @returns GenerationResponse with edited text and metrics
 */
export async function generateSurgicalContent(
  input: string,
  editThreshold: 'HIGH' | 'MEDIUM' = 'HIGH'
): Promise<GenerationResponse> {
  
  // Get API key for surgical editing
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI API key required for surgical editing');
  }
  
  console.log(`[AcademicIntegrityService] Starting surgical edit (threshold: ${editThreshold})`);
  
  // Apply surgical edits - only modify high-risk sentences
  const surgicalResult = await applySurgicalEdits(input, apiKey, editThreshold);
  
  console.log(`[AcademicIntegrityService] Surgical complete: ${surgicalResult.editedCount} edits, ${(surgicalResult.preservationRatio * 100).toFixed(1)}% preserved`);
  
  // Analyze the result
  const metrics = analyzeText(surgicalResult.editedText);
  
  // Generate warnings
  const warnings: string[] = [];
  
  if (surgicalResult.preservationRatio < 0.6) {
    warnings.push(`WARNING: Only ${(surgicalResult.preservationRatio * 100).toFixed(0)}% preserved (target: 60%+)`);
  }
  
  if (surgicalResult.editedCount > 0) {
    warnings.push(`${surgicalResult.editedCount} sentence(s) surgically edited`);
  }
  
  if (metrics.burstiness.score === 'LOW') {
    warnings.push('Low burstiness detected. Text may appear AI-generated.');
  }
  
  // Human-in-the-loop flagging on the result
  const riskReport = analyzeTextRisk(surgicalResult.editedText);
  
  const flaggedSentences = riskReport.sentences.filter(
    (s: SentenceRisk) => s.riskLevel === 'HIGH' || s.riskLevel === 'MEDIUM'
  );
  
  const humanEditFlags = flaggedSentences.length > 0 ? flaggedSentences.map((s: SentenceRisk) => ({
    sentence: s.sentence,
    index: s.index,
    riskLevel: s.riskLevel as 'HIGH' | 'MEDIUM',
    issues: s.riskFactors.map((f: RiskFactor) => f.description),
    suggestion: s.suggestion || null
  })) : undefined;
  
  const editStats = {
    totalSentences: riskReport.sentences.length,
    highRisk: riskReport.highRiskCount,
    mediumRisk: riskReport.mediumRiskCount,
    lowRisk: riskReport.lowRiskCount
  };
  
  return {
    text: surgicalResult.editedText,
    metrics,
    warnings,
    humanEditFlags,
    editStats
  };
}
