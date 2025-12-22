/**
 * Pilot Study Runner for Condition 3
 * 
 * Multi-Agent Friction Assembly Line
 * Testing: LCD ↑ via forced structural conflict
 */

import { generateCondition3 } from '../services/condition3Service';
import { computeAllMetrics } from '../services/metricService';
import { writeFileSync, readFileSync } from 'fs';

const TOPIC = 'The environmental impact of compostable packaging in university canteens';

// Load Claude API key from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envContent.match(/VITE_CLAUDE_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : '';

async function runPilot() {
  console.log('='.repeat(80));
  console.log('CONDITION 3: Multi-Agent Friction Assembly Line');
  console.log('='.repeat(80));
  console.log('\nTopic:', TOPIC);
  console.log('\nAgent Pipeline:');
  console.log('  1. Primary Draftsman (T=0.7) → Clean first draft');
  console.log('  2. Subversive Critic (T=1.0) → Friction generation');
  console.log('  3. Harried Editor (T=0.8) → Fragmented integration');
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Generate document via 3-agent pipeline
  const result = await generateCondition3(TOPIC, API_KEY);
  
  console.log('\n' + '='.repeat(80));
  console.log('ORIGINAL DRAFT (Agent 1: Draftsman)');
  console.log('='.repeat(80));
  console.log(result.originalDraft.substring(0, 500) + '...');
  
  console.log('\n' + '='.repeat(80));
  console.log('CRITIC FEEDBACK (Agent 2: Subversive Critic)');
  console.log('='.repeat(80));
  console.log('\nLogical Conflicts:');
  result.criticFeedback.logicalConflicts.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c}`);
  });
  console.log('\nLexical Poisons:');
  result.criticFeedback.lexicalPoisons.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p}`);
  });
  console.log('\nEntropy Target:', result.criticFeedback.entropyTarget);
  console.log('Entropy Content:', result.criticFeedback.entropyContent.substring(0, 100) + '...');
  
  console.log('\n' + '='.repeat(80));
  console.log('FINAL DOCUMENT (Agent 3: Harried Editor)');
  console.log('='.repeat(80));
  console.log(result.finalDocument);
  
  // Save document
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `./pilot_outputs/condition3_${timestamp}.md`;
  writeFileSync(filename, result.finalDocument);
  console.log(`\n[Saved to: ${filename}]`);
  
  // Also save original draft for comparison
  writeFileSync(`./pilot_outputs/condition3_original_${timestamp}.md`, result.originalDraft);
  
  // Measure metrics
  console.log('\n' + '='.repeat(80));
  console.log('COMPUTING METRICS');
  console.log('='.repeat(80));
  
  console.log('\n--- Original Draft Metrics ---');
  const originalMetrics = await computeAllMetrics(result.originalDraft);
  
  console.log('\n--- Final Document Metrics (After Friction) ---');
  const finalMetrics = await computeAllMetrics(result.finalDocument);
  
  // Load Pilot 2.1 metrics for comparison
  const pilot21TCR = 0.026;
  const pilot21LCV = 0.0037;
  const pilot21LCD = 0.012;
  const pilot21HDV = 0.096;
  
  console.log('\n' + '='.repeat(80));
  console.log('METRIC COMPARISON: Original Draft → Final (Friction Applied)');
  console.log('='.repeat(80));
  
  console.log('\nTCR (Terminology Consistency):');
  console.log('  Original Draft:', originalMetrics.TCR.toFixed(3));
  console.log('  Final (Friction):', finalMetrics.TCR.toFixed(3));
  console.log('  Pilot 2.1:', pilot21TCR.toFixed(3));
  const tcrImproved = finalMetrics.TCR < originalMetrics.TCR;
  console.log('  Effect:', tcrImproved ? '✅ DRIFT INCREASED' : '❌ No change');
  
  console.log('\nLCV (Lexical Coherence Variance):');
  console.log('  Original Draft:', originalMetrics.SCV.variance.toFixed(4));
  console.log('  Final (Friction):', finalMetrics.SCV.variance.toFixed(4));
  console.log('  Pilot 2.1:', pilot21LCV.toFixed(4));
  const lcvImproved = finalMetrics.SCV.variance > originalMetrics.SCV.variance;
  console.log('  Effect:', lcvImproved ? '✅ VARIANCE INCREASED' : '❌ No change');
  
  console.log('\nLCD (Local Contradiction Density):');
  console.log('  Original Draft:', originalMetrics.LCD.toFixed(3));
  console.log('  Final (Friction):', finalMetrics.LCD.toFixed(3));
  console.log('  Pilot 2.1:', pilot21LCD.toFixed(3));
  const lcdImproved = finalMetrics.LCD > originalMetrics.LCD;
  console.log('  Effect:', lcdImproved ? '✅ CONTRADICTIONS INCREASED' : '❌ No change');
  
  console.log('\nHDV (Hedging Distribution Variance):');
  console.log('  Original Draft:', originalMetrics.HDV.toFixed(3));
  console.log('  Final (Friction):', finalMetrics.HDV.toFixed(3));
  console.log('  Pilot 2.1:', pilot21HDV.toFixed(3));
  const hdvImproved = finalMetrics.HDV > originalMetrics.HDV;
  console.log('  Effect:', hdvImproved ? '✅ ASYMMETRY INCREASED' : '❌ No change');
  
  // Summary
  const improvements = [tcrImproved, lcvImproved, lcdImproved, hdvImproved].filter(Boolean).length;
  
  console.log('\n' + '='.repeat(80));
  console.log(`RESULT: ${improvements}/4 metrics improved via friction`);
  console.log('='.repeat(80));
  
  if (lcdImproved) {
    console.log('\n🎉 SUCCESS: LCD FINALLY INCREASED!');
    console.log('   → Multi-agent friction produces contradiction artifacts');
    console.log('   → Hypothesis: "Humanness" = uncoordinated multi-pass reasoning');
    console.log('\n   NEXT STEP: Test on GPTZero to see if % Human increases');
  } else if (improvements >= 2) {
    console.log('\n⚠️  PARTIAL: Some improvement but LCD still flat');
    console.log('   → Friction mechanism may need strengthening');
  } else {
    console.log('\n❌ INSUFFICIENT: Multi-agent friction not producing artifacts');
    console.log('   → May need more aggressive contradiction injection');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run pilot
runPilot().catch(console.error);
