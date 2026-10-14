import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, ServiceHub } from '../types';
import { formatCurrency } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton, NeuIconButton } from './neumorphic/NeuButton';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  merchantName: string;
  activeHub: ServiceHub;
  language: SupportedLanguage;
  deliveryFee: number;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  merchantName,
  activeHub,
  language,
  deliveryFee,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onClose,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const serviceFee = Math.round(subtotal * 0.05); // 5% platform packaging & service fee
  const total = subtotal + deliveryFee + serviceFee;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#EEF2F9] dark:bg-[#0D1117] border-t sm:border border-[#DCE4EF] dark:border-[#1F293D] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Drawer Header */}
        <div className="p-4 bg-[#F8FAFF] dark:bg-[#111722] border-b border-[#DCE4EF] dark:border-[#1F293D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-[#FF5A1F]">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A202C] dark:text-[#F0F4F8]">
                {t.cart}
              </h3>
              <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
                {merchantName || 'Your order'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 cursor-pointer"
              >
                Clear
              </button>
            )}
            <NeuIconButton
              size="sm"
              variant="secondary"
              onClick={onClose}
              aria-label="Close cart"
            >
              <X className="w-4 h-4 text-[#1A202C] dark:text-[#F0F4F8]" />
            </NeuIconButton>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-[#8492A6] mx-auto mb-3" />
              <h4 className="font-bold text-base text-[#1A202C] dark:text-[#F0F4F8]">
                {t.empty_cart}
              </h4>
              <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-1 max-w-xs mx-auto">
                {t.empty_cart_hint}
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <NeuCard
                key={item.id}
                elevation="flat"
                className="p-3.5 flex items-center justify-between gap-3"
              >
                {/* 64x64px Thumbnail */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 neu-flat-sm"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8] truncate">
                    {item.name}
                  </h5>
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <p className="text-[11px] text-[#5A6A80] dark:text-[#8B9BB4] truncate">
                      {item.selectedOptions.map((o) => o.optionName).join(', ')}
                    </p>
                  )}
                  <div className="mt-1 font-mono tabular-nums font-bold text-xs text-[#FF5A1F]">
                    {formatCurrency(item.totalPrice, activeHub.currency)}
                  </div>
                </div>

                {/* Tactile Quantity Stepper */}
                <div className="flex items-center gap-1 neu-pressed rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                    className="w-7 h-7 rounded-lg neu-button flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs font-mono tabular-nums text-[#1A202C] dark:text-[#F0F4F8]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    aria-label="Increase quantity"
                    className="w-7 h-7 rounded-lg neu-button flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </NeuCard>
            ))
          )}
        </div>

        {/* Footer Checkout Bar */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-[#F8FAFF] dark:bg-[#111722] border-t border-[#DCE4EF] dark:border-[#1F293D] space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-[#1A202C] dark:text-[#F0F4F8]">
                  {formatCurrency(subtotal, activeHub.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-mono tabular-nums text-[#1A202C] dark:text-[#F0F4F8]">
                  {formatCurrency(deliveryFee, activeHub.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee (5%)</span>
                <span className="font-mono tabular-nums text-[#1A202C] dark:text-[#F0F4F8]">
                  {formatCurrency(serviceFee, activeHub.currency)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#DCE4EF] dark:border-[#1F293D] flex justify-between text-base font-extrabold text-[#1A202C] dark:text-[#F0F4F8]">
                <span>Total</span>
                <span className="font-mono tabular-nums text-[#FF5A1F]">
                  {formatCurrency(total, activeHub.currency)}
                </span>
              </div>
            </div>

            <NeuButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={onProceedToCheckout}
              icon={<ArrowRight className="w-4 h-4 ml-auto" />}
            >
              <span className="flex items-center justify-between w-full">
                <span>{t.proceed_checkout}</span>
                <span className="font-mono tabular-nums font-extrabold">
                  {formatCurrency(total, activeHub.currency)}
                </span>
              </span>
            </NeuButton>
          </div>
        )}
      </div>
    </div>
  );
};
