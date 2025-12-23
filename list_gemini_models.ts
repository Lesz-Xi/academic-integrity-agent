
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: VITE_GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // There isn't a direct listModels method in the high-level SDK mostly, 
    // but the underlying API supports it. 
    // Alternatively, we can just try to fetch via REST if the SDK doesn't expose it easily.
    // Actually, looking at the node SDK, it might be on the model manager.
    // Let's try REST for certainty to avoid SDK version issues.
    
    // Using fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      console.log("Available Models:");
      data.models.forEach((m: any) => {
        if (m.name.includes("gemini")) {
           console.log(`- ${m.name} (DisplayName: ${m.displayName})`);
        }
      });
    } else {
      console.log("No models found or error:", data);
    }

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
