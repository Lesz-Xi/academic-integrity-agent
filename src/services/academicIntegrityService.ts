import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { Mode, GenerationResponse, DetectionMetrics, ChatMessage } from '../types';
import { ESSAY_MODE_PROMPT } from '../prompts/modeA_essay';
import { CS_MODE_PROMPT } from '../prompts/modeB_cs';
import { PARAPHRASE_MODE_PROMPT } from '../prompts/modeC_paraphrase';
import { analyzeBurstiness } from './burstinessAnalyzer';
import { estimatePerplexity, detectForbiddenPhrases } from './perplexityEstimator';

// Initialize Claude client (for Essay & CS modes)
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

// Initialize Gemini clients (for Paraphrase mode - with failover support)
const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_BACKUP,
].filter(key => key && key !== 'YOUR_THIRD_KEY_HERE');

// Primary Gemini API key (used as fallback reference)
const _primaryGeminiKey = GEMINI_API_KEYS[0] || '';


const MODE_PROMPTS: Record<Mode, string> = {
  essay: ESSAY_MODE_PROMPT,
  cs: CS_MODE_PROMPT,
  paraphrase: PARAPHRASE_MODE_PROMPT
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
  length: 'short' | 'medium' | 'long' = 'medium'
): Promise<GenerationResponse> {
  
  let systemPrompt = MODE_PROMPTS[mode];
  let searchContext = '';
  
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
  
  // Claude will be called directly with streaming
  const systemInstruction = systemPrompt;
  
  // Build user message with search context if available
  let userMessage = input;
  
  if (searchContext) {
    userMessage = `${searchContext}\n\n---\n\nUSER REQUEST:\n${input}`;
  }
  
  // Inject length instructions (only for content generation modes, not paraphrase)
  if (mode !== 'paraphrase') {
    const lengthTargets = {
      short: '400-600 words',      // Optimized: shorter for better humanization
      medium: '800-1,000 words',   // Optimized: reduced from 1,200-1,800
      long: '1,500-2,000 words'    // Optimized: reduced from 2,500-3,500
    };
    userMessage += `\n\nIMPORTANT: Target length is ${lengthTargets[length]}. Ensure the response meets this requirement.`;
  } else {
    // For paraphrase mode: output length should match input length, and output ONLY the result
    userMessage += `\n\nCRITICAL OUTPUT RULES:
1. Output ONLY the paraphrased/humanized text. No explanations, no reasoning, no commentary.
2. Do NOT include phrases like "Here is the paraphrased text" or "The user has requested..."
3. Output length should be similar to the input length (this is paraphrase, not expansion).
4. Start directly with the transformed content.`;
  }
  
  if (additionalInstructions) {
    userMessage += `\n\nAdditional Instructions: ${additionalInstructions}`;
  }

  
  let fullResponse = '';

  try {
    // HYBRID MODEL SELECTION: Gemini for paraphrase, Claude for essay/CS
    if (mode === 'paraphrase') {
      // Use Gemini for paraphrase mode with automatic failover
      let lastError: Error | null = null;
      
      for (let keyIndex = 0; keyIndex < GEMINI_API_KEYS.length; keyIndex++) {
        const apiKey = GEMINI_API_KEYS[keyIndex];
        console.log(`[AcademicIntegrityService] Using Gemini 2.5 Flash Lite (Paraphrase Mode) - Key ${keyIndex + 1}/${GEMINI_API_KEYS.length}`);
        
        try {
          const geminiClient = new GoogleGenAI({ apiKey });
          const chat = geminiClient.chats.create({
            model: 'gemini-2.5-flash-lite-preview-09-2025',
            config: {
              systemInstruction: systemInstruction,
              temperature: 1.1,
              topK: 80,
              topP: 0.95,
              maxOutputTokens: 4096
            }
          });
          
          const result = await chat.sendMessageStream({ message: userMessage });
          
          for await (const chunk of result) {
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
          
          // Check if rate limited (429)
          if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
            console.warn(`[AcademicIntegrityService] Key ${keyIndex + 1} rate limited, trying next key...`);
            fullResponse = ''; // Reset for retry
            continue;
          }
          
          // For other errors, don't retry
          throw error;
        }
      }
      
      // If all keys failed with rate limit
      if (lastError && fullResponse === '') {
        throw new Error('All API keys exhausted. Please try again later.');
      }
    } else {
      // Use Claude Sonnet 4.5 for essay and CS modes (better quality)
      console.log('[AcademicIntegrityService] Using Claude Sonnet 4.5 (Essay/CS Mode)');
      
      const stream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemInstruction,
        messages: [
          { role: 'user', content: userMessage }
        ],
        temperature: 1.0
      });

      for await (const event of stream) {
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
  
  return {
    text: fullResponse,
    metrics,
    warnings
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
    role: msg.role as 'user' | 'assistant',
    content: msg.text
  }));
  
  let fullResponse = '';

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-opus-4-20250514',
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
