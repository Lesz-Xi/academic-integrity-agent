import { forwardRef, useState } from 'react';
import { Copy, CheckCircle, AlertTriangle, FileDown } from 'lucide-react';
import DOMPurify from 'dompurify';
import { markdownToHtml } from '../utils/markdownRenderer';
import { cleanLatex } from '../utils/latexCleaner';
import { linkifySources } from '../utils/sourceLinkifier';
import { exportToDocx, exportToPdf } from '../utils/documentExporter';

interface OutputPanelProps {
  text: string;
  warnings: string[];
  onCopy: () => void;
  copied: boolean;
}

const OutputPanel = forwardRef<HTMLDivElement, OutputPanelProps>(({ text, warnings, onCopy, copied }, ref) => {
  const [isExporting, setIsExporting] = useState<'docx' | 'pdf' | null>(null);

  const handleExportDocx = async () => {
    setIsExporting('docx');
    try {
      await exportToDocx(text, 'generated-content');
    } catch (error) {
      console.error('DOCX export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting('pdf');
    try {
      await exportToPdf(text, 'generated-content');
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

  if (!text) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-white/20 dark:border-white/10">
          <p className="text-gray-600">Generated content will appear here</p>
        </div>
      </div>
    );
  }

  // Clean LaTeX notation, linkify sources, then convert markdown to HTML
  const cleanedText = cleanLatex(text);
  const linkedText = linkifySources(cleanedText);
  const rawHtml = markdownToHtml(linkedText);
  // Sanitize HTML to prevent XSS attacks
  const htmlContent = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'ul', 'ol', 'li', 
                   'strong', 'em', 'code', 'pre', 'blockquote', 'a', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  return (

    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div 
        ref={ref}
        className="bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-lg p-6 transition-colors duration-300"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-[#2D2D2D] dark:text-white">Generated Content</h3>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {/* Export DOCX Button */}
            <button
              onClick={handleExportDocx}
              disabled={isExporting !== null}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium border text-[10px] sm:text-xs 
                bg-white dark:bg-claude-input border-[#D2B48C] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-white dark:hover:bg-[#D2B48C] dark:hover:text-white
                disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Download as Word Document"
            >
              <FileDown className="w-3 h-3" />
              {isExporting === 'docx' ? 'Exporting...' : 'DOCX'}
            </button>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting !== null}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium border text-[10px] sm:text-xs 
                bg-white dark:bg-claude-input border-[#D2B48C] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-white dark:hover:bg-[#D2B48C] dark:hover:text-white
                disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Download as PDF"
            >
              <FileDown className="w-3 h-3" />
              {isExporting === 'pdf' ? 'Exporting...' : 'PDF'}
            </button>

            {/* Copy Button */}
            <button
              onClick={onCopy}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium border text-[10px] sm:text-xs ${
                copied 
                  ? 'bg-[#D2B48C] dark:bg-[#D2B48C] border-[#D2B48C] text-white' 
                  : 'bg-white dark:bg-claude-input border-[#D2B48C] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-white dark:hover:bg-[#D2B48C] dark:hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-6 p-4 bg-[#F2E8CF]/20 dark:bg-[#F2E8CF]/5 border border-[#85683F]/30 dark:border-[#85683F]/20 rounded-xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#85683F]/40" />
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#85683F] dark:text-[#F2E8CF] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#85683F] dark:text-[#F2E8CF] text-sm uppercase tracking-wider mb-2">Warnings</h4>
                <ul className="text-sm text-[#85683F]/90 dark:text-[#F2E8CF]/80 space-y-1.5">
                  {warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-[#85683F]/60 dark:text-[#F2E8CF]/60 flex-shrink-0 leading-none">•</span>
                      <span className="leading-tight">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Content - Rendered as HTML */}
        <div className="p-4 sm:p-6 bg-transparent rounded-lg border-none max-h-[600px] overflow-y-auto prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-p:leading-relaxed sm:prose-p:leading-loose prose-p:mb-4">
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          Review the content and metrics before using in academic work
        </p>
      </div>
    </div>
  );
});

OutputPanel.displayName = 'OutputPanel';

export default OutputPanel;
