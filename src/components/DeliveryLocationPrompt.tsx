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
import { NeuCard } from './neumorphic/NeuCard';
import { NeuButton, NeuIconButton } from './neumorphic/NeuButton';
import { NeuInput } from './neumorphic/NeuInput';

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

        // Query Google Geocoding REST API
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
          // ignore
        }

        setSearchResults(localMatches.slice(0, 5));
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, apiKey]);

  // Handle GPS location click (Option A)
  const handleCurrentLocationClick = () => {
    if (!navigator.geolocation) {
      setGpsError(t.gps_unsupported || 'Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          let resolvedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          let detectedCity = 'Dar es Salaam';
          let detectedCountry = 'Tanzania';
          let detectedCountryCode = 'TZ';

          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'OK' && data.results?.[0]) {
              resolvedAddress = data.results[0].formatted_address;
              for (const comp of data.results[0].address_components) {
                if (
                  comp.types.includes('locality') ||
                  comp.types.includes('administrative_area_level_2')
                ) {
                  if (!detectedCity) detectedCity = comp.long_name;
                }
                if (comp.types.includes('country')) {
                  detectedCountry = comp.long_name;
                  detectedCountryCode = comp.short_name;
                }
              }
            }
          }

          const detection = detectServiceHub(lat, lng, resolvedAddress);

          const newLocation: DeliveryLocation = {
            id: `loc-gps-${Date.now()}`,
            label: 'Home',
            address: resolvedAddress,
            city: detectedCity,
            country: detectedCountry,
            countryCode: detectedCountryCode,
            lat,
            lng,
            isServiced: detection.isServiced,
            hubId: detection.hub?.id,
          };

          setPendingLocation(newLocation);
        } catch (err) {
          console.error('Error reverse geocoding current location:', err);
          const detection = detectServiceHub(lat, lng);
          const fallbackLocation: DeliveryLocation = {
            id: `loc-gps-${Date.now()}`,
            label: 'Home',
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            city: detection.hub?.cityName || 'Dar es Salaam',
            country: detection.hub?.countryName || 'Tanzania',
            countryCode: detection.hub?.countryCode || 'TZ',
            lat,
            lng,
            isServiced: detection.isServiced,
            hubId: detection.hub?.id,
          };
          setPendingLocation(fallbackLocation);
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError(
            t.gps_permission_denied ||
              'Location permission was denied. Please select on map or search above.'
          );
        } else if (error.code === error.TIMEOUT) {
          setGpsError(t.gps_timeout || 'Location request timed out. Please try again or choose on map.');
        } else {
          setGpsError(t.gps_failed || 'Could not fetch current location. Please choose on map.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Handle select from search results (Option B)
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
    <div className="relative isolate min-h-[100dvh] w-full overflow-y-auto flex flex-col justify-between transition-colors p-4 sm:p-6 bg-[#EEF2F9] dark:bg-[#0D1117] text-[#1A202C] dark:text-[#F0F4F8]">
      <div className="max-w-md w-full mx-auto space-y-5 pt-2 pb-6">
        {/* Top Bar with Brand and Optional Close */}
        <div className="flex items-center justify-between pt-safe">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl neu-button p-1 shrink-0 flex items-center justify-center">
              <img
                src={STARCHES_LOGO_URL}
                alt="Starches"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#1A202C] dark:text-[#F0F4F8]">
                Starches
              </span>
              <p className="text-[11px] text-[#5A6A80] dark:text-[#8B9BB4] font-medium">
                Food & Grocery Delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <NeuIconButton
                size="sm"
                variant="secondary"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-4 h-4 text-[#1A202C] dark:text-[#F0F4F8]" />
              </NeuIconButton>
            )}
          </div>
        </div>

        {/* Screen Header */}
        <div className="space-y-1.5 animate-in fade-in duration-300">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A202C] dark:text-[#F0F4F8]">
            {t.where_should_we_deliver || 'Where do you want us to deliver?'}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6A80] dark:text-[#8B9BB4] leading-relaxed">
            Choose your preferred delivery address to explore restaurants and grocery stores near you.
          </p>
        </div>

        {/* GPS Error Notice */}
        {gpsError && (
          <NeuCard elevation="flat" className="p-3.5 border border-amber-300 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF5A1F]" />
            <div className="flex-1">
              <p className="font-semibold">{gpsError}</p>
            </div>
            <button
              type="button"
              onClick={() => setGpsError(null)}
              className="text-[#5A6A80] hover:text-[#1A202C] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </NeuCard>
        )}

        {/* Quick Re-confirm for Returning Customer */}
        {currentLocation && (
          <NeuCard
            elevation="flat"
            className="p-3.5 border border-[#FF5A1F]/50 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl neu-pressed text-[#FF5A1F] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#FF5A1F]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#FF5A1F] uppercase tracking-wider">Previous Address</p>
                <p className="text-xs font-bold text-[#1A202C] dark:text-[#F0F4F8] truncate">{currentLocation.address}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onConfirmLocation(currentLocation)}
              className="px-3.5 py-2 rounded-xl neu-button-primary text-xs font-bold shrink-0 cursor-pointer"
            >
              Deliver here
            </button>
          </NeuCard>
        )}

        {/* Three Primary Selection Options (Tactile Neumorphic) */}
        <div className="space-y-3">
          {/* OPTION A: Current Location */}
          <NeuCard
            elevation="flat"
            clickable
            onClick={handleCurrentLocationClick}
            className="p-4 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl neu-pressed text-[#FF5A1F] flex items-center justify-center shrink-0">
                {gpsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#FF5A1F]" />
                ) : (
                  <Navigation className="w-5 h-5 text-[#FF5A1F]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md neu-button-primary text-white">
                    A
                  </span>
                  <span className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
                    {t.current_location_title || 'Current location'}
                  </span>
                </div>
                <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5 truncate">
                  {gpsLoading
                    ? 'Detecting your device GPS coordinates...'
                    : t.current_location_desc ||
                      'Use device GPS to detect your location automatically'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5A6A80] dark:text-[#8B9BB4] group-hover:text-[#FF5A1F] shrink-0 transition-colors" />
          </NeuCard>

          {/* OPTION B: Search Location in Search Bar */}
          <NeuCard elevation="flat" className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md neu-button-primary text-white">
                B
              </span>
              <span className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
                {t.search_location_title || 'Search location in search bar'}
              </span>
            </div>

            <NeuInput
              prefixIcon={<Search className="w-4 h-4 text-[#5A6A80]" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                t.search_location_placeholder ||
                'Type street, neighborhood, building, or landmark...'
              }
              suffixIcon={
                isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF5A1F]" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#5A6A80] hover:text-[#1A202C] p-1 shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null
              }
            />

            {/* Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="divide-y divide-[#DCE4EF]/60 dark:divide-[#1F293D]/60 rounded-xl overflow-hidden neu-pressed max-h-56 overflow-y-auto">
                {searchResults.map((res, index) => (
                  <button
                    key={`${res.address}-${index}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-3 hover:bg-[#E5ECF6]/60 dark:hover:bg-[#171F2E]/60 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[#FF5A1F] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1A202C] dark:text-[#F0F4F8] truncate">
                        {res.address}
                      </p>
                      <p className="text-[11px] text-[#5A6A80] dark:text-[#8B9BB4]">
                        {res.city}, {res.country}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </NeuCard>

          {/* OPTION C: Choose on Map */}
          <NeuCard
            elevation="flat"
            clickable
            onClick={onOpenMap}
            className="p-4 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl neu-pressed text-[#FF5A1F] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#FF5A1F]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md neu-button-primary text-white">
                    C
                  </span>
                  <span className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8]">
                    {t.choose_on_map_title || 'Choose on map'}
                  </span>
                </div>
                <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5 truncate">
                  {t.choose_on_map_desc ||
                    'Pinpoint your exact delivery spot on fast map'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5A6A80] dark:text-[#8B9BB4] group-hover:text-[#FF5A1F] shrink-0 transition-colors" />
          </NeuCard>
        </div>

        {/* Saved Addresses Section */}
        {savedAddresses && savedAddresses.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6A80] dark:text-[#8B9BB4] px-1">
              {t.saved_addresses || 'Saved Addresses'}
            </h3>
            <div className="space-y-2">
              {savedAddresses.slice(0, 3).map((saved) => (
                <NeuCard
                  key={saved.id}
                  elevation="flat"
                  clickable
                  onClick={() => onConfirmLocation(saved)}
                  className="p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl neu-pressed text-[#FF5A1F] flex items-center justify-center shrink-0">
                      {saved.label === 'Work' ? (
                        <Briefcase className="w-4 h-4" />
                      ) : (
                        <Home className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1A202C] dark:text-[#F0F4F8]">
                        {saved.label || 'Saved Location'}
                      </p>
                      <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] truncate">{saved.address}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#FF5A1F]">Select</span>
                </NeuCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Bottom Sheet for Pending Location */}
      {pendingLocation && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-0 sm:p-4">
          <NeuCard
            elevation="flat"
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1A202C] dark:text-[#F0F4F8]">
                Confirm Delivery Address
              </h3>
              <NeuIconButton
                size="sm"
                variant="secondary"
                onClick={() => setPendingLocation(null)}
                aria-label="Cancel"
              >
                <X className="w-4 h-4 text-[#1A202C] dark:text-[#F0F4F8]" />
              </NeuIconButton>
            </div>

            <div className="p-3 rounded-xl neu-pressed">
              <p className="text-xs font-bold text-[#1A202C] dark:text-[#F0F4F8]">
                {pendingLocation.address}
              </p>
              <p className="text-[11px] text-[#5A6A80] dark:text-[#8B9BB4] mt-0.5">
                {pendingLocation.city}, {pendingLocation.country}
              </p>
            </div>

            {/* Label Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5A6A80] dark:text-[#8B9BB4] block">
                Save as:
              </label>
              <div className="flex gap-2">
                {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setSelectedLabel(lbl)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedLabel === lbl
                        ? 'neu-button-primary'
                        : 'neu-button text-[#1A202C] dark:text-[#F0F4F8]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <NeuButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleFinalConfirm}
            >
              Confirm & Start Ordering
            </NeuButton>
          </NeuCard>
        </div>
      )}
    </div>
  );
};
