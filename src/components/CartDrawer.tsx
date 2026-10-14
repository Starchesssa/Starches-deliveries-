import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, ServiceHub } from '../types';
import { formatCurrency } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';

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
      <div className="w-full max-w-lg bg-white dark:bg-[#222222] border-t sm:border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-t-[24px] sm:rounded-[24px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E7E4DD] dark:border-[#3A3A3A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF8A00]/15 flex items-center justify-center text-[#FF8A00]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#242424] dark:text-white">
                {t.cart}
              </h3>
              <p className="text-xs text-[#707070] dark:text-[#B7B7B7]">
                {merchantName || 'Your order'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="w-9 h-9 rounded-full bg-[#F1F0EB] dark:bg-[#303030] flex items-center justify-center text-[#242424] dark:text-white hover:bg-[#E7E4DD] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-[#909090] mx-auto mb-3" />
              <h4 className="font-bold text-base text-[#242424] dark:text-white">
                {t.empty_cart}
              </h4>
              <p className="text-xs text-[#707070] dark:text-[#B7B7B7] mt-1 max-w-xs mx-auto">
                {t.empty_cart_hint}
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                {/* 72x72px Thumbnail */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-[72px] h-[72px] rounded-xl object-cover shrink-0 bg-[#E7E4DD]"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-[15px] text-[#242424] dark:text-white truncate">
                    {item.name}
                  </h4>

                  {/* Selected Customizations & Options */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="text-xs text-[#707070] dark:text-[#B7B7B7] mt-0.5 space-y-0.5">
                      {item.selectedOptions.map((opt, idx) => (
                        <div key={idx} className="truncate">
                          + {opt.optionName}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.specialInstructions && (
                    <div className="text-[11px] text-[#909090] italic truncate mt-0.5">
                      "{item.specialInstructions}"
                    </div>
                  )}

                  <div className="mt-1 font-mono tabular-nums font-bold text-sm text-[#FF8A00]">
                    {formatCurrency(item.totalPrice, activeHub.currency)}
                  </div>
                </div>

                {/* Quantity Controls & Removal */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    aria-label="Remove item"
                    className="text-[#909090] hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 bg-white dark:bg-[#222222] p-1 rounded-lg border border-[#E7E4DD] dark:border-[#3A3A3A]">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded flex items-center justify-center text-[#242424] dark:text-white hover:bg-[#F1F0EB]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-bold text-xs font-mono tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-6 h-6 rounded flex items-center justify-center text-[#242424] dark:text-white hover:bg-[#F1F0EB]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Breakdown & Proceed CTA */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-[#E7E4DD] dark:border-[#3A3A3A] bg-white dark:bg-[#222222] shrink-0 space-y-3">
            <div className="space-y-1.5 text-xs text-[#707070] dark:text-[#B7B7B7] font-medium">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-mono tabular-nums text-[#242424] dark:text-white">
                  {formatCurrency(subtotal, activeHub.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.delivery_fee}</span>
                <span className="font-mono tabular-nums text-[#242424] dark:text-white">
                  {formatCurrency(deliveryFee, activeHub.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.service_fee}</span>
                <span className="font-mono tabular-nums text-[#242424] dark:text-white">
                  {formatCurrency(serviceFee, activeHub.currency)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E7E4DD] dark:border-[#3A3A3A] text-sm font-bold text-[#242424] dark:text-white">
                <span>{t.total}</span>
                <span className="font-mono tabular-nums text-[#FF8A00]">
                  {formatCurrency(total, activeHub.currency)}
                </span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full h-[52px] rounded-xl bg-[#FF8A00] hover:bg-[#E87900] active:scale-[0.99] text-white font-semibold text-base flex items-center justify-between px-5 shadow-md transition-all"
            >
              <span>{t.checkout}</span>
              <div className="flex items-center gap-1">
                <span className="font-mono tabular-nums">
                  {formatCurrency(total, activeHub.currency)}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
