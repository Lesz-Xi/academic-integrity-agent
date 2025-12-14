# Academic Integrity Agent

An AI-powered writing assistant designed to help students create original academic content with natural human variance while maintaining scholarly integrity.

## Features

- **Three Specialized Modes:**
  - **Essay & Research:** Generate original arguments with high semantic richness
  - **Computer Science:** Technical documentation with conversational tone
  - **Paraphrase & Humanize:** Deep syntactic restructuring

- **Real-Time Anti-Detection Metrics:**
  - **Burstiness Analysis:** Measures sentence length variance
  - **Perplexity Estimation:** Evaluates word choice unpredictability
  - **Overall Risk Assessment:** Combined detection risk score

- **Ethical Safeguards:**
  - Prominent ethics disclaimer on first use
  - Educational focus on natural writing patterns
  - Transparent about limitations

## Setup

1. Install dependencies:
   ```bash
   cd academic-integrity-agent
   npm install
   ```

2. Configure Gemini API Key:
   - Copy `.env.local` and add your Gemini API key:
     ```
     GEMINI_API_KEY=your_actual_key_here
     ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3001](http://localhost:3001)

## Architecture

```
src/
├── components/          # React UI components
│   ├── ModeSelector.tsx
│   ├── InputPanel.tsx
│   ├── MetricsPanel.tsx
│   ├── OutputPanel.tsx
│   └── EthicsDisclaimer.tsx
├── services/           # Core logic
│   ├── academicIntegrityService.ts  # Gemini integration
│   ├── burstinessAnalyzer.ts
│   └── perplexityEstimator.ts
├── prompts/           # Mode-specific system prompts
│   ├── modeA_essay.ts
│   ├── modeB_cs.ts
│   └── modeC_paraphrase.ts
└── types.ts           # TypeScript interfaces
```

## How It Works

1. **Mode Selection:** Choose your writing mode (Essay, CS, or Paraphrase)
2. **Input:** Enter your topic or text to paraphrase
3. **Generation:** AI generates content using mode-specific anti-detection strategies
4. **Analysis:** Real-time metrics show burstiness and perplexity scores
5. **Review:** Examine warnings and metrics before using the content

## Anti-Detection Strategies

### Burstiness Maximization
- Varies sentence lengths dramatically (short punchy → long complex)
- Avoids uniform sentence structures
- Creates natural rhythm variation

### Perplexity Enhancement
- Uses lower-frequency synonyms strategically
- Avoids high-probability phrase transitions
- Employs domain-specific terminology correctly

### Forbidden Phrase Avoidance
- Detects and warns about common LLM tells
- Examples: "delve into," "in conclusion," "landscape," "tapestry"

## Ethical Use

This tool is for **educational purposes only**. Acceptable uses include:
- Learning how to write with varied sentence structure
- Brainstorming initial ideas for extensive modification
- Paraphrasing your own writing for clarity
- Research on AI detection techniques

**Prohibited uses:**
- Submitting AI-generated content as original work
- Bypassing academic integrity requirements
- Hiding AI assistance when disclosure is required

Always follow your institution's academic integrity policies.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Google Gemini 2.5 Flash Lite** for content generation
- **Lucide React** for icons

## License

Educational use only. Not for commercial purposes.
