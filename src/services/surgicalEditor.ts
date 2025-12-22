import { GoogleGenAI } from '@google/genai';

export interface SurgicalResult {
  editedText: string;
  editedCount: number;
  preservationRatio: number;
}

/**
 * Applies surgical edits to text using Gemini to preserve human patterns while reducing AI detection risk.
 * 
 * @param input - The original text to edit
 * @param apiKey - Gemini API key
 * @param threshold - Editor aggression level
 * @param userId - Optional user ID for analytics/personalization
 */
export async function applySurgicalEdits(
  input: string, 
  apiKey: string, 
  threshold: 'HIGH' | 'MEDIUM' = 'HIGH'
): Promise<SurgicalResult> {
  
  try {
    const client = new GoogleGenAI({ apiKey });
    
    // Select model - using Flash Lite for speed/cost effectiveness as it's an editing task
    const model = 'gemini-2.5-flash-lite-preview-09-2025';
    
    const systemInstruction = `You are a SURGICAL TEXT EDITOR. Your goal is to modify specific sentences in the provided text to reduce AI detection signatures while PRESERVING the original meaning, voice, and structure as much as possible.

    MODE: ${threshold} Preservation
    ${threshold === 'HIGH' ? 
      '- Make MINIMAL changes. Only touch sentences that sound extremely robotic.' : 
      '- Make MODERATE changes. Smooth out robotic phrasing and repetitive patterns.'}
    
    RULES:
    1. Output ONLY the edited text. Do not output any preamble or explanation.
    2. Maintain the original word count within +/- 10%.
    3. Do not change technical terms or facts.
    4. If the text looks human enough, output it unchanged.`;

    const chat = client.chats.create({
      model,
      config: {
        systemInstruction,
        temperature: 0.7, // Lower temperature for preservation
        topK: 40,
        topP: 0.95,
      }
    });

    const result = await chat.sendMessage({ message: input });
    const editedText = result.text || input; // Correct accessor (getter)

    // Calculate simple stats
    // Note: detailed diffing would require more complex logic, here we estimate
    const inputSentences = input.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const outputSentences = editedText.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    
    // Crude estimation of edited count based on length diff of sentences (mock logic for now)
    // In a real implementation, we'd align sentences and check Levenshtein distance
    let editedCount = 0;
    const minLen = Math.min(inputSentences.length, outputSentences.length);
    for (let i = 0; i < minLen; i++) {
        if (inputSentences[i].trim() !== outputSentences[i].trim()) {
            editedCount++;
        }
    }
    
    // Preservation ratio (similarity check - simplified as 1 - change_ratio)
    const preservationRatio = 1 - (editedCount / Math.max(inputSentences.length, 1));

    return {
      editedText,
      editedCount,
      preservationRatio
    };

  } catch (error) {
    console.error('Surgical Edit Failed:', error);
    // Fallback to original text on failure
    return {
      editedText: input,
      editedCount: 0,
      preservationRatio: 1.0
    };
  }
}
