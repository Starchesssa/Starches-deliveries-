import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Bike,
  Phone,
  MessageSquare,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatCurrency } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface OrderTrackingModalProps {
  order: Order;
  language: SupportedLanguage;
  isDarkMode: boolean;
  onClose: () => void;
}

const TIMELINE_STAGES: { status: OrderStatus; labelKey: string }[] = [
  { status: 'submitted', labelKey: 'status_submitted' },
  { status: 'accepted', labelKey: 'status_accepted' },
  { status: 'preparing', labelKey: 'status_preparing' },
  { status: 'rider_assigned', labelKey: 'status_rider_assigned' },
  { status: 'out_for_delivery', labelKey: 'status_out_for_delivery' },
  { status: 'delivered', labelKey: 'status_delivered' },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  language,
  isDarkMode,
  onClose,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyAJSRi8e3Skf5VJYDwN7Efn7XJW97nm8ys';

  // Live order progress advancement simulation
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [etaMinutes, setEtaMinutes] = useState(order.estimatedDeliveryMinutes);

  useEffect(() => {
    // Advance status over time for demonstration
    const timer1 = setTimeout(() => {
      setCurrentStatus('accepted');
    }, 4000);
    const timer2 = setTimeout(() => {
      setCurrentStatus('preparing');
      setEtaMinutes((m) => Math.max(1, m - 5));
    }, 9000);
    const timer3 = setTimeout(() => {
      setCurrentStatus('rider_assigned');
      setEtaMinutes((m) => Math.max(1, m - 5));
    }, 15000);
    const timer4 = setTimeout(() => {
      setCurrentStatus('out_for_delivery');
      setEtaMinutes((m) => Math.max(1, m - 5));
    }, 22000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const currentIndex = TIMELINE_STAGES.findIndex(
    (s) => s.status === currentStatus
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#EEF2F9] dark:bg-[#0D1117] overflow-y-auto flex flex-col text-[#1A202C] dark:text-[#F0F4F8]">
      {/* Header */}
      <header className="sticky top-0 z-20 h-14 bg-[#F8FAFF]/95 dark:bg-[#111722]/95 backdrop-blur-md border-b border-[#DCE4EF] dark:border-[#1F293D] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF5A1F] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            S
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
              {t.order_status}
            </h3>
            <span className="text-[11px] font-mono text-[#5A6A80] dark:text-[#8B9BB4]">
              Ref: #{order.referenceNumber}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close tracking"
          className="w-9 h-9 rounded-full bg-[#E5ECF6] dark:bg-[#171F2E] flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] hover:bg-[#DCE4EF] dark:hover:bg-[#1F293D] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full p-4 space-y-4 pb-20">
        {/* Estimated Time & Status Card */}
        <div className="bg-[#F8FAFF] dark:bg-[#111722] border border-[#DCE4EF] dark:border-[#1F293D] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] font-medium block">
                Estimated Arrival
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#1A202C] dark:text-[#F0F4F8] mt-0.5">
                {currentStatus === 'delivered' ? 'Delivered' : `${etaMinutes} mins`}
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#FF5A1F]/15 flex items-center justify-center text-[#FF5A1F]">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#DCE4EF] dark:border-[#1F293D] flex items-center justify-between text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
            <span>Merchant: <strong className="text-[#1A202C] dark:text-[#F0F4F8]">{order.merchantName}</strong></span>
            <span className="font-mono tabular-nums font-bold text-[#FF5A1F]">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>
        </div>

        {/* Live Delivery Route Mini Map */}
        <div className="h-48 w-full rounded-2xl overflow-hidden border border-[#DCE4EF] dark:border-[#1F293D] shadow-xs relative">
          <Map
            defaultCenter={{
              lat: order.deliveryLocation.lat,
              lng: order.deliveryLocation.lng,
            }}
            defaultZoom={14}
            disableDefaultUI={true}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
            colorScheme={isDarkMode ? 'DARK' : 'LIGHT'}
          >
            {/* Delivery Pin */}
            <AdvancedMarker
              position={{
                lat: order.deliveryLocation.lat,
                lng: order.deliveryLocation.lng,
              }}
            >
              <Pin background="#FF5A1F" glyphColor="#FFFFFF" />
            </AdvancedMarker>

            {/* Courier Rider Pin */}
            {order.rider && (
              <AdvancedMarker
                position={{
                  lat: order.rider.currentLat,
                  lng: order.rider.currentLng,
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#FF5A1F] border-2 border-white flex items-center justify-center text-white shadow-md">
                  <Bike className="w-4 h-4 text-white" />
                </div>
              </AdvancedMarker>
            )}
          </Map>
        </div>

        {/* Vertical Status Timeline (Section 9) */}
        <div className="bg-[#F8FAFF] dark:bg-[#111722] border border-[#DCE4EF] dark:border-[#1F293D] rounded-2xl p-5 shadow-xs">
          <h4 className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8] mb-4">
            Live Order Timeline
          </h4>

          <div className="relative pl-6 space-y-5">
            {/* Vertical Track Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#DCE4EF] dark:bg-[#1F293D]" />

            {TIMELINE_STAGES.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              const stageLabel = t[stage.labelKey] || stage.status;

              return (
                <div key={stage.status} className="relative flex items-start gap-3">
                  {/* Step Node Dot */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isPast
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-[#FF5A1F] text-white ring-4 ring-[#FF5A1F]/20'
                        : 'bg-[#E5ECF6] dark:bg-[#171F2E] text-[#8492A6]'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-[#FF5A1F]'
                          : isPast
                          ? 'text-[#1A202C] dark:text-[#F0F4F8]'
                          : 'text-[#8492A6]'
                      }`}
                    >
                      {stageLabel}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5">
                        In progress · Our team is actively updating this step.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Rider Info Card */}
        {order.rider && (
          <div className="bg-[#F8FAFF] dark:bg-[#111722] border border-[#DCE4EF] dark:border-[#1F293D] rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E5ECF6] dark:bg-[#171F2E] flex items-center justify-center text-xl shrink-0">
                🛵
              </div>
              <div>
                <div className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
                  {order.rider.name}
                </div>
                <div className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
                  {order.rider.vehicle}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Verified Starches Rider
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${order.rider.phone}`}
                className="w-10 h-10 rounded-xl bg-[#EEF2F9] dark:bg-[#171F2E] border border-[#DCE4EF] dark:border-[#1F293D] flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] hover:text-[#FF5A1F] transition-colors"
                title="Call Rider"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => alert(`Messaging rider: ${order.rider?.phone}`)}
                className="w-10 h-10 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center hover:bg-[#E84D15] transition-colors cursor-pointer"
                title="Chat with Rider"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Order Details Recap */}
        <div className="bg-[#F8FAFF] dark:bg-[#111722] border border-[#DCE4EF] dark:border-[#1F293D] rounded-2xl p-4 shadow-xs space-y-2 text-xs">
          <h4 className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8] mb-2">
            Order Items
          </h4>
          <div className="divide-y divide-[#DCE4EF] dark:divide-[#1F293D]">
            {order.items.map((it) => (
              <div key={it.id} className="py-1.5 flex justify-between">
                <span>
                  {it.quantity}x {it.name}
                </span>
                <span className="font-mono tabular-nums font-semibold">
                  {formatCurrency(it.totalPrice, order.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#DCE4EF] dark:border-[#1F293D] space-y-1 text-[#5A6A80] dark:text-[#8B9BB4]">
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(order.deliveryFee, order.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="capitalize font-semibold text-[#1A202C] dark:text-[#F0F4F8]">
                {order.paymentMethod.replace('_', ' ')} ({order.paymentStatus})
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8] pt-1">
              <span>Total Paid:</span>
              <span className="font-mono tabular-nums text-[#FF5A1F]">
                {formatCurrency(order.total, order.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
