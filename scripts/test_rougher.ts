// Test script for v15.0 Stealth Saboteur Service
import { applyRougher, quickRoughen } from '../src/services/rougherService';
import * as fs from 'fs';

// Load API key from .env.local
function loadEnv(): { gemini: string, claude: string } {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const gemini = envContent.match(/^VITE_GEMINI_API_KEY=(.+)$/m)?.[1].trim() || '';
  const claude = envContent.match(/^VITE_CLAUDE_API_KEY=(.+)$/m)?.[1].trim() || '';
  return { gemini, claude };
}

const testFile = './Model_Scaling/Assets/GPT_Zero/Real_Test_1.md';
const keys = loadEnv();
process.env.VITE_CLAUDE_API_KEY = keys.claude;
const apiKey = keys.gemini;

async function runTest() {
  console.log('📖 Loading test file:', testFile);
  const text = fs.readFileSync(testFile, 'utf-8').substring(0, 1000); // Only first 1000 chars
  
  console.log('\n🧪 Testing v11 QUICK Sludge (rule-based only)...\n');
  const quickResult = quickRoughen(text);
  
  console.log('📊 QUICK SLUDGE PREVIEW (first 500 chars):');
  console.log('-'.repeat(60));
  console.log(quickResult.substring(0, 500) + '...');
  
  // Save quick result
  fs.writeFileSync('./Model_Scaling/Assets/GPT_Zero/v13_5_Quick_Output.md', quickResult);
  console.log('\n💾 Saved quick result to v13_5_Quick_Output.md');
  
  console.log('\n🔬 Testing v17.0 LAZY STUDENT (Aggressive LLM)...\n');
  
  try {
    const deepResult = await applyRougher(text, apiKey, true);
    
    console.log('\n📊 v17.0 LAZY STUDENT STATS:');
    console.log('='.repeat(60));
    console.log(`🦴 Skeleton Shattered: ${deepResult.stats.skeletonChanges}`);
    console.log(`🌀 Cluster Sabotage: ${deepResult.stats.clusterChanges}`);
    console.log(`💀 Lexical Sabotage: ${deepResult.stats.lexiconChanges}`);
    console.log(`🔗 Connectives Scrubbed: ${deepResult.stats.connectivesScrubbed}`);
    console.log(`📐 Chaos Splits (Ratio Force): ${deepResult.stats.chaosSplits}`);
    console.log(`🧩 Aperiodic Fragments (1:3 Force): ${deepResult.stats.aperiodicFragments}`);
    console.log(`🖇️ Semicolons Injected (Complexity): ${deepResult.stats.semicolonsInjected}`);
    console.log(`🎯 Target Sentences Flagged: ${deepResult.stats.highRiskSentences}`);
    console.log(`📌 Parentheticals Added: ${deepResult.stats.parentheticalsAdded}`);
    console.log(`✂️ Asymmetric Fragments: ${deepResult.stats.asymmetricFragments}`);
    console.log(`🤝 Sentences Fused (Run-ons): ${deepResult.stats.sentencesFused}`);
    console.log(`💤 Lazy Capitalizations: ${deepResult.stats.lazyCapitalizations}`);
    
    console.log('\n📊 v17.0 LAZY STUDENT PREVIEW (first 500 chars):');
    console.log('-'.repeat(60));
    console.log(deepResult.roughenedText.substring(0, 500) + '...');
    
    // Save deep result
    fs.writeFileSync('./Model_Scaling/Assets/GPT_Zero/v13_5_Surgical_Output.md', deepResult.roughenedText);
    console.log('\n💾 Saved lazy result to v13_5_Surgical_Output.md');
    
  } catch (error) {
    console.error('Surgical sludge failed:', error);
  }
}

runTest();
