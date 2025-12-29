
import * as fs from 'fs';
import * as path from 'path';

// Inline the Analysis Logic for standalone execution (avoiding module resolution mess)
// Copy-paste relevant parts from AnalysisService

interface SentenceAnalysis {
  index: number;
  length: number;
  text: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  entropyScore: number;
  avgWordLength: number;
}

interface ParagraphAnalysis {
    index: number;
    length: number;
    text: string;
    sentences: SentenceAnalysis[];
    isMonotone: boolean;
    cv: number;
}

const analyzeSentenceComplexity = (text: string): SentenceAnalysis[] => {
    if (!text) return [];
    
    // Regex: [^.!?\n]+([.!?\n]+|$)/g;
    const sentenceRegex = /[^.!?\n]+([.!?\n]+|$)/g;
    
    const analyses: SentenceAnalysis[] = [];
    let match;

    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentenceText = match[0];
      const trimmed = sentenceText.trim();
      
      if (trimmed.length < 3) continue; 

      const words = trimmed.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const cleanWords = words.filter(w => w.length > 0);
      
      if (cleanWords.length === 0) continue;

      const totalWords = cleanWords.length;
      const uniqueWords = new Set(cleanWords).size;
      const totalChars = cleanWords.reduce((acc, w) => acc + w.length, 0);
      const avgWordLength = totalChars / totalWords;
      const entropy = uniqueWords / totalWords; 

      let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      
      // LOGIC FROM AnalysisService.ts
      if (avgWordLength > 5.5 || entropy > 0.9) {
          risk = 'LOW'; 
      } else if (avgWordLength < 4.0 && totalWords > 10) {
          risk = 'HIGH'; 
      } else {
          risk = 'MEDIUM'; 
      }
      
      if (totalWords < 5) risk = 'LOW';

      analyses.push({
        index: match.index,
        length: sentenceText.length,
        text: sentenceText,
        risk,
        entropyScore: entropy,
        avgWordLength
      });
    }

    return analyses;
}

const analyzeBurstiness = (text: string): ParagraphAnalysis[] => {
    const paragraphs: ParagraphAnalysis[] = [];
    const lines = text.split('\n');
    let currentIndex = 0;

    lines.forEach((line, i) => {
        const fullLine = i < lines.length - 1 ? line + '\n' : line; 
        
        // Skip empty lines for stats (but keep index sync if needed? logic says analyzeBurstiness keeps them)
        // If line is empty, sentences is empty.
        
        const sentences = analyzeSentenceComplexity(line);
        
        let isMonotone = false;
        let cv = 0;
        
        if (sentences.length > 2) {
            const wordCounts = sentences.map(s => s.text.trim().split(/\s+/).length);
            const mean = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
            const variance = wordCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wordCounts.length;
            const stdDev = Math.sqrt(variance);
            cv = mean > 0 ? stdDev / mean : 0;
            
            // Verdict
            // RHYTHM OVERRIDE PROTOCOL
            if (cv < 0.25) {
                isMonotone = true;
                // Downgrade all LOW (Green) risk to MEDIUM (Yellow).
                sentences.forEach(s => {
                    if (s.risk === 'LOW') s.risk = 'MEDIUM';
                });
            }
        }

        paragraphs.push({
            index: currentIndex,
            length: fullLine.length,
            text: fullLine,
            sentences,
            isMonotone,
            cv
        });
        
        currentIndex += fullLine.length;
    });

    return paragraphs;
}

// MAIN EXECUTION
const filePath = '/Users/lesz/Downloads/academic-integrity-agent/Model_Scaling/Assets/Apple_Casual_Pattern/Letting_go.md';
const content = fs.readFileSync(filePath, 'utf-8');

console.log('--- Analyzing File: Letting_go.md ---');
const results = analyzeBurstiness(content);

results.forEach((p, idx) => {
    if (p.sentences.length === 0) return;
    console.log(`\nParagraph ${idx + 1}: Monotone=${p.isMonotone} (CV: ${p.cv.toFixed(3)})`);
    p.sentences.forEach((s, sIdx) => {
        console.log(`  S${sIdx}: Risk=${s.risk} (AvgLen=${s.avgWordLength.toFixed(2)}, Entropy=${s.entropyScore.toFixed(2)}) -> "${s.text.substring(0, 30)}..."`);
    });
});
