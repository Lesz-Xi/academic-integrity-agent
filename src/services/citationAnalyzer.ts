/**
 * Citation Analyzer Service
 * Phase 1 of Adaptive Scholarly Composer
 * 
 * Responsibilities:
 * - Extract all citation formats
 * - Map facts to citation anchors
 * - Score segments for transformation risk
 * - Flag high-risk zones for human review
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Citation {
  text: string;           // Full citation text, e.g., "(Smith, 2024)"
  author: string;         // Extracted author name
  year: string;           // Extracted year
  format: 'apa' | 'mla' | 'numeric' | 'unknown';
  position: number;       // Character position in text
}

export interface AnnotatedSegment {
  text: string;
  citations: Citation[];
  riskScore: number;      // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskFactors: string[];  // Reasons for risk score
  humanReviewNeeded: boolean;
}

export interface CitationAnalysis {
  originalText: string;
  citations: Citation[];
  segments: AnnotatedSegment[];
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  overallRiskScore: number;
  humanInterventionNeeded: AnnotatedSegment[];
  factAnchors: FactAnchor[];
}

export interface FactAnchor {
  fact: string;           // The claim/fact being made
  citation: Citation;     // The citation supporting it
  isTransformable: boolean; // Can this be safely rephrased?
}

// ============================================================================
// CITATION EXTRACTION
// ============================================================================

/**
 * Extract all citations from text
 * Supports: APA (Author, Year), MLA (Author Page), Numeric [1], et al.
 */
export function extractCitations(text: string): Citation[] {
  const citations: Citation[] = [];
  
  // Pattern 1: APA style - (Author, Year) or (Author & Author, Year)
  const apaPattern = /\(([A-Z][a-zA-Z]+(?:\s*(?:&|and)\s*[A-Z][a-zA-Z]+)?(?:\s+et\s+al\.)?),?\s*(\d{4})\)/g;
  let match: RegExpExecArray | null;
  while ((match = apaPattern.exec(text)) !== null) {
    citations.push({
      text: match[0],
      author: match[1].trim(),
      year: match[2],
      format: 'apa',
      position: match.index
    });
  }
  
  // Pattern 2: APA with multiple authors - (Author et al., Year)
  const etAlPattern = /\(([A-Z][a-zA-Z]+)\s+et\s+al\.,?\s*(\d{4})\)/g;
  while ((match = etAlPattern.exec(text)) !== null) {
    // Avoid duplicates
    if (!citations.some(c => c.position === match!.index)) {
      citations.push({
        text: match[0],
        author: `${match[1]} et al.`,
        year: match[2],
        format: 'apa',
        position: match.index
      });
    }
  }
  
  // Pattern 3: Numeric citations [1], [2], [1,2,3]
  const numericPattern = /\[(\d+(?:,\s*\d+)*)\]/g;
  while ((match = numericPattern.exec(text)) !== null) {
    citations.push({
      text: match[0],
      author: `Reference ${match[1]}`,
      year: '',
      format: 'numeric',
      position: match.index
    });
  }
  
  // Pattern 4: In-text author mentions - Author (Year)
  const inTextPattern = /([A-Z][a-zA-Z]+(?:\s+et\s+al\.)?)\s+\((\d{4})\)/g;
  while ((match = inTextPattern.exec(text)) !== null) {
    citations.push({
      text: match[0],
      author: match[1].trim(),
      year: match[2],
      format: 'apa',
      position: match.index
    });
  }
  
  // Sort by position and deduplicate
  const unique = citations.filter((c, i, arr) => 
    arr.findIndex(x => x.position === c.position) === i
  );
  
  return unique.sort((a, b) => a.position - b.position);
}

// ============================================================================
// RISK SCORING
// ============================================================================

// Risk factors and their weights
const RISK_FACTORS = {
  HIGH_CITATION_DENSITY: { weight: 30, threshold: 2, description: 'High citation density (>2 per sentence)' },
  TECHNICAL_JARGON: { weight: 20, description: 'Technical jargon cluster detected' },
  PARALLEL_STRUCTURE: { weight: 15, description: 'Parallel structure (Rule of Three)' },
  SMOOTH_TRANSITION: { weight: 10, description: 'Smooth transitional phrase detected' },
  IMPERSONAL_TONE: { weight: 10, description: 'Impersonal academic tone' },
  LONG_SENTENCE: { weight: 5, description: 'Long complex sentence (>30 words)' },
};

