
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Mode } from '../types.ts';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables BEFORE importing services
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function runTest() {
  try {
    // Dynamic import to ensure env vars are loaded first
    const { generateContent } = await import('../services/academicIntegrityService.ts');
    
    console.log('Starting Casual -> Polish Pipeline Test...');

    // 1. Read Input
    const inputPath = path.resolve(__dirname, '../../Model_Scaling/Assets/GPT_Zero/v12_Claude_Output.md');
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found at ${inputPath}`);
        process.exit(1);
    }
    const inputText = fs.readFileSync(inputPath, 'utf-8');
    console.log(`Input loaded (${inputText.length} chars).`);

    // 2. Generate Casual Output
    console.log('\nSTEP 1: Generating Casual Output...');
    let casualOutput = '';
    const casualResponse = await generateContent(
      'casual' as Mode,
      inputText,
      'medium',
      (chunk: string) => { process.stdout.write('.'); casualOutput += chunk; }
    );
    // Note: generateContent returns an object, but our onChunk builds the string too. 
    // Ideally we use the return value.
    if (casualResponse && casualResponse.text) {
        casualOutput = casualResponse.text;
    }
    console.log('\nCasual Output Generated.');

    // Save Casual Output
    const casualPath = path.resolve(__dirname, '../../Model_Scaling/Assets/Apple_Writing_Tools/test_casual_output.md');
    fs.writeFileSync(casualPath, casualOutput);
    console.log(`Saved Casual Output to: ${casualPath}`);


    // 3. Rewrite with Polish Mode (Professional)
    console.log('\nSTEP 2: Rewriting with Polish Mode...');
    let polishOutput = '';
    const polishResponse = await generateContent(
      'polish' as Mode,
      casualOutput, // Feed the CASUAL output as input
      'medium',
      (chunk: string) => { process.stdout.write('.'); polishOutput += chunk; }
    );
    if (polishResponse && polishResponse.text) {
        polishOutput = polishResponse.text;
    }
    console.log('\nPolish Output Generated.');

    // Save Polish Output
    const polishPath = path.resolve(__dirname, '../../Model_Scaling/Assets/Apple_Writing_Tools/test_casual_to_polish_output.md');
    fs.writeFileSync(polishPath, polishOutput);
    console.log(`Saved Polish Output to: ${polishPath}`);

    console.log('\nPipeline Complete.');
    console.log('------------------------------------------------');
    console.log('CASUAL PREVIEW:\n', casualOutput.substring(0, 150) + '...');
    console.log('------------------------------------------------');
    console.log('POLISH PREVIEW:\n', polishOutput.substring(0, 150) + '...');

  } catch (error) {
    console.error('Error running test:', error);
  }
}

runTest();
