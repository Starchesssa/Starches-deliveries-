import React from 'react';
import { Home, Search, Clock, Heart, User } from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';

export type NavTab = 'home' | 'search' | 'orders' | 'favorites' | 'account';

interface BottomNavProps {
  activeTab: NavTab;
  language: SupportedLanguage;
  ordersCount: number;
  favoritesCount: number;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  language,
  ordersCount,
  favoritesCount,
  onSelectTab,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: t.nav_home, icon: Home },
    { id: 'search', label: t.nav_search, icon: Search },
    { id: 'orders', label: t.nav_orders, icon: Clock, badge: ordersCount > 0 ? ordersCount : undefined },
    { id: 'favorites', label: t.nav_favorites, icon: Heart, badge: favoritesCount > 0 ? favoritesCount : undefined },
    { id: 'account', label: t.nav_account, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-16.5 pb-safe neu-glass border-t border-[#DCE4EF]/80 dark:border-[#1F293D]/80 transition-colors">
      <div className="max-w-md mx-auto h-full grid grid-cols-5 items-center px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative cursor-pointer select-none ${
                isActive
                  ? 'neu-pressed text-[#FF5A1F]'
                  : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[17px] h-4.2 px-1 rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10.5px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-[#FF5A1F]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
