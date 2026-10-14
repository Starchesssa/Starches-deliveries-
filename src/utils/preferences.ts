export type CustomerPreferences = {
  onboardingCompleted: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'sw' | 'fr';
};

export const DEFAULT_PREFERENCES: CustomerPreferences = {
  onboardingCompleted: false,
  theme: 'light',
  language: 'en',
};

export const PREFERENCES_KEY = 'starches-customer-preferences';

export function loadPreferences(): CustomerPreferences {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (!saved) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(saved);
    return {
      onboardingCompleted:
        typeof parsed.onboardingCompleted === 'boolean'
          ? parsed.onboardingCompleted
          : false,
      theme: ['light', 'dark', 'system'].includes(parsed.theme)
        ? parsed.theme
        : 'light',
      language: ['en', 'sw', 'fr'].includes(parsed.language)
        ? parsed.language
        : 'en',
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: CustomerPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Unable to save Starches preferences', error);
  }
}
