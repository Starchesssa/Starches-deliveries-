import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Map,
  MapCameraChangedEvent,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Search,
  Navigation,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Home,
  Briefcase,
  Bookmark,
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { DeliveryLocation, ServiceHub } from '../types';
import { SERVICE_HUBS, detectServiceHub } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { LIGHT_MAP_STYLES, DARK_MAP_STYLES } from '../utils/mapStyles';
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton, NeuIconButton } from './neumorphic/NeuButton';

interface MapLocationPickerProps {
  initialLocation?: DeliveryLocation | null;
  savedAddresses?: DeliveryLocation[];
  onConfirmLocation: (location: DeliveryLocation) => void;
  language: SupportedLanguage;
  isDarkMode: boolean;
  onClose?: () => void;
}

// Map Controller for camera pan & fast dynamic dark/light theme switching
function MapController({
  targetCenter,
  isDarkMode,
}: {
  targetCenter: { lat: number; lng: number } | null;
  isDarkMode: boolean;
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
    if (map && targetCenter) {
      map.panTo(targetCenter);
    }
  }, [map, targetCenter]);

  return null;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  initialLocation,
  savedAddresses = [],
  onConfirmLocation,
  language,
  isDarkMode,
  onClose,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyAJSRi8e3Skf5VJYDwN7Efn7XJW97nm8ys';

  const defaultCenter = initialLocation
    ? { lat: initialLocation.lat, lng: initialLocation.lng }
    : { lat: -6.7725, lng: 39.2450 }; // Kinondoni / Mikocheni fallback

  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>(
    defaultCenter
  );
  const currentCenterRef = useRef<{ lat: number; lng: number }>(defaultCenter);
  const [targetCenter, setTargetCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState(
    initialLocation?.address || 'Kinondoni B & Mikocheni, Dar es Salaam'
  );
  const [detectedCity, setDetectedCity] = useState(
    initialLocation?.city || 'Dar es Salaam'
  );
  const [detectedCountry, setDetectedCountry] = useState(
    initialLocation?.country || 'Tanzania'
  );
  const [detectedCountryCode, setDetectedCountryCode] = useState(
    initialLocation?.countryCode || 'TZ'
  );
  const [activeHub, setActiveHub] = useState<ServiceHub | null>(
    SERVICE_HUBS[0]
  );
  const [isServiced, setIsServiced] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Address label: Home, Work, Other
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>(
    (initialLocation?.label as 'Home' | 'Work' | 'Other') || 'Home'
  );
  const [customLabel, setCustomLabel] = useState('');

  // Bottom panel expansion state
  const [isPanelExpanded, setIsPanelExpanded] = useState<boolean>(false);

  // Geolocation state
  const [gpsStatus, setGpsStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'timeout'
  >('idle');
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasAttemptedStartupGps = useRef(false);

  // Reverse Geocoding with Google Geocoding REST API
  const resolveCoordinates = useCallback(
    async (lat: number, lng: number) => {
      setIsGeocoding(true);

      const detection = detectServiceHub(lat, lng);
      setActiveHub(detection.hub);
      setIsServiced(detection.isServiced);

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK' && data.results?.[0]) {
            const result = data.results[0];
            const formatted = result.formatted_address;
            setResolvedAddress(formatted);

            let city = '';
            let country = '';
            let countryCode = '';

            for (const comp of result.address_components) {
              if (
                comp.types.includes('locality') ||
                comp.types.includes('administrative_area_level_2') ||
                comp.types.includes('sublocality')
              ) {
                if (!city) city = comp.long_name;
              }
              if (comp.types.includes('country')) {
                country = comp.long_name;
                countryCode = comp.short_name;
              }
            }

            if (city) setDetectedCity(city);
            if (country) setDetectedCountry(country);
            if (countryCode) setDetectedCountryCode(countryCode);
          } else {
            setResolvedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } else {
          setResolvedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      } catch {
        setResolvedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } finally {
        setIsGeocoding(false);
      }
    },
    [apiKey]
  );

  // Handle GPS location request
  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      setGpsNotice(t.gps_unsupported);
      return;
    }

    setGpsStatus('requesting');
    setGpsNotice(t.requesting_gps);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsStatus('granted');
        setGpsNotice(t.location_detected);
        setTargetCenter({ lat: latitude, lng: longitude });
        setCurrentCenter({ lat: latitude, lng: longitude });
        currentCenterRef.current = { lat: latitude, lng: longitude };
        resolveCoordinates(latitude, longitude);

        setTimeout(() => setGpsNotice(null), 3500);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
          setGpsNotice(t.gps_permission_denied);
        } else if (err.code === err.TIMEOUT) {
          setGpsStatus('timeout');
          setGpsNotice(t.gps_timeout);
        } else {
          setGpsStatus('unavailable');
          setGpsNotice(t.gps_failed);
        }
        setTimeout(() => setGpsNotice(null), 4500);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [resolveCoordinates, t]);

  useEffect(() => {
    if (!hasAttemptedStartupGps.current && !initialLocation) {
      hasAttemptedStartupGps.current = true;
      requestCurrentLocation();
    }
  }, [initialLocation, requestCurrentLocation]);

  const handleCameraChange = (ev: MapCameraChangedEvent) => {
    const lat = ev.detail.center.lat;
    const lng = ev.detail.center.lng;

    currentCenterRef.current = { lat, lng };
    setCurrentCenter({ lat, lng });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      resolveCoordinates(lat, lng);
    }, 600);
  };

  const handleRecenter = () => {
    requestCurrentLocation();
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchQuery
        )}&key=${apiKey}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.results?.[0]) {
          const loc = data.results[0].geometry.location;
          setTargetCenter({ lat: loc.lat, lng: loc.lng });
          resolveCoordinates(loc.lat, loc.lng);
        } else {
          setGpsNotice(t.address_not_found);
          setTimeout(() => setGpsNotice(null), 3000);
        }
      }
    } catch {
      setGpsNotice(t.search_error);
      setTimeout(() => setGpsNotice(null), 3000);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectSavedAddress = (saved: DeliveryLocation) => {
    setTargetCenter({ lat: saved.lat, lng: saved.lng });
    resolveCoordinates(saved.lat, saved.lng);
    if (saved.label === 'Home' || saved.label === 'Work' || saved.label === 'Other') {
      setAddressLabel(saved.label);
    }
    setIsPanelExpanded(false);
  };

  const handleConfirm = () => {
    const finalLabel =
      addressLabel === 'Other' && customLabel.trim()
        ? customLabel.trim()
        : addressLabel;

    const deliveryLocation: DeliveryLocation = {
      id: `loc-${Date.now()}`,
      label: finalLabel,
      address: resolvedAddress,
      city: detectedCity,
      country: detectedCountry,
      countryCode: detectedCountryCode,
      lat: currentCenter.lat,
      lng: currentCenter.lng,
      isServiced: isServiced,
      hubId: activeHub?.id,
    };
    onConfirmLocation(deliveryLocation);
  };

  return (
    <main
      className="relative isolate w-full overflow-hidden"
      style={{
        height: '100dvh',
        minHeight: 0,
        background: 'var(--app-bg)',
      }}
    >
      {/* 1. Fast Full-Screen Map (Bolt/Uber styled, instant raster tiles, zero WebGL delay) */}
      <div
        className={`absolute inset-0 z-0 transition-colors duration-300 ${
          isDarkMode ? 'dark-map-container' : 'light-map-container'
        }`}
      >
        <Map
          id="starches-delivery-map"
          reuseMaps={true}
          defaultCenter={defaultCenter}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={true}
          styles={isDarkMode ? DARK_MAP_STYLES : LIGHT_MAP_STYLES}
          onCameraChanged={handleCameraChange}
          className="w-full h-full"
        >
          <MapController
            targetCenter={targetCenter}
            isDarkMode={isDarkMode}
          />
        </Map>
      </div>

      {/* 2. Fixed Center Pin with Neumorphic Pulse */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="relative flex flex-col items-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#FF5A1F]/40 animate-ping absolute -bottom-1" />
          <div className="w-3 h-3 rounded-full bg-[#FF5A1F] absolute -bottom-0.5 shadow-sm" />

          {/* Stationary Pin Icon */}
          <div className="w-10 h-11 -translate-y-4 flex items-center justify-center filter drop-shadow-md">
            <svg viewBox="0 0 36 44" fill="none" className="w-full h-full">
              <path
                d="M18 0C8.05887 0 0 8.05887 0 18C0 27.6 15.6 42.6 16.8 43.8C17.4 44.4 18.6 44.4 19.2 43.8C20.4 42.6 36 27.6 36 18C36 8.05887 27.9411 0 18 0Z"
                fill="#FF5A1F"
              />
              <circle cx="18" cy="18" r="7" fill="white" />
              <circle cx="18" cy="18" r="3.5" fill="#FF5A1F" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Top Floating Glassmorphic Controls */}
      <div
        className="absolute left-4 right-4 z-20 space-y-2 pointer-events-none"
        style={{
          top: 'max(14px, env(safe-area-inset-top))',
        }}
      >
        <div className="pointer-events-auto max-w-lg mx-auto flex items-center gap-2.5">
          {onClose && (
            <NeuIconButton
              variant="glass"
              size="md"
              onClick={onClose}
              aria-label="Back"
            >
              <X className="w-5 h-5 text-[#1A202C] dark:text-[#F0F4F8]" />
            </NeuIconButton>
          )}

          {/* Neumorphic Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 relative"
          >
            <div className="neu-glass rounded-xl flex items-center h-11 px-3.5 gap-2 border border-white/60 dark:border-[#232F44]/70">
              <Search className="w-4 h-4 text-[#5A6A80] dark:text-[#8B9BB4] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search_location_placeholder}
                className="w-full bg-transparent text-sm outline-none text-[#1A202C] dark:text-[#F0F4F8] placeholder:text-[#5A6A80]/70 dark:placeholder:text-[#8B9BB4]/70"
              />
              {isGeocoding && (
                <Loader2 className="w-3.5 h-3.5 text-[#FF5A1F] animate-spin shrink-0" />
              )}
            </div>
          </form>

          {/* Recenter Button */}
          <NeuIconButton
            variant="glass"
            size="md"
            onClick={handleRecenter}
            disabled={gpsStatus === 'requesting'}
            title={t.recenter_location}
            aria-label={t.recenter_location}
          >
            <Navigation
              className={`w-4 h-4 text-[#FF5A1F] ${
                gpsStatus === 'requesting' ? 'animate-spin' : ''
              }`}
            />
          </NeuIconButton>
        </div>

        {/* GPS Status Toast */}
        {gpsNotice && (
          <div className="pointer-events-auto max-w-lg mx-auto">
            <NeuCard
              elevation="glass"
              className="flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-medium border border-white/60 dark:border-[#232F44]/70"
            >
              <div className="flex items-center gap-1.5 truncate">
                {gpsStatus === 'requesting' ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#FF5A1F] animate-spin shrink-0" />
                ) : gpsStatus === 'granted' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className="truncate text-[#1A202C] dark:text-[#F0F4F8]">{gpsNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setGpsNotice(null)}
                className="text-[#5A6A80] hover:text-[#1A202C] dark:text-[#8B9BB4] dark:hover:text-[#F0F4F8] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </NeuCard>
          </div>
        )}
      </div>

      {/* 4. Bottom Address Panel with Glassmorphism */}
      <section
        className="absolute bottom-0 left-0 right-0 z-30 neu-glass rounded-t-3xl border-t border-white/60 dark:border-[#232F44]/70 transition-all duration-300 ease-out flex flex-col"
        style={{
          maxHeight: isPanelExpanded ? 'min(75dvh, 560px)' : 'min(22dvh, 175px)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="max-w-lg mx-auto w-full px-4 pt-2.5 flex flex-col flex-1 overflow-hidden">
          {/* Drag Handle & Toggle Header */}
          <div
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            className="cursor-pointer py-1 flex flex-col items-center select-none"
            title={isPanelExpanded ? 'Collapse panel' : 'Expand panel details'}
          >
            <div className="w-10 h-1.5 rounded-full bg-[#DCE4EF] dark:bg-[#1F293D] mb-1.5" />
          </div>

          {/* Compact Primary Row (Always Visible in Collapsed Mode) */}
          <div className="flex items-center justify-between gap-3 pb-2.5 shrink-0">
            <div
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Set delivery address
                </span>
                <span className="text-[10px] text-[#5A6A80] dark:text-[#8B9BB4]">
                  {isServiced ? '· Serviced' : '· Expanding soon'}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold truncate mt-0.5 text-[#1A202C] dark:text-[#F0F4F8]">
                {resolvedAddress}
              </div>
            </div>

            <NeuIconButton
              size="sm"
              variant="secondary"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              aria-label={isPanelExpanded ? 'Collapse' : 'Expand'}
            >
              {isPanelExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#5A6A80] dark:text-[#8B9BB4]" />
              ) : (
                <ChevronUp className="w-4 h-4 text-[#5A6A80] dark:text-[#8B9BB4]" />
              )}
            </NeuIconButton>
          </div>

          {/* Expanded Content (Scrollable when expanded) */}
          {isPanelExpanded && (
            <div className="overflow-y-auto space-y-3 py-2 flex-1 animate-in fade-in duration-150">
              {/* Address Label Selector: Home, Work, Other */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#5A6A80] dark:text-[#8B9BB4] block">
                  Address label:
                </span>
                <div className="flex items-center gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressLabel(lbl)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        addressLabel === lbl
                          ? 'neu-button-primary'
                          : 'neu-button text-[#1A202C] dark:text-[#F0F4F8]'
                      }`}
                    >
                      {lbl === 'Home' && <Home className="w-3.5 h-3.5" />}
                      {lbl === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                      {lbl === 'Other' && <MapPin className="w-3.5 h-3.5" />}
                      <span>{lbl}</span>
                    </button>
                  ))}
                </div>

                {addressLabel === 'Other' && (
                  <div className="neu-input rounded-xl px-3 py-2 mt-1.5">
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="e.g. Gym, Friend's house..."
                      className="w-full bg-transparent text-xs outline-none text-[#1A202C] dark:text-[#F0F4F8] placeholder:text-[#5A6A80]/70 dark:placeholder:text-[#8B9BB4]/70"
                    />
                  </div>
                )}
              </div>

              {/* Saved Address Shortcuts */}
              {savedAddresses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#5A6A80] dark:text-[#8B9BB4] block">
                    Saved addresses:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {savedAddresses.map((sa) => (
                      <button
                        key={sa.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(sa)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium neu-button text-[#1A202C] dark:text-[#F0F4F8] cursor-pointer"
                      >
                        <Bookmark className="w-3 h-3 text-[#FF5A1F]" />
                        <span>{sa.label || sa.city}:</span>
                        <span className="truncate max-w-[110px] text-[#5A6A80] dark:text-[#8B9BB4]">
                          {sa.address}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prominent Full-Width Starches Orange Confirm Location Button */}
          <div className="pt-2 pb-1 shrink-0">
            <NeuButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleConfirm}
            >
              {t.confirm_location}
            </NeuButton>
          </div>
        </div>
      </section>
    </main>
  );
};
