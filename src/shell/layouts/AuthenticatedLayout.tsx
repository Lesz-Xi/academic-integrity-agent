import React from 'react';
import { FileText, Award, ShieldAlert } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { NavigationItem, UserMenuData, Theme } from '../components/types';

export interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  user: UserMenuData;
  isPremium?: boolean | null;
  theme: Theme;
  historyItems?: any[];
  historyLoading?: boolean;
  onThemeToggle: () => void;
  onSignOut: () => void;
  onUpgrade: () => void;
  onShowEditor: () => void;
  onShowCertificates: () => void;
  onShowDefense: () => void;
  onHistoryItemClick?: (item: any) => void;
  onNewChat?: () => void;
  onDeleteHistoryItem?: (item: any, e: React.MouseEvent) => void;
  onRefreshHistory?: () => Promise<void>;
}

/**
 * AuthenticatedLayout - Layout wrapper for authenticated 'app' view
 *
 * Provides:
 * - Full AppShell with navigation
 * - Pre-configured navigation items
 * - History integration
 */
export function AuthenticatedLayout({
  children,
  user,
  isPremium = false,
  theme,
  historyItems = [],
  historyLoading = false,
  onThemeToggle,
  onSignOut,
  onUpgrade,
  onShowEditor,
  onShowCertificates,
  onShowDefense,
  onHistoryItemClick,
  onNewChat,
  onDeleteHistoryItem,
  onRefreshHistory,
}: AuthenticatedLayoutProps) {
  // Pre-configured navigation items for the authenticated view
  const navigationItems: NavigationItem[] = [
    {
      id: 'editor',
      label: 'Drafting Canvas',
      icon: FileText,
      badge: 'Beta',
      onClick: onShowEditor,
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: Award,
      onClick: onShowCertificates,
    },
    {
      id: 'defense',
      label: 'Defense Toolkit',
      icon: ShieldAlert,
      isPremium: true,
      onClick: onShowDefense,
    },
  ];

  return (
    <AppShell
      navigationItems={navigationItems}
      historyItems={historyItems}
      user={user}
      isPremium={isPremium}
      theme={theme}
      onThemeToggle={onThemeToggle}
      onSignOut={onSignOut}
      onUpgrade={onUpgrade}
      onHistoryItemClick={onHistoryItemClick}
      onNewChat={onNewChat}
      onDeleteHistoryItem={onDeleteHistoryItem}
      onRefreshHistory={onRefreshHistory}
      historyLoading={historyLoading}
    >
      {children}
    </AppShell>
  );
}

export default AuthenticatedLayout;
