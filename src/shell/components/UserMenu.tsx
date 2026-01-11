import { Crown, LogOut, Sun, Moon } from 'lucide-react';
import { UserMenuData, Theme } from './types';

export interface UserMenuProps {
  user?: UserMenuData;
  isPremium?: boolean | null;
  theme: Theme;
  onThemeToggle?: () => void;
  onSignOut?: () => void;
  onUpgrade?: () => void;
}

/**
 * UserMenu - User profile section with actions
 *
 * Displays:
 * - User avatar (first letter of email)
 * - Username (email prefix)
 * - Premium badge or upgrade prompt
 * - Theme toggle and sign out buttons
 */
export function UserMenu({
  user,
  isPremium = false,
  theme,
  onThemeToggle,
  onSignOut,
  onUpgrade,
}: UserMenuProps) {
  if (!user) {
    return null;
  }

  const avatarLetter = user.email?.[0]?.toUpperCase() || 'U';
  const displayName = user.name || user.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-2">
      {/* User Info Card */}
      <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#F2E8CF] flex items-center justify-center text-[#85683F] font-bold text-xs shadow-sm">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            avatarLetter
          )}
        </div>

        {/* User Details */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
            {displayName}
          </p>
          {isPremium ? (
            <span className="flex items-center gap-1 text-[9px] font-bold text-[#85683F] dark:text-[#F2E8CF] uppercase tracking-wider">
              <Crown className="w-2.5 h-2.5 fill-current" />
              Premium
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

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium text-gray-500 hover:text-[#85683F] hover:bg-[#F2E8CF]/10 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

export default UserMenu;
