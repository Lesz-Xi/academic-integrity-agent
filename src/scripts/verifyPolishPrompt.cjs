
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

async function runVerification() {
  try {
    console.log('Starting Polish Prompt Verification (Standalone)...');

    // 1. Load API Key
    const apiKey = process.env.VITE_CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_CLAUDE_API_KEY not found in .env.local');
    }
    const anthropic = new Anthropic({ apiKey });

    // 2. Read the Prompt File (to ensure we test the actual file)
    const promptPath = path.resolve(__dirname, '../prompts/modeD_polish.ts');
    let promptFileContent = fs.readFileSync(promptPath, 'utf-8');
    
    // Extract the string content. The file format is: export const POLISH_MODE_PROMPT = `...`;
    // We'll use a regex to capture it.
    const match = promptFileContent.match(/export const POLISH_MODE_PROMPT = `([\s\S]*)`;/);
    if (!match) {
        throw new Error('Could not extract POLISH_MODE_PROMPT from file');
    }
    const systemPrompt = match[1];
    console.log('Prompt extracted successfully.');

    // 3. Read Input Text
    const inputPath = path.resolve(__dirname, '../../Model_Scaling/Assets/GPT_Zero/v12_Claude_Output.md');
    if (!fs.existsSync(inputPath)) {
        console.warn('Input file not found, using dummy text.');
        // Fallback for testing execution flow if file missing
    }
    const inputText = fs.existsSync(inputPath) ? fs.readFileSync(inputPath, 'utf-8') : "Plastic pollution is a bad problem. We assume it's going to get worse.";

    console.log(`Generating with Claude 3.5 Sonnet...`);

    // 4. Call API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: inputText }
      ]
    });

    const outputText = message.content[0].text;

    // 5. Save Output
    const outputPath = path.resolve(__dirname, '../../Model_Scaling/Assets/Apple_Writing_Tools/test_polish_output.md');
    // Ensure dir exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, outputText);
    console.log(`\nSuccess! Output saved to: ${outputPath}`);
    console.log('Preview:');
    console.log(outputText.substring(0, 200) + '...');

  } catch (error) {
    console.error('Verification failed:', error);
  }
}

runVerification();