// Technical jargon patterns (GPTZero triggers)
const JARGON_PATTERNS = [
  /systematic\s+comparison/i,
  /empirical\s+(evidence|analysis|study)/i,
  /methodolog(y|ical)/i,
  /theoretical\s+(framework|lens|perspective)/i,
  /\bimplications?\b/i,
  /\bfeasibility\b/i,
  /\bviability\b/i,
  /\bparadigm\b/i,
];

// Smooth transition patterns (GPTZero triggers)
const SMOOTH_TRANSITIONS = [
  /^Furthermore,?/i,
  /^Moreover,?/i,
  /^Additionally,?/i,
  /^Consequently,?/i,
  /^In\s+addition,?/i,
  /^As\s+a\s+result,?/i,
  /^Transitioning\s+to/i,
  /^This\s+(demonstrates|shows|indicates)/i,
];

// Rule of Three pattern
const RULE_OF_THREE = /\b[\w\s]+,\s+[\w\s]+,\s+(?:and|or)\s+[\w\s]+\b/g;

/**
 * Score a single segment for transformation risk
 */
export function scoreSegment(segment: string, citations: Citation[]): AnnotatedSegment {
  let riskScore = 0;
  const riskFactors: string[] = [];
  
  // Count citations in this segment
  const citationCount = citations.filter(c => 
    segment.includes(c.text)
  ).length;
  
  // Factor 1: Citation density
  const sentences = segment.split(/[.!?]+/).filter(s => s.trim());
  const avgCitationsPerSentence = citationCount / Math.max(sentences.length, 1);
  if (avgCitationsPerSentence >= RISK_FACTORS.HIGH_CITATION_DENSITY.threshold) {
    riskScore += RISK_FACTORS.HIGH_CITATION_DENSITY.weight;
    riskFactors.push(RISK_FACTORS.HIGH_CITATION_DENSITY.description);
  }
  
  // Factor 2: Technical jargon
  const jargonMatches = JARGON_PATTERNS.filter(p => p.test(segment));
  if (jargonMatches.length >= 2) {
    riskScore += RISK_FACTORS.TECHNICAL_JARGON.weight;
    riskFactors.push(RISK_FACTORS.TECHNICAL_JARGON.description);
  }
  
  // Factor 3: Parallel structure (Rule of Three)
  const threeMatches = segment.match(RULE_OF_THREE);
  if (threeMatches && threeMatches.length > 0) {
    riskScore += RISK_FACTORS.PARALLEL_STRUCTURE.weight;
    riskFactors.push(RISK_FACTORS.PARALLEL_STRUCTURE.description);
  }
  
  // Factor 4: Smooth transitions
  const hasSmooth = SMOOTH_TRANSITIONS.some(p => p.test(segment.trim()));
  if (hasSmooth) {
    riskScore += RISK_FACTORS.SMOOTH_TRANSITION.weight;
    riskFactors.push(RISK_FACTORS.SMOOTH_TRANSITION.description);
  }
  
  // Factor 5: Impersonal tone (no first-person)
  const hasFirstPerson = /\b(I|we|my|our)\b/i.test(segment);
  if (!hasFirstPerson && segment.length > 50) {
    riskScore += RISK_FACTORS.IMPERSONAL_TONE.weight;
    riskFactors.push(RISK_FACTORS.IMPERSONAL_TONE.description);
  }
  
  // Factor 6: Long complex sentences
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 30);
  if (longSentences.length > 0) {
    riskScore += RISK_FACTORS.LONG_SENTENCE.weight;
    riskFactors.push(RISK_FACTORS.LONG_SENTENCE.description);
  }
  
  // Calculate risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  if (riskScore >= 50) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 25) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }
  
  return {
    text: segment,
    citations: citations.filter(c => segment.includes(c.text)),
    riskScore,
    riskLevel,
    riskFactors,
    humanReviewNeeded: riskLevel === 'HIGH'
  };
}

