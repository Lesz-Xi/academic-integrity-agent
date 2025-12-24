import { ANTI_THESAURUS_DATA } from '../data/antiThesaurusData';

export interface SimplificationSuggestion {
  index: number;
  length: number;
  original: string;
  replacements: string[];
}

export class AnalysisService {
  /**
   * Scans text for high-probability AI/Academic words and suggests
   * simpler "Anti-Thesaurus" alternatives.
   */
  static scanForSimplification(text: string): SimplificationSuggestion[] {
    const suggestions: SimplificationSuggestion[] = [];
    if (!text) return suggestions;

    // Iterate through all known dictionary words
    Object.keys(ANTI_THESAURUS_DATA).forEach(complexWord => {
      // Create a regex to find whole words only
      const regex = new RegExp(`\\b${complexWord}\\b`, 'gi');
      let match;

      while ((match = regex.exec(text)) !== null) {
        suggestions.push({
          index: match.index,
          length: match[0].length,
          original: match[0], // Keep original casing
          replacements: ANTI_THESAURUS_DATA[complexWord]
        });
      }
    });

    // Sort by index to keep order
    return suggestions.sort((a, b) => a.index - b.index);
  }
}
