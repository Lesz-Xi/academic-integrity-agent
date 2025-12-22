import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { computeAllMetrics, computeTCR, computeSCV, computeLCD, computeHDV } from './services/metricService';

// Load API key from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envContent.match(/VITE_CLAUDE_API_KEY=(.*)/);
const ANTHROPIC_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : '';

// Load baseline document
const BASELINE_TEXT = readFileSync(
  './Model_Scaling/Assets/GPT_Zero/v25_Personalized_Output.md',
  'utf-8'
);

describe('Metric Pressure-Testing (Empirical)', () => {
  
  // ===== BASELINE =====
  
  it('Baseline: Compute all metrics on reference document', async () => {
    const metrics = await computeAllMetrics(BASELINE_TEXT, ANTHROPIC_KEY);
    
    console.log('\n=== BASELINE METRICS ===');
    console.log('TCR:', metrics.TCR.toFixed(3));
    console.log('SCV variance:', metrics.SCV.variance.toFixed(3));
    console.log('SCV mean similarity:', metrics.SCV.meanSimilarity.toFixed(3));
    console.log('LCD:', metrics.LCD.toFixed(3));
    console.log('HDV:', metrics.HDV.toFixed(3));
    
    expect(metrics.TCR).toBeGreaterThan(0);
    expect(metrics.SCV.meanSimilarity).toBeGreaterThan(0.01); // TF-IDF produces lower similarities
  }, 300000); // 5 min timeout
  
  // ===== TEST 1: SENTENCE SHUFFLING =====
  
  it('Test 1: Sentence Shuffling (Rejection Test)', async () => {
    const shuffled = shuffleSentencesWithinParagraphs(BASELINE_TEXT);
    
    const baseline = await computeAllMetrics(BASELINE_TEXT, ANTHROPIC_KEY);
    const manipulated = await computeAllMetrics(shuffled, ANTHROPIC_KEY);
    
    console.log('\n=== TEST 1: SENTENCE SHUFFLING ===');
    console.log('TCR change:', (manipulated.TCR - baseline.TCR).toFixed(3));
    console.log('SCV change:', (manipulated.SCV.variance - baseline.SCV.variance).toFixed(3));
    console.log('LCD change:', (manipulated.LCD - baseline.LCD).toFixed(3));
    console.log('HDV change:', (manipulated.HDV - baseline.HDV).toFixed(3));
    
    // Expected: modest SCV/LCD increase, TCR/HDV stable
    expect(Math.abs(manipulated.TCR - baseline.TCR)).toBeLessThan(0.05);
    expect(Math.abs(manipulated.HDV - baseline.HDV)).toBeLessThan(0.05);
    expect(manipulated.SCV.variance).toBeGreaterThan(baseline.SCV.variance);
    expect(manipulated.SCV.variance).toBeLessThan(baseline.SCV.variance + 0.5); // Not saturated
  }, 300000);
  
  // ===== TEST 2: RANDOM TOKEN DROP =====
  
  it('Test 2: Random Token Drop (Rejection Test)', async () => {
    const dropped = randomTokenDrop(BASELINE_TEXT, 0.07);
    
    const baseline = await computeAllMetrics(BASELINE_TEXT, ANTHROPIC_KEY);
    const manipulated = await computeAllMetrics(dropped, ANTHROPIC_KEY);
    
    console.log('\n=== TEST 2: RANDOM TOKEN DROP ===');
    console.log('TCR change:', (manipulated.TCR - baseline.TCR).toFixed(3));
    console.log('SCV change:', (manipulated.SCV.variance - baseline.SCV.variance).toFixed(3));
    console.log('LCD change:', (manipulated.LCD - baseline.LCD).toFixed(3));
    console.log('HDV change:', (manipulated.HDV - baseline.HDV).toFixed(3));
    
    // Expected: all metrics stable within error bounds
    expect(Math.abs(manipulated.TCR - baseline.TCR)).toBeLessThan(0.1);
    expect(Math.abs(manipulated.SCV.variance - baseline.SCV.variance)).toBeLessThan(0.1);
    expect(Math.abs(manipulated.LCD - baseline.LCD)).toBeLessThan(0.1);
    expect(Math.abs(manipulated.HDV - baseline.HDV)).toBeLessThan(0.1);
  }, 300000);
  
  // ===== TEST 3: GIBBERISH INJECTION =====
  
  it('Test 3: Gibberish Injection (Rejection Test)', async () => {
    const gibberish = injectGibberish(BASELINE_TEXT, 0.05);
    
    const baseline = await computeAllMetrics(BASELINE_TEXT, ANTHROPIC_KEY);
    const manipulated = await computeAllMetrics(gibberish, ANTHROPIC_KEY);
    
    console.log('\n=== TEST 3: GIBBERISH INJECTION ===');
    console.log('TCR change:', (manipulated.TCR - baseline.TCR).toFixed(3));
    console.log('SCV change:', (manipulated.SCV.variance - baseline.SCV.variance).toFixed(3));
    console.log('LCD change:', (manipulated.LCD - baseline.LCD).toFixed(3));
    console.log('HDV change:', (manipulated.HDV - baseline.HDV).toFixed(3));
    console.log('Mean similarity:', manipulated.SCV.meanSimilarity.toFixed(3));
    
    // Expected: LCD/SCV increase locally, coherence preserved
    expect(manipulated.SCV.meanSimilarity).toBeGreaterThan(0.3); // Coherence preserved
    expect(manipulated.SCV.variance).toBeLessThan(0.5); // Not saturated
  }, 300000);
  
  // ===== TEST 4: TERMINOLOGY DRIFT =====
  
  it('Test 4: Terminology Drift Injection (Sensitivity Test)', async () => {
    const drifted = injectTerminologyDrift(BASELINE_TEXT);
    
    const baseline = await computeAllMetrics(BASELINE_TEXT, ANTHROPIC_KEY);
    const manipulated = await computeAllMetrics(drifted, ANTHROPIC_KEY);
    
    console.log('\n=== TEST 4: TERMINOLOGY DRIFT ===');
    console.log('TCR change:', (manipulated.TCR - baseline.TCR).toFixed(3));
    console.log('SCV change:', (manipulated.SCV.variance - baseline.SCV.variance).toFixed(3));
    console.log('LCD change:', (manipulated.LCD - baseline.LCD).toFixed(3));
    console.log('HDV change:', (manipulated.HDV - baseline.HDV).toFixed(3));
    
    // Expected: TCR drops significantly, others stable
    expect(manipulated.TCR).toBeLessThan(baseline.TCR - 0.2);
    expect(Math.abs(manipulated.SCV.variance - baseline.SCV.variance)).toBeLessThan(0.1);
    expect(Math.abs(manipulated.HDV - baseline.HDV)).toBeLessThan(0.1);
  }, 300000);
  
  // ===== TEST 5: HEDGING REDISTRIBUTION =====
  
  it('Test 5: Hedging Redistribution (Sensitivity Test)', async () => {
    const redistributed = redistributeHedging(BASELINE_TEXT);
    
    const baseline = await computeAllMetrics(BASELINE_TEXT, ANTHROPIC_KEY);
    const manipulated = await computeAllMetrics(redistributed, ANTHROPIC_KEY);
    
    console.log('\n=== TEST 5: HEDGING REDISTRIBUTION ===');
    console.log('TCR change:', (manipulated.TCR - baseline.TCR).toFixed(3));
    console.log('SCV change:', (manipulated.SCV.variance - baseline.SCV.variance).toFixed(3));
    console.log('LCD change:', (manipulated.LCD - baseline.LCD).toFixed(3));
    console.log('HDV change:', (manipulated.HDV - baseline.HDV).toFixed(3));
    
    // Expected: HDV increases, TCR/SCV stable
    expect(manipulated.HDV).toBeGreaterThan(baseline.HDV + 0.1);
    expect(Math.abs(manipulated.TCR - baseline.TCR)).toBeLessThan(0.05);
    expect(Math.abs(manipulated.SCV.variance - baseline.SCV.variance)).toBeLessThan(0.05);
  }, 300000);
  
  // ===== TEST 6: CONTRADICTION SURVIVAL =====
  
  it('Test 6: Contradiction Survival (Sensitivity Test)', async () => {
    const contradicted = injectContradiction(BASELINE_TEXT);
    
    const baseline = await computeAllMetrics(BASELINE_TEXT, ANTHROPIC_KEY);
    const manipulated = await computeAllMetrics(contradicted, ANTHROPIC_KEY);
    
    console.log('\n=== TEST 6: CONTRADICTION SURVIVAL ===');
    console.log('TCR change:', (manipulated.TCR - baseline.TCR).toFixed(3));
    console.log('SCV change:', (manipulated.SCV.variance - baseline.SCV.variance).toFixed(3));
    console.log('LCD change:', (manipulated.LCD - baseline.LCD).toFixed(3));
    console.log('HDV change:', (manipulated.HDV - baseline.HDV).toFixed(3));
    
    // Expected: LCD increases locally, SCV modest increase
    expect(manipulated.LCD).toBeGreaterThan(baseline.LCD + 0.05);
    expect(manipulated.SCV.variance - baseline.SCV.variance).toBeLessThan(0.3);
  }, 300000);
  
});

