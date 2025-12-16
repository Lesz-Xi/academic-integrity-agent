// Core types for the Academic Integrity Agent

export type Mode = 'essay' | 'cs' | 'paraphrase';

export type EssayLength = 'short' | 'medium' | 'long';

export interface LengthConfig {
  id: EssayLength;
  label: string;
  wordRange: string;
  targetWords: number;
  description: string;
}

export interface ModeConfig {
  id: Mode;
  title: string;
  icon: any;
  description: string;
  color: string;
  promptFile: string;
}

export interface BurstinessScore {
  coefficient_of_variation: number;
  sentence_lengths: number[];
  score: 'LOW' | 'MEDIUM' | 'HIGH';
  interpretation: string;
  details: string;
}

export interface PerplexityScore {
  perplexity: number;
  score: 'LOW' | 'MEDIUM' | 'HIGH';
  interpretation: string;
}

export interface DetectionMetrics {
  burstiness: BurstinessScore;
  perplexity: PerplexityScore;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  riskInterpretation: string;
}

export interface GenerationRequest {
  mode: Mode;
  input: string;
  additionalInstructions?: string;
}

export interface GenerationResponse {
  text: string;
  metrics: DetectionMetrics;
  warnings: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface HistoryItem {
  id: string;
  mode: Mode;
  input: string;
  output: string;
  metrics: DetectionMetrics;
  timestamp: number;
}
