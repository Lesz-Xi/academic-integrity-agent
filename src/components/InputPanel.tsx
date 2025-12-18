import React, { useState, useEffect, memo, useRef } from 'react';
import { Mode, EssayLength } from '../types';
import { processFile, validateFileSize, validateFileType, FileProcessingResult } from '../utils/fileProcessor';
import { analyzeDocument, FileAnalysis } from '../services/fileAnalyzer';
import SearchToggle from './SearchToggle';
import CompactModeSelector from './CompactModeSelector';
import CompactLengthSelector from './CompactLengthSelector';
import FileAnalysisCard from './FileAnalysisCard';
import { ArrowUp, Paperclip, FileUp, X, Loader, Edit3 } from 'lucide-react';

interface InputPanelProps {
  mode: Mode;
  onGenerate: (input: string, additionalInstructions: string, searchEnabled?: boolean) => void;
  onInputChange?: (input: string) => void;
  onModeChange?: (mode: Mode) => void;
  onLengthChange?: (length: EssayLength) => void;
  selectedLength?: EssayLength;
  isGenerating: boolean;
  searchEnabled?: boolean;
  onSearchToggle?: (enabled: boolean) => void;
  theme?: 'light' | 'dark';
}

const InputPanel: React.FC<InputPanelProps> = ({ 
  mode, 
  onGenerate, 
  onInputChange,
  onModeChange,
  onLengthChange, 
  selectedLength = 'medium',
  isGenerating,
  searchEnabled = false,
  onSearchToggle,
  theme = 'dark'
}) => {
  const [input, setInput] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileProcessingResult | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // File analysis state
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Ref to skip cleanup when mode changes via quick-action buttons
  const skipCleanupOnModeChangeRef = useRef(false);

  // Clear inputs when mode changes (but not when triggered by quick-action buttons)
  useEffect(() => {
    if (skipCleanupOnModeChangeRef.current) {
      // Skip cleanup - this mode change was from quick actions
      skipCleanupOnModeChangeRef.current = false;
      return;
    }
    // We do NOT clear input on mode change in the new design, as the user might just switch mode mid-typing
    // setInput(''); 
  }, [mode]);

  const handleSubmit = () => {
    // If a file is uploaded AND there is text in the input box, combine them.
    // The file becomes the context, and the input text becomes the specific instruction.
    let finalInput = input.trim();
    
    if (uploadedFile) {
      if (finalInput) {
        // Fusion: Treat file as context and user text as the specific instruction
        finalInput = `REFERENCE FILE: ${uploadedFile.fileName}\n\nCONTENT:\n${uploadedFile.text}\n\n---\n\nUSER INSTRUCTION FOR THIS FILE:\n${finalInput}`;
      } else {
        // Just the file content (legacy behavior if box is empty)
        finalInput = uploadedFile.text;
      }
    }
    
    if (finalInput) {
      onGenerate(finalInput, additionalInstructions, searchEnabled);
    }
  };

  const handleFileUpload = async (file: File) => {
    setFileError(null);
    
    // Validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      setFileError(sizeValidation.error!);
      return;
    }
    
    // Validate file type
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      setFileError(typeValidation.error!);
      return;
    }
    
    setIsProcessingFile(true);
    
    try {
      const result = await processFile(file);
      
      if (result.error) {
        setFileError(result.error);
      } else {
        setUploadedFile(result);
        // Trigger async file analysis (non-blocking)
        analyzeFileAsync(result.text, result.fileName);
      }
    } catch (error) {
      setFileError('Failed to process file. Please try again.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFileError(null);
    setFileAnalysis(null);
    setIsAnalyzing(false);
  };
  
  // Async file analysis
  const analyzeFileAsync = async (text: string, fileName: string) => {
    setIsAnalyzing(true);
    setFileAnalysis(null);
    try {
      const analysis = await analyzeDocument(text, fileName);
      setFileAnalysis(analysis);
    } catch (error) {
      console.error('File analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle action selection from analysis card
  const handleAnalysisAction = (action: string) => {
    // Pre-fill the input with the action
    setInput(action);
    // Focus the textarea
    textareaRef.current?.focus();
  };


  /* Unused handler removed
  const handleActionSelect = ...
  */

  const getPlaceholder = () => {
    if (uploadedFile) {
      return `What should I do with "${uploadedFile.fileName}"? (e.g. "Write my section", "Paraphrase", "Check for AI")`;
    }

    switch (mode) {
      case 'cs':
        return "Describe the code or technical concept you need help with...";
      case 'paraphrase':
        return "Paste the text you'd like to rewrite or humanize...";
      case 'essay':
      default:
        return "What would you like to research or write about today?";
    }
  };
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, [input]);

  const hasContent = input.trim().length > 0 || uploadedFile !== null;

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <div 
        className={`
            relative flex flex-col w-full bg-[#f4f4f4] dark:bg-[#303030] 
            border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-600
            rounded-[26px] transition-all duration-200 shadow-sm
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* File Upload Input (Hidden) */}
        <input
          type="file"
          accept=".txt,.md,.pdf,.docx"
          onChange={handleFileInputChange}
          className="hidden"
          id="file-upload"
          disabled={isGenerating || isProcessingFile}
        />

        {/* Uploaded File Preview */}
        {uploadedFile && (
            <div className="px-4 pt-4 pb-0">
                 <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#424242] rounded-xl border border-gray-200 dark:border-gray-600 max-w-md">
                     <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                         <FileUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                     </div>
                     <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                             {uploadedFile.fileName}
                         </p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">
                             {uploadedFile.characterCount.toLocaleString()} chars
                         </p>
                     </div>
                     <button 
                        onClick={clearFile}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                     >
                         <X className="w-4 h-4 text-gray-500" />
                     </button>
                 </div>
                 
                 {/* File Analysis Card */}
                 {(isAnalyzing || fileAnalysis) && (
                   <FileAnalysisCard
                     analysis={fileAnalysis || { documentType: 'unknown', confidence: 0, structure: { hasAbstract: false, hasMethodology: false, hasResults: false, hasConclusion: false, estimatedSections: [] }, summary: '', suggestedActions: [] }}
                     isLoading={isAnalyzing}
                     onActionSelect={handleAnalysisAction}
                     theme={theme}
                   />
                 )}
            </div>
        )}

        {/* Main Input Area */}
        <div className="relative px-3 sm:px-4 py-3">
             <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  onInputChange?.(e.target.value);
                }}
                placeholder={getPlaceholder()}
                className="w-full bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base sm:text-lg font-sans leading-relaxed max-h-[400px]"
                rows={1}
                style={{ minHeight: '56px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isGenerating && !isProcessingFile) {
                    e.preventDefault();
                    if (hasContent) handleSubmit();
                  }
                }}
                disabled={isGenerating}
              />
        </div>

        {/* Additional Instructions Field (Expandable) */}
        {showInstructions && (
            <div className="px-1 py-1 sm:px-4 sm:py-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/10 animate-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
                            Custom Instructions
                        </span>
                    </div>
                    
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <textarea
                            value={additionalInstructions}
                            onChange={(e) => setAdditionalInstructions(e.target.value)}
                            placeholder="Define your own writing rules, target tone, or specific data points..."
                            className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-3 focus:ring-1 focus:ring-[#85683F] focus:border-transparent text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 italic min-h-[80px] resize-none"
                        />
                    </div>
                </div>
            </div>
        )}

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-2 sm:px-3 pb-3 pt-1">
             <div className="flex items-center gap-2">
                 {/* Mode Selector */}
                 {onModeChange && (
                     <CompactModeSelector 
                        selectedMode={mode} 
                        onSelectMode={onModeChange}
                        disabled={isGenerating} 
                     />
                 )}

                 {/* File Upload Trigger */}
                 {!uploadedFile && (
                    <button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isGenerating || isProcessingFile}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                         title="Attach file"
                    >
                        {isProcessingFile ? <Loader className="w-4 h-4 animate-spin text-[#C1A87D] dark:text-[#F2E8CF]" /> : <Paperclip className="w-4 h-4 text-[#C1A87D] dark:text-[#F2E8CF]" />}
                    </button>
                 )}

                  {/* Length Selector (Only for Essay and CS modes) */}
                  {(mode === 'essay' || mode === 'cs') && onLengthChange && (
                    <CompactLengthSelector
                        selectedLength={selectedLength}
                        onSelectLength={onLengthChange}
                        disabled={isGenerating}
                    />
                  )}
                 
                 {/* Custom Instructions Toggle */}
                 <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    disabled={isGenerating}
                    className={`
                        p-2 rounded-lg transition-all duration-200 flex items-center gap-1.5
                        ${showInstructions 
                            ? 'bg-[#85683F]/10 text-[#85683F] ring-1 ring-[#85683F]/30' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10'}
                    `}
                    title="Custom Instructions"
                 >
                    <Edit3 className="w-4 h-4 text-[#C1A87D] dark:text-[#F2E8CF]" />
                    <span className="text-xs font-medium hidden md:inline">Instructions</span>
                 </button>
             </div>

             <div className="flex items-center gap-4 sm:gap-3">
                 {/* Generate Button */}
                 <button
                    onClick={handleSubmit}
                    disabled={!hasContent || isGenerating || isProcessingFile}
                    className={`
                        flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300
                        ${hasContent 
                            ? 'bg-gradient-to-br from-[#C1A87D] to-[#A9936D] text-[#FFF] shadow-lg shadow-[#C1A87D]/20 hover:scale-105 active:scale-95' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}
                    `}
                 >
                    {isGenerating ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <ArrowUp className="w-5 h-5" strokeWidth={3} />
                    )}
                 </button>
             </div>
        </div>

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 bg-[#F2E8CF]/10 backdrop-blur-sm rounded-[26px] border-2 border-[#F2E8CF] flex items-center justify-center">
            <div className="bg-white dark:bg-[#424242] text-[#85683F] px-4 py-2 rounded-lg font-bold shadow-lg animate-bounce">
              Drop file to upload
            </div>
          </div>
        )}

      </div>
      
      {/* File Processing Error */}
      {fileError && (
          <div className="mt-3 text-center text-sm text-red-500">
             {fileError}
          </div>
      )}

      {/* Helpful Search Toggle (conditionally valid) */}
      {searchEnabled !== undefined && onSearchToggle && ['essay', 'cs'].includes(mode) && (
          <div className="mt-4 flex justify-center">
              <SearchToggle 
                  enabled={searchEnabled} 
                  onToggle={onSearchToggle} 
                  theme={theme}
                  compact={true} 
              />
          </div>
      )}
    </div>
  );
};

export default memo(InputPanel);
