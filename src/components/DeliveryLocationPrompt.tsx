import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Search,
  MapPin,
  X,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Home,
  Briefcase,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DeliveryLocation, ServiceHub } from '../types';
import { SERVICE_HUBS, detectServiceHub } from '../data/hubs';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { STARCHES_LOGO_URL } from '../constants/assets';

interface DeliveryLocationPromptProps {
  currentLocation: DeliveryLocation | null;
  savedAddresses: DeliveryLocation[];
  onConfirmLocation: (location: DeliveryLocation) => void;
  onOpenMap: () => void;
  language: SupportedLanguage;
  isDarkMode?: boolean;
  onClose?: () => void;
}

export const DeliveryLocationPrompt: React.FC<DeliveryLocationPromptProps> = ({
  currentLocation,
  savedAddresses,
  onConfirmLocation,
  onOpenMap,
  language,
  isDarkMode = false,
  onClose,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyAJSRi8e3Skf5VJYDwN7Efn7XJW97nm8ys';

  // State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{
      address: string;
      lat: number;
      lng: number;
      city: string;
      country: string;
      countryCode: string;
    }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Selected candidate to confirm
  const [pendingLocation, setPendingLocation] = useState<DeliveryLocation | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [customLabel, setCustomLabel] = useState('');

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const queryLower = searchQuery.toLowerCase();
        const localMatches: Array<{
          address: string;
          lat: number;
          lng: number;
          city: string;
          country: string;
          countryCode: string;
        }> = [];

        // Match against active service hubs & popular districts
        for (const hub of SERVICE_HUBS) {
          if (
            hub.cityName.toLowerCase().includes(queryLower) ||
            hub.countryName.toLowerCase().includes(queryLower)
          ) {
            localMatches.push({
              address: `${hub.cityName}, ${hub.countryName}`,
              lat: hub.center.lat,
              lng: hub.center.lng,
              city: hub.cityName,
              country: hub.countryName,
              countryCode: hub.countryCode,
            });
          }
          for (const district of hub.popularDistricts) {
            if (district.toLowerCase().includes(queryLower)) {
              localMatches.push({
                address: `${district}, ${hub.cityName}, ${hub.countryName}`,
                lat: hub.center.lat + (Math.random() - 0.5) * 0.02,
                lng: hub.center.lng + (Math.random() - 0.5) * 0.02,
                city: hub.cityName,
                country: hub.countryName,
                countryCode: hub.countryCode,
              });
            }
          }
        }

        // Also query Google Geocoding REST API if possible
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              searchQuery
            )}&key=${apiKey}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'OK' && data.results) {
              for (const r of data.results.slice(0, 4)) {
                let city = '';
                let country = '';
                let countryCode = '';
                for (const comp of r.address_components) {
                  if (
                    comp.types.includes('locality') ||
                    comp.types.includes('administrative_area_level_2')
                  ) {
                    if (!city) city = comp.long_name;
                  }
                  if (comp.types.includes('country')) {
                    country = comp.long_name;
                    countryCode = comp.short_name;
                  }
                }
                localMatches.push({
                  address: r.formatted_address,
                  lat: r.geometry.location.lat,
                  lng: r.geometry.location.lng,
                  city: city || 'Dar es Salaam',
                  country: country || 'Tanzania',
                  countryCode: countryCode || 'TZ',
                });
              }
            }
          }
        } catch {
          // fallback to local matches
        }

        // Deduplicate by address
        const seen = new Set<string>();
        const unique = localMatches.filter((item) => {
          if (seen.has(item.address)) return false;
          seen.add(item.address);
          return true;
        });

        setSearchResults(unique.slice(0, 6));
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, apiKey]);

  // Handle Option A: Current location (GPS)
  const handleCurrentLocationClick = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser or device.');
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let formattedAddress = '';
        let detectedCity = 'Dar es Salaam';
        let detectedCountry = 'Tanzania';
        let detectedCountryCode = 'TZ';

        // Check if inside service hub
        const detection = detectServiceHub(latitude, longitude);

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'OK' && data.results?.[0]) {
              const r = data.results[0];
              formattedAddress = r.formatted_address;
              for (const comp of r.address_components) {
                if (
                  comp.types.includes('locality') ||
                  comp.types.includes('administrative_area_level_2') ||
                  comp.types.includes('sublocality')
                ) {
                  if (!detectedCity || detectedCity === 'Dar es Salaam') {
                    detectedCity = comp.long_name;
                  }
                }
                if (comp.types.includes('country')) {
                  detectedCountry = comp.long_name;
                  detectedCountryCode = comp.short_name;
                }
              }
            }
          }
        } catch {
          // fallback
        }

        if (!formattedAddress) {
          if (detection.hub) {
            formattedAddress = `${detection.hub.popularDistricts[0]}, ${detection.hub.cityName}`;
            detectedCity = detection.hub.cityName;
            detectedCountry = detection.hub.countryName;
            detectedCountryCode = detection.hub.countryCode;
          } else {
            formattedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
        }

        const recheck = detectServiceHub(latitude, longitude, formattedAddress);

        const newLocation: DeliveryLocation = {
          id: `loc-gps-${Date.now()}`,
          label: 'Home',
          address: formattedAddress,
          city: detectedCity,
          country: detectedCountry,
          countryCode: detectedCountryCode,
          lat: latitude,
          lng: longitude,
          isServiced: recheck.isServiced,
          hubId: recheck.hub?.id,
        };

        setGpsLoading(false);
        // Show confirmation or confirm directly
        setPendingLocation(newLocation);
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError(
            'Location permission denied. Please search your address in the search bar or choose on map below.'
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGpsError(
            'GPS signal is currently unavailable. Please search your location or choose on map below.'
          );
        } else {
          setGpsError(
            'Unable to acquire device coordinates in time. Please try searching or choose on map.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Handle selecting a search result
  const handleSelectSearchResult = (result: {
    address: string;
    lat: number;
    lng: number;
    city: string;
    country: string;
    countryCode: string;
  }) => {
    const detection = detectServiceHub(result.lat, result.lng, result.address);
    const newLocation: DeliveryLocation = {
      id: `loc-search-${Date.now()}`,
      label: 'Home',
      address: result.address,
      city: result.city || detection.hub?.cityName || 'Dar es Salaam',
      country: result.country || detection.hub?.countryName || 'Tanzania',
      countryCode: result.countryCode || detection.hub?.countryCode || 'TZ',
      lat: result.lat,
      lng: result.lng,
      isServiced: detection.isServiced,
      hubId: detection.hub?.id,
    };
    setPendingLocation(newLocation);
  };

  // Final confirm of pending location
  const handleFinalConfirm = () => {
    if (!pendingLocation) return;
    const finalLabel =
      selectedLabel === 'Other' && customLabel.trim()
        ? customLabel.trim()
        : selectedLabel;

    const confirmedLocation: DeliveryLocation = {
      ...pendingLocation,
      label: finalLabel,
    };
    onConfirmLocation(confirmedLocation);
  };

  return (
    <div
      className="relative isolate min-h-[100dvh] w-full overflow-y-auto flex flex-col justify-between transition-colors p-4 sm:p-6"
      style={{
        background: 'var(--app-bg)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="max-w-md w-full mx-auto space-y-6 pt-2 pb-6">
        {/* Top Bar with Brand and Optional Close */}
        <div className="flex items-center justify-between pt-safe">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#222222] p-1 shrink-0 shadow-xs flex items-center justify-center">
              <img
                src={STARCHES_LOGO_URL}
                alt="Starches"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
                Starches
              </span>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                Food & Grocery Delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-xl border border-[var(--border-color)] bg-white dark:bg-[#222222] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-xs transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Screen Header */}
        <div className="space-y-1.5 animate-in fade-in duration-300">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t.where_should_we_deliver || 'Where do you want us to deliver?'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Choose your preferred delivery address to explore restaurants and grocery stores near you.
          </p>
        </div>

        {/* GPS Error or Permission Denied Notice */}
        {gpsError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="font-semibold">{gpsError}</p>
            </div>
            <button
              onClick={() => setGpsError(null)}
              className="text-amber-600 dark:text-amber-400 hover:opacity-80 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Re-confirm for Returning Customer */}
        {currentLocation && (
          <div className="p-3.5 rounded-2xl bg-[#F8FAFF] dark:bg-[#111722] border border-[var(--brand-orange)]/40 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[var(--brand-orange)]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[var(--brand-orange)] uppercase tracking-wider">Previous Address</p>
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{currentLocation.address}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onConfirmLocation(currentLocation)}
              className="px-3.5 py-2 rounded-xl bg-[var(--brand-orange)] text-white text-xs font-bold hover:bg-[var(--brand-orange-hover)] transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Deliver here
            </button>
          </div>
        )}

        {/* Three Primary Selection Options */}
        <div className="space-y-3">
          {/* OPTION A: Current Location */}
          <button
            type="button"
            onClick={handleCurrentLocationClick}
            disabled={gpsLoading}
            className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all bg-[#F8FAFF] dark:bg-[#111722] border-[var(--border-color)] hover:border-[var(--brand-orange)] shadow-xs active:scale-[0.99] group cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                {gpsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-[var(--brand-orange)] text-white">
                    A
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    {t.current_location_title || 'Current location'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                  {gpsLoading
                    ? 'Detecting your device GPS coordinates...'
                    : t.current_location_desc ||
                      'Use device GPS to detect your location automatically'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--brand-orange)] shrink-0 transition-colors" />
          </button>

          {/* OPTION B: Search Location in Search Bar */}
          <div className="bg-[#F8FAFF] dark:bg-[#111722] border border-[var(--border-color)] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-[var(--brand-orange)] text-white">
                B
              </span>
              <span className="font-bold text-sm text-[var(--text-primary)]">
                {t.search_location_title || 'Search location in search bar'}
              </span>
            </div>

            <div className="relative flex items-center h-12 bg-[var(--surface-secondary)] border border-[var(--border-color)] rounded-xl px-3 transition-colors focus-within:border-[var(--brand-orange)]">
              <Search className="w-4 h-4 text-[var(--text-secondary)] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  t.search_location_placeholder ||
                  'Type street, neighborhood, building, or landmark...'
                }
                className="w-full bg-transparent text-sm outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-orange)] shrink-0 ml-2" />
              )}
              {searchQuery && !isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-xl overflow-hidden bg-[#F8FAFF] dark:bg-[#111722] shadow-sm max-h-56 overflow-y-auto">
                {searchResults.map((res, index) => (
                  <button
                    key={`${res.address}-${index}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-3 hover:bg-[var(--surface-secondary)] transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[var(--brand-orange)] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {res.address}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {res.city}, {res.country}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* OPTION C: Choose on Map */}
          <button
            type="button"
            onClick={onOpenMap}
            className="w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all bg-[#F8FAFF] dark:bg-[#111722] border-[var(--border-color)] hover:border-[var(--brand-orange)] shadow-xs active:scale-[0.99] group cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] border border-[var(--brand-orange)]/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5 text-[var(--brand-orange)]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-[var(--brand-orange)] text-white">
                    C
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    {t.choose_on_map_title || 'Choose on map'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                  {t.choose_on_map_desc ||
                    'Pinpoint your exact delivery spot on interactive map'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--brand-orange)] shrink-0 transition-colors" />
          </button>
        </div>

        {/* Saved Addresses Section (if user has any saved previously) */}
        {savedAddresses && savedAddresses.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] px-1">
              {t.saved_addresses || 'Saved Addresses'}
            </h3>
            <div className="space-y-2">
              {savedAddresses.slice(0, 3).map((saved) => (
                <button
                  key={saved.id}
                  type="button"
                  onClick={() => onConfirmLocation(saved)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-color)] bg-[#F8FAFF] dark:bg-[#111722] text-left hover:border-[var(--brand-orange)] shadow-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-secondary)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
                      {saved.label === 'Home' ? (
                        <Home className="w-4 h-4" />
                      ) : saved.label === 'Work' ? (
                        <Briefcase className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        {saved.label || 'Saved Location'}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        {saved.address}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--brand-orange)] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal when a Location was chosen via A or B */}
      {pendingLocation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[var(--border-color)] p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">
                    Confirm delivery spot
                  </h3>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {pendingLocation.city}, {pendingLocation.country}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingLocation(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resolved Address Box */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-color)]">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {pendingLocation.address}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    pendingLocation.isServiced ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {pendingLocation.isServiced
                    ? 'Active Starches delivery zone'
                    : 'Near service zone'}
                </span>
              </div>
            </div>

            {/* Address Label Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Address label
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Home', 'Work', 'Other'] as const).map((label) => {
                  const isSelected = selectedLabel === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setSelectedLabel(label)}
                      className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        isSelected
                          ? 'bg-[var(--brand-orange)] text-white border-[var(--brand-orange)] shadow-xs'
                          : 'bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border-color)]'
                      }`}
                    >
                      {label === 'Home' && <Home className="w-3.5 h-3.5" />}
                      {label === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                      {label === 'Other' && <MapPin className="w-3.5 h-3.5" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedLabel === 'Other' && (
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. Gym, Friend's house, Mom"
                  className="w-full mt-2 h-10 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-secondary)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-orange)]"
                />
              )}
            </div>

            {/* Confirm & Browse Restaurants Button */}
            <button
              type="button"
              onClick={handleFinalConfirm}
              className="w-full h-12 rounded-xl bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-pressed)] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Browse Restaurants</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
