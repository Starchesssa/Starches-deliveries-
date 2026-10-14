import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  themeMode: ThemeMode;
  onSelectThemeMode: (mode: ThemeMode) => void;
  variant?: 'compact' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  themeMode,
  onSelectThemeMode,
  variant = 'compact',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (variant === 'segmented') {
    return (
      <div className="flex items-center gap-1 p-1 bg-[#F1F0EB] dark:bg-[#303030] rounded-xl border border-[#E7E4DD] dark:border-[#3A3A3A]">
        <button
          type="button"
          onClick={() => onSelectThemeMode('light')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
            themeMode === 'light'
              ? 'bg-white text-[#242424] shadow-xs'
              : 'text-[#707070] dark:text-[#B7B7B7] hover:text-[#242424] dark:hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectThemeMode('dark')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
            themeMode === 'dark'
              ? 'bg-[#222222] text-white shadow-xs'
              : 'text-[#707070] dark:text-[#B7B7B7] hover:text-[#242424] dark:hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-amber-400" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectThemeMode('system')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${
            themeMode === 'system'
              ? 'bg-white dark:bg-[#222222] text-[#242424] dark:text-white shadow-xs'
              : 'text-[#707070] dark:text-[#B7B7B7] hover:text-[#242424] dark:hover:text-white'
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-[#FF8A00]" />
          <span>System</span>
        </button>
      </div>
    );
  }

  // Compact dropdown trigger
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Theme mode switcher"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-[#707070] dark:text-[#B7B7B7] hover:bg-[#F1F0EB] dark:hover:bg-[#303030] transition-colors border border-transparent hover:border-[#E7E4DD] dark:hover:border-[#3A3A3A]"
        title={`Theme: ${themeMode}`}
      >
        {themeMode === 'light' ? (
          <Sun className="w-4 h-4 text-amber-500" />
        ) : themeMode === 'dark' ? (
          <Moon className="w-4 h-4 text-amber-400" />
        ) : (
          <Laptop className="w-4 h-4 text-[#FF8A00]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-36 bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            type="button"
            onClick={() => {
              onSelectThemeMode('light');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
              themeMode === 'light'
                ? 'bg-[#FF8A00]/10 text-[#FF8A00]'
                : 'text-[#242424] dark:text-[#F5F5F5] hover:bg-[#F8F7F3] dark:hover:bg-[#303030]'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectThemeMode('dark');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
              themeMode === 'dark'
                ? 'bg-[#FF8A00]/10 text-[#FF8A00]'
                : 'text-[#242424] dark:text-[#F5F5F5] hover:bg-[#F8F7F3] dark:hover:bg-[#303030]'
            }`}
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectThemeMode('system');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
              themeMode === 'system'
                ? 'bg-[#FF8A00]/10 text-[#FF8A00]'
                : 'text-[#242424] dark:text-[#F5F5F5] hover:bg-[#F8F7F3] dark:hover:bg-[#303030]'
            }`}
          >
            <Laptop className="w-4 h-4 text-[#FF8A00]" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
};
