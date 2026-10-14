import React from 'react';
import { MapPin, ChevronDown, ShoppingBag, Sun, Moon } from 'lucide-react';
import { DeliveryLocation, ServiceHub } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { STARCHES_LOGO_URL } from '../constants/assets';
import { NeuIconButton } from './neumorphic/NeuButton';

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
    <header className="sticky top-0 z-30 h-15 neu-glass border-b border-[#DCE4EF]/70 dark:border-[#1F293D]/70 px-4 flex items-center justify-between transition-colors">
      {/* Brand Logo & Location Selector */}
      <div className="flex items-center gap-2.5 max-w-[78%] min-h-[44px]">
        <button
          type="button"
          onClick={onLogoClick}
          aria-label="Starches Brand Logo"
          title="Starches"
          className="w-10 h-10 rounded-xl neu-button p-1 shrink-0 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
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
          className="flex flex-col text-left group min-w-0 cursor-pointer"
          title="Change delivery address"
        >
          <div className="text-[10px] font-medium text-[#5A6A80] dark:text-[#8B9BB4] flex items-center gap-1 leading-tight">
            <span>{t.delivering_to}</span>
            {location.label && (
              <span className="font-bold text-[#FF5A1F]">
                ({location.label})
              </span>
            )}
            {activeHub && <span>{activeHub.countryFlag}</span>}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold truncate text-[#1A202C] dark:text-[#F0F4F8]">
              {location.city || location.address || 'Select location'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#5A6A80] dark:text-[#8B9BB4] group-hover:translate-y-0.5 transition-transform shrink-0" />
          </div>
        </button>
      </div>

      {/* Right Controls: Quick Theme Toggle & Shopping Cart */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onToggleTheme && (
          <NeuIconButton
            variant="secondary"
            size="md"
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#5A6A80]" />
            )}
          </NeuIconButton>
        )}

        <div className="relative">
          <NeuIconButton
            variant="secondary"
            size="md"
            onClick={onOpenCart}
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#1A202C] dark:text-[#F0F4F8]" />
          </NeuIconButton>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#FF5A1F] text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-scale-in">
              {cartCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
