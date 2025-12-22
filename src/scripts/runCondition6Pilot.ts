/**
 * Pilot Study Runner for Condition 6
 * 
 * Regressive Simplification (The Casual Engine)
 * Testing: "Writing Worse" vs. GPTZero
 */

import { generateCondition6 } from '../services/condition6Service';
import { computeAllMetrics } from '../services/metricService';
import { writeFileSync, readFileSync } from 'fs';

const TOPIC = 'The environmental impact of compostable packaging in university canteens';

// Load Claude API key from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envContent.match(/VITE_CLAUDE_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : '';

async function runPilot() {
  console.log('='.repeat(80));
  console.log('CONDITION 6: The Casual Engine (Regressive Simplification)');
  console.log('='.repeat(80));
  console.log('\nTopic:', TOPIC);
  console.log('\nInterventions:');
  console.log('  1. Forced Contractions ("it\'s", "don\'t")');
  console.log('  2. Weak Verbs ("get", "do", "make")');
  console.log('  3. Vague Nouns ("stuff", "things")');
  console.log('  4. Filler Injection ("Honestly", "Basically")');
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Generate document via The Casual Engine
  const finalDocument = await generateCondition6(TOPIC, API_KEY);
  
  console.log('\n' + '='.repeat(80));
  console.log('CASUAL ENGINE OUTPUT');
  console.log('='.repeat(80));
  console.log(finalDocument);
  
  // Save document
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `./pilot_outputs/condition6_${timestamp}.md`;
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
  console.log('  Context: Likely lower due to "rambling" sentence structure.');
  
  console.log('\nTCR (Terminology Consistency):');
  console.log('  Value:', metrics.TCR.toFixed(3));
  console.log('  Context: Very low due to "stuff/things" usage.');
  
  // Check for "Casual Markers"
  const casualMarkers = ["stuff", "things", "honestly", "basically", "kinda", "sort of", "i guess"];
  const lowerText = finalDocument.toLowerCase();
  const counts = casualMarkers.map(m => {
    const regex = new RegExp(`\\b${m}\\b`, 'g');
    const matches = lowerText.match(regex);
    return { marker: m, count: matches ? matches.length : 0 };
  }).filter(r => r.count > 0);
  
  console.log('\nCasual Markers Found:');
  if (counts.length > 0) {
    counts.forEach(c => console.log(`  - "${c.marker}": ${c.count}`));
  } else {
    console.log('  None found (Failed to simplify)');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run pilot
runPilot().catch(console.error);
