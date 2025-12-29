import React, { useMemo } from 'react';
import { SentenceAnalysis, ParagraphAnalysis } from '../services/analysisService';

interface PerplexityBackdropProps {
  content: string;
  analysis: ParagraphAnalysis[]; // Now accepts Paragraph Tree
  className?: string;
  theme: 'light' | 'dark';
}

const PerplexityBackdrop: React.FC<PerplexityBackdropProps> = ({ 
  content, 
  analysis, 
  className = '',
  theme
}) => {
  // We reconstruct the text layout using the Paragraph Analysis.
  // Each 'Para' object corresponds to a line (or block) in the textarea.
  
  const segments = useMemo(() => {
    if (!content || !analysis || analysis.length === 0) return null;

    return analysis.map((para) => (
        <div 
          key={para.index} 
          className={`relative transition-colors duration-500 mb-0 ${
            para.isMonotone 
               ? 'border-l-4 border-orange-500/50 bg-orange-100/10 dark:bg-orange-900/10 pl-2 -ml-3' // Pull left to create gutter effect
               : 'border-l-4 border-transparent pl-2 -ml-3'
          }`}
          title={para.isMonotone ? `Robotic Rhythm (CV: ${para.cv.toFixed(2)})` : `Human Rhythm (CV: ${para.cv.toFixed(2)})`}
        >
            {/* Render Sentences inside the paragraph */}
            {para.sentences.length > 0 ? para.sentences.map((sent) => (
               <Sentence key={sent.index} data={sent} theme={theme} />
            )) : (
               // If empty paragraph (newline only), render a space/break so it takes up height?
               // Actually the text is needed for wrapping.
               // We render the raw text of the paragraph, wrapping known sentences.
               // BUT if we just mapped sentences, we miss the spaces between them.
               // We need a reconstructor here too.
               <ReconstructedParagraph para={para} theme={theme} />
            )}
        </div>
    ));
  }, [content, analysis, theme]);

  return (
    <div 
      className={`absolute inset-0 z-0 pointer-events-none whitespace-pre-wrap break-words ${className}`}
      aria-hidden="true"
    >
      {segments}
    </div>
  );
};

// Helper to fill gaps within a paragraph
const ReconstructedParagraph = ({ para, theme }: { para: ParagraphAnalysis, theme: 'light' | 'dark' }) => {
    const result: React.ReactNode[] = [];
    let currentIndex = 0; // Relative to para.text start? 
    // Wait, para.sentences have absolute indices (match.index).
    // We need to slice relative to the paragraph text? 
    // AnalysisService puts absolute index in sentence.index.
    
    // Safety check: The sentence indices must align with paragraph text flow.
    // However, slicing para.text is hard if indices are absolute.
    // Better to use Absolute Slicing from `para.text`?
    // Start index of paragraph = para.index.
    
    const paraStart = para.index;
    
    para.sentences.forEach((sent, i) => {
        // Gap before sentence
        if (sent.index > paraStart + currentIndex) {
            const gap = para.text.slice(currentIndex, sent.index - paraStart);
            result.push(<span key={`gap-${i}`} className="text-transparent selection:text-transparent">{gap}</span>);
        }
        
        // Sentence
        result.push(<Sentence key={`s-${i}`} data={sent} theme={theme} />);
        
        currentIndex = (sent.index - paraStart) + sent.length;
    });
    
    // Tail
    if (currentIndex < para.text.length) {
        result.push(<span key="tail" className="text-transparent selection:text-transparent">{para.text.slice(currentIndex)}</span>);
    }
    
    return <>{result}</>;
};

const Sentence = ({ data, theme }: { data: SentenceAnalysis, theme: 'light' | 'dark' }) => {
    let bgClass = 'bg-transparent';
    if (data.risk === 'LOW') {
         // Boosted Green for Dark Mode Visibility
         bgClass = theme === 'dark' ? 'bg-green-500/30' : 'bg-green-100/50';
    } else if (data.risk === 'MEDIUM') {
         bgClass = theme === 'dark' ? 'bg-yellow-900/10' : 'bg-yellow-100/30';
    } else if (data.risk === 'HIGH') {
         // Boosted Visibility for "Red" (High Risk)
         // Light: Stronger Red background with medium opacity
         // Dark: Strong Red tint
         bgClass = theme === 'dark' ? 'bg-red-500/30' : 'bg-red-400/40';
    }

    return (
        <span 
          className={`${bgClass} text-transparent rounded-[2px] transition-colors duration-500`}
        >
            {data.text}
        </span>
    );
};

export default React.memo(PerplexityBackdrop);
