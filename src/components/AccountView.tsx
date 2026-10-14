import React, { useState } from 'react';
import {
  MapPin,
  Globe2,
  HelpCircle,
  FileText,
  ChevronRight,
  Plus,
  Bookmark,
  Check,
} from 'lucide-react';
import { DeliveryLocation, ServiceHub, ThemeMode } from '../types';
import { SERVICE_HUBS } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { ThemeToggle } from './ThemeToggle';
import { STARCHES_LOGO_URL } from '../constants/assets';

interface AccountViewProps {
  currentLocation: DeliveryLocation;
  savedAddresses?: DeliveryLocation[];
  activeHub: ServiceHub | null;
  language: SupportedLanguage;
  isDarkMode: boolean;
  themeMode: ThemeMode;
  onSelectThemeMode: (mode: ThemeMode) => void;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenLocationPicker: () => void;
  onSelectSavedAddress: (address: DeliveryLocation) => void;
  onSelectHub: (hub: ServiceHub) => void;
  onResetOnboarding?: () => void;
  onShowSplash?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  currentLocation,
  savedAddresses = [],
  activeHub,
  language,
  themeMode,
  onSelectThemeMode,
  onSelectLanguage,
  onOpenLocationPicker,
  onSelectSavedAddress,
  onSelectHub,
  onResetOnboarding,
  onShowSplash,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [userName, setUserName] = useState('Guest Customer');
  const [isEditingName, setIsEditingName] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState<{ title: string; content: string } | null>(null);

