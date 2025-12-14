import { forwardRef } from 'react';
import { Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import DOMPurify from 'dompurify';
import { markdownToHtml } from '../utils/markdownRenderer';
import { cleanLatex } from '../utils/latexCleaner';
import { linkifySources } from '../utils/sourceLinkifier';

interface OutputPanelProps {
  text: string;
  warnings: string[];
  onCopy: () => void;
  copied: boolean;
}

const OutputPanel = forwardRef<HTMLDivElement, OutputPanelProps>(({ text, warnings, onCopy, copied }, ref) => {
  if (!text) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-8 text-center">
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
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  });

  return (

    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div 
        ref={ref}
        className="bg-white dark:bg-[#252525] rounded-xl border border-[#E5E3DD] dark:border-[#444] shadow-sm p-6 transition-colors duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-white">Generated Content</h3>
          <button
            onClick={onCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium border ${
              copied 
                ? 'bg-[#D2B48C] dark:bg-[#D2B48C] border-[#D2B48C] text-[#2D2D2D]' 
                : 'bg-white dark:bg-[#333] border-[#D2B48C] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#2D2D2D] dark:hover:bg-[#D2B48C] dark:hover:text-[#2D2D2D]'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Output
              </>
            )}
          </button>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-400 mb-2">Warnings</h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                  {warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-600 dark:text-yellow-500">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Content - Rendered as HTML */}
        <div className="p-6 bg-[#FAF9F6] dark:bg-[#333] rounded-lg border border-[#D2B48C] dark:border-[#444] max-h-[600px] overflow-y-auto prose prose-sm max-w-none dark:prose-invert">
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
