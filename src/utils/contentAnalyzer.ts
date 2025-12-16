/**
 * Content Analyzer Utility for Academic Integrity Agent
 * Analyzes uploaded content for word count, citations, and content type
 */

export interface ContentAnalysis {
  wordCount: number;
  characterCount: number;
  citationCount: number;
  citationStyle: 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'Unknown' | 'None';
  contentType: 'essay' | 'lab-report' | 'reflection' | 'code' | 'general';
  estimatedReadTime: string;
}

/**
 * Analyze text content and return metadata
 */
export function analyzeContent(text: string): ContentAnalysis {
  const wordCount = countWords(text);
  const characterCount = text.length;
  const { count: citationCount, style: citationStyle } = detectCitations(text);
  const contentType = detectContentType(text);
  const estimatedReadTime = calculateReadTime(wordCount);

  return {
    wordCount,
    characterCount,
    citationCount,
    citationStyle,
    contentType,
    estimatedReadTime,
  };
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
}

/**
 * Detect citations and identify style
 */
function detectCitations(text: string): { count: number; style: ContentAnalysis['citationStyle'] } {
  // APA style: (Author, Year) or (Author, Year, p. X)
  const apaPattern = /\([A-Z][a-z]+(?:\s+(?:&|and)\s+[A-Z][a-z]+)*,\s*\d{4}(?:,\s*p\.?\s*\d+)?\)/g;
  const apaMatches = text.match(apaPattern) || [];

  // MLA style: (Author Page) or (Author)
  const mlaPattern = /\([A-Z][a-z]+(?:\s+\d+)?\)/g;
  const mlaMatches = text.match(mlaPattern) || [];

  // Chicago/footnote style: superscript numbers or [1], [2], etc.
  const chicagoPattern = /\[\d+\]|(?<=[.!?])\d+(?=\s)/g;
  const chicagoMatches = text.match(chicagoPattern) || [];

  // Harvard style: similar to APA (Author Year)
  const harvardPattern = /\([A-Z][a-z]+\s+\d{4}\)/g;
  const harvardMatches = text.match(harvardPattern) || [];

  // Determine most likely style based on match count
  const counts = [
    { style: 'APA' as const, count: apaMatches.length },
    { style: 'MLA' as const, count: mlaMatches.length },
    { style: 'Chicago' as const, count: chicagoMatches.length },
    { style: 'Harvard' as const, count: harvardMatches.length },
  ];

  const best = counts.reduce((max, curr) => curr.count > max.count ? curr : max, counts[0]);
  
  if (best.count === 0) {
    return { count: 0, style: 'None' };
  }

  // If counts are close, mark as Unknown
  const secondBest = counts
    .filter(c => c.style !== best.style)
    .reduce<{ style: ContentAnalysis['citationStyle']; count: number }>((max, curr) => curr.count > max.count ? curr : max, { style: 'Unknown', count: 0 });

  if (secondBest.count > 0 && best.count - secondBest.count < 2) {
    return { count: best.count, style: 'Unknown' };
  }

  return { count: best.count, style: best.style };
}

/**
 * Detect content type based on common patterns
 */
function detectContentType(text: string): ContentAnalysis['contentType'] {
  const lowerText = text.toLowerCase();

  // Lab report indicators
  const labReportKeywords = ['hypothesis', 'methodology', 'materials and methods', 'experiment', 'procedure', 'observations', 'results', 'data analysis', 'lab report'];
  const labReportScore = labReportKeywords.filter(keyword => lowerText.includes(keyword)).length;

  // Reflection paper indicators
  const reflectionKeywords = ['i learned', 'i felt', 'i realized', 'my experience', 'personally', 'i believe', 'i think', 'reflection', 'self-assessment'];
  const reflectionScore = reflectionKeywords.filter(keyword => lowerText.includes(keyword)).length;

  // Code/technical indicators
  const codeKeywords = ['function', 'algorithm', 'implementation', 'time complexity', 'o(n)', 'class', 'method', 'variable', 'loop', 'recursion'];
  const codeScore = codeKeywords.filter(keyword => lowerText.includes(keyword)).length;

  // Essay indicators
  const essayKeywords = ['thesis', 'argument', 'conclusion', 'introduction', 'furthermore', 'however', 'therefore', 'in conclusion', 'this essay'];
  const essayScore = essayKeywords.filter(keyword => lowerText.includes(keyword)).length;

  // Determine type based on highest score
  const scores = [
    { type: 'lab-report' as const, score: labReportScore },
    { type: 'reflection' as const, score: reflectionScore },
    { type: 'code' as const, score: codeScore },
    { type: 'essay' as const, score: essayScore },
  ];

  const best = scores.reduce((max, curr) => curr.score > max.score ? curr : max, scores[0]);

  // If no strong signal, default to general
  if (best.score < 2) {
    return 'general';
  }

  return best.type;
}

/**
 * Calculate estimated reading time
 */
function calculateReadTime(wordCount: number): string {
  const wordsPerMinute = 200; // Average reading speed
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  if (minutes < 1) {
    return '< 1 min';
  } else if (minutes === 1) {
    return '1 min';
  } else {
    return `${minutes} mins`;
  }
}

/**
 * Get friendly content type label
 */
export function getContentTypeLabel(type: ContentAnalysis['contentType']): string {
  switch (type) {
    case 'essay':
      return 'Essay';
    case 'lab-report':
      return 'Lab Report';
    case 'reflection':
      return 'Reflection Paper';
    case 'code':
      return 'Technical Document';
    case 'general':
    default:
      return 'Document';
  }
}