// ===== MANIPULATION FUNCTIONS =====

function shuffleSentencesWithinParagraphs(text: string): string {
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map(para => {
    const sentences = para.split(/(?<=[.!?])\s+/);
    if (sentences.length < 2) return para;
    
    // Fisher-Yates shuffle
    for (let i = sentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sentences[i], sentences[j]] = [sentences[j], sentences[i]];
    }
    
    return sentences.join(' ');
  }).join('\n\n');
}

function randomTokenDrop(text: string, dropRate: number): string {
  const tokens = text.split(/\s+/);
  
  return tokens.filter(() => Math.random() > dropRate).join(' ');
}

function injectGibberish(text: string, rate: number): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const numToReplace = Math.floor(sentences.length * rate);
  
  const gibberishWords = ['florp', 'gribble', 'wompus', 'snizzle', 'blortch', 'quibble'];
  
  for (let i = 0; i < numToReplace; i++) {
    const idx = Math.floor(Math.random() * sentences.length);
    const gibberish = Array(10).fill(0).map(() => 
      gibberishWords[Math.floor(Math.random() * gibberishWords.length)]
    ).join(' ');
    sentences[idx] = gibberish + '.';
 }
  
  return sentences.join(' ');
}

function injectTerminologyDrift(text: string): string {
  const replacements = {
    'compostable': 'biodegradable',
    'packaging': 'containers',
    'sustainability': 'environmental viability',
    'canteen': 'cafeteria',
    'students': 'learners'
  };
  
  let drifted = text;
  const paragraphs = text.split(/\n\n+/);
  const midPoint = Math.floor(paragraphs.length / 2);
  
  // Apply replacements only to second half
  for (let i = midPoint; i < paragraphs.length; i++) {
    for (const [from, to] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${from}\\b`, 'gi');
      paragraphs[i] = paragraphs[i].replace(regex, to);
    }
  }
  
  return paragraphs.join('\n\n');
}

function redistributeHedging(text: string): string {
  const paragraphs = text.split(/\n\n+/);
  
  // Remove hedges from middle paragraphs
  const hedgeWords = ['might', 'could', 'possibly', 'perhaps', 'seems', 'appears'];
  
  for (let i = 2; i < paragraphs.length - 2; i++) {
    for (const hedge of hedgeWords) {
      const regex = new RegExp(`\\b${hedge}\\b`, 'gi');
      paragraphs[i] = paragraphs[i].replace(regex, '');
    }
  }
  
  // Concentrate hedges in intro and conclusion
  if (paragraphs.length > 4) {
    paragraphs[0] = paragraphs[0].replace(/\b(is|are|was|were)\b/g, 'might be');
    paragraphs[paragraphs.length - 1] = paragraphs[paragraphs.length - 1].replace(/\b(is|are|was|were)\b/g, 'could be');
  }
  
  return paragraphs.join('\n\n');
}

function injectContradiction(text: string): string {
  const paragraphs = text.split(/\n\n+/);
  
  if (paragraphs.length < 3) return text;
  
  // Insert contradiction in middle paragraph
  const midIdx = Math.floor(paragraphs.length / 2);
  paragraphs[midIdx] += ' However, compostable packaging may actually be less environmentally friendly than traditional plastic in some contexts.';
  
  return paragraphs.join('\n\n');
}
