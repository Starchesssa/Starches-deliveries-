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

    // If mobile money is chosen, simulate the USSD push notification first
    if (['mpesa', 'airtel_money', 'tigopesa', 'mtn_money'].includes(paymentMethod)) {
      setShowUssdPrompt(true);
      return;
    }

    // COD or Card
    completeOrderSubmission('pending');
  };

  const completeOrderSubmission = (paymentStatus: 'pending' | 'authorized' | 'paid') => {
    setIsSubmitting(true);

    setTimeout(() => {
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

      setIsSubmitting(false);
      setShowUssdPrompt(false);
      onPlaceOrder(newOrder);
    }, 1200);
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
      <div className="w-full max-w-lg bg-white dark:bg-[#222222] border-t sm:border border-[#E7E4DD] dark:border-[#3A3A3A] rounded-t-[24px] sm:rounded-[24px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-[#E7E4DD] dark:border-[#3A3A3A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#707070] dark:text-[#B7B7B7] hover:bg-[#F1F0EB]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-base sm:text-lg text-[#242424] dark:text-white">
              {t.checkout}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="w-8 h-8 rounded-full bg-[#F1F0EB] dark:bg-[#303030] flex items-center justify-center text-[#242424] dark:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
          {/* Section 1: Delivery Address */}
          <div className="p-3.5 rounded-2xl bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#707070] dark:text-[#B7B7B7] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>Delivery Address</span>
              </span>
              <button
                onClick={onEditAddress}
                className="text-xs font-semibold text-[#FF8A00] hover:underline"
              >
                Change
              </button>
            </div>
            <div className="font-semibold text-sm text-[#242424] dark:text-white">
              {deliveryLocation.address}
            </div>
            <div className="text-xs text-[#707070] dark:text-[#B7B7B7] mt-0.5">
              {deliveryLocation.city}, {deliveryLocation.country}
            </div>
          </div>

          {/* Section 2: Order Items Summary */}
          <div className="p-3.5 rounded-2xl bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A]">
            <div className="text-xs font-semibold text-[#707070] dark:text-[#B7B7B7] mb-2">
              Ordering from: <span className="text-[#242424] dark:text-white font-bold">{merchantName}</span>
            </div>
            <div className="space-y-1.5 divide-y divide-[#E7E4DD] dark:divide-[#3A3A3A]">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-1.5 flex justify-between text-xs">
                  <span className="text-[#242424] dark:text-white">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-mono tabular-nums text-[#707070] dark:text-[#B7B7B7]">
                    {formatCurrency(item.totalPrice, activeHub.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Delivery Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#707070] dark:text-[#B7B7B7]">
              {t.delivery_instructions}
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder={t.delivery_notes_placeholder}
              className="w-full h-11 px-3 text-sm rounded-xl bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A] text-[#242424] dark:text-white outline-none focus:border-[#FF8A00]"
            />
          </div>

          {/* Section 4: Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#707070] dark:text-[#B7B7B7]">
              {t.phone_number_label}
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t.phone_placeholder}
              className="w-full h-11 px-3 text-sm rounded-xl bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A] text-[#242424] dark:text-white outline-none focus:border-[#FF8A00] font-mono tabular-nums"
              required
            />
          </div>

          {/* Section 5: Payment Methods Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#707070] dark:text-[#B7B7B7] block">
              {t.payment_method}
            </label>

            <div className="space-y-2">
              {/* Cash on Delivery */}
              {activeHub.supportedPayments.includes('cod') && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#FF8A00] bg-[#FF8A00]/5 dark:bg-[#FF8A00]/10 shadow-xs'
                      : 'border-[#E7E4DD] dark:border-[#3A3A3A] bg-[#F8F7F3] dark:bg-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#242424] dark:text-white">
                        {t.cash_on_delivery}
                      </div>
                      <div className="text-xs text-[#707070] dark:text-[#B7B7B7]">
                        {t.cash_on_delivery_desc}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'cod'
                        ? 'border-[#FF8A00] bg-[#FF8A00] text-white'
                        : 'border-[#909090]'
                    }`}
                  >
                    {paymentMethod === 'cod' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              )}

              {/* Vodacom M-Pesa (Tanzania) */}
              {activeHub.supportedPayments.includes('mpesa') && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-[#FF8A00] bg-[#FF8A00]/5 dark:bg-[#FF8A00]/10 shadow-xs'
                      : 'border-[#E7E4DD] dark:border-[#3A3A3A] bg-[#F8F7F3] dark:bg-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 shrink-0 font-bold text-xs">
                      M
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#242424] dark:text-white">
                        {t.mpesa_label}
                      </div>
                      <div className="text-xs text-[#707070] dark:text-[#B7B7B7]">
                        Vodacom USSD push payment
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'mpesa'
                        ? 'border-[#FF8A00] bg-[#FF8A00] text-white'
                        : 'border-[#909090]'
                    }`}
                  >
                    {paymentMethod === 'mpesa' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              )}

              {/* Airtel Money (Tanzania / Zambia) */}
              {activeHub.supportedPayments.includes('airtel_money') && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('airtel_money')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'airtel_money'
                      ? 'border-[#FF8A00] bg-[#FF8A00]/5 dark:bg-[#FF8A00]/10 shadow-xs'
                      : 'border-[#E7E4DD] dark:border-[#3A3A3A] bg-[#F8F7F3] dark:bg-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 shrink-0 font-bold text-xs">
                      A
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#242424] dark:text-white">
                        {t.airtel_label}
                      </div>
                      <div className="text-xs text-[#707070] dark:text-[#B7B7B7]">
                        Airtel push authorization
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'airtel_money'
                        ? 'border-[#FF8A00] bg-[#FF8A00] text-white'
                        : 'border-[#909090]'
                    }`}
                  >
                    {paymentMethod === 'airtel_money' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              )}

              {/* MTN Mobile Money (Zambia) */}
              {activeHub.supportedPayments.includes('mtn_money') && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mtn_money')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'mtn_money'
                      ? 'border-[#FF8A00] bg-[#FF8A00]/5 dark:bg-[#FF8A00]/10 shadow-xs'
                      : 'border-[#E7E4DD] dark:border-[#3A3A3A] bg-[#F8F7F3] dark:bg-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-yellow-100 dark:bg-yellow-950/60 flex items-center justify-center text-yellow-600 shrink-0 font-bold text-xs">
                      MTN
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#242424] dark:text-white">
                        {t.mtn_label}
                      </div>
                      <div className="text-xs text-[#707070] dark:text-[#B7B7B7]">
                        MTN MoMo push notification
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'mtn_money'
                        ? 'border-[#FF8A00] bg-[#FF8A00] text-white'
                        : 'border-[#909090]'
                    }`}
                  >
                    {paymentMethod === 'mtn_money' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              )}

              {/* Card Payment (France / UK) */}
              {activeHub.supportedPayments.includes('card') && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#FF8A00] bg-[#FF8A00]/5 dark:bg-[#FF8A00]/10 shadow-xs'
                      : 'border-[#E7E4DD] dark:border-[#3A3A3A] bg-[#F8F7F3] dark:bg-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#242424] dark:text-white">
                        {t.card_payment}
                      </div>
                      <div className="text-xs text-[#707070] dark:text-[#B7B7B7]">
                        Visa, Mastercard, Apple Pay
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'card'
                        ? 'border-[#FF8A00] bg-[#FF8A00] text-white'
                        : 'border-[#909090]'
                    }`}
                  >
                    {paymentMethod === 'card' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Section 6: Fees Breakdown */}
          <div className="p-3.5 rounded-2xl bg-[#F8F7F3] dark:bg-[#171717] border border-[#E7E4DD] dark:border-[#3A3A3A] space-y-1.5 text-xs text-[#707070] dark:text-[#B7B7B7] font-medium">
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
        </div>

        {/* Action Button: Full-Width 52px Primary Orange Button */}
        <div className="p-4 border-t border-[#E7E4DD] dark:border-[#3A3A3A] bg-white dark:bg-[#222222] shrink-0">
          <button
            onClick={handleStartOrder}
            disabled={isSubmitting}
            className="w-full h-[52px] rounded-xl bg-[#FF8A00] hover:bg-[#E87900] active:scale-[0.99] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>{t.place_order}</span>
                <span className="font-mono tabular-nums">
                  · {formatCurrency(total, activeHub.currency)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Realistic Mobile Money USSD Push Prompt Modal */}
      {showUssdPrompt && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-[#E7E4DD] dark:border-neutral-700 text-[#242424] dark:text-white rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Smartphone className="w-4 h-4" />
              <span>USSD Push Notification</span>
            </div>

            <h4 className="font-bold text-base mb-1 text-[#242424] dark:text-white">
              Confirm Payment to STARCHES
            </h4>
            <p className="text-xs text-[#707070] dark:text-neutral-300 leading-relaxed mb-4">
              Authorize payment of{' '}
              <strong className="text-[#FF8A00] dark:text-amber-400 font-mono">
                {formatCurrency(total, activeHub.currency)}
              </strong>{' '}
              for delivery order from {merchantName}.
            </p>

            <form onSubmit={handleConfirmUssd} className="space-y-4">
              <div>
                <label className="text-[11px] text-[#707070] dark:text-neutral-400 block mb-1">
                  Enter your Mobile Money 4-digit PIN:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={ussdPin}
                  onChange={(e) => setUssdPin(e.target.value)}
                  placeholder="••••"
                  className="w-full h-11 text-center font-mono text-lg tracking-widest bg-[#F8F7F3] dark:bg-neutral-800 border border-[#E7E4DD] dark:border-neutral-700 rounded-xl outline-none focus:border-[#FF8A00] text-[#242424] dark:text-white"
                />
                {ussdError && (
                  <p className="text-xs text-red-500 mt-1">{ussdError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUssdPrompt(false)}
                  className="flex-1 h-10 rounded-xl bg-[#F1F0EB] dark:bg-neutral-800 hover:bg-[#E5E2DC] dark:hover:bg-neutral-700 text-[#707070] dark:text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-xl bg-[#FF8A00] hover:bg-[#E87900] text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm PIN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
