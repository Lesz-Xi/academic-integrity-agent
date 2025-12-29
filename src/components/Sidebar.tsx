import React from 'react';
import { 
  Plus, 
  History, 
  LogOut, 
  Sun, 
  Moon, 
  Crown, 
  X,
  PanelLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  ShieldAlert,
  Award,
  RotateCcw
} from 'lucide-react';
import { Disclosure, Transition } from '@headlessui/react';
import { HistoryItem, Mode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  history: HistoryItem[];
  onHistoryItemClick: (item: HistoryItem) => void;
  onNewChat: () => void;
  isAuthenticated: boolean;
  user: any;
  isPremium: boolean | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onSignOut: () => void;
  onUpgrade: () => void;
  onDeleteHistoryItem: (item: HistoryItem, e: React.MouseEvent) => void;
  onShowCertificates: () => void;
  onShowDefense: () => void;
  onShowEditor: () => void;
  loading?: boolean;
  onRefresh?: () => Promise<void>;
}

const MODE_LABELS: Record<string, string> = {
  essay: 'Essay & Research',
  cs: 'Computer Science',
  paraphrase: 'Paraphrase',
  polish: 'Academic',
  casual: 'Casual'
};

const VALID_MODES: Mode[] = ['essay', 'cs', 'paraphrase', 'polish', 'casual'];

const normalizeMode = (mode: string): Mode => {
  if (VALID_MODES.includes(mode as Mode)) return mode as Mode;
  return 'essay'; // Default fallback for legacy/unknown modes
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  history,
  onHistoryItemClick,
  onNewChat,
  isAuthenticated,
  user,
  isPremium,
  theme,
  toggleTheme,
  onSignOut,
  onUpgrade,
  onDeleteHistoryItem,
  onShowCertificates,
  onShowDefense,
  onShowEditor,
  loading = false,
  onRefresh,
}) => {
  // Group history by mode and deduplicate by input
  // Store all IDs for a given group to support batch deletion
  const groupedHistory = React.useMemo(() => {
    const groups: Record<string, { representative: HistoryItem; allIds: string[] }[]> = {};
    const groupMap: Record<string, { representative: HistoryItem; allIds: string[] }> = {};

    history.forEach(item => {
      const mode = normalizeMode(item.mode || 'essay');
      const dedupKey = `${mode}:${item.input.trim()}`;
      
      if (!groups[mode]) {
        groups[mode] = [];
      }

      if (groupMap[dedupKey]) {
        // Add ID to existing group
        groupMap[dedupKey].allIds.push(item.id);
      } else {
        // Create new group
        const newGroup = { representative: item, allIds: [item.id] };
        groups[mode].push(newGroup);
        groupMap[dedupKey] = newGroup;
      }
    });
    return groups;
  }, [history]);

  // Calculate total visible items (unique groups) for the header count
  const totalVisibleItems = React.useMemo(() => {
    return Object.values(groupedHistory).reduce((acc, items) => acc + items.length, 0);
  }, [groupedHistory]);

  const modeOrder: Mode[] = ['essay', 'cs', 'paraphrase', 'polish', 'casual'];

  const handleBatchDelete = (representative: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // Delete by content group (onion peeling fix)
    onDeleteHistoryItem(representative, e);
  }; 

  const renderSkeleton = () => (
    <div className="px-4 space-y-3 animate-pulse opacity-60">
        {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-white/10 rounded-xl" />
        ))}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-[#fcfcfc] dark:bg-[#1a1a1a] 
          border-r border-gray-200 dark:border-white/5 
          z-50 transition-all duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden'}
        `}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 px-2">
            <img src="/logo.svg" alt="ThesisLens" className="w-8 h-8" />
            <span className="font-serif font-bold text-xl tracking-tight text-[#2D2D2D] dark:text-white">ThesisLens</span>
          </div>
          <button 
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg lg:hidden"
            title="Close Sidebar"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
          
          <button 
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg hidden lg:flex text-gray-400 hover:text-[#85683F] transition-colors"
            title="Close Sidebar (Cmd+.)"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New chat button */}
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

        {/* Navigation / History */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 mt-4 space-y-1">
          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center justify-between">
            <span>Recent Activity</span>
            {totalVisibleItems > 0 && <span>{totalVisibleItems}</span>}
          </div>
          
          {loading && history.length === 0 ? (
             renderSkeleton()
          ) : history.length === 0 ? (
            <div className="px-4 py-8 text-center" key="no-history">
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
              {modeOrder.map(mode => {
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
                                  onClick={() => onHistoryItemClick(item)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm text-gray-600 dark:text-gray-400 md:hover:bg-black/5 md:dark:hover:bg-white/5 md:hover:text-gray-900 md:dark:hover:text-white transition-all active:scale-[0.98]"
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                                    mode === 'essay' ? 'bg-[#F2E8CF]' :
                                    mode === 'cs' ? 'bg-gray-400' :
                                    mode === 'paraphrase' ? 'bg-[#E69F88]' :
                                    mode === 'polish' ? 'bg-[#CC785C]' :
                                    'bg-yellow-400'
                                  }`} />
                                  <span className="truncate flex-1 pr-6 text-xs sm:text-sm">{item.input}</span>
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 space-y-1">
          <div className="grid grid-cols-2 gap-2 mb-3">
             <button
                onClick={onShowCertificates}
                className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 hover:bg-[#F2E8CF] hover:text-[#85683F] dark:hover:bg-[#85683F]/20 dark:hover:text-[#F2E8CF] rounded-xl transition-all group"
             >
               <Award className="w-4 h-4" />
               <span>Certificates</span>
             </button>
             <button
                onClick={onShowDefense}
                className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-[#CC785C] bg-red-50 dark:bg-red-900/10 hover:bg-[#CC785C] hover:text-white rounded-xl transition-all group"
             >
               <ShieldAlert className="w-4 h-4" />
               <span>Defense</span>
             </button>
          </div>
          
          <button
             onClick={onShowEditor}
             className="w-full flex items-center justify-center gap-2 px-3 py-3 mb-2 text-xs font-bold text-gray-900 dark:text-white bg-[#F2E8CF]/30 dark:bg-[#C1A87D]/10 border border-[#C1A87D]/50 hover:border-[#C1A87D] hover:shadow-md hover:shadow-[#C1A87D]/10 rounded-xl transition-all group relative overflow-hidden"
          >
             <FileText className="w-4 h-4 text-[#C1A87D]" />
             <span>Drafting Canvas</span>
             <div className="ml-auto px-2 py-0.5 bg-[#C1A87D]/20 text-[#85683F] dark:text-[#F2E8CF] text-[9px] rounded-full font-bold uppercase tracking-wider">
               Beta
             </div>
          </button>

          {isAuthenticated && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#F2E8CF] flex items-center justify-center text-[#85683F] font-bold text-xs shadow-sm">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {user?.email?.split('@')[0]}
                </p>
                {isPremium ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-[#85683F] dark:text-[#F2E8CF] uppercase tracking-wider">
                    <Crown className="w-2.5 h-2.5 fill-current" /> Premium
                  </span>
                ) : (
                  <button 
                    onClick={onUpgrade}
                    className="text-[9px] font-bold text-gray-400 hover:text-[#85683F] uppercase tracking-wider transition-colors"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
               onClick={toggleTheme}
               className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
               title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            
            <button
               onClick={onSignOut}
               className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium text-gray-500 hover:text-[#85683F] hover:bg-[#F2E8CF]/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

    </>
  );
};

export default Sidebar;