// ============================================================================
// FACT ANCHOR EXTRACTION
// ============================================================================

/**
 * Extract facts anchored to citations
 * Facts tied to citations CANNOT change semantically during transformation
 */
export function extractFactAnchors(text: string, citations: Citation[]): FactAnchor[] {
  const anchors: FactAnchor[] = [];
  
  for (const citation of citations) {
    // Find the sentence containing this citation
    const sentences = text.split(/(?<=[.!?])\s+/);
    const containingSentence = sentences.find(s => s.includes(citation.text));
    
    if (containingSentence) {
      // The fact is the sentence content minus the citation
      const fact = containingSentence.replace(citation.text, '').trim();
      
      // Determine if this is safely transformable
      // Facts with specific numbers, names, or technical terms are less transformable
      const hasSpecificData = /\d+%|\d+\.\d+|\$\d+|Net Present Value|NPV/i.test(fact);
      
      anchors.push({
        fact,
        citation,
        isTransformable: !hasSpecificData
      });
    }
  }
  
  return anchors;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Perform complete citation analysis on input text
 */
export function analyzeCitations(text: string): CitationAnalysis {
  // Step 1: Extract all citations
  const citations = extractCitations(text);
  
  // Step 2: Split into paragraphs for segment analysis
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  
  // Step 3: Score each paragraph/segment
  const segments: AnnotatedSegment[] = paragraphs.map(p => 
    scoreSegment(p, citations)
  );
  
  // Step 4: Extract fact anchors
  const factAnchors = extractFactAnchors(text, citations);
  
  // Step 5: Calculate overall risk
  const avgRisk = segments.length > 0 
    ? segments.reduce((sum, s) => sum + s.riskScore, 0) / segments.length 
    : 0;
  
  let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  if (avgRisk >= 40) {
    overallRisk = 'HIGH';
  } else if (avgRisk >= 20) {
    overallRisk = 'MEDIUM';
  } else {
    overallRisk = 'LOW';
  }
  
  // Step 6: Identify segments needing human intervention
  const humanInterventionNeeded = segments.filter(s => s.humanReviewNeeded);
  
  return {
    originalText: text,
    citations,
    segments,
    overallRisk,
    overallRiskScore: Math.round(avgRisk),
    humanInterventionNeeded,
    factAnchors
  };
}

/**
 * Generate a human-readable risk report
 */
export function generateRiskReport(analysis: CitationAnalysis): string {
  let report = '';
  
  report += `📊 CITATION ANALYSIS REPORT\n`;
  report += `${'='.repeat(50)}\n\n`;
  
  report += `📚 Citations Found: ${analysis.citations.length}\n`;
  report += `📝 Segments Analyzed: ${analysis.segments.length}\n`;
  report += `⚠️ Overall Risk: ${analysis.overallRisk} (${analysis.overallRiskScore}%)\n`;
  report += `🚨 Human Review Needed: ${analysis.humanInterventionNeeded.length} segments\n\n`;
  
  if (analysis.humanInterventionNeeded.length > 0) {
    report += `HIGH-RISK SEGMENTS:\n`;
    report += `${'-'.repeat(50)}\n`;
    for (const seg of analysis.humanInterventionNeeded) {
      report += `\n• Score: ${seg.riskScore}%\n`;
      report += `  Reasons: ${seg.riskFactors.join(', ')}\n`;
      report += `  Text Preview: "${seg.text.substring(0, 100)}..."\n`;
    }
  }
  
  report += `\n📌 FACT ANCHORS (Cannot change semantically):\n`;
  report += `${'-'.repeat(50)}\n`;
  for (const anchor of analysis.factAnchors.slice(0, 5)) {
    const status = anchor.isTransformable ? '✅ Transformable' : '🔒 Fixed';
    report += `\n${status}: ${anchor.citation.text}\n`;
    report += `  Fact: "${anchor.fact.substring(0, 80)}..."\n`;
  }
  
  return report;
}
