# Starches — Neumorphic UI Library & Live Firebase Integration

Starches is transitioning to a comprehensive Neumorphic (Soft-UI) and Glassmorphic interface while connecting the entire application lifecycle—restaurants, grocery stores, menus, custom options, cart calculation, address management, and live order tracking—to real Firebase Firestore persistence with automated initial data seeding and ultra-fast vector map rendering.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during Phase 1 clarification:
> - **Firebase Provisioning**: Firebase will be provisioned via AI Studio tooling (`show_aistudio_ui` / `set_up_firebase`), generating `firebase-applet-config.json`, `firebase-blueprint.json`, and hardened `firestore.rules`.
> - **Neumorphism Integration**: Because `ui-neumorphism` targets React 16–17 peer dependencies while this application runs React 19, we will adopt a robust hybrid strategy: integrating `ui-neumorphism`'s core styling and stylesheet tokens combined with React 19-native neumorphic and glassmorphic primitive components (`NeumorphicCard`, `NeumorphicButton`, `NeumorphicInput`, `NeumorphicSwitch`, `GlassSheet`) guaranteeing zero dependency breakage, smooth framer-motion drag animations, and responsive soft-shadow depth.
> - **Initial Catalog Seeding**: Upon Firestore database initialization, Starches will automatically seed the collections (`hubs`, `merchants`, `menu_items`, `categories`) from the current regional catalog, ensuring instant live data availability across Tanzania (Dar es Salaam), Zambia (Lusaka), France (Paris), and UK (London).

---

## 1. Overview & Core Concept

- **What It Does**: Starches is a high-performance food and grocery delivery web application tailored for diverse regional hubs. Customers select their delivery location immediately upon launch (via GPS, live address search, or interactive map), browse local restaurants and fresh groceries across filtered tabs, customize dishes, add items to an itemized cart, check out with local payment options (Cash on Delivery, M-Pesa, Airtel Money, Tigo Pesa, MTN Money, Card), and track orders with live Firestore listeners.
- **Target Audience / Persona**: Everyday urban consumers ordering takeaway meals or fresh grocery provisions who expect tactile, responsive visual feedback, instant map loading, and transparent order tracking.
- **Key Value**: Tactile Neumorphic design with soft-elevation lighting, real-time Firestore database persistence with offline resilience, and rapid vector map interactions inspired by modern mobility apps like Bolt.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Location-First Onboarding**: The app greets the user with an immediate location selection prompt ("Where should we deliver?") offering GPS detection, autocomplete search, interactive map pin, or previous saved addresses. The main catalog unlocks only after location confirmation.
2. **Catalog Exploration (3 Main Tabs + Sub-tabs)**:
   - **All Tab**: Combines top culinary picks, nearby merchants, and fresh markets.
   - **Restaurants Tab**: Filtered by Swahili local food, pilau, grilled/choma, fast food, breakfast/bakery.
   - **Groceries Tab**: Filtered by farm-fresh vegetables, dairy, bakery, meat, and pantry essentials.
   - Sub-filters: "Near Me", "Top Rated", "Fast Delivery", "Promotions".
3. **Item Customization & Contiguous Purchase**: Selecting an item opens a Neumorphic/Glass bottom sheet displaying portion options, required/optional add-ons, quantity stepper, and a live subtotal button.
4. **Checkout & Live Order Tracking**: Customers enter recipient details, select payment method, and submit the order. The order is committed directly to Firestore `/orders/{orderId}`, and the customer enters the live tracking view with simulated rider updates and status progression (`submitted` → `accepted` → `preparing` → `out_for_delivery` → `delivered`).

### Visual Identity & Theme
- **Light Theme**:
  - Background: `#EEF2F9` (Icy White)
  - Neumorphic Surfaces & Cards: `#F8FAFF` with dual soft shadows (Light highlight `#FFFFFF` at `-4px -4px 10px`, ambient drop shadow `rgba(166, 180, 200, 0.45)` at `4px 4px 10px`)
  - Inset Pressed States: `inset 2px 2px 5px rgba(166, 180, 200, 0.5), inset -2px -2px 5px #FFFFFF`
  - Text: Charcoal `#1A202C` and muted slate `#5A6A80`
- **Dark Theme**:
  - Background: `#0D1117` (Premium Black)
  - Neumorphic Surfaces & Cards: `#111722` with dual soft dark shadows (Soft rim highlight `rgba(255, 255, 255, 0.04)` at `-3px -3px 8px`, deep shadow `rgba(0, 0, 0, 0.7)` at `4px 4px 12px`)
  - Inset Pressed States: `inset 2px 2px 6px rgba(0, 0, 0, 0.8), inset -2px -2px 6px rgba(255, 255, 255, 0.03)`
  - Text: Soft white `#F0F4F8` and muted steel `#8B9BB4`
- **Brand Accent**: Vivid Orange `#FF5A1F` for active tabs, primary CTAs, order badges, and map pins.
- **Glassmorphism**: Translucent floating map controls, header blur, and draggable bottom sheets using `backdrop-blur-md bg-white/70 dark:bg-[#111722]/80 border border-white/40 dark:border-white/10`.
- **Typography**: Clean Inter typography with tabular numerals (`tabular-nums`) for currency, delivery times, and distances.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: React 19 Neumorphic Architecture**
  - *Chosen Approach*: Implement a curated set of custom React 19 Neumorphic components (`NeumorphicCard`, `NeumorphicButton`, `NeumorphicInput`, `NeumorphicSwitch`, `NeumorphicSegmentedControl`) styled with calibrated CSS soft-shadow curves while incorporating `ui-neumorphism` design tokens.
  - *Why*: The external `ui-neumorphism` package depends on React 16/17 and causes React 19 runtime warnings and synthetic event issues with touch gestures. Native components deliver 100% React 19 compatibility, zero bundle bloat, and smooth 60fps animations.
