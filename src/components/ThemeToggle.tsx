import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
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
      <div className="flex items-center gap-1.5 p-1.5 neu-pressed rounded-2xl">
        <button
          type="button"
          onClick={() => onSelectThemeMode('light')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
            themeMode === 'light'
              ? 'neu-button-primary'
              : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C]'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectThemeMode('dark')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
            themeMode === 'dark'
              ? 'neu-button-primary'
              : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#F0F4F8]'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectThemeMode('system')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
            themeMode === 'system'
              ? 'neu-button-primary'
              : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
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
        className="w-10 h-10 rounded-xl neu-button flex items-center justify-center text-[#5A6A80] dark:text-[#8B9BB4] cursor-pointer"
        title={`Theme: ${themeMode}`}
      >
        {themeMode === 'light' ? (
          <Sun className="w-4 h-4 text-amber-500" />
        ) : themeMode === 'dark' ? (
          <Moon className="w-4 h-4 text-amber-400" />
        ) : (
          <Laptop className="w-4 h-4 text-[#FF5A1F]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-38 neu-glass rounded-2xl shadow-xl p-1.5 space-y-1 animate-in fade-in duration-150">
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                onSelectThemeMode(mode);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer capitalize transition-all ${
                themeMode === mode
                  ? 'neu-button-primary'
                  : 'hover:bg-[#E5ECF6]/60 dark:hover:bg-[#171F2E]/60 text-[#1A202C] dark:text-[#F0F4F8]'
              }`}
            >
              <span>{mode}</span>
              {themeMode === mode && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
