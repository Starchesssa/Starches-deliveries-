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
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Merchant, ServiceHub } from '../types';
import { CATEGORIES_BY_HUB } from '../data/merchants';
import { formatCurrency } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton, NeuIconButton } from './neumorphic/NeuButton';
import { NeuInput } from './neumorphic/NeuInput';

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
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
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
  isLoading = false,
  error = null,
  onRetry,
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
      if (
        subTab === 'fresh' &&
        !m.tags.includes('groceries') &&
        !m.cuisine.toLowerCase().includes('produce') &&
        !m.cuisine.toLowerCase().includes('matunda')
      ) {
        return false;
      }
      if (
        subTab === 'supermarket' &&
        !m.name.toLowerCase().includes('supermarket') &&
        !m.cuisine.toLowerCase().includes('supermarket') &&
        !m.tags.includes('supermarket')
      ) {
        return false;
      }
      if (
        subTab === 'bakery_dairy' &&
        !m.tags.includes('bakery') &&
        !m.tags.includes('breakfast') &&
        !m.cuisine.toLowerCase().includes('bakery')
      ) {
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
      {/* Search Bar with Neumorphic Inset Shadow */}
      <div className="px-4 pt-3 pb-2">
        <NeuInput
          prefixIcon={<Search className="w-4.5 h-4.5" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.search_placeholder}
          suffixIcon={
            searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#5A6A80] hover:text-[#1A202C] dark:hover:text-[#F0F4F8] p-1 cursor-pointer"
              >
                ✕
              </button>
            ) : null
          }
        />
      </div>

      {/* 1. THREE MAIN TABS: All Tab, Restaurant Tab, Groceries Tab (Tactile Neumorphic) */}
      <div className="px-4 pt-1.5 pb-2">
        <div className="p-1.5 rounded-2xl neu-pressed grid grid-cols-3 gap-1.5">
          {/* Main Tab 1: All */}
          <button
            type="button"
            onClick={() => handleMainTabChange('all')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
              mainTab === 'all'
                ? 'neu-button-primary'
                : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]'
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
                ? 'neu-button-primary'
                : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]'
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
                ? 'neu-button-primary'
                : 'text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]'
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.tab_groceries || 'Groceries'}</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TABS ROW BELOW EACH TAB (ie near me, top rated, fast delivery, cuisines) */}
      <div className="px-4 py-1.5 flex items-center justify-between gap-2.5">
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
                    ? 'neu-button-primary'
                    : 'neu-button text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]'
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
          <NeuIconButton
            variant={isMapViewActive ? 'primary' : 'secondary'}
            size="md"
            onClick={onToggleMapView}
            title="Toggle Map View"
            aria-label="Toggle Map View"
          >
            <MapIcon className="w-4 h-4" />
          </NeuIconButton>
        )}
      </div>

      {/* 3. Merchant Cards Feed */}
      <div className="px-4 pt-2.5 space-y-4">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#FF5A1F] animate-spin mb-3" />
            <p className="text-sm font-medium text-[#5A6A80] dark:text-[#8B9BB4]">
              Connecting to Starches live catalog...
            </p>
          </div>
        ) : error ? (
          <NeuCard elevation="flat" className="p-6 text-center my-4">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            {onRetry && (
              <NeuButton
                variant="primary"
                size="sm"
                onClick={onRetry}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry
              </NeuButton>
            )}
          </NeuCard>
        ) : filteredMerchants.length === 0 ? (
          <NeuCard elevation="flat" className="py-16 text-center p-6 my-4">
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
            <div className="mt-4 flex justify-center">
              <NeuButton
                variant="primary"
                size="sm"
                onClick={() => {
                  setMainTab('all');
                  setSubTab('all');
                  setSearchQuery('');
                }}
              >
                Show All Available
              </NeuButton>
            </div>
          </NeuCard>
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
              <NeuCard
                key={merchant.id}
                elevation="flat"
                clickable
                onClick={() => onSelectMerchant(merchant)}
                className="overflow-hidden group"
              >
                {/* Hero Image */}
                <div className="relative h-34 w-full bg-[#E5ECF6] dark:bg-[#171F2E] overflow-hidden">
                  <img
                    src={merchant.image}
                    alt={merchant.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Merchant Type indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl neu-glass text-[#1A202C] dark:text-[#F0F4F8] text-[11px] font-semibold border border-white/60 dark:border-[#232F44]/70">
                    {merchant.type === 'grocery' ? (
                      <>
                        <Store className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>Food Grocery</span>
                      </>
                    ) : (
                      <>
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>Restaurant</span>
                      </>
                    )}
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(merchant.id);
                    }}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    className="absolute top-3 right-3 w-9 h-9 rounded-xl neu-glass flex items-center justify-center border border-white/60 dark:border-[#232F44]/70 active:scale-90 transition-transform cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isFav
                          ? 'fill-[#FF5A1F] text-[#FF5A1F]'
                          : 'text-white drop-shadow-sm'
                      }`}
                    />
                  </button>

                  {/* Delivery time pill on image */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#FF5A1F]" />
                    <span>{merchant.deliveryTimeMinutes} mins</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[15px] text-[#1A202C] dark:text-[#F0F4F8] group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
                      {merchant.name}
                    </h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg neu-pressed shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-[#1A202C] dark:text-[#F0F4F8]">
                        {merchant.rating}
                      </span>
                      <span className="text-[10px] text-[#5A6A80] dark:text-[#8B9BB4]">
                        ({merchant.ratingCount})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] line-clamp-1">
                    {cuisineLabel}
                  </p>

                  <div className="pt-2 border-t border-[#DCE4EF]/60 dark:border-[#1F293D]/60 flex items-center justify-between text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Bike className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>
                        {formatCurrency(merchant.deliveryFee, activeHub.currency)} delivery
                      </span>
                    </div>

                    <span className="text-[11px] truncate max-w-[140px]">
                      {merchant.address}
                    </span>
                  </div>
                </div>
              </NeuCard>
            );
          })
        )}
      </div>
    </div>
  );
};