- **Decision 2: Automated Firestore Seeding with Client-Side Fallback**
  - *Chosen Approach*: When Firebase connects, a lightweight check queries the `merchants` collection. If empty or unseeded, it batch-writes the default catalog to Firestore. If offline or provisioning is pending, it displays cached/local data gracefully with a retry indicator.
  - *Why*: Guarantees zero blank screens on first launch while immediately populating real Firestore records for live queries.
- **Decision 3: Vector Map Performance Optimization**
  - *Chosen Approach*: Native Google Maps Vector Engine with `mapId="DEMO_MAP_ID"`, debounced reverse-geocoding (350ms delay using `useRef` for current center), and preconnected CDN links in `index.html`.
  - *Why*: Eliminates high-frequency re-renders during panning, keeping map interactions silky smooth like Bolt.

---

## 4. Technical Architecture & Data Strategy

### System & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Starches Client (React 19)                      │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     CustomerHeader & Top Bar                   │   │
│   │        [Brand: Starches]  ·  [Delivery Address Bar]  ·  [Cart] │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌───────────────────────────────┐  ┌─────────────────────────────┐   │
│   │      Location Gate Modal      │  │      HomeMapOverlay         │   │
│   │  (GPS / Search / Map Pin)     │  │  (Vector Map, DEMO_MAP_ID)  │   │
│   └──────────────┬────────────────┘  └──────────────┬──────────────┘   │
│                  ▼                                  ▼                  │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      HomeFeed (Neumorphic)                     │   │
│   │   [All] [Restaurants] [Groceries]  |  Sub-tabs: Near Me, etc.  │   │
│   │   ┌───────────────────────┐   ┌────────────────────────────┐   │   │
│   │   │   NeumorphicCard      │   │   NeumorphicCard           │   │   │
│   │   │   (Merchant Listing)  │   │   (Grocery Listing)        │   │   │
│   │   └───────────────────────┘   └────────────────────────────┘   │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   ▼                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │         ItemCustomizationSheet  ──►  CartDrawer (Glass)        │   │
│   │         CheckoutModal (Address + Payment) ──► Order Created    │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │              OrderTrackingModal (Real-time Listener)           │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Firebase Firestore & Security Rules                  │
│                                                                        │
│   /hubs/{hubId}                   ── Service areas & currencies        │
│   /merchants/{merchantId}         ── Restaurant & grocery profiles     │
│   /menu_items/{itemId}            ── Dishes, groceries & options       │
│   /orders/{orderId}               ── Customer orders & live status     │
│   /customer_addresses/{addressId} ── Saved user delivery locations     │
└────────────────────────────────────────────────────────────────────────┘
```

### Firestore Schema & Collections

1. `hubs`:
   - `id`: string (e.g. `tz-dar`, `zm-lusaka`, `fr-paris`, `uk-london`)
   - `cityName`: string
   - `countryCode`: string
   - `currency`: `{ code: string, symbol: string, decimals: number }`
   - `center`: `{ lat: number, lng: number }`
   - `radiusKm`: number
   - `supportedPayments`: array of strings

2. `merchants`:
   - `id`: string
   - `hubId`: string
   - `name`: string
   - `type`: `'restaurant' | 'grocery'`
   - `cuisine`: string
   - `rating`: number
   - `deliveryTimeMinutes`: number
   - `deliveryFee`: number
   - `minOrder`: number
   - `image`: string
   - `lat`: number
   - `lng`: number
   - `tags`: array of strings

3. `menu_items`:
   - `id`: string
   - `merchantId`: string
   - `name`: string
   - `description`: string
   - `price`: number
   - `category`: string
   - `image`: string
   - `isAvailable`: boolean
   - `customizationGroups`: array of `{ id, name, required, options }`

4. `orders`:
   - `id`: string
   - `referenceNumber`: string
   - `merchantId`: string
   - `merchantName`: string
   - `hubId`: string
   - `items`: array of CartItems
   - `subtotal`: number
   - `deliveryFee`: number
   - `serviceFee`: number
   - `total`: number
   - `status`: `'submitted' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered'`
   - `createdAt`: timestamp / ISO string
   - `deliveryLocation`: DeliveryLocation object
   - `recipientPhone`: string
   - `paymentMethod`: string

### Execution Phases & Step-by-Step Milestones
1. **Firebase Setup**:
   - Trigger `show_aistudio_ui` with `firebase_setup`.
   - Verify acceptance via `GetFirebaseTos` and execute `ProvisionFirebase`.
   - Create `src/services/firebase.ts`, `firebase-blueprint.json`, and secure `firestore.rules`.
   - Create `src/services/catalogService.ts` for fetching/seeding live Firestore data with loading/error states.
2. **Neumorphism & Glassmorphism Styling**:
   - Add Neumorphic utility classes and CSS variables in `src/index.css`.
   - Create reusable components in `src/components/neumorphic/`: `NeumorphicCard`, `NeumorphicButton`, `NeumorphicInput`, `NeumorphicSwitch`, `NeumorphicSegment`.
   - Update `CustomerHeader`, `HomeFeed`, `MerchantDetailModal`, `ItemCustomizationSheet`, `CartDrawer`, `CheckoutModal`, and `OrderTrackingModal` with cohesive Neumorphic surfaces and Glassmorphic overlays.
3. **Map Performance & Delivery Location**:
   - Confirm Vector Map with `DEMO_MAP_ID` and ensure instant 60fps load times.
   - Retain the initial delivery location gate on app launch.
4. **Verification**:
   - Run compilation and verify complete order creation, cart math, and live Firestore sync.
