import React, { useState } from 'react';
import {
  X,
  MapPin,
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import {
  CartItem,
  DeliveryLocation,
  ServiceHub,
  PaymentMethodType,
  Order,
} from '../types';
import { formatCurrency } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { createOrderInFirestore } from '../services/firebase';
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton, NeuIconButton } from './neumorphic/NeuButton';
import { NeuInput } from './neumorphic/NeuInput';

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  merchantName: string;
  merchantId: string;
  deliveryLocation: DeliveryLocation;
  activeHub: ServiceHub;
  language: SupportedLanguage;
  deliveryFee: number;
  onEditAddress: () => void;
  onPlaceOrder: (order: Order) => void;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cartItems,
  merchantName,
  merchantId,
  deliveryLocation,
  activeHub,
  language,
  deliveryFee,
  onEditAddress,
  onPlaceOrder,
  onClose,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    activeHub.supportedPayments[0] || 'cod'
  );
  const [phoneNumber, setPhoneNumber] = useState(
    activeHub.countryCode === 'TZ'
      ? '+255 754 123 456'
      : activeHub.countryCode === 'ZM'
      ? '+260 977 123 456'
      : '+33 6 12 34 56 78'
  );
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUssdPrompt, setShowUssdPrompt] = useState(false);
  const [ussdPin, setUssdPin] = useState('');
  const [ussdError, setUssdError] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + serviceFee;

  const handleStartOrder = () => {
    if (!phoneNumber.trim()) {
      alert('Please enter your recipient phone number.');
      return;
    }

    if (['mpesa', 'airtel_money', 'tigopesa', 'mtn_money'].includes(paymentMethod)) {
      setShowUssdPrompt(true);
      return;
    }

    completeOrderSubmission('pending');
  };

  const completeOrderSubmission = async (paymentStatus: 'pending' | 'authorized' | 'paid') => {
    setIsSubmitting(true);

    const orderRef = `STA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      referenceNumber: orderRef,
      merchantId,
      merchantName,
      merchantType: 'restaurant',
      hubId: activeHub.id,
      currency: activeHub.currency,
      items: [...cartItems],
      subtotal,
      deliveryFee,
      serviceFee,
      total,
      paymentMethod,
      paymentStatus,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      deliveryLocation: {
        ...deliveryLocation,
        deliveryNotes,
      },
      recipientPhone: phoneNumber,
      rider: {
        name: 'Juma Bakari',
        phone: '+255 712 998 877',
        vehicle: 'TVS Star HLX (Box T 412 DKS)',
        currentLat: deliveryLocation.lat - 0.005,
        currentLng: deliveryLocation.lng - 0.005,
      },
      estimatedDeliveryMinutes: 28,
    };

    // Save order in Firestore!
    try {
      await createOrderInFirestore(newOrder);
    } catch (err) {
      console.warn('Notice saving order to Firestore:', err);
    }

    setIsSubmitting(false);
    setShowUssdPrompt(false);
    onPlaceOrder(newOrder);
  };

  const handleConfirmUssd = (e: React.FormEvent) => {
    e.preventDefault();
    if (ussdPin.length < 4) {
      setUssdError('Please enter a 4-digit PIN');
      return;
    }
    setUssdError('');
    completeOrderSubmission('paid');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#EEF2F9] dark:bg-[#0D1117] border-t sm:border border-[#DCE4EF] dark:border-[#1F293D] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Header */}
        <div className="p-4 bg-[#F8FAFF] dark:bg-[#111722] border-b border-[#DCE4EF] dark:border-[#1F293D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <NeuIconButton
              size="sm"
              variant="secondary"
              onClick={onClose}
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-[#1A202C] dark:text-[#F0F4F8]" />
            </NeuIconButton>
            <h3 className="font-extrabold text-base sm:text-lg text-[#1A202C] dark:text-[#F0F4F8]">
              {t.checkout}
            </h3>
          </div>
          <NeuIconButton
            size="sm"
            variant="secondary"
            onClick={onClose}
            aria-label="Close checkout"
          >
            <X className="w-4 h-4 text-[#1A202C] dark:text-[#F0F4F8]" />
          </NeuIconButton>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {/* Section 1: Delivery Address */}
          <NeuCard elevation="flat" className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5A6A80] dark:text-[#8B9BB4] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Delivery Address</span>
              </span>
              <button
                type="button"
                onClick={onEditAddress}
                className="text-xs font-bold text-[#FF5A1F] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
            <div className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
              {deliveryLocation.address}
            </div>
            <div className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5">
              {deliveryLocation.city}, {deliveryLocation.country}
            </div>
          </NeuCard>

          {/* Section 2: Order Items Summary */}
          <NeuCard elevation="flat" className="p-4">
            <div className="text-xs font-semibold text-[#5A6A80] dark:text-[#8B9BB4] mb-2.5">
              Ordering from: <span className="text-[#1A202C] dark:text-[#F0F4F8] font-bold">{merchantName}</span>
            </div>
            <div className="space-y-2 divide-y divide-[#DCE4EF]/60 dark:divide-[#1F293D]/60">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-2 flex justify-between text-xs">
                  <span className="text-[#1A202C] dark:text-[#F0F4F8] font-medium">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-mono tabular-nums text-[#5A6A80] dark:text-[#8B9BB4] font-semibold">
                    {formatCurrency(item.totalPrice, activeHub.currency)}
                  </span>
                </div>
              ))}
            </div>
          </NeuCard>

          {/* Section 3: Delivery Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5A6A80] dark:text-[#8B9BB4] block">
              {t.delivery_instructions}
            </label>
            <NeuInput
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder={t.delivery_notes_placeholder}
            />
          </div>

          {/* Section 4: Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5A6A80] dark:text-[#8B9BB4] block">
              {t.phone_number_label}
            </label>
            <NeuInput
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t.phone_placeholder}
              className="font-mono tabular-nums"
              required
            />
          </div>

          {/* Section 5: Payment Methods Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#5A6A80] dark:text-[#8B9BB4] block">
              {t.payment_method}
            </label>

            <div className="space-y-2.5">
              {/* Cash on Delivery */}
              {activeHub.supportedPayments.includes('cod') && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'neu-pressed border border-[#FF5A1F]'
                      : 'neu-button text-[#1A202C] dark:text-[#F0F4F8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A202C] dark:text-[#F0F4F8]">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
                        Pay driver cash upon arrival
                      </p>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && (
                    <CheckCircle2 className="w-5 h-5 text-[#FF5A1F]" />
                  )}
                </button>
              )}

              {/* Mobile Money Options */}
              {['mpesa', 'airtel_money', 'tigopesa', 'mtn_money'].map((method) => {
                if (!activeHub.supportedPayments.includes(method as PaymentMethodType)) {
                  return null;
                }
                const label =
                  method === 'mpesa'
                    ? 'M-Pesa (Vodacom)'
                    : method === 'airtel_money'
                    ? 'Airtel Money'
                    : method === 'tigopesa'
                    ? 'Tigo Pesa (Mixx)'
                    : 'MTN Mobile Money';

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method as PaymentMethodType)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                      paymentMethod === method
                        ? 'neu-pressed border border-[#FF5A1F]'
                        : 'neu-button text-[#1A202C] dark:text-[#F0F4F8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FF5A1F]/15 flex items-center justify-center text-[#FF5A1F] shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1A202C] dark:text-[#F0F4F8]">
                          {label}
                        </p>
                        <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
                          Instant USSD PIN push
                        </p>
                      </div>
                    </div>
                    {paymentMethod === method && (
                      <CheckCircle2 className="w-5 h-5 text-[#FF5A1F]" />
                    )}
                  </button>
                );
              })}

              {/* Card Payment */}
              {activeHub.supportedPayments.includes('card') && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'neu-pressed border border-[#FF5A1F]'
                      : 'neu-button text-[#1A202C] dark:text-[#F0F4F8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A202C] dark:text-[#F0F4F8]">
                        Credit / Debit Card
                      </p>
                      <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
                        Visa, Mastercard, AMEX
                      </p>
                    </div>
                  </div>
                  {paymentMethod === 'card' && (
                    <CheckCircle2 className="w-5 h-5 text-[#FF5A1F]" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Section 6: Cost Summary */}
          <NeuCard elevation="flat" className="p-4 space-y-2">
            <div className="flex justify-between text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums text-[#1A202C] dark:text-[#F0F4F8]">
                {formatCurrency(subtotal, activeHub.currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
              <span>Delivery Fee</span>
              <span className="font-mono tabular-nums text-[#1A202C] dark:text-[#F0F4F8]">
                {formatCurrency(deliveryFee, activeHub.currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
              <span>Service Fee</span>
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
          </NeuCard>
        </div>

        {/* Footer Place Order Button */}
        <div className="p-4 bg-[#F8FAFF] dark:bg-[#111722] border-t border-[#DCE4EF] dark:border-[#1F293D] shrink-0">
          <NeuButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStartOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Firestore Order...</span>
              </span>
            ) : (
              <span className="flex items-center justify-between w-full">
                <span>Place Starches Order</span>
                <span className="font-mono tabular-nums font-extrabold">
                  {formatCurrency(total, activeHub.currency)}
                </span>
              </span>
            )}
          </NeuButton>
        </div>
      </div>

      {/* Mobile Money USSD Prompt Modal */}
      {showUssdPrompt && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <NeuCard elevation="flat" className="max-w-xs w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F]/15 text-[#FF5A1F] mx-auto flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-base text-[#1A202C] dark:text-[#F0F4F8]">
                Authorize Payment
              </h4>
              <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-1">
                Enter your 4-digit mobile money PIN to confirm {formatCurrency(total, activeHub.currency)}
              </p>
            </div>

            <form onSubmit={handleConfirmUssd} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                value={ussdPin}
                onChange={(e) => setUssdPin(e.target.value)}
                placeholder="••••"
                className="w-32 mx-auto text-center font-mono text-2xl tracking-widest h-12 rounded-xl neu-pressed text-[#1A202C] dark:text-[#F0F4F8] outline-none"
                autoFocus
              />
              {ussdError && (
                <p className="text-xs text-red-500 font-semibold">{ussdError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <NeuButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  type="button"
                  onClick={() => setShowUssdPrompt(false)}
                >
                  Cancel
                </NeuButton>
                <NeuButton
                  variant="primary"
                  size="md"
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verifying...' : 'Pay Now'}
                </NeuButton>
              </div>
            </form>
          </NeuCard>
        </div>
      )}
    </div>
  );
};
