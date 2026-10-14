import React, { useState } from 'react';
import { MapPin, Bell, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { DeliveryLocation, ServiceHub } from '../types';
import { SERVICE_HUBS } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton, NeuIconButton } from './neumorphic/NeuButton';
import { NeuInput } from './neumorphic/NeuInput';

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
    <div className="min-h-screen bg-[#EEF2F9] dark:bg-[#0D1117] text-[#1A202C] dark:text-[#F0F4F8] flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between max-w-lg w-full mx-auto mb-4">
        <NeuButton
          variant="secondary"
          size="sm"
          onClick={onChangeLocation}
          icon={<ArrowLeft className="w-4 h-4 text-[#FF5A1F]" />}
        >
          {t.switch_location}
        </NeuButton>
        <span className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] font-medium">
          Starches Global
        </span>
      </div>

      {/* Main Content Card */}
      <NeuCard
        elevation="flat"
        className="max-w-md w-full mx-auto my-auto p-6 sm:p-8 text-center"
      >
        {/* Soft Pin Graphic with Pulsing Beacon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl neu-pressed flex items-center justify-center relative">
          <div className="w-10 h-10 rounded-full bg-[#FF5A1F] flex items-center justify-center text-white shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-[#FF5A1F] text-[10px] font-bold text-white uppercase tracking-wider">
            Soon
          </div>
        </div>

        {/* Dynamic Location Title */}
        <h2 className="text-2xl font-extrabold text-[#1A202C] dark:text-[#F0F4F8] tracking-tight mb-2">
          {t.out_of_service_title}
        </h2>
        <div className="text-sm font-bold text-[#FF5A1F] mb-3">
          📍 {location.city || location.address || 'Selected Location'}, {location.country}
        </div>

        <p className="text-sm text-[#5A6A80] dark:text-[#8B9BB4] leading-relaxed mb-6">
          {t.out_of_service_subtitle}
        </p>

        {/* Waitlist Subscription Form */}
        {!isSubscribed ? (
          <form onSubmit={handleNotifySubmit} className="space-y-3 mb-8">
            <NeuInput
              prefixIcon={<Bell className="w-4 h-4 text-[#5A6A80]" />}
              type="text"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder="Enter email or mobile number"
              required
            />
            <NeuButton
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
            >
              {t.notify_me_button}
            </NeuButton>
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
            <div className="w-full border-t border-[#DCE4EF] dark:border-[#1F293D]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#F8FAFF] dark:bg-[#111722] px-2 text-[#5A6A80] dark:text-[#8B9BB4] font-semibold">
              Or Try A Live Hub
            </span>
          </div>
        </div>

        {/* Hub Fast Switchers */}
        <div className="grid grid-cols-2 gap-2 text-left">
          {SERVICE_HUBS.map((hub) => (
            <button
              key={hub.id}
              type="button"
              onClick={() => onSelectHub(hub)}
              className="p-3 rounded-xl neu-button text-xs flex items-center justify-between group cursor-pointer"
            >
              <div className="min-w-0">
                <span className="text-base mr-1.5">{hub.countryFlag}</span>
                <span className="font-bold text-[#1A202C] dark:text-[#F0F4F8]">{hub.cityName}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#5A6A80] group-hover:text-[#FF5A1F] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </NeuCard>

      <div className="max-w-md w-full mx-auto text-center text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
        Expanding across Africa and global metropolitan capitals.
      </div>
    </div>
  );
};
