/**
 * Pilot Study Runner for Condition 5
 * 
 * Collocation Shattering
 * Testing: Lexical Inefficiency vs. GPTZero Layer 1
 */

import { generateCondition5 } from '../services/condition5Service';
import { computeAllMetrics } from '../services/metricService';
import { writeFileSync, readFileSync } from 'fs';

const TOPIC = 'The environmental impact of compostable packaging in university canteens';

// Load Claude API key from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envContent.match(/VITE_CLAUDE_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : '';

async function runPilot() {
  console.log('='.repeat(80));
  console.log('CONDITION 5: The Thesaurus Engine (Collocation Shattering)');
  console.log('='.repeat(80));
  console.log('\nTopic:', TOPIC);
  console.log('\nInterventions:');
  console.log('  1. Blacklist (Banning "delicate balance", "holds promise", etc.)');
  console.log('  2. Low-Frequency Synonymy (Tier-3 words)');
  console.log('  3. Noun-Verb Mismatch');
  console.log('  4. Syntactic Friction');
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Generate document via The Thesaurus Engine
  const finalDocument = await generateCondition5(TOPIC, API_KEY);
  
  console.log('\n' + '='.repeat(80));
  console.log('THESAURUS ENGINE OUTPUT');
  console.log('='.repeat(80));
  console.log(finalDocument);
  
  // Save document
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `./pilot_outputs/condition5_${timestamp}.md`;
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
  
  console.log('\nSLE (Burstiness):');
  console.log('  Value:', metrics.SLE.toFixed(3));
  console.log('  Note: We expect this to stay high or moderate.');
  
  console.log('\nTCR (Terminology Consistency):');
  console.log('  Value:', metrics.TCR.toFixed(3));
  console.log('  Prediction: Near Zero (High drift due to synonyms).');
  
  // Check Blacklist Adherence
  const forbidden = [
    "delicate balance", "fragile balance", 
    "broader implications", "wider implications",
    "holds promise", "shows promise",
    "path forward", "way forward",
    "innovative solutions", "creative solutions",
    "crucial role", "essential part",
    "nuanced landscape", "complex issue", "multifaceted issue",
    "in conclusion", "ultimately"
  ];
  
  const lowerText = finalDocument.toLowerCase();
  const violations = forbidden.filter(w => lowerText.includes(w));
  
  console.log('\nCheck Blacklist:');
  console.log('  Violations found:', violations.length > 0 ? violations.join(', ') : 'None ✅');
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run pilot
runPilot().catch(console.error);
