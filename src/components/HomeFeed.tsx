import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  Clock,
  Bike,
  Heart,
  Map as MapIcon,
  Store,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Zap,
} from 'lucide-react';
import { Merchant, ServiceHub } from '../types';
import { CATEGORIES_BY_HUB } from '../data/merchants';
import { formatCurrency } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';

export type MainFeedTab = 'all' | 'restaurants' | 'groceries';

interface HomeFeedProps {
  merchants: Merchant[];
  activeHub: ServiceHub;
  language: SupportedLanguage;
  favorites: string[];
  onToggleFavorite: (merchantId: string) => void;
  onSelectMerchant: (merchant: Merchant) => void;
  onToggleMapView?: () => void;
  isMapViewActive?: boolean;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  merchants,
  activeHub,
  language,
  favorites,
  onToggleFavorite,
  onSelectMerchant,
  onToggleMapView,
  isMapViewActive,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // 1. Three Main Tabs: All Tab, Restaurant Tab, Groceries Tab
  const [mainTab, setMainTab] = useState<MainFeedTab>('all');

  // 2. Sub-tab state
  const [subTab, setSubTab] = useState<string>('all');

  // 3. Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Hub categories
  const hubCategories = CATEGORIES_BY_HUB[activeHub.id] || CATEGORIES_BY_HUB['tz-dar'];

