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

  /**
   * Analyzes sentence complexity to proxy "Perplexity".
   * Short, simple, repetitive sentences -> HIGH RISK (AI-like).
   * Complex, varied sentences -> LOW RISK (Human-like).
   */
  static analyzeSentenceComplexity(text: string): SentenceAnalysis[] {
    if (!text) return [];

    // 1. Robust Sentence Splitter (matches punctuation followed by space or end of string)
    // Captures the punctuation as part of the match implies using a lookbehind or capturing group approach,
    // but JS regex is tricky. 
    // Easier way: match sentence + punctuation.
    // Regex: [^.!?]+[.!?]+(\s+|$)  -- finds chunks ending in punctuation
    // Note: This is a simple tokenizer for MVP.
    const sentenceRegex = /[^.!?\n]+([.!?\n]+|$)/g;
    
    const analyses: SentenceAnalysis[] = [];
    let match;

    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentenceText = match[0];
      const trimmed = sentenceText.trim();
      
      if (trimmed.length < 3) continue; // Skip noise

      // 2. Metrics Calculation
      const words = trimmed.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const cleanWords = words.filter(w => w.length > 0);
      
      if (cleanWords.length === 0) continue;

      const totalWords = cleanWords.length;
      const uniqueWords = new Set(cleanWords).size;
      const totalChars = cleanWords.reduce((acc, w) => acc + w.length, 0);
      const avgWordLength = totalChars / totalWords;
      const entropy = uniqueWords / totalWords; // Type-Token Ratio (Variance)

      // 3. Risk Algorithm (The "Sovereign Proxy")
      // AI tends to be:
      // - Medium length (15-25 words)
      // - Perfect grammar (hard to check here)
      // - Average vocabulary (Entropy ~0.7-0.8)
      // Human tends to be:
      // - Variable length (Short / Long bursts)
      // - High Variance (Entropy > 0.9 or < 0.5 for repetition)
      
      let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      
      // Heuristic:
      // If entropy is VERY HIGH (> 0.95), it's likely complex human thought or random keys. -> LOW RISK (Green)
      // If entropy is LOW (< 0.6), it's repetitive. -> HIGH RISK (Red) - Actually AI avoids repetition usually...
      // Wait, AI has "High probability", meaning it chooses "Common" words.
      // So high average word length -> Human (Rare words).
      // Low average word length -> AI (Simple words).
      
      // Simplified Model for MVP:
      if (avgWordLength > 5.5 || entropy > 0.9) {
          risk = 'LOW'; // Complex / High Variance
      } else if (avgWordLength < 4.0 && totalWords > 10) {
          risk = 'HIGH'; // Simple + Long-ish (Ramble without substance)
      } else {
          risk = 'MEDIUM'; // Average
      }
      
      // Override: Very short sentences are usually human (conversation) or headers
      if (totalWords < 5) risk = 'LOW';

      analyses.push({
        index: match.index,
        length: sentenceText.length, // Include whitespace/punctuation for highlighting math
        text: sentenceText,
        risk,
        entropyScore: entropy,
        avgWordLength
      });
    }

    return analyses;
  }

  /**
   * Phase 4: Burstiness Analysis (Rhythm Detector).
   * Segments text into Paragraphs and calculates Coefficient of Variation (CV).
   * CV < 0.25 -> Monotone (AI-like).
   * CV > 0.6 -> Bursty (Human-like).
   */
  static analyzeBurstiness(text: string): ParagraphAnalysis[] {
    if (!text) return [];

    // Split by double newline (Paragraphs)
    // We capture the delimiter to preserve exact spacing in the UI reconstruction if needed,
    // but typically we can just reconstruct from indices.
    // For rendering, we need the exact text parts.
    
    // Simple split for analysis logic:
    // We need to map this back to the original text. 
    // Let's find paragraphs by regex `\n\n+` or just split by `\n` if we consider single lines as paragraphs?
    // Markdown usually treats `\n\n` as paragraph. `\n` is just a break.
    // Let's assume standard writing: Paragraphs separated by newlines.
    
    // Strategy: Iterate through text, find blocks separated by \n.
    
    const paragraphs: ParagraphAnalysis[] = [];
    // Regex matches logical paragraphs (text ending with \n or EOF)
    // Actually, splitting by `\n` is safest for visual alignment in the backdrop.
    // Use `\n` as the delimiter.
    
    const lines = text.split('\n');
    let currentIndex = 0;

    lines.forEach((line, i) => {
        // The delimiter length is 1 for \n, except for the last line if no newline.
        // Actually split removes the delimiter. We assume \n is 1 char.
        // We need to account for it in indexing. 
        // Logic: each line (except maybe last) is followed by \n in the original string (if we used split('\n')).
        // Wait, `split` consumes the separator.
        // We need to restore it for the UI to match.
        // We will assume `line + '\n'` (or just `line` if it's the last one).
        
        // Actually, to be robust:
        const fullLine = i < lines.length - 1 ? line + '\n' : line; 
        
        // Analyze sentences in this "paragraph" (line)
        const sentences = this.analyzeSentenceComplexity(line);
        
        // Burstiness Math
        let isMonotone = false;
        let cv = 0;
        
        if (sentences.length > 2) {
            // Re-parsing words from the sentence analysis results is redundant but safe.
            const wordCounts = sentences.map(s => s.text.trim().split(/\s+/).length);
            
            const mean = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
            const variance = wordCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wordCounts.length;
            const stdDev = Math.sqrt(variance);
            
            cv = mean > 0 ? stdDev / mean : 0;
            
            // Verdict
            // CV < 0.25 is very robotic (uniform lengths).
            if (cv < 0.25) {
                isMonotone = true;
                
                // RHYTHM OVERRIDE PROTOCOL
                // "Fruit of the Poisonous Tree": If structure is robotic, individual sentences cannot be "Safe".
                // Downgrade all LOW (Green) risk to MEDIUM (Yellow).
                sentences.forEach(s => {
                    if (s.risk === 'LOW') {
                        s.risk = 'MEDIUM';
                    }
                });
            }
        }

        paragraphs.push({
            index: currentIndex,
            length: fullLine.length,
            text: fullLine,
            sentences,
            isMonotone,
            cv
        });
        
        currentIndex += fullLine.length;
    });

    return paragraphs;
  }
}

export interface SentenceAnalysis {
  index: number;
  length: number;
  text: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  entropyScore: number;
  avgWordLength: number;
}

export interface ParagraphAnalysis {
    index: number;
    length: number;
    text: string;
    sentences: SentenceAnalysis[];
    isMonotone: boolean;
    cv: number;
}
