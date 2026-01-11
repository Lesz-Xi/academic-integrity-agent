import React from 'react';
import { Theme } from '../components/types';

export interface EditorLayoutProps {
  children: React.ReactNode;
  theme: Theme;
  onBack: () => void;
  onThemeToggle: () => void;
}

/**
 * EditorLayout - Full-screen layout for the Drafting Canvas
 *
 * Features:
 * - Minimal chrome for focus
 * - Back button to return to main app
 * - Theme support
 * - Optional full-screen mode
 */
export function EditorLayout({
  children,
  theme,
  onBack: _onBack,
  onThemeToggle: _onThemeToggle,
}: EditorLayoutProps) {
  const layoutClasses = `
    min-h-screen w-full
    transition-colors duration-300
    ${theme === 'dark' ? 'bg-[#1a1a1a] text-[#e5e5e5]' : 'bg-[#F5F3EE] text-[#2D2D2D]'}
  `;

  return (
    <div className={theme}>
      <div className={layoutClasses}>
        {children}
      </div>
    </div>
  );
}

export default EditorLayout;
