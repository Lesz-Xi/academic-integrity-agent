import React from 'react';
import { EssayLength } from '../types';
import { FileText, BookOpen, ScrollText, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

interface CompactLengthSelectorProps {
  selectedLength: EssayLength;
  onSelectLength: (length: EssayLength) => void;
  disabled?: boolean;
}

const CompactLengthSelector: React.FC<CompactLengthSelectorProps> = ({ 
  selectedLength, 
  onSelectLength,
  disabled = false
}) => {
  const getIcon = (id: EssayLength) => {
    switch (id) {
      case 'short': return <FileText className="w-4 h-4" />;
      case 'medium': return <BookOpen className="w-4 h-4" />;
      case 'long': return <ScrollText className="w-4 h-4" />;
      default: return null;
    }
  };

  const lengths: { id: EssayLength; label: string; range: string; desc: string }[] = [
    { id: 'short', label: 'Normal', range: '400-500', desc: 'Focus' },
    { id: 'medium', label: 'Medium', range: '1,000-1,500', desc: 'Standard' },
    { id: 'long', label: 'Long', range: '2,000-3,000', desc: 'Detailed' },
  ];

  const currentLengthItem = lengths.find(l => l.id === selectedLength) || lengths[1];

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
                <span className="text-[#C1A87D] dark:text-[#F2E8CF] flex-shrink-0">
                  {getIcon(selectedLength)}
                </span>
                <span className="hidden sm:inline">Length: </span>
                {currentLengthItem.label}
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
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Target Length
                  </div>
                  {lengths.map((len) => (
                    <Menu.Item key={len.id}>
                      {({ active }) => (
                        <button
                          onClick={() => onSelectLength(len.id)}
                          className={`
                            group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm
                            ${active ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}
                            ${selectedLength === len.id ? 'bg-gray-50 dark:bg-white/5 font-semibold' : ''}
                          `}
                        >
                          <div className={`
                            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                            ${selectedLength === len.id ? 'bg-[#F2E8CF] text-[#85683F]' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}
                          `}>
                            {getIcon(len.id)}
                          </div>
                          <div className="flex flex-col text-left flex-1">
                            <span>{len.label}</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{len.desc}</span>
                          </div>
                          <span className={`text-[10px] font-mono ${selectedLength === len.id ? 'text-[#85683F] dark:text-[#F2E8CF]' : 'text-gray-400'}`}>
                            {len.range} w
                          </span>
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

export default CompactLengthSelector;
