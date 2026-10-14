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
import { LIGHT_MAP_STYLES, DARK_MAP_STYLES } from '../utils/mapStyles';
import { subscribeToOrder } from '../services/firebase';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton, NeuIconButton } from './neumorphic/NeuButton';

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

  // Live order progress synced from Firestore
  const [liveOrder, setLiveOrder] = useState<Order>(order);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [etaMinutes, setEtaMinutes] = useState(order.estimatedDeliveryMinutes);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToOrder(order.id, (updated) => {
      if (updated) {
        setLiveOrder(updated);
        setCurrentStatus(updated.status);
        if (updated.estimatedDeliveryMinutes) {
          setEtaMinutes(updated.estimatedDeliveryMinutes);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [order.id]);

  // Demo progress simulation
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentStatus('accepted');
    }, 4000);
    const timer2 = setTimeout(() => {
      setCurrentStatus('preparing');
      setEtaMinutes((m) => Math.max(1, m - 5));
    }, 10000);
    const timer3 = setTimeout(() => {
      setCurrentStatus('rider_assigned');
      setEtaMinutes((m) => Math.max(1, m - 5));
    }, 18000);
    const timer4 = setTimeout(() => {
      setCurrentStatus('out_for_delivery');
      setEtaMinutes((m) => Math.max(1, m - 5));
    }, 28000);

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
      <header className="sticky top-0 z-20 h-15 neu-glass border-b border-[#DCE4EF]/70 dark:border-[#1F293D]/70 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-xl neu-button-primary flex items-center justify-center text-white font-black text-sm">
            S
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
              {t.order_status}
            </h3>
            <span className="text-[11px] font-mono text-[#5A6A80] dark:text-[#8B9BB4]">
              Ref: #{liveOrder.referenceNumber}
            </span>
          </div>
        </div>

        <NeuIconButton
          size="sm"
          variant="secondary"
          onClick={onClose}
          aria-label="Close tracking"
        >
          <X className="w-4 h-4 text-[#1A202C] dark:text-[#F0F4F8]" />
        </NeuIconButton>
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full p-4 space-y-4 pb-20">
        {/* Estimated Time & Status Card with Soft-UI Elevation */}
        <NeuCard elevation="flat" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] font-semibold block">
                Estimated Arrival
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#1A202C] dark:text-[#F0F4F8] mt-0.5">
                {currentStatus === 'delivered' ? 'Delivered' : `${etaMinutes} mins`}
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl neu-pressed flex items-center justify-center text-[#FF5A1F]">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-3.5 pt-3.5 border-t border-[#DCE4EF]/60 dark:border-[#1F293D]/60 flex items-center justify-between text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
            <span>
              Merchant: <strong className="text-[#1A202C] dark:text-[#F0F4F8] font-bold">{liveOrder.merchantName}</strong>
            </span>
            <span className="font-mono tabular-nums font-extrabold text-[#FF5A1F]">
              {formatCurrency(liveOrder.total, liveOrder.currency)}
            </span>
          </div>
        </NeuCard>

        {/* Live Delivery Route Mini Map (Fast bolt styled, zero lag) */}
        <NeuCard elevation="flat" className="h-48 w-full overflow-hidden relative">
          <Map
            defaultCenter={{
              lat: liveOrder.deliveryLocation.lat,
              lng: liveOrder.deliveryLocation.lng,
            }}
            defaultZoom={14}
            disableDefaultUI={true}
            reuseMaps={true}
            styles={isDarkMode ? DARK_MAP_STYLES : LIGHT_MAP_STYLES}
            className="w-full h-full"
          >
            <AdvancedMarker
              position={{
                lat: liveOrder.deliveryLocation.lat,
                lng: liveOrder.deliveryLocation.lng,
              }}
            >
              <Pin background="#FF5A1F" glyphColor="#FFFFFF" borderColor="#E04812" />
            </AdvancedMarker>
          </Map>
        </NeuCard>

        {/* Order Status Timeline with Tactile Steps */}
        <NeuCard elevation="flat" className="p-5">
          <h4 className="font-extrabold text-sm mb-4 text-[#1A202C] dark:text-[#F0F4F8]">
            Order Progress
          </h4>
          <div className="space-y-4">
            {TIMELINE_STAGES.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={stage.status} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                      isPast || isCurrent
                        ? 'neu-button-primary text-white'
                        : 'neu-pressed text-[#5A6A80] dark:text-[#8B9BB4]'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-[#FF5A1F]'
                          : isPast
                          ? 'text-[#1A202C] dark:text-[#F0F4F8]'
                          : 'text-[#5A6A80] dark:text-[#8B9BB4]'
                      }`}
                    >
                      {t[stage.labelKey as keyof typeof t] || stage.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </NeuCard>

        {/* Rider Contact Card */}
        {liveOrder.rider && (
          <NeuCard elevation="flat" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl neu-pressed flex items-center justify-center text-[#FF5A1F] shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
                  {liveOrder.rider.name}
                </h5>
                <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
                  {liveOrder.rider.vehicle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${liveOrder.rider.phone}`}
                className="w-9 h-9 rounded-xl neu-button flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] hover:text-[#FF5A1F]"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`sms:${liveOrder.rider.phone}`}
                className="w-9 h-9 rounded-xl neu-button flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] hover:text-[#FF5A1F]"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </NeuCard>
        )}
      </div>
    </div>
  );
};
