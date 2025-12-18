import React, { useState, useEffect, memo, useRef } from 'react';
import { Mode, EssayLength } from '../types';
import { ArrowUp, Paperclip, FileUp, X, Loader } from 'lucide-react';
import { processFile, validateFileSize, validateFileType, FileProcessingResult } from '../utils/fileProcessor';
// import { analyzeContent, ContentAnalysis } from '../utils/contentAnalyzer';
import SearchToggle from './SearchToggle';
// import FileActionPrompt from './FileActionPrompt';
import CompactModeSelector from './CompactModeSelector';

interface InputPanelProps {
  mode: Mode;
  onGenerate: (input: string, additionalInstructions: string, searchEnabled?: boolean) => void;
  onInputChange?: (input: string) => void;
  onModeChange?: (mode: Mode) => void;
  onLengthChange?: (length: EssayLength) => void;
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
  // onLengthChange, 
  isGenerating,
  searchEnabled = false,
  onSearchToggle,
  theme = 'dark'
}) => {
  const [input, setInput] = useState('');
  const [additionalInstructions] = useState('');
  const [uploadedFile, setUploadedFile] = useState<FileProcessingResult | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
    // Use file content if uploaded, otherwise use input
    const content = uploadedFile?.text || input.trim();
    if (content) {
      onGenerate(content, additionalInstructions, searchEnabled);
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
        // Analysis skipped in compact mode
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
    // setContentAnalysis(null);
    // setShowActionPrompt(false);
  };

  /* Unused handler removed
  const handleActionSelect = ...
  */

  const getPlaceholder = () => {
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
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0">
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
            </div>
        )}

        {/* Main Input Area */}
        <div className="relative px-4 py-3">
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

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
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
                        {isProcessingFile ? <Loader className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </button>
                 )}
             </div>

             <div className="flex items-center gap-3">
                 {/* Generate Button */}
                 <button
                    onClick={handleSubmit}
                    disabled={!hasContent || isGenerating || isProcessingFile}
                    className={`
                        flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${hasContent 
                            ? 'bg-[#CC785C] text-white shadow-md hover:bg-[#b56a50]' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}
                    `}
                 >
                    {isGenerating ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                    )}
                 </button>
             </div>
        </div>

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 bg-[#CC785C]/10 backdrop-blur-sm rounded-[26px] border-2 border-[#CC785C] flex items-center justify-center">
            <div className="bg-white dark:bg-[#424242] text-[#CC785C] px-4 py-2 rounded-lg font-bold shadow-lg animate-bounce">
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
