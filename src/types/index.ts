export type PaymentMethodType = 'cod' | 'mpesa' | 'airtel_money' | 'tigopesa' | 'mtn_money' | 'card';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ServiceHub {
  id: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  cityName: string;
  center: { lat: number; lng: number };
  radiusKm: number;
  currency: {
    code: string;
    symbol: string;
    decimals: number;
  };
  supportedPayments: PaymentMethodType[];
  defaultLanguage: 'en' | 'sw' | 'fr';
  popularDistricts: string[];
}

export interface DeliveryLocation {
  id: string;
  label?: string; // 'Home', 'Work', etc.
  address: string;
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  isServiced: boolean;
  hubId?: string;
  deliveryNotes?: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  nameSw?: string;
  nameFr?: string;
  price: number;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  nameSw?: string;
  nameFr?: string;
  required: boolean;
  minSelect?: number;
  maxSelect?: number;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  merchantId: string;
  name: string;
  nameSw?: string;
  nameFr?: string;
  description: string;
  descriptionSw?: string;
  descriptionFr?: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isRetailGrocery?: boolean;
  unitSize?: string;
  customizationGroups?: CustomizationGroup[];
}

export interface Merchant {
  id: string;
  hubId: string;
  name: string;
  type: 'restaurant' | 'grocery';
  cuisine: string;
  cuisineSw?: string;
  cuisineFr?: string;
  rating: number;
  ratingCount: number;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  minOrder: number;
  image: string;
  address: string;
  lat: number;
  lng: number;
  tags: string[];
  isClosed?: boolean;
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  id: string;
  merchantId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions: SelectedOption[];
  specialInstructions?: string;
  totalPrice: number;
}

export type OrderStatus =
  | 'submitted'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'rider_assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  referenceNumber: string;
  merchantId: string;
  merchantName: string;
  merchantType: 'restaurant' | 'grocery';
  hubId: string;
  currency: {
    code: string;
    symbol: string;
    decimals: number;
  };
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'pending' | 'authorized' | 'paid';
  status: OrderStatus;
  createdAt: string;
  deliveryLocation: DeliveryLocation;
  recipientPhone: string;
  rider?: {
    name: string;
    phone: string;
    vehicle: string;
    currentLat: number;
    currentLng: number;
  };
  estimatedDeliveryMinutes: number;
}
