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

// Initialize Claude client (for Essay & CS modes & Chunking)
// Use local proxy in dev to avoid CORS 404 errors & Invalid URL errors
const isDev = import.meta.env.DEV;
const getProxyUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/anthropic`;
  }
  return 'http://localhost:3001/api/anthropic';
};

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  // Route through proxy in dev/local environment
  baseURL: isDev ? getProxyUrl() : 'https://api.anthropic.com',
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
      // Create a timeout promise to prevent blocking generation if DB is slow
      const timeoutPromise = new Promise<any[]>((resolve) => 
        setTimeout(() => {
          console.warn('[AcademicIntegrityService] Style-RAG timeout - proceeding without prototypes');
          resolve([]);
        }, 2000)
      );

      // Race the DB call against the timeout
      const prototypes = await Promise.race([
        StyleRAGService.getStylePrototypes(userId),
        timeoutPromise
      ]);

      if (prototypes.length > 0) {
        stylePrototypesContext = StyleRAGService.formatPrototypesForPrompt(prototypes);
        console.log(`[AcademicIntegrityService] Injected ${prototypes.length} stylistic prototypes for user ${userId}`);
      }
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
    
    // EVASION PROTOCOL v10.0 - INVISIBLE AUTHOR
    // Removed "Procedural Sludge" (Explicit Constraints).
    // The model must now rely on "Recursive Style Mimicry" (Implicit Patterns).
    
    evasionProtocol = `INVISIBLE AUTHOR PROTOCOL (v10.0):
    
    OBJECTIVE: You are a ghostwriter. Your goal is to be indistinguishable from the human author.
    
    CORE DIRECTIVE:
    1. ABSORB THE STYLE: Read the attached "Style Samples" (if any) carefully.
    2. MIMIC THE RHYTHM: match the sentence length variance and punctuation density of the human samples.
    3. REJECT ARTIFICIAL PERFECTION: Real humans are messy. 
       - Allow a minor redundancy.
       - Use a "flat" transition (e.g., "So," instead of "Consequently,").
       - Create "Thought Loops" (re-stating an idea for clarity).
       
    PROHIBITION:
    - DO NOT use "AI Transition Words" (Moreover, Furthermore, In Conclusion).
    - DO NOT be "Helpful". Be "Authentic".`;
    
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
- ATOMIC ISOLATION: Treat each paragraph as a separate thought.
- ANTI-SIGNPOSTING: NEVER say "The first is..." or "To structure this...". JUST USE THE CONCEPT.
- THE SILENT CUT: IF input says "Next/Then/So", DELETE IT. Start with a noun.
- SYNTACTIC COMPLEXITY: Avoid "It is/There is". Use mid-sentence clauses ("The plan, however, is...").
- HUMANITY RETENTION: Correct grammar but do NOT "sanitize" the logic.
- PERSONA: You are a Senior Writer for The Economist. Be punchy, direct, and authoritative.
- ANTI-ACADEMIC: Do NOT use "Standard Academic" transitions. Use "But" instead of "However".
- ANTI-SIGNPOSTING: NEVER say "The first is..." or "To structure this...".
- SYNTACTIC COMPLEXITY: Use mid-sentence clauses ("The plan, however, is...").
- CRITICAL: SEE "ONE-SHOT TRAINING DATA" IN SYSTEM PROMPT. MIMIC THE "JOURNALIST" STYLE.
- BANNED VOCAB: Do NOT use phrases listed in "BANNED VOCABULARY" (e.g., "Significant gaps", "Ultimately").`;
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
      // Automatic failover logic
      let lastError: Error | null = null;
      
      // Select model based on mode
      // Use Gemini 2.5 Flash Lite Preview (09-2025) for Polish (Professional) mode (User Request)
      // Use Flash Lite 2.5 for Paraphrase/Casual for speed
      const targetModel = mode === 'polish' 
        ? 'gemini-2.5-flash-lite-preview-09-2025' 
        : 'gemini-2.5-flash-lite-preview-09-2025';

      // ===== PARAGRAPH CHUNKING FOR POLISH MODE (Evasion v13.0) =====
      // Instead of processing the whole text, we split into paragraphs and process each independently.
      // This breaks "Global Coherence" at the API level, mimicking Apple's chunked output.
      if (mode === 'polish') {
        console.log('[AcademicIntegrityService] Polish Mode: Activating Paragraph Chunking (Evasion v13.0)');
        
        // Split input text into paragraphs (split by double newline)
        const paragraphs = input.split(/\n\n+/).filter(p => p.trim().length > 0);
        console.log(`[AcademicIntegrityService] Chunking: ${paragraphs.length} paragraphs detected`);
        
        // If very few paragraphs, fall through to normal processing
        if (paragraphs.length >= 2) {
          const chunkSystemPrompt = `INVISIBLE AUTHOR - POLISH MODE (v10.0):
          
          Your task is to REWRITE the input paragraph to match the "Human Style" of the provided samples.
          
          RULES:
          1. DE-SLUDGE: Remove academic fluff ("It is important to note", "Furthermore").
          2. RHYTHM MATCH: If the samples use short, punchy sentences, do the same.
          3. HUMAN IMPERFECTION: allow a sentence to end elegantly, even if it's not "maximally efficient".
          
          OUTPUT: Return ONLY the polished text. No meta-talk.`;

          
          // Helper to chunk array
          const chunkArray = (arr: any[], size: number) => {
            return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
              arr.slice(i * size, i * size + size)
            );
          };

          // Group paragraphs into batches of 3 to reduce API calls (9 paragraphs -> 3 chunks)
          const batchedParagraphs = chunkArray(paragraphs, 3);
          console.log(`[AcademicIntegrityService] Batching: ${paragraphs.length} paragraphs -> ${batchedParagraphs.length} API calls`);

          // Process batches SEQUENTIALLY
          const results: { index: number; text: string }[] = [];
          
          for (let batchIndex = 0; batchIndex < batchedParagraphs.length; batchIndex++) {
            const batch = batchedParagraphs[batchIndex];
            const batchText = batch.join('\n\n'); // Join paragraphs in the batch
            
            // Check for abort
            if (signal?.aborted) {
              throw new Error('Generation cancelled by user');
            }
            
            try {
              // Use Claude Haiku (accessible with current API key tier)
              // No retry needed for Claude usually, but keeping 1 retry for safety
              let retries = 1;
              let resultText = '';
              
              while (retries >= 0) {
                try {
                  const message = await anthropic.messages.create({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 2048,
                    system: chunkSystemPrompt + "\n\nNOTE: The input contains multiple paragraphs. RETURN THEM as multiple paragraphs, keeping them separate.",
                    messages: [{
                      role: 'user',
                      content: batchText
                    }],
                    temperature: 0.7
                  });
                  
                  if (message.content[0].type === 'text') {
                    resultText = message.content[0].text;
                  }
                  break; 
                } catch (retryError: any) {
                  console.warn(`[AcademicIntegrityService] Batch ${batchIndex} Claude error:`, retryError);
                  if (retries > 0) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 2000));
                  } else {
                    throw retryError;
                  }
                }
              }
              
              results.push({ index: batchIndex, text: resultText.trim() });
              
              if (onChunk) {
                onChunk(`Processing batch ${batchIndex + 1}/${batchedParagraphs.length} (Claude Sonnet)...\n\n`);
              }
              
              console.log(`[AcademicIntegrityService] Batch ${batchIndex + 1}/${batchedParagraphs.length} completed (Claude)`);
              
            } catch (error) {
              console.warn(`[AcademicIntegrityService] Batch ${batchIndex} failed:`, error);
              // Fallback: use original text
              results.push({ index: batchIndex, text: batchText });
            }
            
            // Delay between batches
            if (batchIndex < batchedParagraphs.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          
          // Post-processing: catch stubborn academic violations Claude missed
          const postProcessAcademic = (text: string): string => {
            let processed = text;
            // Remove meta-text introductions (multiple variants)
            processed = processed.replace(/^Here is the (transformed|revised|rewritten) (text|paragraph|version)[:\s]*/gim, '');
            processed = processed.replace(/^The (transformed|revised) version is[:\s]*/gim, '');
            processed = processed.replace(/^Here are the paragraphs[:\s]*/gim, '');
            processed = processed.replace(/\n\nHere are the paragraphs[:\s]*/gim, '\n\n');
            processed = processed.replace(/\n\nHere is the (transformed|revised|rewritten)[^\n]*/gim, '');
            
            // Academic replacements - comprehensive list
            const replacements: [RegExp, string][] = [
              // Self-deprecation removals
              [/, a term perhaps more impressive than the process itself/gi, ''],
              [/a term perhaps more impressive than the process itself/gi, ''],
              [/perhaps more impressive than the process itself/gi, ''],
              
              // Emotional adjectives
              [/rather arduous/gi, 'systematic'],
              [/\barduous\b/gi, 'systematic'],
              [/\bmore challenging\b/gi, 'requiring careful analysis'],
              [/\ba greater challenge\b/gi, 'requiring careful analysis'],
              [/\bchallenging\b/gi, 'requiring analysis'],
              
              // Storytelling phrases
              [/^Fortunately,?\s*/gim, ''],
              [/\bFortunately,?\s*/gi, ''],
              [/\bproved to be the next\b/gi, 'comprised the subsequent'],
              [/\bproved to be\b/gi, 'was'],
              
              // Defensive language
              [/\bnot feasible\b/gi, 'outside the scope of this descriptive study'],
              [/\bwas not feasible\b/gi, 'was outside the scope'],
              [/\bwere not feasible\b/gi, 'were outside the scope'],
              [/\bcertainly sufficient\b/gi, 'appropriate'],
              [/\bbut thirty is\b/gi, 'A sample of 30 was'],
              [/, a small number, but/gi, '. This sample size was'],
              
              // Original replacements
              [/\bthe simplest part\b/gi, 'conducted systematically'],
              [/\bthe easiest part\b/gi, 'conducted systematically'],
              [/\bwas the simplest part\b/gi, 'was conducted systematically'],
              [/\bfree of paywalls\b/gi, 'open-access'],
              [/\bpreferable to (\w+)\b/gi, 'appropriate'],
              [/\bcertainly preferable\b/gi, 'appropriate'],
              [/\bstraightforward grading\b/gi, 'consistent measurement'],
              [/\bfor straightforward grading\b/gi, 'for statistical consistency'],
              [/\bcommon knowledge\b/gi, 'widely recognized'],
              [/\bremains vague\b/gi, 'remains underexplored'],
              [/\binexpensive street food\b/gi, 'daily food expenditures'],
              [/\bstreet food\b/gi, 'food expenditures'],
              [/\bsubmissions were waited for\b/gi, 'responses were collected'],
              [/\bwaited for submissions\b/gi, 'collected responses'],
              [/\bthen waited for submissions\b/gi, 'and collected responses'],
              [/\binteresting results\b/gi, 'meaningful findings'],
              [/\bin vain\b/gi, ''],
              [/\bwithout contribution to the field\b/gi, ''],
              [/would otherwise have been\s*\./gi, '.'],
              [/the effort invested in the methodology would otherwise have been\s*\./gi, ''],
              [/as the effort invested[^.]*\./gi, '.'],
              
              // Fix "open-access" appearing as "sources open-access"
              [/\bsources open-access\b/gi, 'open-access sources'],
              [/\bonline sources open-access\b/gi, 'open-access online sources'],
            ];
            
            for (const [pattern, replacement] of replacements) {
              processed = processed.replace(pattern, replacement);
            }
            
            // Fix incomplete sentences like "was ." or "was  ."
            processed = processed.replace(/\bwas\s+\./g, 'was conducted.');
            processed = processed.replace(/\bwere\s+\./g, 'were conducted.');
            
            // Clean up double spaces and multiple periods
            processed = processed.replace(/  +/g, ' ');
            processed = processed.replace(/\.\s*\./g, '.');
            processed = processed.replace(/,\s*\./g, '.');
            
            return processed.trim();
          };
          
          const reassembledText = results.map(r => r.text).join('\n\n\n'); // Triple newline for spacing
          
          fullResponse = postProcessAcademic(reassembledText);
          
          // Stream the final result to user
          if (onChunk) {
            onChunk(fullResponse);
          }
          
          console.log(`[AcademicIntegrityService] Chunking complete: ${results.length} paragraphs processed`);
          
        } else {
          // Fall through to normal processing for short texts
          console.log('[AcademicIntegrityService] Too few paragraphs for chunking, using normal flow');
        }
      }
      
      // Skip normal processing if chunking was successful
      if (fullResponse !== '') {
        // Continue to return logic
      } else {
        // Normal single-pass processing for paraphrase/casual OR short polish texts
        for (let keyIndex = 0; keyIndex < GEMINI_API_KEYS.length; keyIndex++) {
          const apiKey = GEMINI_API_KEYS[keyIndex];
          console.log(`[AcademicIntegrityService] Using ${targetModel} (${mode} Mode) - Key ${keyIndex + 1}/${GEMINI_API_KEYS.length}`);
        
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
            model: targetModel,
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
      } // Close the else block for normal processing
    } else {
      // Use Claude Sonnet 4.5 for essay and CS modes (better quality)
      console.log('[AcademicIntegrityService] Using Claude Sonnet 4.5 (Essay/CS Mode)');
      
      // Dynamic temperature scaling based on input length
      // Identify input type: Multimodal or Text?
      const base64ImageMatch = input.match(/data:image\/(png|jpeg|jpg|webp);base64,([^"'\s]+)/);
      let messages: any[] = [];
      let inputWordCount = 0;

      if (base64ImageMatch) {
        // MULTIMODAL REQUEST
        const mimeType = base64ImageMatch[1] === 'jpg' ? 'jpeg' : base64ImageMatch[1]; // Normalization
        const base64Data = base64ImageMatch[2];
        const textContent = input.replace(base64ImageMatch[0], '').trim(); // Remove base64 from text
        
        inputWordCount = textContent.split(/\s+/).length;
        
        console.log(`[AcademicIntegrityService] Detected Image Input (${mimeType}). Processing as Multimodal.`);
        
        messages = [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: `image/${mimeType}`,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: userMessage.replace(base64ImageMatch[0], '[Image attached]').trim() // Ensure clean text context
              }
            ]
          }
        ];
      } else {
        // STANDARD TEXT REQUEST
        inputWordCount = input.trim().split(/\s+/).length;
        messages = [{ role: 'user', content: userMessage }];
      }

      let dynamicTemperature = 1.0; 
      if (inputWordCount >= 1500) {
        dynamicTemperature = 0.85;
      } else if (inputWordCount >= 500) {
        dynamicTemperature = 0.9;
      }
      console.log(`[AcademicIntegrityService] Claude Input: ${inputWordCount} words → Temperature: ${dynamicTemperature}`);

      const stream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514', // Using Claude 3.5 Sonnet (mapped via proxy/Shim)
        max_tokens: 4096,
        system: systemInstruction,
        messages: messages,
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
    // Ignore abort errors - they are expected user actions
    if (error.name === 'AbortError' || error.message?.includes('aborted') || error.message?.includes('cancelled')) {
      throw new Error('Generation cancelled by user');
    }

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
