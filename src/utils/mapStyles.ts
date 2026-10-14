/**
 * Google Maps Styled Map Definitions for Starches
 * Ensures the map switches between authentic Light Mode and Dark Mode in real time.
 */

export interface MapTypeStyle {
  elementType?: string;
  featureType?: string;
  stylers: Array<Record<string, string | number | boolean>>;
}

// Dark / Night Theme Map Styles (Matches Starches deep dark charcoal theme)
export const DARK_MAP_STYLES: MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1f1f1f' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8c8c8c' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }, { weight: 2 }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#555555' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#aaaaaa' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cccccc' }, { weight: 1 }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#161e16' }, { visibility: 'simplified' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#688068' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#2b2b2b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e1e1e' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#999999' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#383838' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#242424' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b5b5b5' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#262626' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f141a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a5b6b' }],
  },
];

// Light / Warm White Map Styles (Matches Starches signature warm-white brand theme)
export const LIGHT_MAP_STYLES: MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#fbfaf7' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#fbfaf7' }, { weight: 3 }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#242424' }, { weight: 1 }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e8ede2' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#668060' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ebe7de' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666666' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffe4cc' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f5cba7' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#d8e8f8' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5a7a99' }],
  },
];
