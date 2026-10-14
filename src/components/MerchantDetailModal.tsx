import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  Plus,
  Store,
  UtensilsCrossed,
  ShoppingBag,
} from 'lucide-react';
import { Merchant, MenuItem, ServiceHub, CartItem } from '../types';
import { MENU_ITEMS } from '../data/merchants';
import { formatCurrency } from '../data/hubs';
import { ItemCustomizationSheet } from './ItemCustomizationSheet';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';

interface MerchantDetailModalProps {
  merchant: Merchant;
  activeHub: ServiceHub;
  language: SupportedLanguage;
  cartItems: CartItem[];
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    selectedOptions: any[],
    specialInstructions?: string
  ) => void;
  onOpenCart: () => void;
  onBack: () => void;
}

export const MerchantDetailModal: React.FC<MerchantDetailModalProps> = ({
  merchant,
  activeHub,
  language,
  cartItems,
  onAddToCart,
  onOpenCart,
  onBack,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  // Filter items for this merchant
  const merchantItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => item.merchantId === merchant.id);
  }, [merchant.id]);

  // Unique categories in this merchant's menu
  const menuCategories = useMemo(() => {
    const cats = Array.from(new Set(merchantItems.map((item) => item.category)));
    return ['all', ...cats];
  }, [merchantItems]);

  const displayedItems = useMemo(() => {
    if (selectedCategory === 'all') return merchantItems;
    return merchantItems.filter((item) => item.category === selectedCategory);
  }, [merchantItems, selectedCategory]);

  // Cart total for this merchant
  const merchantCartItems = cartItems.filter(
    (item) => item.merchantId === merchant.id
  );
  const cartItemCount = merchantCartItems.reduce((acc, c) => acc + c.quantity, 0);
  const cartSubtotal = merchantCartItems.reduce(
    (acc, c) => acc + c.totalPrice,
    0
  );

  const cuisineLabel =
    language === 'sw' && merchant.cuisineSw
      ? merchant.cuisineSw
      : language === 'fr' && merchant.cuisineFr
      ? merchant.cuisineFr
      : merchant.cuisine;

  return (
    <div className="fixed inset-0 z-40 bg-[#F8F7F3] dark:bg-[#171717] overflow-y-auto flex flex-col">
      {/* Hero Header Area - 200px image height */}
      <div className="relative h-52 sm:h-64 w-full bg-[#F1F0EB] dark:bg-[#303030] shrink-0">
        <img
          src={merchant.image}
          alt={merchant.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40 pointer-events-none" />

        {/* Back Button (min 44x44px target) */}
        <button
          onClick={onBack}
          aria-label="Back to merchants list"
          className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full bg-white/95 dark:bg-[#222222]/95 backdrop-blur-md flex items-center justify-center text-[#242424] dark:text-white shadow-md active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-[#242424] dark:text-white" />
        </button>

        {/* Merchant Type badge */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-[#222222]/95 border border-[#E7E4DD]/80 dark:border-[#3A3A3A] text-[#242424] dark:text-white backdrop-blur-md text-xs font-semibold shadow-xs">
          {merchant.type === 'grocery' ? (
            <>
              <Store className="w-3.5 h-3.5 text-[#FF8A00]" />
              <span>Food Grocery</span>
            </>
          ) : (
            <>
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#FF8A00]" />
              <span>Restaurant</span>
            </>
          )}
        </div>
      </div>

      {/* Merchant Title & Metadata Info Section */}
      <div className="px-4 py-4 bg-white dark:bg-[#222222] border-b border-[#E7E4DD] dark:border-[#3A3A3A] transition-colors shrink-0">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#242424] dark:text-white tracking-tight">
            {merchant.name}
          </h1>

          <p className="text-sm text-[#707070] dark:text-[#B7B7B7] mt-1">
            {cuisineLabel}
          </p>

          <p className="text-xs text-[#909090] mt-0.5">{merchant.address}</p>

          {/* Clean Unboxed Metadata Line with · Separators */}
          <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm text-[#707070] dark:text-[#B7B7B7] font-medium">
            <div className="flex items-center gap-1 text-[#242424] dark:text-white font-semibold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{merchant.rating}</span>
              <span className="text-[#909090] font-normal">
                ({merchant.ratingCount})
              </span>
            </div>

            <span aria-hidden="true" className="text-[#909090]">
              ·
            </span>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-[#909090]" />
              <span>
                {merchant.deliveryTimeMinutes} {t.delivery_time}
              </span>
            </div>

            <span aria-hidden="true" className="text-[#909090]">
              ·
            </span>

            <div className="flex items-center gap-1 font-mono tabular-nums">
              <Bike className="w-4 h-4 text-[#909090]" />
              <span>
                {merchant.deliveryFee === 0
                  ? t.free_delivery
                  : formatCurrency(merchant.deliveryFee, activeHub.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Category Sticky Navigation */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#222222]/95 backdrop-blur-md border-b border-[#E7E4DD] dark:border-[#3A3A3A] px-4 py-2 transition-colors">
        <div className="max-w-2xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {menuCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-[#FF8A00] text-white shadow-xs'
                  : 'bg-[#F1F0EB] dark:bg-[#303030] text-[#707070] dark:text-[#B7B7B7] hover:text-[#242424]'
              }`}
            >
              {cat === 'all' ? t.all_categories : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Item Cards List */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-3 pb-32">
        {displayedItems.length === 0 ? (
          <div className="py-12 text-center text-[#909090] text-sm">
            No items available in this category.
          </div>
        ) : (
          displayedItems.map((item) => {
            const displayName =
              language === 'sw' && item.nameSw
                ? item.nameSw
                : language === 'fr' && item.nameFr
                ? item.nameFr
                : item.name;

            const displayDesc =
              language === 'sw' && item.descriptionSw
                ? item.descriptionSw
                : language === 'fr' && item.descriptionFr
                ? item.descriptionFr
                : item.description;

            return (
              <div
                key={item.id}
                onClick={() => setCustomizingItem(item)}
                className="bg-white dark:bg-[#222222] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs hover:border-[#FF8A00] transition-colors cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base text-[#242424] dark:text-white group-hover:text-[#FF8A00] transition-colors">
                    {displayName}
                  </h4>
                  {item.unitSize && (
                    <span className="text-[11px] text-[#707070] dark:text-[#B7B7B7] block">
                      {item.unitSize}
                    </span>
                  )}
                  <p className="text-xs text-[#707070] dark:text-[#B7B7B7] mt-1 line-clamp-2 leading-relaxed">
                    {displayDesc}
                  </p>
                  <div className="mt-2 font-mono tabular-nums font-bold text-sm text-[#FF8A00]">
                    {formatCurrency(item.price, activeHub.currency)}
                  </div>
                </div>

                {/* Thumbnail & Add Button */}
                <div className="relative shrink-0 flex flex-col items-center">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover bg-[#F1F0EB] dark:bg-[#303030]"
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomizingItem(item);
                    }}
                    aria-label={`Add ${item.name} to cart`}
                    className="mt-1.5 min-w-[40px] h-[34px] px-3 rounded-lg bg-[#F8F7F3] dark:bg-[#303030] hover:bg-[#FF8A00] hover:text-white border border-[#E7E4DD] dark:border-[#3A3A3A] text-xs font-semibold text-[#242424] dark:text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.add}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Cart Bar (if cart has items) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#171717] dark:via-[#171717]/95">
          <div className="max-w-md mx-auto">
            <button
              onClick={onOpenCart}
              className="w-full h-[52px] rounded-xl bg-[#FF8A00] hover:bg-[#E87900] active:scale-[0.99] text-white font-semibold text-base flex items-center justify-between px-5 shadow-lg transition-all"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>
                  {cartItemCount} {t.items}
                </span>
              </div>
              <span>{t.view_cart}</span>
              <span className="font-mono tabular-nums font-bold">
                {formatCurrency(cartSubtotal, activeHub.currency)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Item Customization Sheet */}
      {customizingItem && (
        <ItemCustomizationSheet
          item={customizingItem}
          merchantName={merchant.name}
          activeHub={activeHub}
          language={language}
          onAddToCart={(item, qty, options, notes) => {
            onAddToCart(item, qty, options, notes);
            setCustomizingItem(null);
          }}
          onClose={() => setCustomizingItem(null)}
        />
      )}
    </div>
  );
};
