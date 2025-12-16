import React, { useState, useEffect, memo, useRef } from 'react';
import { Mode, EssayLength } from '../types';
import { Loader, ArrowRight, Plus, FileUp } from 'lucide-react';
import { processFile, validateFileSize, validateFileType, FileProcessingResult } from '../utils/fileProcessor';
import { analyzeContent, ContentAnalysis } from '../utils/contentAnalyzer';
import SearchToggle from './SearchToggle';
import FileActionPrompt from './FileActionPrompt';

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
  onLengthChange,
  isGenerating,
  searchEnabled = false,
  onSearchToggle,
  theme = 'dark'
}) => {
  const [input, setInput] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [uploadedFile, setUploadedFile] = useState<FileProcessingResult | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [showActionPrompt, setShowActionPrompt] = useState(false);
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);
  
  // Ref to skip cleanup when mode changes via quick-action buttons
  const skipCleanupOnModeChangeRef = useRef(false);

  // Show search toggle only for essay and cs modes
  const showSearchToggle = mode === 'essay' || mode === 'cs';

  // Clear inputs when mode changes (but not when triggered by quick-action buttons)
  useEffect(() => {
    if (skipCleanupOnModeChangeRef.current) {
      // Skip cleanup - this mode change was from quick actions
      skipCleanupOnModeChangeRef.current = false;
      return;
    }
    setInput('');
    setAdditionalInstructions('');
    setUploadedFile(null);
    setFileError(null);
    setContentAnalysis(null);
    setShowActionPrompt(false);
    setShowCustomInstructions(false);
    onInputChange?.('');
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
        // Analyze content and show action prompt
        const analysis = analyzeContent(result.text);
        setContentAnalysis(analysis);
        setShowActionPrompt(true);
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
    setContentAnalysis(null);
    setShowActionPrompt(false);
    // Only clear file, keep input intact
  };

  const handleActionSelect = (selectedMode: Mode | null, instruction: string, actionId: string) => {
    // Switch mode if different AND a mode was specified (null means keep current)
    if (selectedMode !== null && selectedMode !== mode && onModeChange) {
      skipCleanupOnModeChangeRef.current = true;
      onModeChange(selectedMode);
    }
    // Auto-adjust essay length for expand action
    if (actionId === 'expand' && onLengthChange) {
      onLengthChange('long');
    }
    // Set the instruction (if not custom)
    if (instruction) {
      setAdditionalInstructions(instruction);
    }
    // Show custom instructions input only for Custom action
    setShowCustomInstructions(actionId === 'custom');
    // Hide the action prompt
    setShowActionPrompt(false);
  };

  const getInstructionPlaceholder = () => {
    switch (mode) {
      case 'essay':
        return "e.g., 'Focus on environmental ethics', 'Adopt a skeptical tone', 'Include historical context'";
      case 'cs':
        return "e.g., 'Explain time complexity', 'Use Python type hints', 'Focus on error handling'";
      case 'paraphrase':
        return "e.g., 'Summarize key points', 'Make it more formal', 'Simplify technical jargon'";
      default:
        return "e.g., 'Focus on clarity', 'Use simple language'";
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'essay':
        return 'Enter your essay topic or research question...\n\nExample: "Analyze the impact of climate change on global food security"';
      case 'cs':
        return 'Describe the algorithm or code you want to document...\n\nExample: "Explain a binary search tree implementation with AVL balancing"';
      case 'paraphrase':
        return 'Paste the text you want to paraphrase...\n\nNote: The entire text will be restructured while preserving meaning.';
    }
  };



  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div id="input-panel" className="bg-transparent p-0 transition-colors duration-300">
        <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-white mb-4 flex items-center gap-2">
          {mode === 'paraphrase' ? 'Input Text to Paraphrase' : 'Topic/Content Input'}
          <span className="text-xs font-normal text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5">Required</span>
        </h3>

        {/* Unified Input Area */}
        <div 
          className="relative group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-xl transition-all focus-within:!border-[#F2E8CF] dark:focus-within:!border-[#F2E8CF]">
            {/* File Upload Input (Hidden) */}
            <input
              type="file"
              accept=".txt,.md,.pdf,.docx"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
              disabled={isGenerating || isProcessingFile}
            />

            {/* Conditional: Show textarea OR file preview */}
            {!uploadedFile ? (
              // Manual input textarea
              <textarea
                value={input}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setInput(newValue);
                  onInputChange?.(newValue);
                }}
                placeholder={getPlaceholder()}
                aria-label="Content input area"
                className="w-full h-[500px] p-6 pb-32 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-lg font-sans tracking-wide leading-relaxed scrollbar-hide"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isGenerating && !isProcessingFile) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isGenerating}
              />
            ) : (
              // File uploaded: Show collapsed preview
              <div className="p-6 pb-20 min-h-[200px]">
                <div className={`p-4 rounded-xl border ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileUp className={`w-4 h-4 ${theme === 'dark' ? 'text-[#D2B48C]' : 'text-[#CC785C]'}`} />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {uploadedFile.fileName}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        theme === 'dark' ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {uploadedFile.characterCount.toLocaleString()} chars
                      </span>
                    </div>
                    <button
                      onClick={clearFile}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'text-red-400 hover:bg-red-400/10' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      Remove file
                    </button>
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {uploadedFile.text.slice(0, 300)}
                    {uploadedFile.text.length > 300 && '...'}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Toolbar - Only show when no file is uploaded */}
            {!uploadedFile && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isGenerating || isProcessingFile}
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95 disabled:opacity-50"
                aria-label="Upload file"
              >
                {isProcessingFile ? (
                   <Loader className="w-5 h-5 animate-spin" />
                ) : (
                   <Plus className="w-6 h-6" strokeWidth={1.5} />
                )}
              </button>
            </div>
            )}

            {/* Drag Overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-10 bg-[#F2E8CF]/10 backdrop-blur-sm rounded-2xl border-2 border-[#F2E8CF] flex items-center justify-center">
                <div className="bg-[#F2E8CF] text-[#2D2D2D] px-4 py-2 rounded-lg font-bold shadow-lg animate-bounce">
                  Drop file to upload
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Error */}
        {fileError && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-300 animate-in fade-in slide-in-from-top-2">
            {fileError}
          </div>
        )}

        {/* Smart Content Detection - Quick Action Prompt */}
        {uploadedFile && contentAnalysis && showActionPrompt && (
          <FileActionPrompt
            fileName={uploadedFile.fileName}
            analysis={contentAnalysis}
            onActionSelect={handleActionSelect}
            onDismiss={() => setShowActionPrompt(false)}
            theme={theme}
          />
        )}

        {/* Additional Instructions - Only show when no file uploaded OR when Custom is selected */}
        {(!uploadedFile || showCustomInstructions) && (
        <div className="mt-8">
          <label className="block text-sm font-bold text-[#2D2D2D] dark:text-gray-200 mb-2">
            Additional Instructions <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isGenerating && !isProcessingFile) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={getInstructionPlaceholder()}
            className="w-full p-3 border border-white/20 dark:border-white/10 rounded-2xl focus:outline-none focus:!border-[#F2E8CF] focus:bg-white/10 transition-all bg-white/5 dark:bg-white/5 backdrop-blur-xl text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-xl font-sans tracking-wide"
            disabled={isGenerating}
          />
        </div>
        )}

        {/* Search Toggle - Only for Essay and CS modes */}
        {showSearchToggle && onSearchToggle && (
          <div className="mt-8">
            <SearchToggle
              enabled={searchEnabled}
              onToggle={onSearchToggle}
              theme={theme}
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={(!input.trim() && !uploadedFile) || isGenerating || isProcessingFile}
          aria-label={isGenerating ? 'Processing content' : 'Generate content'}
          className="group relative w-1/2 mx-auto block mt-8 rounded-full p-4 font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-[#2D2D2D] from-[#F2E8CF] to-[#F2E8CF]/85 border-2 border-[#2D2D2D]/10 bg-gradient-to-t shadow-xl shadow-[#F2E8CF]/70 ring-4 ring-offset-2 ring-[#F5F3EE]/30 dark:ring-[#262523]/30 ring-offset-[#F5F3EE] dark:ring-offset-[#262523] transition-[filter] duration-200 hover:brightness-120 active:brightness-100"
        >
          <div className="relative flex items-center justify-center gap-2">
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Generate
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </div>
        </button>

        <p className="mt-3 text-xs text-gray-500 text-center">
          Content will be analyzed in real-time for burstiness and perplexity metrics
        </p>
      </div>
    </div>
  );
};

export default memo(InputPanel);
