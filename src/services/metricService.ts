/**
 * Metric Computation Service
 * Detector-agnostic cognitive artifact measurement
 * 
 * Implements:
 * - TCR (Terminology Consistency Rate)
 * - SCV (Semantic Coherence Variance) - using local sentence transformers
 * - LCD (Local Contradiction Density) - using pattern-based detection
 * - HDV (Hedging Distribution Variance)
 */

// ===== METRIC 1: Terminology Consistency Rate (TCR) =====
// Refactored: Exact noun phrase matching to detect lexical drift
// (e.g., "compostable packaging" vs "biodegradable wraps")

export async function computeTCR(text: string): Promise<number> {
  const sections = text.split(/\n\n+/).filter(s => s.trim().length > 50);
  
  if (sections.length < 2) return 1.0;
  
  // Extract key noun phrases (2-3 word combinations) from each section
  const sectionPhrases: Set<string>[] = [];
  
  for (const section of sections) {
    const phrases = extractNounPhrases(section);
    sectionPhrases.push(phrases);
  }
  
  // Compute terminology consistency across sections
  // TCR = overlap of phrases across sections / union of all phrases
  
  // Get all phrases across document
  const allPhrases = new Set<string>();
  sectionPhrases.forEach(phrases => phrases.forEach(p => allPhrases.add(p)));
  
  if (allPhrases.size === 0) return 1.0;
  
  // Count how many sections each phrase appears in
  const phraseFrequency = new Map<string, number>();
  for (const phrases of sectionPhrases) {
    for (const phrase of phrases) {
      phraseFrequency.set(phrase, (phraseFrequency.get(phrase) || 0) + 1);
    }
  }
  
  // Calculate consistency: phrases that appear in multiple sections / total phrases
  const consistentPhrases = Array.from(phraseFrequency.values())
    .filter(freq => freq >= 2).length; // Appears in at least 2 sections
  
  const totalDistinctPhrases = allPhrases.size;
  
  // TCR = ratio of consistent phrases
  const tcr = totalDistinctPhrases > 0 ? consistentPhrases / totalDistinctPhrases : 1.0;
  
  return tcr;
}

// Extract key noun phrases (2-3 word combinations) - EXACT matching
function extractNounPhrases(text: string): Set<string> {
  const phrases = new Set<string>();
  
  // Clean and tokenize
  const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, ' ');
  const words = cleanText.split(/\s+/).filter(w => w.length > 2);
  
  // Skip common stop words
  const stopWords = new Set([
    'the', 'and', 'but', 'for', 'with', 'this', 'that', 'from', 'into',
    'which', 'their', 'these', 'those', 'such', 'more', 'also', 'been',
    'have', 'has', 'are', 'was', 'were', 'being', 'would', 'could',
    'should', 'can', 'may', 'might', 'must'
  ]);
  
  const filteredWords = words.filter(w => !stopWords.has(w));
  
  // Extract 2-word and 3-word phrases
  for (let i = 0; i < filteredWords.length - 1; i++) {
    const twoWord = `${filteredWords[i]} ${filteredWords[i + 1]}`;
    phrases.add(twoWord);
    
    if (i < filteredWords.length - 2) {
      const threeWord = `${filteredWords[i]} ${filteredWords[i + 1]} ${filteredWords[i + 2]}`;
      phrases.add(threeWord);
    }
  }
  
  return phrases;
}

// ===== METRIC 2: Semantic Coherence Variance (SCV) =====
// Using TF-IDF vectorization and cosine similarity (no external dependencies)

export async function computeSCV(
  text: string,
  _anthropicKey?: string // Kept for API compatibility, but unused
): Promise<{ variance: number; meanSimilarity: number }> {
  const sections = text.split(/\n\n+/).filter(s => s.trim().length > 50);
  
  if (sections.length < 2) {
    return { variance: 0, meanSimilarity: 1.0 };
  }
  
  // Compute TF-IDF vectors for all sections
  const tfidfVectors = computeTFIDF(sections);
  
  // Compute cosine similarities between adjacent sections
  const similarities: number[] = [];
  
  for (let i = 0; i < tfidfVectors.length - 1; i++) {
    const sim = cosineSimilarity(tfidfVectors[i], tfidfVectors[i + 1]);
    similarities.push(sim);
  }
  
  if (similarities.length === 0) {
    return { variance: 0, meanSimilarity: 1.0 };
  }
  
  const mean = similarities.reduce((a, b) => a + b, 0) / similarities.length;
  const variance = similarities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / similarities.length;
  
  return { variance, meanSimilarity: mean };
}

