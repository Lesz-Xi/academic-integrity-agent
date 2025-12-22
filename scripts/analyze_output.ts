// Script to test burstiness and perplexity on Model_Output_5.md
import { analyzeBurstiness, getSentenceLengthHistogram } from '../src/services/burstinessAnalyzer';
import { estimatePerplexity, detectForbiddenPhrases } from '../src/services/perplexityEstimator';
import * as fs from 'fs';

const text = fs.readFileSync('./Model_Scaling/Assets/GPT_Zero/Model_Output_5.md', 'utf-8');

console.log('========================================');
console.log('BURSTINESS ANALYSIS');
console.log('========================================');
const burstiness = analyzeBurstiness(text);
console.log(`Coefficient of Variation: ${burstiness.coefficient_of_variation.toFixed(3)}`);
console.log(`Score: ${burstiness.score}`);
console.log(`Interpretation: ${burstiness.interpretation}`);
console.log(`Details: ${burstiness.details}`);
console.log(`\nSentence Length Distribution:`);
console.log(getSentenceLengthHistogram(burstiness.sentence_lengths));

console.log('\n========================================');
console.log('PERPLEXITY ANALYSIS');
console.log('========================================');
const perplexity = estimatePerplexity(text);
console.log(`Perplexity Score: ${perplexity.perplexity.toFixed(1)}`);
console.log(`Score: ${perplexity.score}`);
console.log(`Interpretation: ${perplexity.interpretation}`);

console.log('\n========================================');
console.log('FORBIDDEN PHRASES');
console.log('========================================');
const forbidden = detectForbiddenPhrases(text);
if (forbidden.length > 0) {
  console.log(`Found ${forbidden.length} forbidden phrases:`);
  forbidden.forEach(p => console.log(`  - "${p}"`));
} else {
  console.log('No forbidden phrases detected. ✅');
}
