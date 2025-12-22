// Test script for Sentence Risk Analyzer
import { analyzeTextRisk, generateHumanEditReport } from '../src/services/sentenceRiskAnalyzer';
import * as fs from 'fs';

const testFile = './Model_Scaling/Assets/GPT_Zero/v7_Output_1.md';

console.log('📖 Loading test file:', testFile);
const text = fs.readFileSync(testFile, 'utf-8');

console.log('\n🔬 Running Sentence Risk Analysis...\n');
const report = analyzeTextRisk(text);

console.log(generateHumanEditReport(report));

console.log('\n📊 FULL SENTENCE BREAKDOWN:');
console.log('-'.repeat(60));
for (const s of report.sentences) {
  const icon = s.riskLevel === 'HIGH' ? '🔴' : s.riskLevel === 'MEDIUM' ? '🟡' : '🟢';
  console.log(`${icon} [${s.riskScore}%] ${s.sentence.substring(0, 60)}...`);
}
