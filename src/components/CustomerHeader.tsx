import React from 'react';
import { MapPin, ChevronDown, ShoppingBag, Sun, Moon } from 'lucide-react';
import { DeliveryLocation, ServiceHub } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { STARCHES_LOGO_URL } from '../constants/assets';

interface CustomerHeaderProps {
  location: DeliveryLocation;
  activeHub: ServiceHub | null;
  cartCount: number;
  language: SupportedLanguage;
  onOpenLocationPicker: () => void;
  onOpenCart: () => void;
  onLogoClick?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  location,
  activeHub,
  cartCount,
  language,
  onOpenLocationPicker,
  onOpenCart,
  onLogoClick,
  isDarkMode = false,
  onToggleTheme,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <header
      className="sticky top-0 z-30 h-14 backdrop-blur-md border-b px-4 flex items-center justify-between transition-colors"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Brand Logo & Location Selector */}
      <div className="flex items-center gap-2.5 max-w-[78%] min-h-[44px]">
        <button
          type="button"
          onClick={onLogoClick}
          aria-label="Starches Brand Logo"
          title="Starches"
          className="w-9 h-9 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-0.5 shrink-0 shadow-xs flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <img
            src={STARCHES_LOGO_URL}
            alt="Starches"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </button>

        <button
          type="button"
          onClick={onOpenLocationPicker}
          className="flex flex-col text-left group min-w-0"
          title="Change delivery address"
        >
          <div className="text-[10px] font-medium text-[var(--text-secondary)] flex items-center gap-1 leading-tight">
            <span>{t.delivering_to}</span>
            {location.label && (
              <span className="font-bold text-[var(--brand-orange)]">
                ({location.label})
              </span>
            )}
            {activeHub && <span>{activeHub.countryFlag}</span>}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold truncate">
              {location.city || location.address || 'Select location'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:translate-y-0.5 transition-transform shrink-0" />
          </div>
        </button>
      </div>

      {/* Right Controls: Quick Theme Toggle & Shopping Cart */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
            style={{
              background: 'var(--surface-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-amber-400" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onOpenCart}
          className="relative w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[var(--brand-orange)] transition-colors"
          style={{
            background: 'var(--surface-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
          aria-label="Shopping Cart"
        >
          <ShoppingBag className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-[var(--brand-orange)] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
