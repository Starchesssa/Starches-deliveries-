import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  Plus,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Merchant, MenuItem, ServiceHub, CartItem } from '../types';
import { formatCurrency } from '../data/hubs';
import { fetchMenuItemsFromFirestore } from '../services/firebase';
import { ItemCustomizationSheet } from './ItemCustomizationSheet';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton, NeuIconButton } from './neumorphic/NeuButton';

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
  const [merchantItems, setMerchantItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(true);

  // Fetch menu items from Firestore for this merchant
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMenu(true);
    fetchMenuItemsFromFirestore(merchant.id)
      .then((items) => {
        if (isMounted) {
          setMerchantItems(items);
          setIsLoadingMenu(false);
        }
      })
      .catch((err) => {
        console.warn('Could not load menu from Firestore:', err);
        if (isMounted) setIsLoadingMenu(false);
      });

    return () => {
      isMounted = false;
    };
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
    <div className="fixed inset-0 z-40 bg-[#EEF2F9] dark:bg-[#0D1117] overflow-y-auto flex flex-col transition-colors">
      {/* Hero Header Area */}
      <div className="relative h-56 sm:h-64 w-full bg-[#E5ECF6] dark:bg-[#171F2E] shrink-0">
        <img
          src={merchant.image}
          alt={merchant.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40 pointer-events-none" />

        {/* Floating Neumorphic Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <NeuIconButton
            variant="glass"
            size="md"
            onClick={onBack}
            aria-label="Back to merchants list"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A202C] dark:text-[#F0F4F8]" />
          </NeuIconButton>
        </div>

        {/* Merchant Type badge */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-glass border border-white/60 dark:border-[#232F44]/70 text-[#1A202C] dark:text-[#F0F4F8] text-xs font-semibold">
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
      </div>

      {/* Merchant Title & Metadata Info Section */}
      <div className="px-4 py-4.5 bg-[#F8FAFF] dark:bg-[#111722] border-b border-[#DCE4EF] dark:border-[#1F293D] transition-colors shrink-0">
        <div className="max-w-2xl mx-auto space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A202C] dark:text-[#F0F4F8] tracking-tight">
            {merchant.name}
          </h1>

          <p className="text-sm text-[#5A6A80] dark:text-[#8B9BB4]">
            {cuisineLabel}
          </p>

          <p className="text-xs text-[#8492A6]">{merchant.address}</p>

          {/* Metadata Row */}
          <div className="flex items-center gap-2.5 pt-2 text-xs sm:text-sm text-[#5A6A80] dark:text-[#8B9BB4] font-medium">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg neu-pressed text-[#1A202C] dark:text-[#F0F4F8] font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{merchant.rating}</span>
              <span className="text-[#8492A6] font-normal">
                ({merchant.ratingCount})
              </span>
            </div>

            <span aria-hidden="true">·</span>

            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>
                {merchant.deliveryTimeMinutes} {t.delivery_time}
              </span>
            </div>

            <span aria-hidden="true">·</span>

            <div className="flex items-center gap-1 font-mono tabular-nums font-semibold text-[#FF5A1F]">
              <Bike className="w-3.5 h-3.5" />
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
      <div className="sticky top-0 z-20 neu-glass border-b border-[#DCE4EF]/70 dark:border-[#1F293D]/70 px-4 py-2.5 transition-colors">
        <div className="max-w-2xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {menuCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'neu-button-primary'
                  : 'neu-button text-[#5A6A80] dark:text-[#8B9BB4] hover:text-[#1A202C] dark:hover:text-[#F0F4F8]'
              }`}
            >
              {cat === 'all' ? t.all_categories : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Item Cards List */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-3.5 pb-32">
        {isLoadingMenu ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#FF5A1F] animate-spin mb-2.5" />
            <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
              Loading live menu items...
            </p>
          </div>
        ) : displayedItems.length === 0 ? (
          <NeuCard elevation="flat" className="py-12 text-center p-6 text-sm text-[#5A6A80] dark:text-[#8B9BB4]">
            No items available in this category.
          </NeuCard>
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
              <NeuCard
                key={item.id}
                elevation="flat"
                clickable
                onClick={() => setCustomizingItem(item)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm sm:text-base text-[#1A202C] dark:text-[#F0F4F8] group-hover:text-[#FF5A1F] transition-colors">
                    {displayName}
                  </h4>
                  {item.unitSize && (
                    <span className="text-[11px] font-medium text-[#5A6A80] dark:text-[#8B9BB4] block">
                      {item.unitSize}
                    </span>
                  )}
                  <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-1 line-clamp-2 leading-relaxed">
                    {displayDesc}
                  </p>
                  <div className="mt-2.5 font-mono tabular-nums font-bold text-sm text-[#FF5A1F]">
                    {formatCurrency(item.price, activeHub.currency)}
                  </div>
                </div>

                {/* Thumbnail & Neumorphic Add Button */}
                <div className="relative shrink-0 flex flex-col items-center">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover neu-flat-sm"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomizingItem(item);
                    }}
                    aria-label={`Add ${item.name} to cart`}
                    className="mt-2 px-3 py-1.5 rounded-lg neu-button text-xs font-semibold text-[#1A202C] dark:text-[#F0F4F8] hover:text-[#FF5A1F] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span>{t.add}</span>
                  </button>
                </div>
              </NeuCard>
            );
          })
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4">
          <div className="max-w-md mx-auto">
            <button
              type="button"
              onClick={onOpenCart}
              className="w-full h-13 rounded-2xl neu-button-primary text-white font-bold text-sm sm:text-base flex items-center justify-between px-5 cursor-pointer"
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
