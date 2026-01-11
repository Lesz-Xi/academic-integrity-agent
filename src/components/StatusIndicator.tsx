import React from 'react';
import { ShieldCheck, ShieldAlert, Loader2, Link as LinkIcon } from 'lucide-react';

export type SecurityStatus = 'sovereign' | 'monitored' | 'compromised' | 'offline';

interface StatusIndicatorProps {
  status: SecurityStatus;
  isPremium: boolean;
  className?: string;
  onClick?: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  isPremium, 
  className = '',
  onClick
}) => {
  
  const getConfig = () => {
    switch (status) {
      case 'sovereign':
        return {
          icon: ShieldCheck,
          text: 'Sovereign',
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20'
        };
      case 'monitored':
        return {
          icon: Loader2,
          text: 'Monitored',
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          animate: true
        };
      case 'compromised':
        return {
          icon: ShieldAlert,
          text: 'Compromised',
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20'
        };
      case 'offline':
        return {
          icon: LinkIcon,
          text: 'Offline',
          color: 'text-gray-400',
          bg: 'bg-gray-500/5',
          border: 'border-gray-500/10'
        };
       default:
        // Fallback or legacy mapping
        return {
           icon: ShieldCheck,
           text: 'Sovereign',
           color: 'text-amber-500',
           bg: 'bg-amber-500/10',
           border: 'border-amber-500/20'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all duration-300 ${config.bg} ${config.border} ${className} ${onClick ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
      <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
        {config.text}
      </span>
      {isPremium && (
        <span className="ml-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
      )}
    </div>
  );
};
