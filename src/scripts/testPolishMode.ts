
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { generateContent } from '../services/academicIntegrityService.ts';
import { Mode } from '../types';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function runTest() {
  try {
    console.log('Starting Polish Mode Verification...');

    // Read the input file (Plastic Pollution text)
    const inputPath = path.resolve(__dirname, '../../Model_Scaling/Assets/GPT_Zero/v12_Claude_Output.md');
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found at ${inputPath}`);
        // Fallback or exit
        // Let's create a dummy input if file is missing, but it should be there based on context
        process.exit(1);
    }
    const inputText = fs.readFileSync(inputPath, 'utf-8');

    console.log(`Input loaded (${inputText.length} chars). Generating Polish Mode output...`);

    // Call the service
    // Mock user context if needed, but for now we pass empty context or minimal
    // The service requires (input, mode, length, citationStyle, userContext, onChunk)
    // We'll use a simple onChunk to log progress
    let output = '';
    await generateContent(
      'polish' as Mode,
      inputText,
      'medium', // Length guidance (technically additionalInstructions is 3rd arg in actual service signature, wait)
      (chunk: string) => {
        process.stdout.write('.');
        output += chunk;
      }
    );

    console.log('\nGeneration Complete.');

    // Save Output
    const outputPath = path.resolve(__dirname, '../../Model_Scaling/Assets/Apple_Writing_Tools/test_polish_output.md');
    // Ensure dir exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, output);
    console.log(`Output saved to: ${outputPath}`);

  } catch (error) {
    console.error('Error running test:', error);
  }
}

runTest();
