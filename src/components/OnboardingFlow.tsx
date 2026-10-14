import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Globe2,
  Sun,
  Moon,
  Laptop,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { CustomerPreferences } from '../utils/preferences';
import { STARCHES_LOGO_URL } from '../constants/assets';

interface OnboardingFlowProps {
  preferences: CustomerPreferences;
  onComplete: (
    updatedPreferences: Partial<CustomerPreferences>,
    locationChoice?: 'gps' | 'search' | 'map' | 'manual'
  ) => void;
  onRequestGpsLocation?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  preferences,
  onComplete,
  onRequestGpsLocation,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<
    'en' | 'sw' | 'fr'
  >(preferences.language);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(
    preferences.theme || 'light'
  );
  const [locationChoice, setLocationChoice] = useState<
    'gps' | 'search' | 'map' | 'manual'
  >('map');
  const [isLocating, setIsLocating] = useState(false);

  // Immediate Skip Introduction (Completes onboarding with defaults)
  const handleSkipIntroduction = () => {
    onComplete({
      onboardingCompleted: true,
      theme: 'light',
      language: selectedLanguage,
    });
  };

  // Screen 2: Location option selection
  const handleSelectLocationOption = (
    choice: 'gps' | 'search' | 'map' | 'manual'
  ) => {
    setLocationChoice(choice);
    if (choice === 'gps') {
      setIsLocating(true);
      if (onRequestGpsLocation) {
        onRequestGpsLocation();
      }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setIsLocating(false);
            setStep(3); // move to language
          },
          () => {
            setIsLocating(false);
            setStep(3);
          },
          { timeout: 8000 }
        );
      } else {
        setIsLocating(false);
        setStep(3);
      }
    } else {
      setStep(3);
    }
  };

  // Screen 4: Finish setup
  const handleFinishOnboarding = () => {
    onComplete(
      {
        onboardingCompleted: true,
        language: selectedLanguage,
        theme: selectedTheme,
      },
      locationChoice
    );
  };

  return (
    <div
      className="relative isolate w-full h-[100dvh] overflow-y-auto flex flex-col justify-between p-6 transition-colors"
      style={{
        background: 'var(--app-bg)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Header Row with Skip Option */}
      <header className="flex items-center justify-between pt-safe">
        <div className="flex items-center gap-2.5">
          <img
            src={STARCHES_LOGO_URL}
            alt="Starches Logo"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-lg object-contain shadow-xs border border-[var(--border-color)] bg-white p-0.5"
          />
          <span className="font-bold text-lg tracking-tight">Starches</span>
        </div>

        {step === 1 ? (
          <button
            type="button"
            onClick={handleSkipIntroduction}
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1"
          >
            Skip introduction
          </button>
        ) : (
          <div className="text-xs font-semibold text-[var(--text-secondary)]">
            Step {step} of 4
          </div>
        )}
      </header>

      {/* Main Step Content Container */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        {/* SCREEN 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-[#222222] border border-[var(--border-color)] p-2 mx-auto flex items-center justify-center shadow-lg">
              <img
                src={STARCHES_LOGO_URL}
                alt="Starches Brand Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome to Starches
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                Discover local restaurants, order your favourite food, and get it delivered to you.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-[52px] rounded-xl bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-pressed)] active:scale-[0.99] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSkipIntroduction}
                className="w-full py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Skip introduction
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: Delivery Location */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Where should we deliver?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Choose how you'd like to set your delivery spot.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Option A: Current location */}
              <button
                type="button"
                onClick={() => handleSelectLocationOption('gps')}
                disabled={isLocating}
                className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all min-h-[58px] cursor-pointer"
                style={{
                  background: 'var(--surface)',
                  borderColor: locationChoice === 'gps' ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex items-center justify-center shrink-0">
                    <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      <span className="text-xs font-bold px-1.5 py-0.2 rounded bg-[var(--brand-orange)] text-white">A</span>
                      <span>Current location</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {isLocating ? 'Acquiring device GPS coordinates...' : 'Use device GPS to detect your location automatically'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>

              {/* Option B: Search for address */}
              <button
                type="button"
                onClick={() => handleSelectLocationOption('search')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all min-h-[58px] cursor-pointer"
                style={{
                  background: 'var(--surface)',
                  borderColor: locationChoice === 'search' ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-secondary)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      <span className="text-xs font-bold px-1.5 py-0.2 rounded bg-[var(--text-primary)] text-white">B</span>
                      <span>Search location in search bar</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Type street, neighborhood, building, or landmark
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>

              {/* Option C: Choose on map */}
              <button
                type="button"
                onClick={() => handleSelectLocationOption('map')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all min-h-[58px] cursor-pointer"
                style={{
                  background: 'var(--surface)',
                  borderColor: locationChoice === 'map' ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      <span className="text-xs font-bold px-1.5 py-0.2 rounded bg-[var(--brand-orange)] text-white">C</span>
                      <span>Choose on map</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Pinpoint your exact delivery spot on interactive map
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: Language */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Choose your language
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                You can always change this later in Account settings.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all min-h-[56px]"
                style={{
                  background: 'var(--surface)',
                  borderColor: selectedLanguage === 'en' ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <div className="text-sm font-semibold">English</div>
                    <div className="text-xs text-[var(--text-secondary)]">Default system language</div>
                  </div>
                </div>
                {selectedLanguage === 'en' && (
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-orange)] text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedLanguage('sw')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all min-h-[56px]"
                style={{
                  background: 'var(--surface)',
                  borderColor: selectedLanguage === 'sw' ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇹🇿</span>
                  <div>
                    <div className="text-sm font-semibold">Kiswahili</div>
                    <div className="text-xs text-[var(--text-secondary)]">Lugha ya Kiswahili</div>
                  </div>
                </div>
                {selectedLanguage === 'sw' && (
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-orange)] text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedLanguage('fr')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all min-h-[56px]"
                style={{
                  background: 'var(--surface)',
                  borderColor: selectedLanguage === 'fr' ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇫🇷</span>
                  <div>
                    <div className="text-sm font-semibold">Français</div>
                    <div className="text-xs text-[var(--text-secondary)]">Langue française</div>
                  </div>
                </div>
                {selectedLanguage === 'fr' && (
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-orange)] text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 h-[52px] rounded-xl border border-[var(--border-color)] text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 h-[52px] rounded-xl bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-pressed)] text-white font-semibold text-sm flex items-center justify-center gap-1 shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: Theme Preference */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Which theme do you like?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Choose the appearance that feels most comfortable. You can change it anytime in Account settings.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Light Theme */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTheme('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.classList.remove('dark');
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all min-h-[56px]"
                style={{
                  background: 'var(--surface)',
                  borderColor: selectedTheme === 'light' ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Light theme</div>
                    <div className="text-xs text-[var(--text-secondary)]">Icy white (#EEF2F9) background</div>
                  </div>
                </div>
                {selectedTheme === 'light' && (
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-orange)] text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* Dark Theme */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTheme('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('dark');
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all min-h-[56px]"
                style={{
                  background: 'var(--surface)',
                  borderColor: selectedTheme === 'dark' ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 text-amber-400 flex items-center justify-center shrink-0">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Dark theme</div>
                    <div className="text-xs text-[var(--text-secondary)]">Premium black (#0D1117) background</div>
                  </div>
                </div>
                {selectedTheme === 'dark' && (
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-orange)] text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* Skip -> Selects System Mode */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTheme('system');
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                  if (isDark) document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all min-h-[56px]"
                style={{
                  background: 'var(--surface)',
                  borderColor: selectedTheme === 'system' ? 'var(--brand-orange)' : 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-secondary)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5 text-[var(--brand-orange)]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Skip (Follow System)</div>
                    <div className="text-xs text-[var(--text-secondary)]">Adapts automatically to your device's mode</div>
                  </div>
                </div>
                {selectedTheme === 'system' && (
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-orange)] text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 h-[52px] rounded-xl border border-[var(--border-color)] text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="flex-1 h-[52px] rounded-xl bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-pressed)] text-white font-semibold text-sm flex items-center justify-center gap-1 shadow-md"
              >
                <span>Finish setup</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Safe Space */}
      <footer className="text-center text-xs text-[var(--text-secondary)] pb-safe">
        Starches · Premium Food Delivery
      </footer>
    </div>
  );
};
