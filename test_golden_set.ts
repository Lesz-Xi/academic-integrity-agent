// Golden Set Test Script for Paraphrase Prompt
// Run with: npx tsx test_golden_set.ts

import { GoogleGenAI } from '@google/genai';
import { PARAPHRASE_MODE_PROMPT } from './src/prompts/modeC_paraphrase';

const API_KEY = 'AIzaSyCACbyuQmzNlSh0RcoQyCtHisELZqLpBNk'; // Backup key


const GOLDEN_SET = [
  {
    name: 'Test Case 1: Dense Theory (Philosophy/Psychology)',
    input: `The mechanisms behind self-doubt reveal themselves not as simple hesitations, but as complex recursive loops where the subject interrogates their own competence. This internal scrutiny, while often maladaptive, serves a perverse protectory function by preempting external criticism. Cognitive dissonance plays a central role here, as the individual strives to reconcile their perceived potential with their current performance metrics.`,
    successCriteria: [
      'Retains "recursive loops", "maladaptive", "preempting", "Cognitive dissonance".',
      'No slang (e.g., "mess", "stuff", "weird loops").',
      'No "I think" or "We see" additions.',
    ],
    bannedTerms: ['mess', 'stuff', 'weird loops', 'I think', 'We see', 'basically', 'kinda', 'sorta'],
    requiredTerms: ['recursive', 'maladaptive', 'preempting', 'cognitive dissonance'],
  },
  {
    name: 'Test Case 2: Hard Science (Biology/Neuroscience)',
    input: `Synaptic plasticity remains the fundamental substrate of learning and memory formation. Long-term potentiation (LTP) involves the persistent strengthening of synapses based on recent patterns of activity. Specifically, the influx of calcium ions through NMDA receptors triggers a cascade of intracellular signaling pathways, ultimately leading to the insertion of additional AMPA receptors into the postsynaptic membrane.`,
    successCriteria: [
      'Retains "Synaptic plasticity", "substrate", "LTP", "NMDA receptors", "AMPA receptors".',
      'Passive/Objective voice maintained.',
      'No "basically", "tiny doors", "stuff happens".',
    ],
    bannedTerms: ['basically', 'tiny doors', 'stuff happens', 'stuff', 'things', 'pretty much', 'kinda'],
    requiredTerms: ['synaptic plasticity', 'substrate', 'LTP', 'NMDA', 'AMPA'],
  },
  {
    name: 'Test Case 3: Formal Professional (Business/Legal)',
    input: `The proposed acquisition of the subsidiary leverages significant synergies in the supply chain vertical. Due diligence indicates that while immediate integration costs are substantial, the long-term amortization schedule suggests a favorable return on investment (ROI) within the fiscal quartiles projected. Shareholders are advised to consider the macroeconomic volatility that may impact short-term liquidity.`,
    successCriteria: [
      'Retains "synergies", "vertical", "Due diligence", "amortization", "liquidity".',
      'No contractions (\"It\'s\", \"There\'s\").',
      'No "Heads up", "Look", "Money talk".',
    ],
    bannedTerms: ["It's", "There's", "Here's", "Heads up", "Look", "Money talk", "stuff", "basically", "gonna"],
    requiredTerms: ['synergies', 'vertical', 'due diligence', 'amortization', 'liquidity'],
  },
];

async function runTest(testCase: typeof GOLDEN_SET[0]) {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = PARAPHRASE_MODE_PROMPT + '\n\n[USER INPUT TO PARAPHRASE]:\n' + testCase.input;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 ${testCase.name}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\n📥 INPUT:\n${testCase.input}\n`);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 1.0,
        topP: 0.95,
      }
    });
    const output = response.text || '';

    
    console.log(`📤 OUTPUT:\n${output}\n`);
    
    // Check for banned terms
    const outputLower = output.toLowerCase();
    const bannedFound = testCase.bannedTerms.filter(term => 
      outputLower.includes(term.toLowerCase())
    );
    
    // Check for required concepts (flexible matching)
    const requiredMissing = testCase.requiredTerms.filter(term => 
      !outputLower.includes(term.toLowerCase())
    );
    
    console.log(`\n✅ SUCCESS CRITERIA EVALUATION:`);
    testCase.successCriteria.forEach((criteria, i) => {
      console.log(`   ${i + 1}. ${criteria}`);
    });
    
    console.log(`\n🔍 AUTOMATED CHECKS:`);
    if (bannedFound.length === 0) {
      console.log(`   ✅ No banned slang/casual terms found`);
    } else {
      console.log(`   ❌ BANNED TERMS FOUND: ${bannedFound.join(', ')}`);
    }
    
    if (requiredMissing.length === 0) {
      console.log(`   ✅ All key academic terms retained`);
    } else {
      console.log(`   ⚠️ MISSING TERMS (may be synonymized): ${requiredMissing.join(', ')}`);
    }
    
    // Check for first person additions
    const firstPersonPatterns = /\b(I think|We see|I believe|We found|I recall|In my experience)\b/gi;
    const firstPersonMatches = output.match(firstPersonPatterns);
    if (!firstPersonMatches) {
      console.log(`   ✅ No inappropriate first-person additions`);
    } else {
      console.log(`   ❌ FIRST-PERSON ADDITIONS: ${firstPersonMatches.join(', ')}`);
    }
    
    // Calculate burstiness (sentence length variation)
    const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avgLen;
    
    console.log(`   📊 Burstiness CV: ${cv.toFixed(2)} (target: >0.6)`);
    console.log(`   📊 Sentence lengths: ${lengths.join(', ')}`);
    
    return { success: bannedFound.length === 0 && !firstPersonMatches, output, bannedFound, requiredMissing };
  } catch (error) {
    console.error(`❌ ERROR: ${error}`);
    return { success: false, output: '', bannedFound: [], requiredMissing: [] };
  }
}

async function main() {
  console.log('🧪 GOLDEN SET TEST - Paraphrase Prompt Verification');
  console.log('Testing for "Storybook Effect" elimination\n');
  
  const results = [];
  
  for (const testCase of GOLDEN_SET) {
    const result = await runTest(testCase);
    results.push({ name: testCase.name, ...result });
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 FINAL SUMMARY');
  console.log(`${'='.repeat(80)}`);
  
  results.forEach((r, i) => {
    const status = r.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${i + 1}. ${r.name}: ${status}`);
    if (r.bannedFound.length > 0) {
      console.log(`   - Banned terms: ${r.bannedFound.join(', ')}`);
    }
  });
  
  const passed = results.filter(r => r.success).length;
  console.log(`\n🎯 Result: ${passed}/${results.length} tests passed`);
}

main();
