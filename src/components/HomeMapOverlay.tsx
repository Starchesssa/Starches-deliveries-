import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Merchant, ServiceHub } from '../types';
import { formatCurrency } from '../data/hubs';
import { Star, Clock, X, ChevronRight } from 'lucide-react';

interface HomeMapOverlayProps {
  activeHub: ServiceHub;
  merchants: Merchant[];
  isDarkMode: boolean;
  onSelectMerchant: (merchant: Merchant) => void;
  onClose: () => void;
}

function OverlayMapController({ isDarkMode }: { isDarkMode: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    try {
      map.setOptions({
        colorScheme: isDarkMode ? 'DARK' : 'LIGHT',
        backgroundColor: isDarkMode ? '#0D1117' : '#EEF2F9',
      });
    } catch {
      // ignore
    }
  }, [map, isDarkMode]);
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
    <div className={`relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-[#DCE4EF] dark:border-[#1F293D] my-3 shadow-md ${isDarkMode ? 'dark-map-container' : 'light-map-container'}`}>
      <Map
        key={isDarkMode ? 'dark-overlay-map' : 'light-overlay-map'}
        mapId="DEMO_MAP_ID"
        defaultCenter={activeHub.center}
        defaultZoom={13}
        disableDefaultUI={true}
        gestureHandling="greedy"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
        colorScheme={isDarkMode ? 'DARK' : 'LIGHT'}
      >
        <OverlayMapController isDarkMode={isDarkMode} />
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
              scale={activeMerchant?.id === m.id ? 1.2 : 1.0}
            />
          </AdvancedMarker>
        ))}
      </Map>

      {/* Close Map Overlay Button */}
      <button
        onClick={onClose}
        aria-label="Close Map View"
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#F8FAFF]/95 dark:bg-[#111722]/95 border border-[#DCE4EF] dark:border-[#1F293D] flex items-center justify-center text-[#1A202C] dark:text-[#F0F4F8] shadow-md hover:bg-[#E5ECF6] dark:hover:bg-[#171F2E] transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Selected Merchant Preview Card at Bottom of Map */}
      {activeMerchant && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div
            onClick={() => onSelectMerchant(activeMerchant)}
            className="bg-[#F8FAFF]/95 dark:bg-[#111722]/95 backdrop-blur-md border border-[#DCE4EF] dark:border-[#1F293D] p-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 cursor-pointer hover:border-[#FF5A1F] transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={activeMerchant.image}
                alt={activeMerchant.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-sm text-[#1A202C] dark:text-[#F0F4F8] truncate">
                  {activeMerchant.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5">
                  <span className="flex items-center gap-0.5 font-semibold text-[#1A202C] dark:text-[#F0F4F8]">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {activeMerchant.rating}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {activeMerchant.deliveryTimeMinutes}m
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(
                      activeMerchant.deliveryFee,
                      activeHub.currency
                    )}
                  </span>
                </div>
              </div>
            </div>

            <button className="px-3 py-1.5 rounded-xl bg-[#FF5A1F] text-white text-xs font-semibold shrink-0 flex items-center gap-1 shadow-xs hover:bg-[#E84D15] transition-colors cursor-pointer">
              <span>Menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
