// Test script for Citation Analyzer
import { analyzeCitations, generateRiskReport } from '../src/services/citationAnalyzer';
import * as fs from 'fs';

const testFile = './Model_Scaling/Assets/GPT_Zero/Real_Test_1.md';

console.log('📖 Loading test file:', testFile);
const text = fs.readFileSync(testFile, 'utf-8');

console.log('\n🔬 Running Citation Analysis...\n');
const analysis = analyzeCitations(text);

console.log(generateRiskReport(analysis));

console.log('\n📋 ALL CITATIONS FOUND:');
for (const citation of analysis.citations) {
  console.log(`  - ${citation.text} (${citation.format})`);
}