  // Sub-tabs configuration based on active main tab
  const subTabs = useMemo(() => {
    if (mainTab === 'all') {
      return [
        { id: 'all', label: t.subtab_all || 'All', icon: <Sparkles className="w-3.5 h-3.5" /> },
        { id: 'near_me', label: t.subtab_near_me || 'Near me', icon: <MapPin className="w-3.5 h-3.5" /> },
        { id: 'top_rated', label: t.subtab_top_rated || '★ Top Rated', icon: <Star className="w-3.5 h-3.5" /> },
        { id: 'fast', label: t.subtab_fast_delivery || '⚡ Under 25 mins', icon: <Zap className="w-3.5 h-3.5" /> },
        ...hubCategories.filter((c) => c.id !== 'all').map((c) => ({
          id: c.id,
          label:
            language === 'sw' && c.nameSw
              ? c.nameSw
              : language === 'fr' && c.nameFr
              ? c.nameFr
              : c.name,
          icon: <span className="text-sm">{c.icon}</span>,
        })),
      ];
    }

    if (mainTab === 'restaurants') {
      return [
        { id: 'all', label: t.tab_restaurants || 'All Restaurants', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
        { id: 'near_me', label: t.subtab_near_me || 'Near me', icon: <MapPin className="w-3.5 h-3.5" /> },
        { id: 'top_rated', label: t.subtab_top_rated || '★ Top Rated', icon: <Star className="w-3.5 h-3.5" /> },
        { id: 'fast', label: t.subtab_fast_delivery || '⚡ Under 25 mins', icon: <Zap className="w-3.5 h-3.5" /> },
        ...hubCategories
          .filter((c) => c.id !== 'all' && c.id !== 'groceries')
          .map((c) => ({
            id: c.id,
            label:
              language === 'sw' && c.nameSw
                ? c.nameSw
                : language === 'fr' && c.nameFr
                ? c.nameFr
                : c.name,
            icon: <span className="text-sm">{c.icon}</span>,
          })),
      ];
    }

    // Groceries tab sub-tabs
    return [
      { id: 'all', label: t.tab_groceries || 'All Groceries', icon: <Store className="w-3.5 h-3.5" /> },
      { id: 'near_me', label: t.subtab_near_me || 'Near me', icon: <MapPin className="w-3.5 h-3.5" /> },
      { id: 'fresh', label: language === 'sw' ? 'Mboga & Matunda' : language === 'fr' ? 'Fruits & Légumes' : 'Fresh Produce', icon: <span className="text-sm">🥑</span> },
      { id: 'supermarket', label: language === 'sw' ? 'Maduka Makubwa' : language === 'fr' ? 'Supermarchés' : 'Supermarkets', icon: <span className="text-sm">🏬</span> },
      { id: 'bakery_dairy', label: language === 'sw' ? 'Vitafunwa & Maziwa' : language === 'fr' ? 'Boulangerie & Lait' : 'Bakery & Dairy', icon: <span className="text-sm">🥖</span> },
      { id: 'fast', label: t.subtab_fast_delivery || '⚡ Under 25 mins', icon: <Zap className="w-3.5 h-3.5" /> },
      { id: 'top_rated', label: t.subtab_top_rated || '★ Top Rated', icon: <Star className="w-3.5 h-3.5" /> },
    ];
  }, [mainTab, hubCategories, language, t]);

  // When switching main tabs, reset subTab to 'all'
  const handleMainTabChange = (tab: MainFeedTab) => {
    setMainTab(tab);
    setSubTab('all');
  };

  // Filtered and sorted merchants
  const filteredMerchants = useMemo(() => {
    let result = merchants.filter((m) => {
      // 1. Hub filter
      if (m.hubId !== activeHub.id) return false;

      // 2. Main tab filter
      if (mainTab === 'restaurants' && m.type !== 'restaurant') return false;
      if (mainTab === 'groceries' && m.type !== 'grocery') return false;

      // 3. Sub-tab filter
      if (subTab === 'top_rated' && m.rating < 4.8) return false;
      if (subTab === 'fast' && m.deliveryTimeMinutes > 25) return false;
      if (subTab === 'fresh' && !m.tags.includes('groceries') && !m.cuisine.toLowerCase().includes('produce') && !m.cuisine.toLowerCase().includes('matunda')) {
        return false;
      }
      if (subTab === 'supermarket' && !m.name.toLowerCase().includes('supermarket') && !m.cuisine.toLowerCase().includes('supermarket') && !m.tags.includes('supermarket')) {
        return false;
      }
      if (subTab === 'bakery_dairy' && !m.tags.includes('bakery') && !m.tags.includes('breakfast') && !m.cuisine.toLowerCase().includes('bakery')) {
        return false;
      }
      if (
        subTab !== 'all' &&
        subTab !== 'near_me' &&
        subTab !== 'top_rated' &&
        subTab !== 'fast' &&
        subTab !== 'fresh' &&
        subTab !== 'supermarket' &&
        subTab !== 'bakery_dairy'
      ) {
        if (!m.tags.includes(subTab)) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesCuisine = m.cuisine.toLowerCase().includes(q);
        const matchesAddress = m.address.toLowerCase().includes(q);
        const matchesTags = m.tags.some((tag) => tag.toLowerCase().includes(q));
        return matchesName || matchesCuisine || matchesAddress || matchesTags;
      }

      return true;
    });

    // Sub-tab sorting
    if (subTab === 'near_me' || subTab === 'fast') {
      result = [...result].sort((a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes);
    } else if (subTab === 'top_rated') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [merchants, activeHub.id, mainTab, subTab, searchQuery]);

  return (
    <div className="w-full pb-28">
      {/* Search Bar - Clean, 50px height, #F8FAFF in light theme */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative flex items-center h-[50px] bg-[#F8FAFF] dark:bg-[#111722] border border-[#DCE4EF] dark:border-[#1F293D] rounded-xl px-3.5 shadow-xs transition-colors">
          <Search className="w-5 h-5 text-[#8492A6] mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="w-full bg-transparent text-[15px] outline-none text-[#1A202C] dark:text-[#F0F4F8] placeholder-[#8492A6]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#8492A6] hover:text-[#1A202C] dark:hover:text-[#F0F4F8] px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 1. THREE MAIN TABS: All Tab, Restaurant Tab, Groceries Tab */}
      <div className="px-4 pt-1 pb-2">
        <div className="p-1 rounded-2xl bg-[#E5ECF6] dark:bg-[#171F2E] border border-[#DCE4EF] dark:border-[#1F293D] grid grid-cols-3 gap-1">
          {/* Main Tab 1: All */}
          <button
            type="button"
            onClick={() => handleMainTabChange('all')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
              mainTab === 'all'
                ? 'bg-[#FF5A1F] text-white shadow-xs'
                : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8] hover:bg-[#F8FAFF]/60 dark:hover:bg-[#111722]/60'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.tab_all || 'All'}</span>
          </button>

          {/* Main Tab 2: Restaurant */}
          <button
            type="button"
            onClick={() => handleMainTabChange('restaurants')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
              mainTab === 'restaurants'
                ? 'bg-[#FF5A1F] text-white shadow-xs'
                : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8] hover:bg-[#F8FAFF]/60 dark:hover:bg-[#111722]/60'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.tab_restaurants || 'Restaurants'}</span>
          </button>

          {/* Main Tab 3: Groceries */}
          <button
            type="button"
            onClick={() => handleMainTabChange('groceries')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
              mainTab === 'groceries'
                ? 'bg-[#FF5A1F] text-white shadow-xs'
                : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8] hover:bg-[#F8FAFF]/60 dark:hover:bg-[#111722]/60'
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.tab_groceries || 'Groceries'}</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TABS ROW BELOW EACH TAB (ie near me, top rated, fast delivery, cuisines) */}
      <div className="px-4 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
          {subTabs.map((st) => {
            const isSelected = subTab === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSubTab(st.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all min-h-[38px] cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF5A1F] text-white border border-[#FF5A1F] shadow-xs'
                    : 'bg-[#F8FAFF] dark:bg-[#111722] text-[#5A6A80] dark:text-[#8B9BB4] border border-[#DCE4EF] dark:border-[#1F293D] hover:border-[#FF5A1F] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]'
                }`}
              >
                {st.icon}
                <span className="whitespace-nowrap">{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Map View Toggle Button */}
        {onToggleMapView && (
          <button
            type="button"
            onClick={onToggleMapView}
            className={`p-2.5 rounded-xl border transition-colors shrink-0 shadow-xs cursor-pointer ${
              isMapViewActive
                ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
                : 'bg-[#F8FAFF] dark:bg-[#111722] text-[#5A6A80] dark:text-[#8B9BB4] border border-[#DCE4EF] dark:border-[#1F293D] hover:border-[#FF5A1F] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]'
            }`}
            title="Toggle Map View"
            aria-label="Toggle Map View"
          >
            <MapIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Merchant Cards Feed */}
      <div className="px-4 pt-2.5 space-y-4">
        {filteredMerchants.length === 0 ? (
          <div className="py-16 text-center bg-[#F8FAFF] dark:bg-[#111722] rounded-2xl border border-[#DCE4EF] dark:border-[#1F293D] p-6 shadow-xs">
            <UtensilsCrossed className="w-10 h-10 text-[#8492A6] mx-auto mb-2.5" />
            <h3 className="font-bold text-base text-[#1A202C] dark:text-[#F0F4F8]">
              No merchants found
            </h3>
            <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-1 max-w-xs mx-auto">
              {mainTab === 'restaurants'
                ? 'No restaurants match your selected filter. Try another tab or clear search.'
                : mainTab === 'groceries'
                ? 'No grocery stores match your selected filter. Try another tab or clear search.'
                : 'Try adjusting your sub-tab filter or search query.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setMainTab('all');
                setSubTab('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#FF5A1F] text-white text-xs font-semibold shadow-xs hover:bg-[#E84D15] cursor-pointer"
            >
              Show All Available
            </button>
          </div>
        ) : (
          filteredMerchants.map((merchant) => {
            const isFav = favorites.includes(merchant.id);
            const cuisineLabel =
              language === 'sw' && merchant.cuisineSw
                ? merchant.cuisineSw
                : language === 'fr' && merchant.cuisineFr
                ? merchant.cuisineFr
                : merchant.cuisine;

            return (
              <div
                key={merchant.id}
                onClick={() => onSelectMerchant(merchant)}
                className="bg-[#F8FAFF] dark:bg-[#111722] border border-[#DCE4EF] dark:border-[#1F293D] rounded-2xl overflow-hidden shadow-xs hover:border-[#FF5A1F]/60 active:scale-[0.99] transition-all cursor-pointer group"
              >
                {/* Hero Image */}
                <div className="relative h-32 w-full bg-[#E5ECF6] dark:bg-[#171F2E] overflow-hidden">
                  <img
                    src={merchant.image}
                    alt={merchant.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Merchant Type indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFF]/95 dark:bg-[#111722]/95 border border-[#DCE4EF]/80 dark:border-[#1F293D] text-[#1A202C] dark:text-[#F0F4F8] backdrop-blur-md text-[11px] font-semibold shadow-xs">
                    {merchant.type === 'grocery' ? (
                      <>
                        <Store className="w-3 h-3 text-[#FF5A1F]" />
                        <span>Food Grocery</span>
                      </>
                    ) : (
                      <>
                        <UtensilsCrossed className="w-3 h-3 text-[#FF5A1F]" />
                        <span>Restaurant</span>
                      </>
                    )}
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(merchant.id);
                    }}
                    aria-label="Save to favorites"
                    className="absolute top-2.5 right-2.5 w-10 h-10 rounded-full bg-[#F8FAFF]/90 dark:bg-[#111722]/90 border border-[#DCE4EF]/60 dark:border-[#1F293D] backdrop-blur-md flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav
                          ? 'fill-[#FF5A1F] text-[#FF5A1F]'
                          : 'text-[#1A202C] dark:text-[#F0F4F8]'
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-3.5 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[15px] sm:text-base text-[#1A202C] dark:text-[#F0F4F8] leading-snug">
                      {merchant.name}
                    </h3>
                  </div>

                  {/* Cuisine / Secondary line */}
                  <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5 line-clamp-1">
                    {cuisineLabel}
                  </p>

                  {/* Metadata: Clean text separated by · with subtle styling */}
                  <div className="flex items-center gap-2 mt-2.5 text-xs text-[#5A6A80] dark:text-[#8B9BB4] font-medium">
                    <div className="flex items-center gap-1 text-[#1A202C] dark:text-[#F0F4F8] font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{merchant.rating}</span>
                      <span className="text-[#8492A6] font-normal">
                        ({merchant.ratingCount})
                      </span>
                    </div>

                    <span aria-hidden="true" className="text-[#8492A6]">
                      ·
                    </span>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8492A6]" />
                      <span>
                        {merchant.deliveryTimeMinutes} {t.delivery_time}
                      </span>
                    </div>

                    <span aria-hidden="true" className="text-[#8492A6]">
                      ·
                    </span>

                    <div className="flex items-center gap-1 font-mono tabular-nums">
                      <Bike className="w-3.5 h-3.5 text-[#8492A6]" />
                      <span>
                        {merchant.deliveryFee === 0
                          ? t.free_delivery
                          : formatCurrency(merchant.deliveryFee, activeHub.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
