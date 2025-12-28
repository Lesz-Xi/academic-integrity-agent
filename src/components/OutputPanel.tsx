import { forwardRef, useState } from 'react';
import { Copy, Lock, ClipboardCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import DOMPurify from 'dompurify';
import { markdownToHtml } from '../utils/markdownRenderer';
import { cleanLatex } from '../utils/latexCleaner';
import { linkifySources } from '../utils/sourceLinkifier';
import { exportToDocx, exportToPdf } from '../utils/documentExporter';
import AttestationModal from './AttestationModal';

interface OutputPanelProps {
  text: string;
  warnings: string[];
  onCopy: () => void;
  copied: boolean;
  theme?: 'light' | 'dark';
  isPremium?: boolean | null;
  onUpgrade?: () => void;
}

const DocxIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <rect x="2" y="11" width="10" height="6" rx="1" fill="currentColor" stroke="none" />
    <text x="7" y="15.5" fontSize="3.5" fontWeight="bold" textAnchor="middle" fill="white" stroke="none">DOCX</text>
  </svg>
);

const PdfIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <rect x="2" y="11" width="8" height="6" rx="1" fill="currentColor" stroke="none" />
    <text x="6" y="15.5" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="white" stroke="none">PDF</text>
  </svg>
);

const OutputPanel = forwardRef<HTMLDivElement, OutputPanelProps>(({ text, warnings, onCopy, copied, theme = 'light', isPremium, onUpgrade }, ref) => {
  const [isExporting, setIsExporting] = useState<'docx' | 'pdf' | null>(null);
  const [showAttestation, setShowAttestation] = useState(false);

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
                   'strong', 'em', 'code', 'pre', 'blockquote', 'a', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
                   'div', 'span'], // Added div, span for layout
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'], // Added class for styling
  });

  return (
    <>

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
              className="p-2 text-gray-500 hover:text-[#C1A87D] dark:text-gray-400 dark:hover:text-[#F2E8CF] transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50"
              title="Download as Word"
            >
              <DocxIcon className="w-5 h-5" />
            </button>

            {/* Export PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting !== null}
              className="p-2 text-gray-500 hover:text-[#C1A87D] dark:text-gray-400 dark:hover:text-[#F2E8CF] transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50"
              title="Download as PDF"
            >
              <PdfIcon className="w-5 h-5" />
            </button>

            <div className="w-[1px] h-5 bg-gray-200 dark:bg-white/10 mx-1" />

// ... (imports)

// ...

            {/* Audit Log Button */}
            <button
              onClick={() => {
                if (!isPremium && onUpgrade) {
                    onUpgrade();
                } else {
                    setShowAttestation(true);
                }
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:text-[#C1A87D] dark:text-gray-400 dark:hover:text-[#F2E8CF] transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
              title={!isPremium ? "Premium Feature: Forensic Audit" : "Generate Audit Defense Log"}
            >
              {!isPremium ? <Lock className="w-3.5 h-3.5" /> : <ClipboardCheck className="w-4 h-4" />}
              <span className="hidden sm:inline">AUDIT LOG</span>
            </button>

            <div className="w-[1px] h-5 bg-gray-200 dark:bg-white/10 mx-1" />

            {/* Copy Button */}
            <button
              onClick={onCopy}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
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
        <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 dark:border-white/5">
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
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          Review the content and metrics before using in academic work
        </p>
      </div>
    </div>

      {/* Attestation Modal */}
      <AttestationModal
        isOpen={showAttestation}
        onClose={() => setShowAttestation(false)}
        theme={theme}
        modesUsed={{ professional: true }}
      />
    </>
  );
});

OutputPanel.displayName = 'OutputPanel';

export default OutputPanel;
