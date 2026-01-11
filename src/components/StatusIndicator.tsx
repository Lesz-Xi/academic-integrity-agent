import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export type SecurityStatus = 'sovereign' | 'monitored' | 'compromised' | 'offline';

interface StatusIndicatorProps {
  status: SecurityStatus;
  isPremium: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  isPremium, 
  className = '' 
}) => {
  
  const getConfig = () => {
    switch (status) {
      case 'sovereign': // Changed from 'secured'
        return {
          icon: ShieldCheck,
          text: 'Secured',
          subtext: 'Chain Intact',
          colors: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
        };
      case 'gap-detected':
        return {
          icon: ShieldAlert,
          text: 'Gap Detected',
          subtext: 'Chain Broken',
          colors: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20'
        };
      case 'pending':
        return {
          icon: Loader2,
          text: 'Hashing',
          subtext: 'Verifying...',
          colors: 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-400',
          animate: true
        };
      case 'offline':
      default:
        return {
          icon: LinkIcon, // Using Link icon to represent local/disconnected state
          text: 'Offline',
          subtext: 'Local Only',
          colors: 'bg-gray-500/5 border-gray-500/10 text-gray-500 dark:text-gray-500'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <button 
      onClick={onClick}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${config.colors} ${className}`}
      title={config.subtext}
    >
      <Icon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
      <div className="flex flex-col items-start leading-none">
        <span className="text-[10px] font-bold uppercase tracking-wider">{config.text}</span>
        {/* Optional subtext on hover or large screens? Keeping minimal for now as per design */}
      </div>
    </button>
  );
};
