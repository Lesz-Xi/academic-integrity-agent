import { forwardRef, useState } from 'react';
import { Copy, CheckCircle, AlertTriangle, FileText, File } from 'lucide-react';
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

    <div className="w-full max-w-5xl mx-auto px-0 sm:px-6 scroll-mt-20">
      <div 
        ref={ref}
        className="bg-transparent transition-colors duration-300"
      >
        <div className="flex flex-row items-center justify-center gap-2 mb-10 sticky top-20 z-10 py-2">
          {/* Actions - Now centered and more discrete */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/60 dark:bg-[#1a1a1a]/60 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg px-2">
            {/* Export DOCX Button */}
            <button
              onClick={handleExportDocx}
              disabled={isExporting !== null}
              className="p-2.5 text-gray-500 hover:text-[#C1A87D] dark:text-gray-400 dark:hover:text-[#F2E8CF] transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50"
              title="Download as Word"
            >
              <FileText className="w-5 h-5" />
            </button>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting !== null}
              className="p-2.5 text-gray-500 hover:text-[#C1A87D] dark:text-gray-400 dark:hover:text-[#F2E8CF] transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50"
              title="Download as PDF"
            >
              <File className="w-5 h-5" />
            </button>

            <div className="w-[1px] h-5 bg-gray-200 dark:bg-white/10 mx-1" />

            {/* Copy Button */}
            <button
              onClick={onCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                copied 
                  ? 'bg-[#C1A87D] text-white shadow-md transform scale-105' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warnings - Moved and styled elegantly */}
        {warnings.length > 0 && (
          <div className="mb-10 p-5 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-2">Review Required</h4>
                <ul className="text-sm text-amber-700/80 dark:text-amber-300/80 space-y-1.5">
                  {warnings.map((warning, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="opacity-60">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Content - Document Style */}
        <div className="prose prose-sm sm:prose-lg max-w-none dark:prose-invert 
            prose-headings:font-serif prose-headings:font-medium 
            prose-p:leading-relaxed sm:prose-p:leading-loose prose-p:mb-6 
            prose-li:my-1 prose-ul:my-4 prose-ol:my-4
            text-gray-800 dark:text-gray-200">
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
