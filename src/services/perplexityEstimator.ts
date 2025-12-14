import { PerplexityScore } from '../types';

/**
 * Estimates perplexity without requiring model inference.
 * Uses heuristic-based scoring as a proxy for true perplexity.
 * 
 * NOTE: True perplexity requires access to LLM logits (GPT-2, etc.)
 * This is a simplified client-side approximation.
 */
export function estimatePerplexity(text: string): PerplexityScore {
  // Heuristic-based perplexity estimation using multiple signals:
  
  // 1. Lexical Diversity (Type-Token Ratio)
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const typeTokenRatio = uniqueWords.size / words.length;
  
  // 2. Average Word Length (longer words = higher perplexity)
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  
  // 3. Rare Word Usage (count words > 10 characters)
  const longWords = words.filter(w => w.length > 10).length;
  const longWordRatio = longWords / words.length;
  
  // 4. Punctuation Complexity (em-dashes, semicolons, colons)
  const complexPunctuation = (text.match(/[—;:]/g) || []).length;
  const punctuationDensity = complexPunctuation / words.length;
  
  // 5. Forbidden Phrase Detection (LLM tells)
  const forbiddenPhrases = [
    'it is important to note',
    'delve into',
    'in conclusion',
    'in summary',
    'the landscape of',
    'tapestry',
    "in today's society"
  ];
  
  const lowerText = text.toLowerCase();
  const forbiddenCount = forbiddenPhrases.filter(phrase => lowerText.includes(phrase)).length;
  
  // Composite Score Calculation
  let score = 100; // Base score
  
  // Boost for diversity
  score += typeTokenRatio * 50;
  
  // Boost for word complexity
  score += (avgWordLength - 4) * 10; // 4 is typical average
  score += longWordRatio * 100;
  
  // Boost for punctuation complexity
  score += punctuationDensity * 200;
  
  // Penalty for forbidden phrases (major tell)
  score -= forbiddenCount * 50;
  
  // Clamp to reasonable range
  const perplexity = Math.max(20, Math.min(300, score));
  
  // Scoring
  let scoreLabel: 'LOW' | 'MEDIUM' | 'HIGH';
  let interpretation: string;
  
  if (perplexity < 80) {
    scoreLabel = 'LOW';
    interpretation = '⚠️ Highly predictable text. AI signature detected.';
  } else if (perplexity < 150) {
    scoreLabel = 'MEDIUM';
    interpretation = '⚡ Moderate unpredictability. Acceptable but could improve.';
  } else {
    scoreLabel = 'HIGH';
    interpretation = '✅ High perplexity. Natural human variance detected.';
  }
  
  return {
    perplexity,
    score: scoreLabel,
    interpretation
  };
}

/**
 * Detects forbidden LLM phrases in text
 */
export function detectForbiddenPhrases(text: string): string[] {
  const forbiddenPhrases = [
    'it is important to note',
    'delve into',
    'in conclusion',
    'in summary',
    'the landscape of',
    'tapestry',
    'in today\'s society',
    'in recent years',
    'throughout history',
    'at its core',
    'let\'s dive into'
  ];
  
  const lowerText = text.toLowerCase();
  return forbiddenPhrases.filter(phrase => lowerText.includes(phrase));
}
