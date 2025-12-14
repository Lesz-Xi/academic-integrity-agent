import { GoogleGenAI } from '@google/genai';
import { Mode, GenerationResponse, DetectionMetrics, ChatMessage } from '../types';
import { ESSAY_MODE_PROMPT } from '../prompts/modeA_essay';
import { CS_MODE_PROMPT } from '../prompts/modeB_cs';
import { PARAPHRASE_MODE_PROMPT } from '../prompts/modeC_paraphrase';
import { analyzeBurstiness } from './burstinessAnalyzer';
import { estimatePerplexity, detectForbiddenPhrases } from './perplexityEstimator';
import { geminiRateLimiter, checkRateLimit } from '../utils/rateLimiter';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

/**
 * Classify API errors for better error handling
 */
function classifyApiError(error: any): {
  type: 'quota' | 'auth' | 'network' | 'server' | 'unknown';
  message: string;
  retryable: boolean;
  retryAfter?: number;
} {
  const errorStr = JSON.stringify(error);
  const errorMessage = error?.message || errorStr;

  // Check for 429 rate limit
  if (errorStr.includes('"code":429') || errorMessage.includes('429')) {
    // Try to extract retry delay
    let retryAfter: number | undefined;
    const retryMatch = errorStr.match(/"retryDelay":"(\d+)s"/);
    if (retryMatch) {
      retryAfter = parseInt(retryMatch[1]);
    }

    return {
      type: 'quota',
      message: 'Rate limit exceeded. Please wait before retrying.',
      retryable: true,
      retryAfter
    };
  }

  // Check for auth errors
  if (errorStr.includes('"code":401') || errorStr.includes('"code":403') ||
      errorMessage.includes('401') || errorMessage.includes('403')) {
    return {
      type: 'auth',
      message: 'Invalid API key. Please check your .env.local file.',
      retryable: false
    };
  }

  // Check for server errors (500s)
  if (errorStr.includes('"code":5') || errorMessage.includes('500')) {
    return {
      type: 'server',
      message: 'Gemini API server error. Please try again.',
      retryable: true
    };
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection.',
      retryable: true
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred. Please try again.',
    retryable: false
  };
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorInfo = classifyApiError(error);

      // Don't retry if not retryable or on last attempt
      if (!errorInfo.retryable || attempt === maxRetries) {
        throw new Error(errorInfo.message);
      }

      // Calculate delay with exponential backoff
      const delay = errorInfo.retryAfter
        ? errorInfo.retryAfter * 1000
        : baseDelay * Math.pow(2, attempt) + Math.random() * 1000;

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

const MODE_PROMPTS: Record<Mode, string> = {
  essay: ESSAY_MODE_PROMPT,
  cs: CS_MODE_PROMPT,
  paraphrase: PARAPHRASE_MODE_PROMPT
};

/**
 * Generate academic content using mode-specific prompts
 * @param searchEnabled - If true, search web for sources and inject into context
 */
export async function generateContent(
  mode: Mode,
  input: string,
  additionalInstructions: string = '',
  onChunk?: (text: string) => void,
  searchEnabled: boolean = false
): Promise<GenerationResponse> {
  
  // Check rate limit before making API call
  checkRateLimit(geminiRateLimiter, 'Gemini API');
  
  let systemPrompt = MODE_PROMPTS[mode];
  let searchContext = '';
  
  // Search integration (only for essay and cs modes)
  if (searchEnabled && (mode === 'essay' || mode === 'cs')) {
    try {
      const { searchAndSelectSources } = await import('./searchService');
      const searchResult = await searchAndSelectSources(input, 10, 5, 100);
      
      if (searchResult && searchResult.sources.length > 0) {
        searchContext = searchResult.formattedContext;
        console.log(`[AcademicIntegrityService] Search found ${searchResult.sources.length} sources`);
      }
    } catch (error) {
      console.warn('[AcademicIntegrityService] Search failed, proceeding without sources:', error);
    }
  }
  
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash-lite-preview-09-2025',
    config: {
      systemInstruction: systemPrompt,
      temperature: 1.1, // Model 2.0: Increased for higher perplexity/variance
      topK: 80,         // Model 2.0: Wider vocabulary selection (long-tail words)
      topP: 0.95,
      maxOutputTokens: 4096
    }
  });
  
  // Build user message with search context if available
  let userMessage = input;
  
  if (searchContext) {
    userMessage = `${searchContext}\n\n---\n\nUSER REQUEST:\n${input}`;
  }
  
  if (additionalInstructions) {
    userMessage += `\n\nAdditional Instructions: ${additionalInstructions}`;
  }

  
  let fullResponse = '';

  try {
    await retryWithBackoff(async () => {
      const result = await chat.sendMessageStream({
        message: userMessage
      });

      for await (const chunk of result) {
        if (chunk.text) {
          fullResponse += chunk.text;
          if (onChunk) onChunk(chunk.text);
        }
      }
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Error message already classified by retryWithBackoff
    throw error;
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
  
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash-lite',
    config: {
      systemInstruction: systemPrompt,
      temperature: 1.1, // Model 2.0: Increased for higher perplexity/variance
      topK: 80,         // Model 2.0: Wider vocabulary selection
      topP: 0.95,
      maxOutputTokens: 4096
    },
    history: history.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }))
  });
  
  const currentMessage = history[history.length - 1];
  let fullResponse = '';

  try {
    await retryWithBackoff(async () => {
      const result = await chat.sendMessageStream({
        message: currentMessage.text
      });

      for await (const chunk of result) {
        if (chunk.text) {
          fullResponse += chunk.text;
          onChunk(chunk.text);
        }
      }
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    const errorInfo = classifyApiError(error);
    onChunk(`I apologize, but I encountered an error: ${errorInfo.message}`);
  }

  return fullResponse;
}
