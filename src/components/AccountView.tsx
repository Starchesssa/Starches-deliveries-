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
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton } from './neumorphic/NeuButton';

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
    <div className="w-full max-w-lg mx-auto p-4 space-y-4 pb-28 text-[#1A202C] dark:text-[#F0F4F8]">
      {/* Profile Header Card with Soft-UI Elevation */}
      <NeuCard elevation="flat" className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl neu-button-primary flex items-center justify-center text-white font-extrabold text-lg">
            {userName.charAt(0)}
          </div>
          <div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-sm font-bold neu-pressed px-2.5 py-1 rounded-xl outline-none text-[#1A202C] dark:text-[#F0F4F8]"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="text-xs text-[#FF5A1F] font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#1A202C] dark:text-[#F0F4F8]">
                  {userName}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-[#FF5A1F] font-semibold hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}
            <div className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5">
              Starches Customer Account · Live Firebase Mode
            </div>
          </div>
        </div>
      </NeuCard>

      {/* Saved Addresses Section */}
      <NeuCard elevation="flat" className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-[#1A202C] dark:text-[#F0F4F8] flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-[#FF5A1F]" />
            <span>{t.saved_addresses}</span>
          </h4>
          <button
            type="button"
            onClick={onOpenLocationPicker}
            className="text-xs font-bold text-[#FF5A1F] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.add_new_address}</span>
          </button>
        </div>

        {/* Current Active Location */}
        <div className="p-3.5 rounded-xl neu-pressed flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-[#FF5A1F] uppercase tracking-wider block">
              Active Delivery Address {currentLocation.label && `(${currentLocation.label})`}
            </span>
            <div className="text-sm font-bold text-[#1A202C] dark:text-[#F0F4F8] truncate mt-0.5">
              {currentLocation.address}
            </div>
            <div className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
              {currentLocation.city}, {currentLocation.country}
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenLocationPicker}
            className="px-3 py-1.5 rounded-xl neu-button text-xs font-semibold text-[#1A202C] dark:text-[#F0F4F8] shrink-0 cursor-pointer"
          >
            Change
          </button>
        </div>

        {/* List of Other Saved Addresses */}
        {savedAddresses.filter((sa) => sa.id !== currentLocation.id).length > 0 && (
          <div className="space-y-2 pt-1 border-t border-[#DCE4EF]/60 dark:border-[#1F293D]/60">
            <span className="text-[11px] font-semibold text-[#5A6A80] dark:text-[#8B9BB4] block">
              Other Saved Places:
            </span>
            {savedAddresses
              .filter((sa) => sa.id !== currentLocation.id)
              .map((sa) => (
                <div
                  key={sa.id}
                  className="p-3 rounded-xl neu-button flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-[#1A202C] dark:text-[#F0F4F8]">
                      {sa.label || 'Saved Place'}:
                    </span>{' '}
                    <span className="text-[#5A6A80] dark:text-[#8B9BB4] truncate">
                      {sa.address}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectSavedAddress(sa)}
                    className="px-3 py-1 rounded-lg neu-button-primary text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              ))}
          </div>
        )}
      </NeuCard>

      {/* 3-State Theme Settings: Light, Dark, System */}
      <NeuCard elevation="flat" className="p-4 space-y-2.5">
        <div>
          <div className="font-extrabold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
            {t.theme_settings}
          </div>
          <div className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
            Choose between Light (#EEF2F9), Dark (#0D1117), or Follow System.
          </div>
        </div>

        <ThemeToggle
          themeMode={themeMode}
          onSelectThemeMode={onSelectThemeMode}
          variant="segmented"
        />
      </NeuCard>

      {/* Language & Regional Settings */}
      <NeuCard elevation="flat" className="p-4 space-y-3">
        <h4 className="font-extrabold text-sm text-[#1A202C] dark:text-[#F0F4F8] flex items-center gap-1.5">
          <Globe2 className="w-4 h-4 text-[#FF5A1F]" />
          <span>{t.language_settings}</span>
        </h4>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSelectLanguage('en')}
            className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              language === 'en'
                ? 'neu-button-primary'
                : 'neu-button text-[#1A202C] dark:text-[#F0F4F8]'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectLanguage('sw')}
            className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              language === 'sw'
                ? 'neu-button-primary'
                : 'neu-button text-[#1A202C] dark:text-[#F0F4F8]'
            }`}
          >
            <span>🇹🇿</span>
            <span>Kiswahili</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectLanguage('fr')}
            className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              language === 'fr'
                ? 'neu-button-primary'
                : 'neu-button text-[#1A202C] dark:text-[#F0F4F8]'
            }`}
          >
            <span>🇫🇷</span>
            <span>Français</span>
          </button>
        </div>
      </NeuCard>

      {/* Demonstration Hubs Selector */}
      <NeuCard elevation="flat" className="p-4 space-y-3">
        <h4 className="font-extrabold text-sm text-[#1A202C] dark:text-[#F0F4F8] flex items-center gap-1.5">
          <span>🌍</span>
          <span>{t.active_hubs_title}</span>
        </h4>
        <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
          {t.select_hub_hint}
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {SERVICE_HUBS.map((hub) => (
            <button
              key={hub.id}
              type="button"
              onClick={() => onSelectHub(hub)}
              className={`p-3 rounded-xl text-left text-xs transition-all cursor-pointer ${
                activeHub?.id === hub.id
                  ? 'neu-pressed border border-[#FF5A1F] font-bold text-[#FF5A1F]'
                  : 'neu-button text-[#1A202C] dark:text-[#F0F4F8]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{hub.countryFlag}</span>
                <span className="truncate">{hub.cityName}</span>
              </div>
              <div className="text-[10px] text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5">
                {hub.currency.code} ({hub.currency.symbol})
              </div>
            </button>
          ))}
        </div>
      </NeuCard>

      {/* Support & Legal Info */}
      <NeuCard elevation="flat" className="p-2 divide-y divide-[#DCE4EF]/60 dark:divide-[#1F293D]/60 text-xs">
        <button
          type="button"
          onClick={() => {
            setInfoModalMessage({
              title: 'Help & Customer Support',
              content: 'Starches Customer Care is available 24/7.\nEmail: support@starches.delivery\nPhone: +255 22 212 3456\nLocation: Starches Hub, Kinondoni & Mikocheni, Dar es Salaam.',
            });
          }}
          className="w-full p-3 flex items-center justify-between rounded-xl hover:bg-[#E5ECF6]/40 dark:hover:bg-[#171F2E]/40 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 text-[#1A202C] dark:text-[#F0F4F8] font-semibold">
            <HelpCircle className="w-4 h-4 text-[#FF5A1F]" />
            <span>Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8492A6]" />
        </button>

        <button
          type="button"
          onClick={() => {
            setInfoModalMessage({
              title: 'Terms of Service & Privacy',
              content: 'Starches connects hungry customers with vetted food merchants and independent couriers. All orders are subject to merchant confirmation and courier assignment. Cash on Delivery and Mobile Money payments are secured.',
            });
          }}
          className="w-full p-3 flex items-center justify-between rounded-xl hover:bg-[#E5ECF6]/40 dark:hover:bg-[#171F2E]/40 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 text-[#1A202C] dark:text-[#F0F4F8] font-semibold">
            <FileText className="w-4 h-4 text-[#FF5A1F]" />
            <span>Terms of Service & Privacy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8492A6]" />
        </button>
      </NeuCard>

      {/* Brand Identity Footer */}
      <NeuCard elevation="flat" className="p-4 flex items-center gap-3.5">
        <div className="w-13 h-13 rounded-2xl neu-button p-1 shrink-0 flex items-center justify-center">
          <img
            src={STARCHES_LOGO_URL}
            alt="Starches Brand"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-extrabold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
              Starches
            </h4>
            <span className="text-[10px] font-bold text-[#FF5A1F] neu-pressed px-2 py-0.5 rounded-full">
              Official App
            </span>
          </div>
          <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5">
            Food & Grocery Delivery · Version 2.5.0
          </p>
        </div>
      </NeuCard>

      {/* In-App Information Modal */}
      {infoModalMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <NeuCard elevation="flat" className="max-w-sm w-full p-5 space-y-3">
            <h3 className="font-extrabold text-base text-[#1A202C] dark:text-[#F0F4F8]">
              {infoModalMessage.title}
            </h3>
            <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] whitespace-pre-line leading-relaxed">
              {infoModalMessage.content}
            </p>
            <div className="pt-2">
              <NeuButton
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setInfoModalMessage(null)}
              >
                Close
              </NeuButton>
            </div>
          </NeuCard>
        </div>
      )}
    </div>
  );
};
