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

interface MapLocationPickerProps {
  initialLocation?: DeliveryLocation | null;
  savedAddresses?: DeliveryLocation[];
  onConfirmLocation: (location: DeliveryLocation) => void;
  language: SupportedLanguage;
  isDarkMode: boolean;
  onClose?: () => void;
}

// Map Controller for camera pan & dynamic dark/light theme switching
function MapController({
  targetCenter,
  onRenderingTypeDetected,
  isDarkMode,
}: {
  targetCenter: { lat: number; lng: number } | null;
  onRenderingTypeDetected?: (type: string) => void;
  isDarkMode: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      if (typeof map.getRenderingType === 'function') {
        const type = map.getRenderingType();
        if (onRenderingTypeDetected) {
          onRenderingTypeDetected(type);
        }
      }
    } catch {
      // ignore
    }
  }, [map, onRenderingTypeDetected]);

  // Dynamically update colorScheme and background for instant vector theme switching
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

  // Default coordinates: if initialLocation exists, use it; otherwise fallback coordinates
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

  // Bottom panel expansion state:
  // When collapsed, must occupy <= 20% of viewport height (leaving >= 80% map visible).
  // When expanded, allows selecting saved addresses, address labels, or search details.
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

            const recheck = detectServiceHub(lat, lng, formatted);
            setActiveHub(recheck.hub);
            setIsServiced(recheck.isServiced);
            setIsGeocoding(false);
            return;
          }
        }
      } catch {
        // network or CORS error fallback
      }

      if (detection.hub) {
        setDetectedCity(detection.hub.cityName);
        setDetectedCountry(detection.hub.countryName);
        setDetectedCountryCode(detection.hub.countryCode);
        setResolvedAddress(
          `${detection.hub.popularDistricts[0]}, ${detection.hub.cityName}`
        );
      } else {
        setDetectedCountry('Location');
        setDetectedCity(`${lat.toFixed(3)}°, ${lng.toFixed(3)}°`);
        setDetectedCountryCode('GL');
        setResolvedAddress(`Pin at: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
      }

      setIsGeocoding(false);
    },
    [apiKey]
  );

  // Device Geolocation on Startup: request location if available
  useEffect(() => {
    if (hasAttemptedStartupGps.current) return;
    hasAttemptedStartupGps.current = true;

    if (initialLocation && initialLocation.lat) {
      resolveCoordinates(initialLocation.lat, initialLocation.lng);
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      setGpsNotice('GPS unavailable. You can drag the map to set your location.');
      return;
    }

    setGpsStatus('requesting');
    setGpsNotice('Finding your location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setGpsStatus('granted');
        setGpsNotice('Location found');
        setTargetCenter(coords);
        setCurrentCenter(coords);
        resolveCoordinates(coords.lat, coords.lng);
        setTimeout(() => setGpsNotice(null), 3000);
      },
      (err) => {
        if (err.code === 1) {
          setGpsStatus('denied');
          setGpsNotice('Location permission denied. Move the map to set your location.');
        } else if (err.code === 2) {
          setGpsStatus('unavailable');
          setGpsNotice('GPS signal unavailable. You can drag the map manually.');
        } else {
          setGpsStatus('timeout');
          setGpsNotice('GPS request timed out. You can move the map freely.');
        }
        setTimeout(() => setGpsNotice(null), 5000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [initialLocation, resolveCoordinates]);

  // Recenter button click handler
  const handleRecenter = () => {
    if (!navigator.geolocation) {
      setGpsNotice('Geolocation not supported by browser.');
      return;
    }
    setGpsStatus('requesting');
    setGpsNotice('Acquiring current GPS location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setGpsStatus('granted');
        setGpsNotice('Centered on device location');
        setTargetCenter(coords);
        setCurrentCenter(coords);
        resolveCoordinates(coords.lat, coords.lng);
        setTimeout(() => setGpsNotice(null), 3000);
      },
      (err) => {
        if (err.code === 1) {
          setGpsStatus('denied');
          setGpsNotice('Location permission denied.');
        } else {
          setGpsStatus('unavailable');
          setGpsNotice('Unable to acquire GPS signal. Pan the map manually.');
        }
        setTimeout(() => setGpsNotice(null), 5000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Camera change listener for stationary center pin - uses ref to avoid re-rendering entire component during dragging
  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => {
      const center = ev.detail.center;
      if (!center) return;

      const newLat = center.lat;
      const newLng = center.lng;
      currentCenterRef.current = { lat: newLat, lng: newLng };

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setCurrentCenter({ lat: newLat, lng: newLng });
        resolveCoordinates(newLat, newLng);
      }, 350);
    },
    [resolveCoordinates]
  );

  // Address search submit handler
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsGeocoding(true);

    const lower = searchQuery.toLowerCase();
    for (const hub of SERVICE_HUBS) {
      if (
        hub.cityName.toLowerCase().includes(lower) ||
        hub.countryName.toLowerCase().includes(lower) ||
        hub.popularDistricts.some((d) => d.toLowerCase().includes(lower))
      ) {
        setTargetCenter({ lat: hub.center.lat, lng: hub.center.lng });
        resolveCoordinates(hub.center.lat, hub.center.lng);
        setIsGeocoding(false);
        setIsPanelExpanded(false);
        return;
      }
    }

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
          setIsGeocoding(false);
          setIsPanelExpanded(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    setIsGeocoding(false);
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
      {/* 1. Full-screen existing map: extends behind the bottom panel rather than stopping above it */}
      <div className={`absolute inset-0 z-0 transition-colors duration-300 ${isDarkMode ? 'dark-map-container' : 'light-map-container'}`}>
        <Map
          id="starches-delivery-map"
          mapId="DEMO_MAP_ID"
          colorScheme={isDarkMode ? 'DARK' : 'LIGHT'}
          reuseMaps={true}
          defaultCenter={defaultCenter}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={true}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onCameraChanged={handleCameraChange}
          className="w-full h-full"
        >
          <MapController
            targetCenter={targetCenter}
            isDarkMode={isDarkMode}
          />
        </Map>
      </div>

      {/* 2. Fixed Center Pin: Positioned precisely at the center of the visible map */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="relative flex flex-col items-center">
          {/* Ground Contact Pulse Shadow */}
          <div className="w-3 h-3 rounded-full bg-[var(--brand-orange)]/40 animate-ping absolute -bottom-1" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-orange)] absolute -bottom-0.5 shadow-sm" />

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

      {/* 3. Top Controls: Search field & Back / GPS Toast near safe area */}
      <div
        className="absolute left-4 right-4 z-20 space-y-2 pointer-events-none"
        style={{
          top: 'max(14px, env(safe-area-inset-top))',
        }}
      >
        <div className="pointer-events-auto max-w-lg mx-auto flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-colors"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px',
              }}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Minimal Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 relative shadow-md rounded-xl"
          >
            <div
              className="flex items-center h-11 rounded-xl px-3 transition-colors"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px',
              }}
            >
              <Search className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search_location_placeholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-secondary)]"
                style={{ color: 'var(--text-primary)' }}
              />
              {isGeocoding && (
                <Loader2 className="w-3.5 h-3.5 text-[var(--brand-orange)] animate-spin shrink-0 ml-1.5" />
              )}
            </div>
          </form>

          {/* Recenter Button near top */}
          <button
            type="button"
            onClick={handleRecenter}
            disabled={gpsStatus === 'requesting'}
            title={t.recenter_location}
            aria-label={t.recenter_location}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-color)',
              borderWidth: '1px',
              color: 'var(--brand-orange)',
            }}
          >
            <Navigation
              className={`w-4 h-4 ${
                gpsStatus === 'requesting' ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>

        {/* GPS Status Toast */}
        {gpsNotice && (
          <div className="pointer-events-auto max-w-lg mx-auto">
            <div
              className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl shadow-md text-xs font-medium animate-in fade-in"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px',
              }}
            >
              <div className="flex items-center gap-1.5 truncate">
                {gpsStatus === 'requesting' ? (
                  <Loader2 className="w-3.5 h-3.5 text-[var(--brand-orange)] animate-spin shrink-0" />
                ) : gpsStatus === 'granted' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className="truncate">{gpsNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setGpsNotice(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Address Panel:
          - When collapsed: occupies <= 20% of usable viewport height (leaving >= 80% map visible).
          - When expanded: expands upward to max 75dvh for search results, saved address chips, and label options.
      */}
      <section
        className="absolute bottom-0 left-0 right-0 z-30 rounded-t-3xl border-t transition-all duration-300 ease-out shadow-2xl flex flex-col"
        style={{
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-color)',
          maxHeight: isPanelExpanded ? 'min(75dvh, 560px)' : 'min(20dvh, 160px)',
          paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="max-w-lg mx-auto w-full px-4 pt-2 flex flex-col flex-1 overflow-hidden">
          {/* Drag Handle & Toggle Header */}
          <div
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            className="cursor-pointer py-1 flex flex-col items-center select-none"
            title={isPanelExpanded ? 'Collapse panel' : 'Expand panel details'}
          >
            <div
              className="w-9 h-1 rounded-full mb-1"
              style={{ background: 'var(--border-color)' }}
            />
          </div>

          {/* Compact Primary Row (Always Visible in Collapsed Mode) */}
          <div className="flex items-center justify-between gap-3 pb-2 shrink-0">
            <div
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[var(--brand-orange)] uppercase tracking-wider">
                  Set delivery address
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {isServiced ? '· Serviced' : '· Expanding soon'}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold truncate mt-0.5">
                {resolvedAddress}
              </div>
            </div>

            {/* Expand / Collapse toggle icon */}
            <button
              type="button"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              aria-label={isPanelExpanded ? 'Collapse' : 'Expand'}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              style={{
                background: 'var(--surface-secondary)',
                color: 'var(--text-secondary)',
              }}
            >
              {isPanelExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Expanded Content (Scrollable when expanded) */}
          {isPanelExpanded && (
            <div className="overflow-y-auto space-y-3 py-2 flex-1 animate-in fade-in duration-150">
              {/* Address Label Selector: Home, Work, Other */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                  Address label:
                </span>
                <div className="flex items-center gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressLabel(lbl)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all"
                      style={{
                        background: addressLabel === lbl ? 'var(--brand-orange)' : 'var(--surface-secondary)',
                        color: addressLabel === lbl ? '#ffffff' : 'var(--text-primary)',
                        borderColor: addressLabel === lbl ? 'var(--brand-orange)' : 'var(--border-color)',
                      }}
                    >
                      {lbl === 'Home' && <Home className="w-3.5 h-3.5" />}
                      {lbl === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                      {lbl === 'Other' && <MapPin className="w-3.5 h-3.5" />}
                      <span>{lbl}</span>
                    </button>
                  ))}
                </div>

                {addressLabel === 'Other' && (
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="e.g. Gym, Friend's house..."
                    className="w-full h-8 px-2.5 text-xs rounded-xl border outline-none mt-1"
                    style={{
                      background: 'var(--surface-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                )}
              </div>

              {/* Saved Address Shortcuts if customer has saved any */}
              {savedAddresses.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                    Saved addresses:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {savedAddresses.map((sa) => (
                      <button
                        key={sa.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(sa)}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
                        style={{
                          background: 'var(--surface-secondary)',
                          color: 'var(--text-primary)',
                          borderColor: 'var(--border-color)',
                        }}
                      >
                        <Bookmark className="w-3 h-3 text-[var(--brand-orange)]" />
                        <span>{sa.label || sa.city}:</span>
                        <span className="truncate max-w-[100px] text-[var(--text-secondary)]">
                          {sa.address}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prominent Full-Width Starches Orange Confirm Location Button (Fits in collapsed state) */}
          <div className="pt-1 pb-1 shrink-0">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full h-[46px] sm:h-[48px] rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center shadow-md active:scale-[0.99] transition-all text-white"
              style={{
                background: 'var(--brand-orange)',
              }}
            >
              {t.confirm_location}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
