import React, { useState, useEffect, useCallback } from 'react';
import { PanelLeft, Sun, Moon } from 'lucide-react';
import MainNav from './MainNav';
import { UserMenuData, NavigationItem } from './types';

export interface AppShellProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  historyItems?: any[];
  user?: UserMenuData;
  isPremium?: boolean | null;
  theme: 'light' | 'dark';
  onNavigate?: (href: string) => void;
  onThemeToggle?: () => void;
  onSignOut?: () => void;
  onUpgrade?: () => void;
  onHistoryItemClick?: (item: any) => void;
  onNewChat?: () => void;
  onDeleteHistoryItem?: (item: any, e: React.MouseEvent) => void;
  onRefreshHistory?: () => Promise<void>;
  historyLoading?: boolean;
}

/**
 * AppShell - Main layout wrapper component
 * 
 * Provides consistent structure with:
 * - Responsive sidebar navigation
 * - Sticky header with glassmorphism
 * - Content area with proper padding
 * - Light/dark mode support
 */
export function AppShell({
  children,
  navigationItems,
  historyItems = [],
  user,
  isPremium = false,
  theme,
  onNavigate,
  onThemeToggle,
  onSignOut,
  onUpgrade,
  onHistoryItemClick,
  onNewChat,
  onDeleteHistoryItem,
  onRefreshHistory,
  historyLoading = false,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  // Keyboard shortcut for sidebar: Cmd/Ctrl + .
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle responsive sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on mobile, auto-open on desktop
      if (window.innerWidth < 1024 && isSidebarOpen) {
        // Only auto-close if user hasn't manually opened it
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleNavigation = useCallback((href: string) => {
    onNavigate?.(href);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [onNavigate]);

  // Dynamic classes based on theme
  const shellClasses = `
    relative flex min-h-screen overflow-hidden
    font-sans selection:bg-[#CC785C] selection:text-white
    transition-colors duration-300
    ${theme === 'dark' ? 'bg-[#1a1a1a] text-[#e5e5e5]' : 'bg-[#F5F3EE] text-[#2D2D2D]'}
  `;

  return (
    <div className={shellClasses}>
      {/* Sidebar Navigation */}
      <MainNav
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        navigationItems={navigationItems}
        historyItems={historyItems}
        user={user}
        isPremium={isPremium}
        theme={theme}
        onNavigate={handleNavigation}
        onThemeToggle={onThemeToggle}
        onSignOut={onSignOut}
        onUpgrade={onUpgrade}
        onHistoryItemClick={onHistoryItemClick}
        onNewChat={onNewChat}
        onDeleteHistoryItem={onDeleteHistoryItem}
        onRefresh={onRefreshHistory}
        loading={historyLoading}
      />

      {/* Main Content Area */}
      <div
        className={`
          flex-1 flex flex-col relative
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}
        `}
      >
        {/* Sticky Header */}
        <header
          className={`
            sticky top-0 p-4 z-40
            flex justify-between items-center
            backdrop-blur-sm pointer-events-auto
            border-b border-transparent
            transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-[#1a1a1a]/80' 
              : 'bg-[#F5F3EE]/80'
            }
          `}
        >
          {/* Left: Sidebar Toggle (when closed) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isSidebarOpen && (
              <button
                onClick={handleSidebarToggle}
                className={`
                  p-2 rounded-xl shadow-sm transition-colors
                  ${theme === 'dark'
                    ? 'bg-[#1a1a1a] border border-white/5 hover:bg-white/10'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }
                `}
                title="Open Sidebar (Cmd+.)"
                aria-label="Open sidebar"
              >
                <PanelLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Right: Theme Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onThemeToggle}
              className={`
                p-2 rounded-xl shadow-sm transition-colors
                ${theme === 'dark'
                  ? 'bg-[#1a1a1a] border border-white/5 hover:bg-white/10'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
                }
              `}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[#C1A87D]" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </header>

        {/* Decorative Background Elements */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[#F2E8CF]/10 rounded-full blur-3xl animate-float -z-10 pointer-events-none" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-[#CC785C]/5 rounded-full blur-3xl animate-float-delayed -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-3xl animate-float -z-10 pointer-events-none" />

        {/* Main Content */}
        <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
