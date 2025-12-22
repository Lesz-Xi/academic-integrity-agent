// Test script for Surgical Editor
import { applySurgicalEdits } from '../src/services/surgicalEditor';
import * as fs from 'fs';

// Load API key from .env.local
function loadEnv(): string {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/^VITE_GEMINI_API_KEY=(.+)$/m);
  return match ? match[1].trim() : '';
}

const testFile = './Model_Scaling/Assets/GPT_Zero/Real_Test_1.md';
const apiKey = loadEnv();

async function runTest() {
  console.log('📖 Loading test file:', testFile);
  const text = fs.readFileSync(testFile, 'utf-8');
  
  console.log('\n🔬 Applying Surgical Edits (HIGH-risk only)...\n');
  
  try {
    const result = await applySurgicalEdits(text, apiKey, 'HIGH');
    
    console.log('\n📊 SURGICAL EDIT REPORT');
    console.log('='.repeat(60));
    console.log(`📝 Total Sentences: ${result.preservedCount + result.editedCount}`);
    console.log(`✏️ Edited: ${result.editedCount}`);
    console.log(`✅ Preserved: ${result.preservedCount}`);
    console.log(`📈 Preservation Ratio: ${(result.preservationRatio * 100).toFixed(1)}%`);
    console.log('\n🔧 EDITS APPLIED:');
    console.log('-'.repeat(60));
    
    for (const edit of result.editsApplied) {
      console.log(`\n[Sentence ${edit.index + 1}] Risk: ${edit.riskBefore}%`);
      console.log(`ORIGINAL: "${edit.originalSentence.substring(0, 80)}..."`);
      console.log(`EDITED:   "${edit.editedSentence.substring(0, 80)}..."`);
      console.log(`REASON:   ${edit.reason}`);
    }
    
    // Save output
    const outputPath = './Model_Scaling/Assets/GPT_Zero/v8_Surgical_Output.md';
    fs.writeFileSync(outputPath, result.editedText);
    console.log(`\n💾 Saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

runTest();
