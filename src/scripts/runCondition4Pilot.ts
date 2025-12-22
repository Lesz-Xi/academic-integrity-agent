/**
 * Pilot Study Runner for Condition 4
 * 
 * Syntactic Entropy & N-Gram Shattering
 * Testing: SLE ↑ (Burstiness) and Perplexity Evasion
 */

import { generateCondition4 } from '../services/condition4Service';
import { computeAllMetrics } from '../services/metricService';
import { writeFileSync, readFileSync } from 'fs';

const TOPIC = 'The environmental impact of compostable packaging in university canteens';

// Load Claude API key from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envContent.match(/VITE_CLAUDE_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : '';

async function runPilot() {
  console.log('='.repeat(80));
  console.log('CONDITION 4: The Shatterer (Syntactic Entropy)');
  console.log('='.repeat(80));
  console.log('\nTopic:', TOPIC);
  console.log('\nConstraints:');
  console.log('  1. Forbidden Transitions (No "Furthermore", "However", etc.)');
  console.log('  2. Rhythmic Spiking (Short <6 words → Long >35 words)');
  console.log('  3. Lexical Rarity (Tier-2/3 synonyms)');
  console.log('  4. Voice Dysphonia (Clinical → Frustrated → Philosophical)');
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Generate document via The Shatterer
  const finalDocument = await generateCondition4(TOPIC, API_KEY);
  
  console.log('\n' + '='.repeat(80));
  console.log('THE SHATTERER OUTPUT');
  console.log('='.repeat(80));
  console.log(finalDocument);
  
  // Save document
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `./pilot_outputs/condition4_${timestamp}.md`;
  writeFileSync(filename, finalDocument);
  console.log(`\n[Saved to: ${filename}]`);
  
  // Measure metrics
  console.log('\n' + '='.repeat(80));
  console.log('COMPUTING METRICS');
  console.log('='.repeat(80));
  
  const metrics = await computeAllMetrics(finalDocument);
  
  console.log('\n' + '='.repeat(80));
  console.log('METRIC RESULTS');
  console.log('='.repeat(80));
  
  console.log('\nSLE (Sentence Length Entropy) [NEW]:');
  console.log('  Value:', metrics.SLE.toFixed(3));
  console.log('  Target: > 3.0 (High Burstiness)');
  const slePass = metrics.SLE > 3.0;
  console.log('  Status:', slePass ? '✅ BURSTINESS ACHIEVED' : '❌ Still robotic');
  
  console.log('\nTCR (Terminology Consistency):');
  console.log('  Value:', metrics.TCR.toFixed(3));
  console.log('  Context: Lower is better (drift)');
  
  console.log('\nHDV (Hedging Variance):');
  console.log('  Value:', metrics.HDV.toFixed(3));
  
  console.log('\nCheck Constraints:');
  const forbidden = ["furthermore", "moreover", "however", "in conclusion", "additionally", "ultimately", "therefore"];
  const lowerText = finalDocument.toLowerCase();
  const violations = forbidden.filter(w => lowerText.includes(w));
  
  console.log('  Forbidden words found:', violations.length > 0 ? violations.join(', ') : 'None ✅');
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run pilot
runPilot().catch(console.error);
