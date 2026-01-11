import { NavigationItem } from './types';

export interface NavItemProps {
  item: NavigationItem;
  onClick?: () => void;
}

/**
 * NavItem - Individual navigation link component
 *
 * Supports:
 * - Active state highlighting
 * - Premium badge
 * - Custom badges (e.g., "Beta")
 * - Icon display
 */
export function NavItem({ item, onClick }: NavItemProps) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3
        rounded-xl text-sm font-medium
        transition-all group
        ${item.isActive
          ? 'bg-[#F2E8CF]/30 dark:bg-[#C1A87D]/10 text-[#85683F] dark:text-[#F2E8CF] border border-[#C1A87D]/30'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
        }
      `}
    >
      {Icon && (
        <Icon
          className={`w-4 h-4 transition-colors ${
            item.isActive
              ? 'text-[#C1A87D]'
              : 'text-gray-400 group-hover:text-[#85683F]'
          }`}
        />
      )}

      <span className="flex-1 text-left">{item.label}</span>

      {/* Badge (Beta, Premium, etc.) */}
      {item.badge && (
        <div
          className={`
            px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
            ${item.isPremium
              ? 'bg-gradient-to-r from-[#C1A87D] to-[#85683F] text-white'
              : 'bg-[#C1A87D]/20 text-[#85683F] dark:text-[#F2E8CF]'
            }
          `}
        >
          {item.badge}
        </div>
      )}

      {/* Premium Lock Indicator */}
      {item.isPremium && !item.badge && (
        <div className="px-2 py-0.5 bg-gradient-to-r from-[#C1A87D] to-[#85683F] text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
          Pro
        </div>
      )}
    </button>
  );
}

export default NavItem;