// Compute TF-IDF vectors for documents
function computeTFIDF(documents: string[]): number[][] {
  // Tokenize all documents
  const docTokens = documents.map(doc => tokenize(doc));
  
  // Build vocabulary
  const vocabulary = new Set<string>();
  docTokens.forEach(tokens => tokens.forEach(t => vocabulary.add(t)));
  const vocab = Array.from(vocabulary);
  
  // Compute document frequencies
  const df = new Map<string, number>();
  vocab.forEach(term => {
    const count = docTokens.filter(tokens => tokens.includes(term)).length;
    df.set(term, count);
  });
  
  const numDocs = documents.length;
  
  // Compute TF-IDF vectors
  return docTokens.map(tokens => {
    const vector: number[] = new Array(vocab.length).fill(0);
    
    // Compute term frequencies
    const tf = new Map<string, number>();
    tokens.forEach(term => {
      tf.set(term, (tf.get(term) || 0) + 1);
    });
    
    // Compute TF-IDF for each term in vocabulary
    vocab.forEach((term, idx) => {
      const termFreq = (tf.get(term) || 0) / tokens.length;
      const inverseDocFreq = Math.log(numDocs / (df.get(term) || 1));
      vector[idx] = termFreq * inverseDocFreq;
    });
    
    return vector;
  });
}

// Tokenize text (simple word tokenization)
function tokenize(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might',' can', 'this', 'that', 'these', 'those'
  ]);
  
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  return words.filter(w => w.length > 2 && !stopWords.has(w));
}

// Helper: Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ===== METRIC 3: Local Contradiction Density (LCD) =====
// Using pattern-based contradiction detection instead of Claude NLI

export async function computeLCD(
  text: string,
  _anthropicKey?: string // Kept for API compatibility, but unused
): Promise<number> {
  // Extract claims (sentences that make assertions)
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
  
  if (sentences.length < 2) return 0;
  
  let contradictionCount = 0;
  let totalComparisons = 0;
  
  // Compare each sentence with the next 3 (local window)
  for (let i = 0; i < sentences.length - 1; i++) {
    const windowEnd = Math.min(i + 4, sentences.length);
    
    for (let j = i + 1; j < windowEnd; j++) {
      totalComparisons++;
      
      if (detectContradiction(sentences[i], sentences[j])) {
        contradictionCount++;
      }
    }
  }
  
  return totalComparisons > 0 ? contradictionCount / totalComparisons : 0;
}

// Pattern-based contradiction detection
function detectContradiction(sent1: string, sent2: string): boolean {
  const s1Lower = sent1.toLowerCase();
  const s2Lower = sent2.toLowerCase();
  
  // Extract key terms (nouns, verbs)
  const terms1 = extractKeyTerms(s1Lower);
  const terms2 = extractKeyTerms(s2Lower);
  
  // Check for shared context (must have at least 2 common terms)
  const commonTerms = terms1.filter(t => terms2.includes(t));
  if (commonTerms.length < 2) return false; // Not about same topic
  
  // Check for negation patterns
  const hasNegation1 = /\b(not|no|never|neither|none|cannot|isn't|aren't|wasn't|weren't)\b/.test(s1Lower);
  const hasNegation2 = /\b(not|no|never|neither|none|cannot|isn't|aren't|wasn't|weren't)\b/.test(s2Lower);
  
  // If one has negation and other doesn't → potential contradiction
  if (hasNegation1 !== hasNegation2) {
    // Check if they're talking about the same predicate
    for (const term of commonTerms) {
      const pattern = new RegExp(`\\b${term}\\b`, 'i');
      if (pattern.test(sent1) && pattern.test(sent2)) {
        return true; // Likely contradiction
      }
    }
  }
  
  // Check for antonym pairs
  const antonymPairs = [
    ['increase', 'decrease'], ['rise', 'fall'], ['more', 'less'],
    ['beneficial', 'harmful'], ['positive', 'negative'],
    ['effective', 'ineffective'], ['supports', 'opposes'],
    ['better', 'worse'], ['improve', 'worsen']
  ];
  
  for (const [word1, word2] of antonymPairs) {
    if ((s1Lower.includes(word1) && s2Lower.includes(word2)) ||
        (s1Lower.includes(word2) && s2Lower.includes(word1))) {
      // Check if about same topic
      if (commonTerms.length > 0) {
        return true;
      }
    }
  }
  
  return false;
}

