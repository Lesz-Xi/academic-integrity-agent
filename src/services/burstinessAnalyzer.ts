import { BurstinessScore } from '../types';

/**
 * Analyzes the burstiness (sentence length variance) of text.
 * Low burstiness = AI-like (uniform sentences)
 * High burstiness = Human-like (varied sentences)
 */
export function analyzeBurstiness(text: string): BurstinessScore {
  // 1. Tokenize into sentences using multiple delimiters
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length < 3) {
    return {
      coefficient_of_variation: 0,
      sentence_lengths: [],
      score: 'LOW',
      interpretation: '⚠️ Text too short for reliable burstiness analysis.',
      details: 'Need at least 3 sentences for variance calculation.'
    };
  }
  
  // 2. Calculate word count per sentence
  const lengths = sentences.map(s => {
    const words = s.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length;
  });
  
  // 3. Statistical calculation: Coefficient of Variation (CV = σ/μ)
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  const std_dev = Math.sqrt(variance);
  const cv = std_dev / mean;
  
  // 4. Scoring based on research thresholds
  let score: 'LOW' | 'MEDIUM' | 'HIGH';
  let interpretation: string;
  let details: string;
  
  if (cv < 0.3) {
    score = 'LOW';
    interpretation = '⚠️ Uniform sentence length detected. High AI detection risk.';
    details = `CV = ${cv.toFixed(2)}. LLM-generated text typically shows CV < 0.3. Consider varying sentence structure.`;
  } else if (cv < 0.6) {
    score = 'MEDIUM';
    interpretation = '⚡ Moderate sentence variance. Acceptable but improvable.';
    details = `CV = ${cv.toFixed(2)}. Borderline human-like. Add more structural dynamism (short punchy sentences + long complex ones).`;
  } else {
    score = 'HIGH';
    interpretation = '✅ High burstiness. Strong human signature.';
    details = `CV = ${cv.toFixed(2)}. Excellent variance! Sentence lengths range from ${Math.min(...lengths)} to ${Math.max(...lengths)} words.`;
  }
  
  return {
    coefficient_of_variation: cv,
    sentence_lengths: lengths,
    score,
    interpretation,
    details
  };
}

/**
 * Visualizes sentence length distribution
 */
export function getSentenceLengthHistogram(lengths: number[]): string {
  const maxLength = Math.max(...lengths);
  const minLength = Math.min(...lengths);
  const range = maxLength - minLength;
  
  if (range === 0) return 'All sentences have identical length (CRITICAL AI TELL)';
  
  return lengths.map((len, idx) => {
    const bar = '█'.repeat(Math.ceil((len / maxLength) * 20));
    return `S${idx + 1}: ${bar} (${len}w)`;
  }).join('\n');
}
