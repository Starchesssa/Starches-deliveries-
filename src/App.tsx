import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { DeliveryLocation, ServiceHub, Merchant, MenuItem, CartItem, Order, SelectedOption, ThemeMode } from './types';
import { SERVICE_HUBS, detectServiceHub, formatCurrency } from './data/hubs';
import { MERCHANTS as LOCAL_MERCHANTS } from './data/merchants';
import { SupportedLanguage } from './utils/translations';
import { SplashScreen } from './components/SplashScreen';
import { loadPreferences, savePreferences, CustomerPreferences } from './utils/preferences';
import { DeliveryLocationPrompt } from './components/DeliveryLocationPrompt';
import { MapLocationPicker } from './components/MapLocationPicker';
import { OutOfServiceView } from './components/OutOfServiceView';
import { CustomerHeader } from './components/CustomerHeader';
import { HomeFeed } from './components/HomeFeed';
import { HomeMapOverlay } from './components/HomeMapOverlay';
import { MerchantDetailModal } from './components/MerchantDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { BottomNav, NavTab } from './components/BottomNav';
import { AccountView } from './components/AccountView';
import { QuotaWarningBanner } from './components/QuotaWarningBanner';
import { NeuCard } from './components/neumorphic/NeuCard';
import { NeuButton } from './components/neumorphic/NeuButton';
import {
  validateFirestoreConnection,
  seedStarchesCatalogIfEmpty,
  fetchMerchantsFromFirestore,
  fetchOrdersFromFirestore,
  fetchAddressesFromFirestore,
  saveAddressToFirestore,
} from './services/firebase';
import { Heart, Clock, UtensilsCrossed } from 'lucide-react';

