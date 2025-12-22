/**
 * Pilot Study Runner for Condition 2
 * 
 * Generates document with memory decay and measures cognitive artifacts
 */

import { generateCondition2 } from '../services/condition2Service';
import { computeAllMetrics } from '../services/metricService';
import { writeFileSync, readFileSync } from 'fs';

const TOPIC = 'The environmental impact of compostable packaging in university canteens';

// Load Claude API key from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envContent.match(/VITE_CLAUDE_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : '';

async function runPilot() {
  console.log('='.repeat(80));
  console.log('PILOT STUDY: Condition 2 (Multi-Stage with Memory Decay)');
  console.log('='.repeat(80));
  console.log('\nTopic:', TOPIC);
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Generate document
  console.log('[1/3] Generating document with memory decay constraints...\n');
  const result = await generateCondition2(TOPIC, API_KEY);
  
  console.log('\n' + '='.repeat(80));
  console.log('OUTLINE (T=1.0)');
  console.log('='.repeat(80));
  result.outline.forEach((sent, i) => {
    console.log(`${i + 1}. ${sent}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('PARAGRAPHS (T=0.8, Isolated Context)');
  console.log('='.repeat(80));
  result.paragraphs.forEach((para, i) => {
    console.log(`\nParagraph ${i + 1} (${para.split(' ').length} words):`);
    console.log(para);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('FINAL DOCUMENT (T=0.7, Minimal Assembly)');
  console.log('='.repeat(80));
  console.log(result.finalDocument);
  
  // Save document
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `./pilot_outputs/condition2_${timestamp}.md`;
  writeFileSync(filename, result.finalDocument);
  console.log(`\n[Saved to: ${filename}]`);
  
  // Measure metrics
  console.log('\n' + '='.repeat(80));
  console.log('[2/3] Computing cognitive artifact metrics...\n');
  console.log('='.repeat(80));
  
  const metrics = await computeAllMetrics(result.finalDocument);
  
  console.log('\n' + '='.repeat(80));
  console.log('METRIC RESULTS');
  console.log('='.repeat(80));
  console.log('\nTerminology Consistency Rate (TCR):', metrics.TCR.toFixed(3));
  console.log('  → Expected: < 1.0 (terminology drift)');
  console.log('  → Baseline: 1.000');
  
  console.log('\nLexical Coherence Variance (LCV):', metrics.SCV.variance.toFixed(3));
  console.log('  → Expected: > 0.002 (higher variance)');
  console.log('  → Baseline: 0.002');
  console.log('  → Mean similarity:', metrics.SCV.meanSimilarity.toFixed(3));
  
  console.log('\nLocal Contradiction Density (LCD):', metrics.LCD.toFixed(3));
  console.log('  → Expected: > 0.087 (more contradictions)');
  console.log('  → Baseline: 0.087');
  
  console.log('\nHedging Distribution Variance (HDV):', metrics.HDV.toFixed(3));
  console.log('  → Expected: > 0.066 (more asymmetry)');
  console.log('  → Baseline: 0.066');
  
  // Validate
  console.log('\n' + '='.repeat(80));
  console.log('[3/3] Validation');
  console.log('='.repeat(80));
  
  const baselineTCR = 1.0;
  const baselineLCV = 0.002;
  const baselineLCD = 0.087;
  const baselineHDV = 0.066;
  
  let effectCount = 0;
  
  if (metrics.TCR < baselineTCR) {
    console.log('\n✅ TCR decreased:', metrics.TCR.toFixed(3), '< 1.000');
    effectCount++;
  } else {
    console.log('\n❌ TCR unchanged:', metrics.TCR.toFixed(3));
  }
  
  if (metrics.SCV.variance > baselineLCV) {
    console.log('✅ LCV increased:', metrics.SCV.variance.toFixed(3), '> 0.002');
    effectCount++;
  } else {
    console.log('❌ LCV unchanged:', metrics.SCV.variance.toFixed(3));
  }
  
  if (metrics.LCD > baselineLCD) {
    console.log('✅ LCD increased:', metrics.LCD.toFixed(3), '> 0.087');
    effectCount++;
  } else {
    console.log('❌ LCD unchanged:', metrics.LCD.toFixed(3));
  }
  
  if (metrics.HDV > baselineHDV) {
    console.log('✅ HDV increased:', metrics.HDV.toFixed(3), '> 0.066');
    effectCount++;
  } else {
    console.log('❌ HDV unchanged:', metrics.HDV.toFixed(3));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`RESULT: ${effectCount}/4 metrics showed predicted effects`);
  console.log('='.repeat(80));
  
  if (effectCount >= 3) {
    console.log('\n🎉 SUCCESS: Memory decay constraints are working');
    console.log('   → Proceed to full 3-condition experiment');
  } else if (effectCount >= 2) {
    console.log('\n⚠️  PARTIAL: Some effects detected');
    console.log('   → Consider strengthening constraints');
  } else {
    console.log('\n❌ FAILURE: Constraints too weak');
    console.log('   → Increase memory decay strength');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run pilot
runPilot().catch(console.error);
