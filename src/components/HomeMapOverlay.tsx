import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Merchant, ServiceHub } from '../types';
import { formatCurrency } from '../data/hubs';
import { LIGHT_MAP_STYLES, DARK_MAP_STYLES } from '../utils/mapStyles';
import { NeuCard } from './neumorphic/NeuCard';
import { NeuIconButton } from './neumorphic/NeuButton';
import { Star, Clock, X, ChevronRight } from 'lucide-react';

interface HomeMapOverlayProps {
  activeHub: ServiceHub;
  merchants: Merchant[];
  isDarkMode: boolean;
  onSelectMerchant: (merchant: Merchant) => void;
  onClose: () => void;
}

function OverlayMapController({
  isDarkMode,
  activeCenter,
}: {
  isDarkMode: boolean;
  activeCenter: { lat: number; lng: number };
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    try {
      map.setOptions({
        styles: isDarkMode ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
        backgroundColor: isDarkMode ? '#0D1117' : '#EEF2F9',
      });
    } catch {
      // ignore
    }
  }, [map, isDarkMode]);

  useEffect(() => {
    if (map && activeCenter) {
      map.panTo(activeCenter);
    }
  }, [map, activeCenter]);

  return null;
}

export const HomeMapOverlay: React.FC<HomeMapOverlayProps> = ({
  activeHub,
  merchants,
  isDarkMode,
  onSelectMerchant,
  onClose,
}) => {
  const [activeMerchant, setActiveMerchant] = useState<Merchant | null>(
    merchants[0] || null
  );

  return (
    <NeuCard
      elevation="flat"
      className={`relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden my-3 ${
        isDarkMode ? 'dark-map-container' : 'light-map-container'
      }`}
    >
      <Map
        key={isDarkMode ? 'dark-fast-overlay-map' : 'light-fast-overlay-map'}
        defaultCenter={activeHub.center}
        defaultZoom={13}
        disableDefaultUI={true}
        gestureHandling="greedy"
        reuseMaps={true}
        styles={isDarkMode ? DARK_MAP_STYLES : LIGHT_MAP_STYLES}
        className="w-full h-full"
      >
        <OverlayMapController
          isDarkMode={isDarkMode}
          activeCenter={
            activeMerchant
              ? { lat: activeMerchant.lat, lng: activeMerchant.lng }
              : activeHub.center
          }
        />
        {merchants.map((m) => (
          <AdvancedMarker
            key={m.id}
            position={{ lat: m.lat, lng: m.lng }}
            onClick={() => setActiveMerchant(m)}
          >
            <Pin
              background="#FF5A1F"
              glyphColor="#FFFFFF"
              borderColor="#E04812"
              scale={activeMerchant?.id === m.id ? 1.25 : 1.0}
            />
          </AdvancedMarker>
        ))}
      </Map>

      {/* Floating Neumorphic Close Button */}
      <div className="absolute top-3 right-3 z-10">
        <NeuIconButton
          variant="glass"
          size="sm"
          onClick={onClose}
          aria-label="Close Map View"
        >
          <X className="w-4 h-4 text-[#1A202C] dark:text-[#F0F4F8]" />
        </NeuIconButton>
      </div>

      {/* Selected Merchant Preview Card at Bottom of Map with Glassmorphism */}
      {activeMerchant && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <NeuCard
            elevation="glass"
            clickable
            onClick={() => onSelectMerchant(activeMerchant)}
            className="p-3.5 flex items-center justify-between gap-3 border border-white/60 dark:border-[#232F44]/70"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activeMerchant.image}
                alt={activeMerchant.name}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-xl object-cover shrink-0 neu-flat-sm"
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-sm text-[#1A202C] dark:text-[#F0F4F8] truncate">
                  {activeMerchant.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5">
                  <span className="flex items-center gap-0.5 font-semibold text-[#1A202C] dark:text-[#F0F4F8]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {activeMerchant.rating}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {activeMerchant.deliveryTimeMinutes}m
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums font-medium text-[#FF5A1F]">
                    {formatCurrency(
                      activeMerchant.deliveryFee,
                      activeHub.currency
                    )}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-2 rounded-xl neu-button-primary text-xs font-semibold shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </NeuCard>
        </div>
      )}
    </NeuCard>
  );
};