// Extract key terms (simplified noun/verb extraction)
function extractKeyTerms(text: string): string[] {
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  const words = text.match(/\b[a-z]+\b/g) || [];
  return words.filter(w => w.length > 3 && !stopWords.has(w));
}

// ===== METRIC 4: Hedging Distribution Variance (HDV) =====

const HEDGE_WORDS = ['might', 'could', 'possibly', 'perhaps', 'seems', 'appears', 'may', 'suggests'];
const ASSERTIVE_WORDS = ['clearly', 'obviously', 'demonstrates', 'proves', 'definitely', 'certainly'];

export async function computeHDV(text: string): Promise<number> {
  const sections = text.split(/\n\n+/).filter(s => s.trim().length > 50);
  
  if (sections.length < 2) return 0;
  
  const hedgeRatios: number[] = [];
  
  for (const section of sections) {
    const lowerSection = section.toLowerCase();
    
    let hedgeCount = 0;
    let assertiveCount = 0;
    
    for (const hedge of HEDGE_WORDS) {
      const regex = new RegExp(`\\b${hedge}\\b`, 'g');
      const matches = lowerSection.match(regex);
      hedgeCount += matches ? matches.length : 0;
    }
    
    for (const assertive of ASSERTIVE_WORDS) {
      const regex = new RegExp(`\\b${assertive}\\b`, 'g');
      const matches = lowerSection.match(regex);
      assertiveCount += matches ? matches.length : 0;
    }
    
    const ratio = hedgeCount / (hedgeCount + assertiveCount + 1); // +1 to avoid division by zero
    hedgeRatios.push(ratio);
  }
  
  if (hedgeRatios.length < 2) return 0;
  
  const mean = hedgeRatios.reduce((a, b) => a + b, 0) / hedgeRatios.length;
  const variance = hedgeRatios.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / hedgeRatios.length;
  
  return variance;
}

// ===== METRIC 5: Sentence Length Entropy (SLE) =====
// Measures burstiness/variance in sentence length (Human-like = high entropy)

export async function computeSLE(text: string): Promise<number> {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length < 2) return 0;
  
  // Calculate lengths in words
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  
  // Calculate relative frequencies of each length
  const lengthCounts = new Map<number, number>();
  lengths.forEach(l => lengthCounts.set(l, (lengthCounts.get(l) || 0) + 1));
  
  const totalSentences = lengths.length;
  let entropy = 0;
  
  for (const count of lengthCounts.values()) {
    const p = count / totalSentences;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

// ===== COMBINED METRICS COMPUTATION =====

export interface MetricResults {
  TCR: number;
  SCV: { variance: number; meanSimilarity: number };
  LCD: number;
  HDV: number;
  SLE: number;
}

export async function computeAllMetrics(
  text: string,
  anthropicKey?: string // Now optional since we don't use Claude anymore
): Promise<MetricResults> {
  console.log('[MetricService] Computing all metrics...');
  
  const TCR = await computeTCR(text);
  console.log('[MetricService] TCR:', TCR);
  
  const SCV = await computeSCV(text, anthropicKey);
  console.log('[MetricService] SCV:', SCV);
  
  const LCD = await computeLCD(text, anthropicKey);
  console.log('[MetricService] LCD:', LCD);
  
  const HDV = await computeHDV(text);
  console.log('[MetricService] HDV:', HDV);
  
  const SLE = await computeSLE(text);
  console.log('[MetricService] SLE:', SLE);
  
  return { TCR, SCV, LCD, HDV, SLE };
}