  return (
    <div className="w-full max-w-lg mx-auto p-4 space-y-5 pb-28 text-[#242424] dark:text-[#F5F5F5]">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#FF8A00] flex items-center justify-center text-white font-bold text-lg shadow-xs">
            {userName.charAt(0)}
          </div>
          <div>
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-sm font-bold bg-[#F8F7F3] dark:bg-[#303030] px-2 py-1 rounded-lg border border-[#E7E4DD] dark:border-[#3A3A3A] outline-none"
                />
                <button
                  onClick={() => setIsEditingName(false)}
                  className="text-xs text-[#FF8A00] font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#242424] dark:text-white">
                  {userName}
                </h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-[#FF8A00] hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
            <div className="text-xs text-[#707070] dark:text-[#B7B7B7] mt-0.5">
              Starches Customer Account · Anonymous Mode
            </div>
          </div>
        </div>
      </div>

      {/* Saved Addresses Section (Section 2) */}
      <div className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-[#242424] dark:text-white flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-[#FF8A00]" />
            <span>{t.saved_addresses}</span>
          </h4>
          <button
            onClick={onOpenLocationPicker}
            className="text-xs font-semibold text-[#FF8A00] flex items-center gap-0.5 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.add_new_address}</span>
          </button>
        </div>

        {/* Current Active Location */}
        <div className="p-3 rounded-xl bg-[#F8F7F3] dark:bg-[#171717] border border-[#FF8A00]/40 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-[#FF8A00] uppercase tracking-wider block">
              Active Delivery Address {currentLocation.label && `(${currentLocation.label})`}
            </span>
            <div className="text-sm font-semibold text-[#242424] dark:text-white truncate mt-0.5">
              {currentLocation.address}
            </div>
            <div className="text-xs text-[#707070] dark:text-[#B7B7B7]">
              {currentLocation.city}, {currentLocation.country}
            </div>
          </div>
          <button
            onClick={onOpenLocationPicker}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] text-xs font-semibold text-[#242424] dark:text-white shrink-0 hover:border-[#FF8A00]"
          >
            Change
          </button>
        </div>

        {/* List of Other Saved Addresses */}
        {savedAddresses.filter((sa) => sa.id !== currentLocation.id).length > 0 && (
          <div className="space-y-2 pt-1 border-t border-[#E7E4DD] dark:border-[#3A3A3A]">
            <span className="text-[11px] font-semibold text-[#707070] dark:text-[#B7B7B7] block">
              Other Saved Places:
            </span>
            {savedAddresses
              .filter((sa) => sa.id !== currentLocation.id)
              .map((sa) => (
                <div
                  key={sa.id}
                  className="p-2.5 rounded-xl bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-[#242424] dark:text-white">
                      {sa.label || 'Saved Place'}:
                    </span>{' '}
                    <span className="text-[#707070] dark:text-[#B7B7B7] truncate">
                      {sa.address}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectSavedAddress(sa)}
                    className="px-2.5 py-1 rounded-lg bg-[#FF8A00] text-white font-semibold text-xs shrink-0 hover:bg-[#E87900]"
                  >
                    Select
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Genuine 3-state Theme Settings: Light, Dark, System (Section 4) */}
      <div className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-4 shadow-xs space-y-2.5">
        <div>
          <div className="font-bold text-sm text-[#242424] dark:text-white">
            {t.theme_settings}
          </div>
          <div className="text-xs text-[#707070] dark:text-[#B7B7B7]">
            Choose between Light (warm-white), Dark (charcoal), or Follow System.
          </div>
        </div>

        <ThemeToggle
          themeMode={themeMode}
          onSelectThemeMode={onSelectThemeMode}
          variant="segmented"
        />
      </div>

      {/* Language & Regional Settings */}
      <div className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-4 shadow-xs space-y-3">
        <h4 className="font-bold text-sm text-[#242424] dark:text-white flex items-center gap-1.5">
          <Globe2 className="w-4 h-4 text-[#FF8A00]" />
          <span>{t.language_settings}</span>
        </h4>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSelectLanguage('en')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              language === 'en'
                ? 'bg-[#FF8A00] text-white border-[#FF8A00]'
                : 'bg-[#F8F7F3] dark:bg-[#171717] border-[#E7E4DD] dark:border-[#3A3A3A]'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>

          <button
            onClick={() => onSelectLanguage('sw')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              language === 'sw'
                ? 'bg-[#FF8A00] text-white border-[#FF8A00]'
                : 'bg-[#F8F7F3] dark:bg-[#171717] border-[#E7E4DD] dark:border-[#3A3A3A]'
            }`}
          >
            <span>🇹🇿</span>
            <span>Kiswahili</span>
          </button>

          <button
            onClick={() => onSelectLanguage('fr')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              language === 'fr'
                ? 'bg-[#FF8A00] text-white border-[#FF8A00]'
                : 'bg-[#F8F7F3] dark:bg-[#171717] border-[#E7E4DD] dark:border-[#3A3A3A]'
            }`}
          >
            <span>🇫🇷</span>
            <span>Français</span>
          </button>
        </div>
      </div>

      {/* Worldwide Demonstration Hubs Selector */}
      <div className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-4 shadow-xs space-y-3">
        <h4 className="font-bold text-sm text-[#242424] dark:text-white flex items-center gap-1.5">
          <span>🌍</span>
          <span>{t.active_hubs_title}</span>
        </h4>
        <p className="text-xs text-[#707070] dark:text-[#B7B7B7]">
          {t.select_hub_hint}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {SERVICE_HUBS.map((hub) => (
            <button
              key={hub.id}
              onClick={() => onSelectHub(hub)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                activeHub?.id === hub.id
                  ? 'border-[#FF8A00] bg-[#FF8A00]/10 font-bold'
                  : 'border-[#E7E4DD] dark:border-[#3A3A3A] bg-[#F8F7F3] dark:bg-[#171717]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{hub.countryFlag}</span>
                <span className="truncate">{hub.cityName}</span>
              </div>
              <div className="text-[10px] text-[#707070] dark:text-[#B7B7B7] mt-0.5">
                {hub.currency.code} ({hub.currency.symbol})
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Replay Onboarding Option */}
      {onResetOnboarding && (
        <div className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-[#242424] dark:text-white">
                Onboarding Tour
              </div>
              <div className="text-xs text-[#707070] dark:text-[#B7B7B7]">
                Replay the new-customer setup questions anytime.
              </div>
            </div>
            <button
              onClick={onResetOnboarding}
              className="px-3 py-1.5 rounded-xl bg-[#F8F7F3] dark:bg-[#303030] border border-[#E7E4DD] dark:border-[#3A3A3A] text-xs font-semibold text-[#FF8A00] hover:border-[#FF8A00] transition-colors"
            >
              Replay Intro
            </button>
          </div>
        </div>
      )}

      {/* Support & Legal Info */}
      <div className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-2 shadow-xs divide-y divide-[#E7E4DD] dark:divide-[#3A3A3A] text-xs">
        <button
          type="button"
          onClick={() => {
            setInfoModalMessage({
              title: 'Help & Customer Support',
              content: 'Starches Customer Care is available 24/7.\nEmail: support@starches.delivery\nPhone: +255 22 212 3456\nLocation: Starches Hub, Kinondoni & Mikocheni, Dar es Salaam.',
            });
          }}
          className="w-full p-3 flex items-center justify-between hover:bg-[#F8F7F3] dark:hover:bg-[#303030] rounded-xl transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-[#242424] dark:text-white font-medium">
            <HelpCircle className="w-4 h-4 text-[#FF8A00]" />
            <span>Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#909090]" />
        </button>

        <button
          type="button"
          onClick={() => {
            setInfoModalMessage({
              title: 'Terms of Service & Privacy',
              content: 'Starches connects hungry customers with vetted food merchants and independent couriers. All orders are subject to merchant confirmation and courier assignment. Cash on Delivery and Mobile Money payments are secured.',
            });
          }}
          className="w-full p-3 flex items-center justify-between hover:bg-[#F8F7F3] dark:hover:bg-[#303030] rounded-xl transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-[#242424] dark:text-white font-medium">
            <FileText className="w-4 h-4 text-[#FF8A00]" />
            <span>Terms of Service & Privacy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#909090]" />
        </button>
      </div>

      {/* Brand Identity Footer */}
      <div className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl border border-[#E7E4DD] dark:border-[#3A3A3A] bg-white dark:bg-[#1c1c1c] p-1 shrink-0 flex items-center justify-center shadow-xs">
          <img
            src={STARCHES_LOGO_URL}
            alt="Starches Brand"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-sm text-[#242424] dark:text-white">
              Starches
            </h4>
            <span className="text-[10px] font-bold text-[#FF8A00] bg-[#FF8A00]/10 px-1.5 py-0.5 rounded-full">
              Official App
            </span>
          </div>
          <p className="text-xs text-[#707070] dark:text-[#B7B7B7] mt-0.5">
            Food & Grocery Delivery · Version 2.4.0
          </p>
        </div>
        {onShowSplash && (
          <button
            type="button"
            onClick={onShowSplash}
            className="ml-auto px-2.5 py-1.5 rounded-xl bg-[#F8F7F3] dark:bg-[#303030] border border-[#E7E4DD] dark:border-[#3A3A3A] text-[11px] font-semibold text-[#FF8A00] shrink-0 hover:border-[#FF8A00] transition-colors"
          >
            Replay Logo
          </button>
        )}
      </div>

      {/* In-App Information Modal */}
      {infoModalMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <h3 className="font-bold text-base text-[#242424] dark:text-white">
              {infoModalMessage.title}
            </h3>
            <p className="text-xs text-[#707070] dark:text-[#B7B7B7] whitespace-pre-line leading-relaxed">
              {infoModalMessage.content}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setInfoModalMessage(null)}
                className="w-full py-2.5 rounded-xl bg-[#FF8A00] text-white font-semibold text-xs shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
