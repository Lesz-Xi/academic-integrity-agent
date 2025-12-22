// import { HumanEditFlag } from '../types';

export interface RiskFactor {
  type: 'repetitive' | 'robotic' | 'complex' | 'passive';
  description: string;
}

export interface SentenceRisk {
  sentence: string;
  index: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskFactors: RiskFactor[];
  suggestion?: string;
}

export interface RiskReport {
  sentences: SentenceRisk[];
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

/**
 * Analyzes text for sentence-level risks (repetitive patterns, robotic phrasing, etc.)
 * This allows for "Human-in-the-Loop" editing of specific problematic sentences.
 */
export function analyzeTextRisk(text: string): RiskReport {
  // Simple sentence splitting (can be improved with Intl.Segmenter)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  const analyzedSentences: SentenceRisk[] = sentences.map((sentence, index) => {
    const trimmed = sentence.trim();
    const riskFactors: RiskFactor[] = [];
    let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let suggestion: string | undefined;

    // Heuristic 1: Length and complexity
    const words = trimmed.split(/\s+/);
    if (words.length > 40) {
      riskFactors.push({
        type: 'complex',
        description: 'Sentence is very long and complex'
      });
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
    }

    // Heuristic 2: Robotic/Transition phrases
    const roboticPhrases = [
      'in conclusion', 'furthermore', 'moreover', 'significantly',
      'it is important to note', 'crucially', 'additionally'
    ];
    
    const foundRobotic = roboticPhrases.find(p => trimmed.toLowerCase().includes(p));
    if (foundRobotic) {
      riskFactors.push({
        type: 'robotic',
        description: `Contains robotic transition: "${foundRobotic}"`
      });
      riskLevel = 'HIGH';
      suggestion = `Try removing "${foundRobotic}" or using a more casual connector.`;
    }

    // Heuristic 3: Common AI patterns (Passive voice overuse - simplified check)
    if (/\b(?:is|are|was|were|been)\s+\w+ed\b/i.test(trimmed) && trimmed.length > 100) {
      riskFactors.push({
        type: 'passive',
        description: 'Potential overuse of passive voice'
      });
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
    }

    return {
      sentence: trimmed,
      index,
      riskLevel,
      riskFactors,
      suggestion
    };
  });

  return {
    sentences: analyzedSentences,
    highRiskCount: analyzedSentences.filter(s => s.riskLevel === 'HIGH').length,
    mediumRiskCount: analyzedSentences.filter(s => s.riskLevel === 'MEDIUM').length,
    lowRiskCount: analyzedSentences.filter(s => s.riskLevel === 'LOW').length
  };
}
