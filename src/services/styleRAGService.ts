/**
 * Style-RAG Service (v1.0)
 * 
 * Based on First Principles Thinking:
 * 1. Axiom of Identity: Users have unique phrasing habits.
 * 2. Axiom of Provenance: Matching past human signatures bypasses anomaly detection.
 */

import { GenerationService } from './generationService';
import { analyzeBurstiness } from './burstinessAnalyzer';
import { estimatePerplexity } from './perplexityEstimator';

export interface StylePrototype {
  text: string;
  dna: {
    burstiness: number;
    perplexity: number;
    lexicalDiversity: number;
    punctuationDensity: number;
    avgWordLength: number;
  };
  length: number;
}

export class StyleRAGService {
  /**
   * Fetch stylistic prototypes from user history
   */
  static async getStylePrototypes(userId: string, limit: number = 5): Promise<StylePrototype[]> {
    try {
      // 1. Fetch recent history
      console.log(`[StyleRAGService] Fetching history for userId: ${userId}`);
      const history = await GenerationService.getHistory(userId, 50, 0);
      console.log(`[StyleRAGService] History raw count: ${history.length}`);
      
      // 2. Filter for "Human-like" entries (Low AI Risk)
      const humanSamples = history
        .filter(item => {
          const isLow = item.metrics?.overallRisk === 'LOW';
          const hasText = item.input && item.input.length > 100;
          return isLow && hasText;
        })
        .map(item => item.input);
      console.log(`[StyleRAGService] Human samples after filter: ${humanSamples.length}`);

      if (humanSamples.length === 0) return [];

      // 4. Score and select top prototypes based on structural diversity AND similarity
      const scoredPrototypes = humanSamples.map(text => {
        const burst = analyzeBurstiness(text);
        const perp = estimatePerplexity(text);
        
        const dnaWords = text.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(dnaWords);
        const punctuationCount = (text.match(/[—;:]/g) || []).length;

        return {
          text,
          dna: {
            burstiness: burst.coefficient_of_variation,
            perplexity: perp.perplexity,
            lexicalDiversity: uniqueWords.size / dnaWords.length,
            punctuationDensity: punctuationCount / dnaWords.length,
            avgWordLength: dnaWords.reduce((sum, w) => sum + w.length, 0) / dnaWords.length
          },
          length: text.length
        };
      });

      // Sort by a combination of burstiness and "Complexity Signature"
      // We want prototypes that are both diverse and representative of the user's high-ends
      return scoredPrototypes
        .sort((a, b) => b.dna.burstiness + b.dna.perplexity / 100 - (a.dna.burstiness + a.dna.perplexity / 100))
        .slice(0, limit);
    } catch (error) {
      console.error('[StyleRAGService] Failed to retrieve style prototypes:', error);
      return [];
    }
  }

  /**
   * Format prototypes for LLM prompt injection
   */
  static formatPrototypesForPrompt(prototypes: StylePrototype[]): string {
    if (prototypes.length === 0) return '';

    let prompt = "\n### INVISIBLE AUTHOR - STYLE SAMPLES\n";
    prompt += "Directives: These are samples of the user's natural voice.\n";
    prompt += "1. IGNORE grammar rules if the samples ignore them.\n";
    
    // Calculate global habits to give a high-level summary
    const avgBurst = prototypes.reduce((sum, p) => sum + p.dna.burstiness, 0) / prototypes.length;
    const highPunctuation = prototypes.some(p => p.dna.punctuationDensity > 0.05);
    
    if (avgBurst > 0.6) prompt += "2. GLOBAL TRAIT: High Burstiness (mix of very short/long sentences).\n";
    if (highPunctuation) prompt += "3. GLOBAL TRAIT: Dense Punctuation (complex clauses).\n\n";

    prototypes.forEach((p, i) => {
      prompt += `[Sample ${i + 1} - Length: ${p.length} chars]:\n"${p.text.substring(0, 600)}..."\n\n`;
    });

    return prompt;
  }
}
