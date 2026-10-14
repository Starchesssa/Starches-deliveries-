import React, { useState } from 'react';
import { MapPin, Bell, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { DeliveryLocation, ServiceHub } from '../types';
import { SERVICE_HUBS } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';

interface OutOfServiceViewProps {
  location: DeliveryLocation;
  language: SupportedLanguage;
  onChangeLocation: () => void;
  onSelectHub: (hub: ServiceHub) => void;
}

export const OutOfServiceView: React.FC<OutOfServiceViewProps> = ({
  location,
  language,
  onChangeLocation,
  onSelectHub,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [contactInput, setContactInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;
    setIsSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#171717] text-[#242424] dark:text-[#F5F5F5] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between max-w-lg w-full mx-auto mb-4">
        <button
          onClick={onChangeLocation}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] hover:bg-[#F1F0EB] dark:hover:bg-[#303030] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF8A00]" />
          <span>{t.switch_location}</span>
        </button>
        <span className="text-xs text-[#707070] dark:text-[#B7B7B7] font-medium">
          Starches Global
        </span>
      </div>

      {/* Main Content Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-3xl p-6 sm:p-8 shadow-sm text-center">
        {/* Soft Pin Graphic with Pulsing Beacon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center relative">
          <div className="w-10 h-10 rounded-full bg-[#FF8A00] flex items-center justify-center text-white shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-[#FF8A00] text-[10px] font-bold text-white uppercase tracking-wider">
            Soon
          </div>
        </div>

        {/* Dynamic Location Title */}
        <h2 className="text-2xl font-bold text-[#242424] dark:text-white tracking-tight mb-2">
          {t.out_of_service_title}
        </h2>
        <div className="text-sm font-semibold text-[#FF8A00] mb-3">
          📍 {location.city || location.address || 'Selected Location'}, {location.country}
        </div>

        <p className="text-sm text-[#707070] dark:text-[#B7B7B7] leading-relaxed mb-6">
          {t.out_of_service_subtitle}
        </p>

        {/* Waitlist Subscription Form */}
        {!isSubscribed ? (
          <form onSubmit={handleNotifySubmit} className="space-y-3 mb-8">
            <div className="flex items-center h-12 bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-xl px-3 transition-colors">
              <Bell className="w-4 h-4 text-[#909090] shrink-0 mr-2" />
              <input
                type="text"
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                placeholder="Enter email or mobile number"
                className="w-full bg-transparent text-sm outline-none text-[#242424] dark:text-[#F5F5F5] placeholder-[#909090]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#FF8A00] hover:bg-[#E87900] active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center shadow-xs transition-colors"
            >
              {t.notify_me_button}
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs mb-8 flex items-start gap-2.5 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>{t.notify_success}</p>
          </div>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E7E4DD] dark:border-[#3A3A3A]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-[#222222] px-3 text-[#909090] font-medium">
              or try an active hub
            </span>
          </div>
        </div>

        {/* Active Hub Shortcuts for Demo / Instant Exploration */}
        <div className="space-y-2 text-left">
          <div className="text-xs font-semibold text-[#707070] dark:text-[#B7B7B7] mb-1">
            {t.explore_active_cities}:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_HUBS.map((hub) => (
              <button
                key={hub.id}
                onClick={() => onSelectHub(hub)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#E7E4DD] dark:border-[#3A3A3A] hover:border-[#FF8A00] bg-[#F8F7F3] dark:bg-[#171717] transition-all text-xs group"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span>{hub.countryFlag}</span>
                  <span className="font-semibold text-[#242424] dark:text-white truncate">
                    {hub.cityName}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#909090] group-hover:text-[#FF8A00] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-md w-full mx-auto text-center mt-6 text-xs text-[#909090]">
        Starches Delivery Network · Dar es Salaam · Lusaka · Paris · London
      </div>
    </div>
  );
};
