import React, { useMemo } from 'react';
import {
  Plus,
  History,
  X,
  PanelLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { Disclosure, Transition } from '@headlessui/react';
import UserMenu from './UserMenu';
import NavItem from './NavItem';
import { NavigationItem, UserMenuData, Theme } from './types';

// Mode type from app
type Mode = 'essay' | 'cs' | 'paraphrase' | 'polish' | 'casual';

const MODE_LABELS: Record<string, string> = {
  essay: 'Essay & Research',
  cs: 'Computer Science',
  paraphrase: 'Paraphrase',
  polish: 'Academic',
  casual: 'Casual',
};

const VALID_MODES: Mode[] = ['essay', 'cs', 'paraphrase', 'polish', 'casual'];

const normalizeMode = (mode: string): Mode => {
  if (VALID_MODES.includes(mode as Mode)) return mode as Mode;
  return 'essay';
};

const MODE_COLORS: Record<Mode, string> = {
  essay: 'bg-[#F2E8CF]',
  cs: 'bg-gray-400',
  paraphrase: 'bg-[#E69F88]',
  polish: 'bg-[#CC785C]',
  casual: 'bg-yellow-400',
};

export interface MainNavProps {
  isOpen: boolean;
  onToggle: () => void;
  navigationItems: NavigationItem[];
  historyItems?: any[];
  user?: UserMenuData;
  isPremium?: boolean | null;
  theme: Theme;
  onNavigate?: (href: string) => void;
  onThemeToggle?: () => void;
  onSignOut?: () => void;
  onUpgrade?: () => void;
  onHistoryItemClick?: (item: any) => void;
  onNewChat?: () => void;
  onDeleteHistoryItem?: (item: any, e: React.MouseEvent) => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

/**
 * MainNav - Primary navigation sidebar component
 *
 * Features:
 * - Responsive with mobile overlay and desktop inline
 * - History grouped by mode with disclosure panels
 * - User menu with premium status
 * - Theme toggle
 */
export function MainNav({
  isOpen,
  onToggle,
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
  onRefresh,
  loading = false,
}: MainNavProps) {
  // Group history by mode and deduplicate
  const groupedHistory = useMemo(() => {
    const groups: Record<string, { representative: any; allIds: string[] }[]> = {};
    const groupMap: Record<string, { representative: any; allIds: string[] }> = {};

    historyItems.forEach((item) => {
      const mode = normalizeMode(item.mode || 'essay');
      const dedupKey = `${mode}:${item.input.trim()}`;

      if (!groups[mode]) {
        groups[mode] = [];
      }

      if (groupMap[dedupKey]) {
        groupMap[dedupKey].allIds.push(item.id);
      } else {
        const newGroup = { representative: item, allIds: [item.id] };
        groups[mode].push(newGroup);
        groupMap[dedupKey] = newGroup;
      }
    });
    return groups;
  }, [historyItems]);

  const totalVisibleItems = useMemo(() => {
    return Object.values(groupedHistory).reduce((acc, items) => acc + items.length, 0);
  }, [groupedHistory]);

  const modeOrder: Mode[] = ['essay', 'cs', 'paraphrase', 'polish', 'casual'];

  const handleBatchDelete = (representative: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteHistoryItem?.(representative, e);
  };

  const renderSkeleton = () => (
    <div className="px-4 space-y-3 animate-pulse opacity-60">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-white/10 rounded-xl" />
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full
          bg-[#fcfcfc] dark:bg-[#1a1a1a]
          border-r border-gray-200 dark:border-white/5
          z-50 transition-all duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 px-2">
            <img src="/logo.svg" alt="ThesisLens" className="w-8 h-8" />
            <span className="font-serif font-bold text-xl tracking-tight text-[#2D2D2D] dark:text-white">
              ThesisLens
            </span>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg lg:hidden"
            title="Close Sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg hidden lg:flex text-gray-400 hover:text-[#85683F] transition-colors"
            title="Close Sidebar (Cmd+.)"
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-2">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#242424] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-[#85683F] dark:hover:border-[#F2E8CF] transition-all hover:shadow-md group"
          >
            <div className="w-6 h-6 rounded-md bg-[#F2E8CF] text-[#85683F] flex items-center justify-center group-hover:bg-[#85683F] group-hover:text-white transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            New Generation
          </button>
        </div>

        {/* Primary Navigation Items */}
        {navigationItems.length > 0 && (
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.href) {
                    onNavigate?.(item.href);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* History Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 mt-4 space-y-1">
          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center justify-between">
            <span>Recent Activity</span>
            {totalVisibleItems > 0 && <span>{totalVisibleItems}</span>}
          </div>

          {loading && historyItems.length === 0 ? (
            renderSkeleton()
          ) : historyItems.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <History className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-400 mb-3">No recent activity</p>
              {onRefresh && (
                <button
                  onClick={() => onRefresh()}
                  className="flex items-center gap-2 mx-auto px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Refresh Connection
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {modeOrder.map((mode) => {
                const groups = groupedHistory[mode];
                if (!groups || groups.length === 0) return null;

                return (
                  <Disclosure key={mode} defaultOpen={true}>
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 uppercase tracking-wider transition-colors group">
                          <span className="flex items-center gap-2">
                            {open ? (
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                            )}
                            {MODE_LABELS[mode] || mode}
                          </span>
                          <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-500">
                            {groups.length}
                          </span>
                        </Disclosure.Button>

                        <Transition
                          enter="transition duration-100 ease-out"
                          enterFrom="transform scale-95 opacity-0"
                          enterTo="transform scale-100 opacity-100"
                          leave="transition duration-75 ease-out"
                          leaveFrom="transform scale-100 opacity-100"
                          leaveTo="transform scale-95 opacity-0"
                        >
                          <Disclosure.Panel className="space-y-1 pb-2">
                            {groups.map(({ representative: item, allIds }) => (
                              <div key={item.id} className="group relative pl-2">
                                <button
                                  onClick={() => onHistoryItemClick?.(item)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm text-gray-600 dark:text-gray-400 md:hover:bg-black/5 md:dark:hover:bg-white/5 md:hover:text-gray-900 md:dark:hover:text-white transition-all active:scale-[0.98]"
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${MODE_COLORS[mode]}`}
                                  />
                                  <span className="truncate flex-1 pr-6 text-xs sm:text-sm">
                                    {item.input}
                                  </span>
                                </button>
                                <button
                                  onClick={(e) => handleBatchDelete(item, e)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title={`Delete generation${allIds.length > 1 ? ` (and ${allIds.length - 1} duplicates)` : ''}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </Disclosure.Panel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with User Menu */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 space-y-1">
          <UserMenu
            user={user}
            isPremium={isPremium}
            theme={theme}
            onThemeToggle={onThemeToggle}
            onSignOut={onSignOut}
            onUpgrade={onUpgrade}
          />
        </div>
      </aside>
    </>
  );
}

export default MainNav;
