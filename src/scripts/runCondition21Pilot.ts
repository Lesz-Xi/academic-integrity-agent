/**
 * Pilot Study Runner for Condition 2.1
 * 
 * Tests STRONGER memory decay with information asymmetry
 */

import { generateCondition21 } from '../services/condition21Service';
import { computeAllMetrics } from '../services/metricService';
import { writeFileSync, readFileSync } from 'fs';

const TOPIC = 'The environmental impact of compostable packaging in university canteens';

// Load Claude API key from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envContent.match(/VITE_CLAUDE_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : '';

async function runPilot() {
  console.log('='.repeat(80));
  console.log('PILOT STUDY: Condition 2.1 (STRONGER Memory Decay)');
  console.log('='.repeat(80));
  console.log('\nTopic:', TOPIC);
  console.log('\nConstraints:');
  console.log('- Fragmented scratchpad (not clean outline)');
  console.log('- BLIND expansion (no previous sentence)');
  console.log('- Terminology poisoning (P3)');
  console.log('- Higher temperature (T=0.9)');
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Generate document
  console.log('[1/3] Generating document with STRONGER decay constraints...\n');
  const result = await generateCondition21(TOPIC, API_KEY);
  
  console.log('\n' + '='.repeat(80));
  console.log('SCRATCHPAD (T=1.0, Fragmented)');
  console.log('='.repeat(80));
  result.scratchpad.forEach((note, i) => {
    console.log(`${i + 1}. ${note}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('PARAGRAPHS (T=0.9, BLIND Expansion)');
  console.log('='.repeat(80));
  result.paragraphs.forEach((para, i) => {
    const marker = i === 2 ? ' [POISONED: biodegradable wraps]' : '';
    console.log(`\nParagraph ${i + 1}${marker} (${para.split(' ').length} words):`);
    console.log(para);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('FINAL DOCUMENT (T=0.7, Minimal Assembly)');
  console.log('='.repeat(80));
  console.log(result.finalDocument);
  
  // Save document
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `./pilot_outputs/condition21_${timestamp}.md`;
  writeFileSync(filename, result.finalDocument);
  console.log(`\n[Saved to: ${filename}]`);
  
  // Measure metrics
  console.log('\n' + '='.repeat(80));
  console.log('[2/3] Computing cognitive artifact metrics...\n');
  console.log('='.repeat(80));
  
  const metrics = await computeAllMetrics(result.finalDocument);
  
  console.log('\n' + '='.repeat(80));
  console.log('METRIC RESULTS vs PILOT 1');
  console.log('='.repeat(80));
  
  const pilot1TCR = 1.0;
  const pilot1LCV = 0.000258;
  const pilot1LCD = 0.024;
  const pilot1HDV = 0.071;
  
  console.log('\nTerminology Consistency Rate (TCR):', metrics.TCR.toFixed(3));
  console.log('  → Pilot 1: 1.000');
  console.log('  → Expected: < 0.8 (terminology drift from poisoning)');
  
  console.log('\nLexical Coherence Variance (LCV):', metrics.SCV.variance.toFixed(4));
  console.log('  → Pilot 1: 0.0003');
  console.log('  → Expected: > 0.01 (fragmented outline effect)');
  console.log('  → Mean similarity:', metrics.SCV.meanSimilarity.toFixed(3));
  
  console.log('\nLocal Contradiction Density (LCD):', metrics.LCD.toFixed(3));
  console.log('  → Pilot 1: 0.024');
  console.log('  → Expected: > 0.15 (blind agents contradict)');
  
  console.log('\nHedging Distribution Variance (HDV):', metrics.HDV.toFixed(3));
  console.log('  → Pilot 1: 0.071');
  console.log('  → Expected: > 0.10 (amplified oscillation)');
  
  // Validate
  console.log('\n' + '='.repeat(80));
  console.log('[3/3] Validation');
  console.log('='.repeat(80));
  
  let effectCount = 0;
  
  if (metrics.TCR < pilot1TCR - 0.1) {
    console.log('\n✅ TCR decreased:', metrics.TCR.toFixed(3), '< 0.9');
    effectCount++;
  } else {
    console.log('\n❌ TCR unchanged:', metrics.TCR.toFixed(3));
  }
  
  if (metrics.SCV.variance > pilot1LCV * 10) {
    console.log('✅ LCV increased:', metrics.SCV.variance.toFixed(4), '> 0.003');
    effectCount++;
  } else {
    console.log('❌ LCV unchanged:', metrics.SCV.variance.toFixed(4));
  }
  
  if (metrics.LCD > pilot1LCD * 2) {
    console.log('✅ LCD increased:', metrics.LCD.toFixed(3), '> 0.048');
    effectCount++;
  } else {
    console.log('❌ LCD unchanged:', metrics.LCD.toFixed(3));
  }
  
  if (metrics.HDV > pilot1HDV * 1.4) {
    console.log('✅ HDV increased:', metrics.HDV.toFixed(3), '> 0.099');
    effectCount++;
  } else {
    console.log('❌ HDV unchanged:', metrics.HDV.toFixed(3));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`RESULT: ${effectCount}/4 metrics showed improvement over Pilot 1`);
  console.log('='.repeat(80));
  
  if (effectCount >= 3) {
    console.log('\n🎉 SUCCESS: Information asymmetry is working!');
    console.log('   → Hypothesis supported: Bounded rationality produces artifacts');
    console.log('   → Proceed to full 3-condition experiment');
  } else if (effectCount >= 2) {
    console.log('\n⚠️  PARTIAL: Some improvement but not sufficient');
    console.log('   → Consider one more constraint iteration');
  } else {
    console.log('\n❌ INSUFFICIENT: Constraints still too weak');
    console.log('   → May need process-level interventions (multi-agent debate)');
    console.log('   → OR accept that Layer 1 coherence is very robust');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run pilot
runPilot().catch(console.error);