export default function App() {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyAJSRi8e3Skf5VJYDwN7Efn7XJW97nm8ys';

  // Splash Screen on startup (1.8s brand introduction)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // 0. Preferences
  const [preferences, setPreferences] = useState<CustomerPreferences>(loadPreferences);

  // 1. Theme state: 'light' | 'dark' | 'system'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('starches_theme_mode');
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved as ThemeMode;
    }
    return 'light';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = useMemo(() => {
    if (themeMode === 'system') return systemIsDark;
    return themeMode === 'dark';
  }, [themeMode, systemIsDark]);

  useEffect(() => {
    localStorage.setItem('starches_theme_mode', themeMode);
    document.documentElement.setAttribute(
      'data-theme',
      isDarkMode ? 'dark' : 'light'
    );
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode, isDarkMode]);

  // 2. Language state
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('starches_lang');
    return (saved as SupportedLanguage) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('starches_lang', language);
  }, [language]);

  // 3. Saved Addresses List
  const [savedAddresses, setSavedAddresses] = useState<DeliveryLocation[]>(() => {
    const saved = localStorage.getItem('starches_saved_addresses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // 4. Confirmed Delivery Location
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(() => {
    const confirmed = localStorage.getItem('starches_confirmed_location');
    if (confirmed) {
      try {
        return JSON.parse(confirmed);
      } catch {
        // ignore
      }
    }
    return null;
  });

  // 5. Delivery Location Selection Gate:
  // As soon as customer enters the app, ask "Where should we deliver" first before browsing restaurants/groceries.
  const [hasConfirmedSessionLocation, setHasConfirmedSessionLocation] = useState<boolean>(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState<boolean>(true);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);

  const [activeHub, setActiveHub] = useState<ServiceHub | null>(() => {
    if (deliveryLocation) {
      const detected = detectServiceHub(
        deliveryLocation.lat,
        deliveryLocation.lng,
        deliveryLocation.address
      );
      return detected.hub;
    }
    return SERVICE_HUBS[0]; // Dar es Salaam default hub
  });

  const [showMapView, setShowMapView] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Live Firestore Merchants Data State
  const [merchants, setMerchants] = useState<Merchant[]>(LOCAL_MERCHANTS);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState<boolean>(false);
  const [merchantsError, setMerchantsError] = useState<string | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('starches_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('starches_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('starches_favs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return ['tz-m1', 'tz-m2'];
  });

  useEffect(() => {
    localStorage.setItem('starches_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('starches_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('starches_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('starches_saved_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  // Sync active hub when delivery location changes
  useEffect(() => {
    if (deliveryLocation) {
      const detected = detectServiceHub(
        deliveryLocation.lat,
        deliveryLocation.lng,
        deliveryLocation.address
      );
      setActiveHub(detected.hub);
    }
  }, [deliveryLocation]);

  // Load live merchants and orders from Firebase
  const loadLiveMerchants = useCallback(async () => {
    setIsLoadingMerchants(true);
    setMerchantsError(null);
    try {
      await validateFirestoreConnection();
      await seedStarchesCatalogIfEmpty();
      const liveList = await fetchMerchantsFromFirestore();
      if (liveList && liveList.length > 0) {
        setMerchants(liveList);
      }
    } catch (err: any) {
      console.warn('Live Firestore sync notice:', err);
      setMerchantsError('Could not sync live Firestore catalog, displaying cached items.');
    } finally {
      setIsLoadingMerchants(false);
    }
  }, []);

  useEffect(() => {
    loadLiveMerchants();

    // Also fetch historical orders and saved addresses from Firestore
    fetchOrdersFromFirestore().then((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders((prev) => {
          const combined = [...remoteOrders];
          for (const p of prev) {
            if (!combined.some((c) => c.id === p.id)) {
              combined.push(p);
            }
          }
          return combined;
        });
      }
    });

    fetchAddressesFromFirestore().then((remoteAddresses) => {
      if (remoteAddresses && remoteAddresses.length > 0) {
        setSavedAddresses((prev) => {
          const combined = [...remoteAddresses];
          for (const p of prev) {
            if (!combined.some((c) => c.id === p.id || c.address === p.address)) {
              combined.push(p);
            }
          }
          return combined;
        });
      }
    });
  }, [loadLiveMerchants]);

  // Handle Location Confirmation (Section 2)
  const handleConfirmLocation = (loc: DeliveryLocation) => {
    setDeliveryLocation(loc);
    localStorage.setItem('starches_confirmed_location', JSON.stringify(loc));

    // Save or update in saved addresses & sync to Firestore
    setSavedAddresses((prev) => {
      const exists = prev.some((p) => p.address === loc.address || p.id === loc.id);
      if (!exists) {
        return [loc, ...prev];
      }
      return prev.map((p) => (p.id === loc.id || p.address === loc.address ? loc : p));
    });
    saveAddressToFirestore(loc);

    setHasConfirmedSessionLocation(true);
    setIsSelectingLocation(false);
    setIsMapPickerOpen(false);
  };

  const handleSelectSavedAddress = (saved: DeliveryLocation) => {
    setDeliveryLocation(saved);
    localStorage.setItem('starches_confirmed_location', JSON.stringify(saved));
    setHasConfirmedSessionLocation(true);
    setIsSelectingLocation(false);
    setIsMapPickerOpen(false);
  };

  const handleToggleFavorite = (merchantId: string) => {
    setFavorites((prev) =>
      prev.includes(merchantId)
        ? prev.filter((id) => id !== merchantId)
        : [...prev, merchantId]
    );
  };

  const handleSelectHub = (hub: ServiceHub) => {
    const newLoc: DeliveryLocation = {
      id: `loc-${Date.now()}`,
      label: 'City Center',
      address: `${hub.popularDistricts[0]}, ${hub.cityName}`,
      city: hub.cityName,
      country: hub.countryName,
      countryCode: hub.countryCode,
      lat: hub.center.lat,
      lng: hub.center.lng,
      isServiced: true,
      hubId: hub.id,
    };
    handleConfirmLocation(newLoc);
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem('starches_confirmed_location');
    setDeliveryLocation(null);
    setHasConfirmedSessionLocation(false);
    setIsSelectingLocation(true);
    setIsMapPickerOpen(false);
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    selectedOptions: SelectedOption[],
    specialInstructions?: string
  ) => {
    if (cartItems.length > 0 && cartItems[0].merchantId !== item.merchantId) {
      const confirmClear = window.confirm(
        'Your cart contains items from another merchant. Clear cart and start a new order?'
      );
      if (!confirmClear) return;
      setCartItems([]);
    }

    const optionsExtra = selectedOptions.reduce((acc, c) => acc + c.price, 0);
    const unitPrice = item.price + optionsExtra;
    const totalPrice = unitPrice * quantity;

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      merchantId: item.merchantId,
      menuItemId: item.id,
      name: item.name,
      price: unitPrice,
      quantity,
      image: item.image,
      selectedOptions,
      specialInstructions,
      totalPrice,
    };

    setCartItems((prev) => {
      const sameMerchantItems =
        prev.length > 0 && prev[0].merchantId !== item.merchantId ? [] : prev;
      return [...sameMerchantItems, newItem];
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const unitPrice = item.price;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handlePlaceOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setSelectedMerchant(null);
    setTrackingOrder(order);
  };

  const activeCartMerchant = merchants.find(
    (m) => m.id === cartItems[0]?.merchantId
  );
  const deliveryFee = activeCartMerchant ? activeCartMerchant.deliveryFee : 2000;
  const currentHub = activeHub || SERVICE_HUBS[0];

  return (
    <APIProvider apiKey={apiKey}>
      {/* Brand Launch Splash Screen */}
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          durationMs={2000}
        />
      )}

      {/* 1. Location Selection Gate: As soon as customer enters the app, ask where should we deliver before browsing */}
      {!hasConfirmedSessionLocation || isSelectingLocation || !deliveryLocation ? (
        isMapPickerOpen ? (
          /* C. Choose on map: fast interactive map like Bolt */
          <MapLocationPicker
            initialLocation={deliveryLocation}
            savedAddresses={savedAddresses}
            onConfirmLocation={handleConfirmLocation}
            language={language}
            isDarkMode={isDarkMode}
            onClose={() => setIsMapPickerOpen(false)}
          />
        ) : (
          /* Screen: "Where do you want us to deliver" with A. Current location, B. Search, C. Choose on map */
          <DeliveryLocationPrompt
            currentLocation={deliveryLocation}
            savedAddresses={savedAddresses}
            onConfirmLocation={handleConfirmLocation}
            onOpenMap={() => setIsMapPickerOpen(true)}
            language={language}
            isDarkMode={isDarkMode}
            onClose={hasConfirmedSessionLocation && deliveryLocation ? () => setIsSelectingLocation(false) : undefined}
          />
        )
      ) : deliveryLocation && !deliveryLocation.isServiced ? (
        /* 2. Out-of-Service / Expanding Soon Screen if Location Unserviced */
        <OutOfServiceView
          location={deliveryLocation}
          language={language}
          onChangeLocation={() => {
            setIsSelectingLocation(true);
            setIsMapPickerOpen(false);
          }}
          onSelectHub={handleSelectHub}
        />
      ) : (
        /* 3. Main Food & Grocery Customer Discovery Interface */
        <div className="min-h-screen bg-[#EEF2F9] dark:bg-[#0D1117] text-[#1A202C] dark:text-[#F0F4F8] flex flex-col transition-colors">
          {/* Tier 2 Quota Defense Banner */}
          <QuotaWarningBanner />

          {/* Sticky Customer Header */}
          <CustomerHeader
            location={
              deliveryLocation || {
                id: 'loc-default',
                label: 'Selected',
                address: 'Dar es Salaam',
                city: 'Dar es Salaam',
                country: 'Tanzania',
                countryCode: 'TZ',
                lat: -6.7725,
                lng: 39.2450,
                isServiced: true,
              }
            }
            activeHub={currentHub}
            cartCount={cartItems.reduce((acc, c) => acc + c.quantity, 0)}
            language={language}
            onOpenLocationPicker={() => {
              setIsSelectingLocation(true);
              setIsMapPickerOpen(false);
            }}
            onOpenCart={() => setIsCartOpen(true)}
            onLogoClick={() => setShowSplash(true)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setThemeMode(isDarkMode ? 'light' : 'dark')}
          />

          {/* Main Body per Active Tab */}
          <main className="flex-1 max-w-xl mx-auto w-full">
            {activeTab === 'home' && (
              <div>
                {showMapView && (
                  <div className="px-4">
                    <HomeMapOverlay
                      activeHub={currentHub}
                      merchants={merchants.filter((m) => m.hubId === currentHub.id)}
                      isDarkMode={isDarkMode}
                      onSelectMerchant={(m) => setSelectedMerchant(m)}
                      onClose={() => setShowMapView(false)}
                    />
                  </div>
                )}

                <HomeFeed
                  merchants={merchants}
                  activeHub={currentHub}
                  language={language}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectMerchant={(m) => setSelectedMerchant(m)}
                  onToggleMapView={() => setShowMapView(!showMapView)}
                  isMapViewActive={showMapView}
                  isLoading={isLoadingMerchants}
                  error={merchantsError}
                  onRetry={loadLiveMerchants}
                />
              </div>
            )}

            {activeTab === 'search' && (
              <div className="p-4">
                <h2 className="text-xl font-extrabold mb-3 text-[#1A202C] dark:text-[#F0F4F8]">
                  Search Food & Groceries
                </h2>
                <HomeFeed
                  merchants={merchants}
                  activeHub={currentHub}
                  language={language}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectMerchant={(m) => setSelectedMerchant(m)}
                  isLoading={isLoadingMerchants}
                  error={merchantsError}
                  onRetry={loadLiveMerchants}
                />
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="p-4 space-y-4 pb-28">
                <h2 className="text-xl font-extrabold text-[#1A202C] dark:text-[#F0F4F8]">
                  Your Orders
                </h2>
                {orders.length === 0 ? (
                  <NeuCard elevation="flat" className="py-16 text-center p-6">
                    <Clock className="w-12 h-12 text-[#8492A6] mx-auto mb-3" />
                    <h4 className="font-bold text-base text-[#1A202C] dark:text-[#F0F4F8]">
                      No orders yet
                    </h4>
                    <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-1 max-w-xs mx-auto">
                      When you place an order, live Firestore delivery tracking and receipts will appear here.
                    </p>
                    <div className="mt-4 flex justify-center">
                      <NeuButton
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveTab('home')}
                      >
                        Explore Restaurants
                      </NeuButton>
                    </div>
                  </NeuCard>
                ) : (
                  orders.map((ord) => (
                    <NeuCard
                      key={ord.id}
                      elevation="flat"
                      clickable
                      onClick={() => setTrackingOrder(ord)}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-mono font-bold text-[#FF5A1F]">
                            #{ord.referenceNumber}
                          </span>
                          <h4 className="font-bold text-base text-[#1A202C] dark:text-[#F0F4F8] mt-0.5">
                            {ord.merchantName}
                          </h4>
                          <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4]">
                            {ord.items.length} items · {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <span className="px-2.5 py-1 rounded-full neu-pressed text-emerald-600 dark:text-emerald-400 text-xs font-bold capitalize">
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#DCE4EF]/60 dark:border-[#1F293D]/60 flex items-center justify-between text-xs">
                        <span className="text-[#5A6A80] dark:text-[#8B9BB4] font-medium">
                          {ord.paymentMethod.toUpperCase()} · Paid
                        </span>
                        <span className="text-[#FF5A1F] font-bold hover:underline">
                          Track Live Delivery →
                        </span>
                      </div>
                    </NeuCard>
                  ))
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="p-4 space-y-4 pb-28">
                <h2 className="text-xl font-extrabold text-[#1A202C] dark:text-[#F0F4F8]">
                  Saved Favorites
                </h2>
                {favorites.length === 0 ? (
                  <NeuCard elevation="flat" className="py-16 text-center p-6">
                    <Heart className="w-12 h-12 text-[#8492A6] mx-auto mb-3" />
                    <h4 className="font-bold text-base text-[#1A202C] dark:text-[#F0F4F8]">
                      No favorites yet
                    </h4>
                    <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] mt-1 max-w-xs mx-auto">
                      Tap the heart icon on any restaurant or grocery store to save it for quick access.
                    </p>
                  </NeuCard>
                ) : (
                  merchants.filter((m) => favorites.includes(m.id)).map((m) => (
                    <NeuCard
                      key={m.id}
                      elevation="flat"
                      clickable
                      onClick={() => setSelectedMerchant(m)}
                      className="p-3.5 flex items-center gap-3"
                    >
                      <img
                        src={m.image}
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 neu-flat-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-[#1A202C] dark:text-[#F0F4F8] truncate">
                          {m.name}
                        </h4>
                        <p className="text-xs text-[#5A6A80] dark:text-[#8B9BB4] truncate">
                          {m.cuisine}
                        </p>
                        <div className="text-xs text-[#8492A6] mt-1 font-semibold">
                          ★ {m.rating} · {m.deliveryTimeMinutes} mins
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(m.id);
                        }}
                        className="p-2 text-[#FF5A1F] cursor-pointer"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </NeuCard>
                  ))
                )}
              </div>
            )}

            {activeTab === 'account' && (
              <AccountView
                currentLocation={
                  deliveryLocation || {
                    id: 'loc-default',
                    label: 'Home',
                    address: 'Dar es Salaam',
                    city: 'Dar es Salaam',
                    country: 'Tanzania',
                    countryCode: 'TZ',
                    lat: -6.7725,
                    lng: 39.2450,
                    isServiced: true,
                  }
                }
                savedAddresses={savedAddresses}
                activeHub={currentHub}
                language={language}
                isDarkMode={isDarkMode}
                themeMode={themeMode}
                onSelectThemeMode={setThemeMode}
                onSelectLanguage={setLanguage}
                onOpenLocationPicker={() => {
                  setIsSelectingLocation(true);
                  setIsMapPickerOpen(false);
                }}
                onSelectSavedAddress={handleSelectSavedAddress}
                onSelectHub={handleSelectHub}
                onResetOnboarding={handleResetOnboarding}
                onShowSplash={() => setShowSplash(true)}
              />
            )}
          </main>

          {/* Persistent Bottom 5-Tab Navigation */}
          <BottomNav
            activeTab={activeTab}
            language={language}
            ordersCount={orders.length}
            favoritesCount={favorites.length}
            onSelectTab={setActiveTab}
          />

          {/* Merchant Details Modal */}
          {selectedMerchant && (
            <MerchantDetailModal
              merchant={selectedMerchant}
              activeHub={currentHub}
              language={language}
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              onOpenCart={() => setIsCartOpen(true)}
              onBack={() => setSelectedMerchant(null)}
            />
          )}

          {/* Shopping Cart Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            cartItems={cartItems}
            merchantName={activeCartMerchant?.name || 'Starches Merchant'}
            activeHub={currentHub}
            language={language}
            deliveryFee={deliveryFee}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={() => setCartItems([])}
            onProceedToCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
            onClose={() => setIsCartOpen(false)}
          />

          {/* Checkout Modal */}
          {isCheckoutOpen && deliveryLocation && (
            <CheckoutModal
              isOpen={isCheckoutOpen}
              cartItems={cartItems}
              merchantName={activeCartMerchant?.name || 'Starches Merchant'}
              merchantId={activeCartMerchant?.id || ''}
              deliveryLocation={deliveryLocation}
              activeHub={currentHub}
              language={language}
              deliveryFee={deliveryFee}
              onEditAddress={() => {
                setIsCheckoutOpen(false);
                setIsSelectingLocation(true);
              }}
              onPlaceOrder={handlePlaceOrder}
              onClose={() => setIsCheckoutOpen(false)}
            />
          )}

          {/* Order Tracking Modal */}
          {trackingOrder && (
            <OrderTrackingModal
              order={trackingOrder}
              language={language}
              isDarkMode={isDarkMode}
              onClose={() => setTrackingOrder(null)}
            />
          )}
        </div>
      )}
    </APIProvider>
  );
}
