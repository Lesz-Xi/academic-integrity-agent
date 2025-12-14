import React, { useState, useEffect, memo } from 'react';
import { Mode } from '../types';
import { Send, Loader, Upload, X } from 'lucide-react';
import { processFile, validateFileSize, validateFileType, FileProcessingResult } from '../utils/fileProcessor';
import SearchToggle from './SearchToggle';

interface InputPanelProps {
  mode: Mode;
  onGenerate: (input: string, additionalInstructions: string, searchEnabled?: boolean) => void;
  isGenerating: boolean;
  searchEnabled?: boolean;
  onSearchToggle?: (enabled: boolean) => void;
  theme?: 'light' | 'dark';
}

const InputPanel: React.FC<InputPanelProps> = ({ 
  mode, 
  onGenerate, 
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

  // Show search toggle only for essay and cs modes
  const showSearchToggle = mode === 'essay' || mode === 'cs';

  // Clear inputs when mode changes
  useEffect(() => {
    setInput('');
    setAdditionalInstructions('');
    setUploadedFile(null);
    setFileError(null);
  }, [mode]);

  const handleSubmit = () => {
    const finalInput = uploadedFile ? uploadedFile.text : input;
    if (finalInput.trim()) {
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
        setInput(''); // Clear manual input when file is uploaded
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

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'md':
        return '📋';
      default:
        return '📄';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div id="input-panel" className="bg-white dark:bg-[#252525] rounded-xl border border-[#E5E3DD] dark:border-[#444] shadow-sm p-6 transition-colors duration-300">
        <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-white mb-4 flex items-center gap-2">
          {mode === 'paraphrase' ? 'Input Text to Paraphrase' : 'Topic/Content Input'}
          <span className="text-xs font-normal text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5">Required</span>
        </h3>

        {/* File Upload Area - Hidden if manual input exists */}
        {!uploadedFile && !input && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging 
                ? 'border-[#D2B48C] bg-[#FAF9F6] dark:bg-[#333]' 
                : 'border-gray-300 dark:border-gray-600 hover:border-[#D2B48C] dark:hover:border-[#D2B48C] hover:bg-[#FAF9F6] dark:hover:bg-[#333]'
            }`}
          >
            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-[#2D2D2D] dark:text-gray-200 mb-1">
              Drag and drop a file here, or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Supported: .txt, .md, .pdf, .docx (max 10MB)
            </p>
            <input
              type="file"
              accept=".txt,.md,.pdf,.docx"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
              disabled={isGenerating || isProcessingFile}
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-[#2D2D2D] dark:bg-[#444] text-white text-sm font-medium rounded-lg hover:bg-black dark:hover:bg-[#555] transition-colors cursor-pointer"
            >
              {isProcessingFile ? 'Processing...' : 'Browse Files'}
            </label>
          </div>
        )}

        {/* File Error */}
        {fileError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            {fileError}
          </div>
        )}

        {/* Uploaded File Badge */}
        {uploadedFile && (
          <div className="mb-6 p-4 bg-[#FAF9F6] dark:bg-[#333] border border-[#D2B48C] dark:border-[#C1A87D] rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getFileIcon(uploadedFile.fileType)}</span>
                <div>
                  <p className="text-sm font-bold text-[#2D2D2D] dark:text-gray-200">{uploadedFile.fileName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadedFile.characterCount.toLocaleString()} characters extracted
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* File Preview */}
            <div className="mt-3 p-3 bg-white dark:bg-[#252525] rounded border border-[#E5E3DD] dark:border-[#444] max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-600 dark:text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                {uploadedFile.text.substring(0, 500)}
                {uploadedFile.text.length > 500 && '...'}
              </p>
            </div>
          </div>
        )}

        {/* Manual Input (only shown if no file uploaded) */}
        {!uploadedFile && (
          <>
            {!input && (
            <div className="relative mb-4">
              <div className="absolute top-3 right-3 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-[#333] px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                Or type manually
              </div>
            </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              aria-label="Content input area"
              className="w-full h-48 p-4 border border-[#D2B48C] dark:border-[#444] rounded-xl resize-none focus:outline-none focus:border-[#D2B48C] focus:ring-1 focus:ring-[#D2B48C] transition-all bg-[#FAF9F6] dark:bg-[#333] text-[#2D2D2D] dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={isGenerating}
            />
          </>
        )}

        <div className="mt-6">
          <label className="block text-sm font-bold text-[#2D2D2D] dark:text-gray-200 mb-2">
            Additional Instructions <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="e.g., 'Focus on environmental ethics', 'Use simple language', 'Include code examples'"
            className="w-full p-3 border border-[#E5E3DD] dark:border-[#444] rounded-xl focus:outline-none focus:border-[#CC785C] focus:ring-1 focus:ring-[#CC785C] transition-all bg-[#FAF9F6] dark:bg-[#333] text-[#2D2D2D] dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={isGenerating}
          />
        </div>

        {/* Search Toggle - Only for Essay and CS modes */}
        {showSearchToggle && onSearchToggle && (
          <div className="mt-6">
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
          className="group relative mt-8 w-full rounded-xl overflow-hidden p-[1px] shadow-md hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-70 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed"
        >
          {/* Spinning Gradient Beam */}
          <div className="absolute inset-[-1000%] animate-spin-fast bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-[-1000%] animate-spin-fast bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-70" />

          {/* Inner Content */}
          <div className="relative h-full w-full bg-[#D2B48C] hover:bg-[#C1A87D] dark:bg-[#D2B48C] dark:hover:bg-[#C1A87D] rounded-xl flex items-center justify-center gap-2 py-4 px-6 text-[#2D2D2D] font-bold transition-colors">
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing Content...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generate Content
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
