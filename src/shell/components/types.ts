import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isPremium?: boolean;
  badge?: string;
  onClick?: () => void;
}

export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface UserMenuData {
  name?: string;
  email: string;
  avatarUrl?: string;
}

export interface HistoryGroup {
  mode: string;
  items: HistoryItemData[];
}

export interface HistoryItemData {
  id: string;
  mode: string;
  input: string;
  output: string;
  createdAt?: string;
  metrics?: Record<string, number>;
}

export type Theme = 'light' | 'dark';
