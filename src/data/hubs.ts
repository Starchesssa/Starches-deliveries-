import { ServiceHub } from '../types';

export const SERVICE_HUBS: ServiceHub[] = [
  {
    id: 'tz-dar',
    countryCode: 'TZ',
    countryName: 'Tanzania',
    countryFlag: '🇹🇿',
    cityName: 'Dar es Salaam',
    center: { lat: -6.7725, lng: 39.2450 }, // Kinondoni / Mikocheni
    radiusKm: 45,
    currency: {
      code: 'TZS',
      symbol: 'TSh',
      decimals: 0,
    },
    supportedPayments: ['cod', 'mpesa', 'airtel_money', 'tigopesa'],
    defaultLanguage: 'sw',
    popularDistricts: [
      'Kinondoni',
      'Mikocheni',
      'Masaki',
      'Oysterbay',
      'Msasani',
      'Upanga',
      'Kariakoo',
      'Sinza',
    ],
  },
  {
    id: 'zm-lusaka',
    countryCode: 'ZM',
    countryName: 'Zambia',
    countryFlag: '🇿🇲',
    cityName: 'Lusaka',
    center: { lat: -15.4167, lng: 28.2833 }, // Kabulonga / Woodlands
    radiusKm: 35,
    currency: {
      code: 'ZMW',
      symbol: 'K',
      decimals: 0,
    },
    supportedPayments: ['cod', 'mtn_money', 'airtel_money'],
    defaultLanguage: 'en',
    popularDistricts: [
      'Kabulonga',
      'Woodlands',
      'Rhodes Park',
      'Longacres',
      'Northmead',
      'Olympia',
    ],
  },
  {
    id: 'fr-paris',
    countryCode: 'FR',
    countryName: 'France',
    countryFlag: '🇫🇷',
    cityName: 'Paris',
    center: { lat: 48.8566, lng: 2.3522 }, // Le Marais
    radiusKm: 30,
    currency: {
      code: 'EUR',
      symbol: '€',
      decimals: 2,
    },
    supportedPayments: ['card', 'cod'],
    defaultLanguage: 'fr',
    popularDistricts: [
      'Le Marais',
      'Montmartre',
      'Saint-Germain',
      'Bastille',
      'Canal Saint-Martin',
      'Quartier Latin',
    ],
  },
  {
    id: 'uk-london',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    countryFlag: '🇬🇧',
    cityName: 'London',
    center: { lat: 51.5074, lng: -0.1278 }, // Soho / Central
    radiusKm: 35,
    currency: {
      code: 'GBP',
      symbol: '£',
      decimals: 2,
    },
    supportedPayments: ['card', 'cod'],
    defaultLanguage: 'en',
    popularDistricts: [
      'Soho',
      'Covent Garden',
      'Shoreditch',
      'Borough',
      'Kensington',
      'Camden',
    ],
  },
];

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function detectServiceHub(
  lat: number,
  lng: number,
  addressText?: string
): { hub: ServiceHub | null; isServiced: boolean } {
  // First check coordinate proximity to active hubs
  for (const hub of SERVICE_HUBS) {
    const dist = calculateDistanceKm(lat, lng, hub.center.lat, hub.center.lng);
    if (dist <= hub.radiusKm) {
      return { hub, isServiced: true };
    }
  }

  // Second check address text keywords if available
  if (addressText) {
    const lower = addressText.toLowerCase();
    if (lower.includes('dar es salaam') || lower.includes('tanzania') || lower.includes('kinondoni') || lower.includes('mikocheni') || lower.includes('masaki')) {
      const hub = SERVICE_HUBS.find((h) => h.id === 'tz-dar') || null;
      return { hub, isServiced: true };
    }
    if (lower.includes('lusaka') || lower.includes('zambia') || lower.includes('kabulonga')) {
      const hub = SERVICE_HUBS.find((h) => h.id === 'zm-lusaka') || null;
      return { hub, isServiced: true };
    }
    if (lower.includes('paris') || lower.includes('france') || lower.includes('île-de-france')) {
      const hub = SERVICE_HUBS.find((h) => h.id === 'fr-paris') || null;
      return { hub, isServiced: true };
    }
    if (lower.includes('london') || lower.includes('united kingdom') || lower.includes('england')) {
      const hub = SERVICE_HUBS.find((h) => h.id === 'uk-london') || null;
      return { hub, isServiced: true };
    }
  }

  // Not serviced currently
  return { hub: null, isServiced: false };
}

export function formatCurrency(
  amount: number,
  currency: { code: string; symbol: string; decimals: number }
): string {
  if (currency.code === 'TZS') {
    return `${currency.symbol} ${Math.round(amount).toLocaleString('en-US')}`;
  }
  if (currency.code === 'ZMW') {
    return `${currency.symbol} ${Math.round(amount).toLocaleString('en-US')}`;
  }
  if (currency.code === 'EUR') {
    return `${amount.toFixed(2)} ${currency.symbol}`;
  }
  if (currency.code === 'GBP') {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
  return `${currency.symbol} ${amount.toFixed(currency.decimals)}`;
}
