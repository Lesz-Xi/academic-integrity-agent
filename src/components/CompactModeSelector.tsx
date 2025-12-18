import React from 'react';
import { Mode } from '../types';
import { Terminal, Feather, RefreshCw, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

interface CompactModeSelectorProps {
  selectedMode: Mode;
  onSelectMode: (mode: Mode) => void;
  disabled?: boolean;
}

const CompactModeSelector: React.FC<CompactModeSelectorProps> = ({ 
  selectedMode, 
  onSelectMode,
  disabled = false
}) => {
  const modes: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: 'essay', label: 'Essay & Research', icon: <Feather className="w-4 h-4" /> }, // Renamed from "Essay" to match generic feel if desired, but sticking to logic. Actually Claude uses "Claude 3.5 Sonnet" etc. Let's stick to our modes but make it look like a model selector.
    { id: 'cs', label: 'Computer Science', icon: <Terminal className="w-4 h-4" /> },
    { id: 'paraphrase', label: 'Paraphrase', icon: <RefreshCw className="w-4 h-4" /> },
  ];

  const currentMode = modes.find(m => m.id === selectedMode) || modes[0];

  return (
    <div className="relative inline-block text-left">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button
              disabled={disabled}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
                text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="flex items-center gap-2">
                <span className="hidden sm:inline">{currentMode.label}</span>
                <span className="sm:hidden">{currentMode.label.split(' ')[0]}</span>
              </span>
              <ChevronDown 
                className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${open ? 'transform rotate-180' : ''}`} 
              />
            </Menu.Button>

            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 bottom-full mb-2 w-56 origin-bottom-left divide-y divide-gray-100 dark:divide-gray-700 rounded-xl bg-white dark:bg-[#252525] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50">
                <div className="px-1 py-1">
                  {modes.map((mode) => (
                    <Menu.Item key={mode.id}>
                      {({ active }) => (
                        <button
                          onClick={() => onSelectMode(mode.id)}
                          className={`
                            group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm
                            ${active ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}
                            ${selectedMode === mode.id ? 'bg-gray-50 dark:bg-white/5 font-semibold' : ''}
                          `}
                        >
                          <span className={`${selectedMode === mode.id ? 'text-[#C1A87D] dark:text-[#F2E8CF]' : 'text-gray-400 dark:text-gray-500'}`}>
                            {mode.icon}
                          </span>
                          {mode.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default CompactModeSelector;
