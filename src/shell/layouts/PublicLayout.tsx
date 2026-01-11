import React from 'react';
import { Theme } from '../components/types';

export interface PublicLayoutProps {
  children: React.ReactNode;
  theme: Theme;
}

/**
 * PublicLayout - Layout wrapper for public/unauthenticated views
 *
 * Used for:
 * - Landing page
 * - Authentication pages
 *
 * Features:
 * - Clean, full-width layout
 * - Theme support
 * - No sidebar navigation
 */
export function PublicLayout({ children, theme }: PublicLayoutProps) {
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

export default PublicLayout;
