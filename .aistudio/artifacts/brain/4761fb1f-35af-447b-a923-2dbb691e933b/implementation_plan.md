# Starches — Worldwide Customer Mobile Delivery App

A premium, mobile-first food delivery and food retail customer application with **worldwide geographic flexibility**. Customers can drop their delivery pin or search for any location globally on the interactive map. The app automatically detects the selected country and city, customizes the marketplace catalog, currency, and payment options for active regions (including Tanzania, Zambia, France, UK, etc.), and displays an elegant, branded "Expanding Soon" screen with waiting list sign-up whenever a user selects a location outside active service zones.

***

### User Review & Critical Decisions

> [!IMPORTANT]
> The following revisions have been incorporated directly from your guidance:

- **Worldwide Location Architecture**: The customer can search or drag the map pin to **any location worldwide** (e.g., Paris, France; Lusaka, Zambia; Dar es Salaam, Tanzania; London, UK; New York, USA; Tokyo, Japan, etc.).
- **Dynamic Service Zone Detection & Graceful Fallback**:
  - **Active Service Hubs**: When the user selects an active city (e.g. Dar es Salaam, Lusaka, Paris, London), the app dynamically loads local merchants, regional cuisines (e.g. Swahili pilau & mishkaki in Dar, nshima & grilled tilapia in Lusaka, boulangeries & bistros in Paris), local currencies (TZS, ZMW, EUR, GBP), and regional payment options.
  - **"Expanding Soon" Out-of-Service Screen**: If the user selects an area where Starches has not yet launched (e.g., non-serviced cities or countries), the app clearly informs them: *"Starches hasn't reached [Location] yet. We're expanding rapidly and will soon reach you!"*, offering an email/phone launch notification signup and an instant one-tap switcher to test active cities.
- **Stationary Center Pin & Global Geocoding**: The map retains the smooth stationary pin interaction over a panning world map, resolving addresses anywhere on Earth via reverse geocoding.
- **Brand Identity**: Retains Starches visual design: Primary Orange (`#FF8A00`), Warm-White (`#F8F7F3`), Elevated White (`#FFFFFF`), Charcoal text (`#242424`), and dark mode support (`#171717`).

***

## 1. Overview & Core Concept

- **What It Does**: Starches is a global-ready mobile food delivery and grocery retail app. Customers select their delivery point anywhere in the world on an interactive map. If Starches operates in that city, customers can immediately discover local restaurants, fresh food retailers, customize items, manage a cart, checkout in local currency, and track orders. If the area is unserviced, customers receive clear, friendly feedback with launch notifications and sample city previews.
- **Target Audience / Persona**: Customers worldwide ordering food and groceries, with dynamic adaptation to local culture, cuisine, and payment methods.
- **Key Value**: No hardcoded borders—instant global geocoding, contextual regional merchants and currencies, transparent service boundaries, and consistent tactile mobile UX.

***

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────────────────────┐
│  1. Global Map Pin Selection    │ (Search or pan anywhere: France, Zambia, Tanzania, etc.)
└────────────────┬────────────────┘
                 │
                 ▼
      [ Service Zone Check ]
       /                 \
  [Active Zone]     [Unserviced Zone]
     /                     \
    ▼                       ▼
┌───────────────────────┐ ┌───────────────────────────────────────┐
│ 2. Localized Home Feed│ │ 2b. "Expanding Soon" Notification Screen │
│ - Country/City Hub    │ │ - "We'll soon reach [City]!"          │
│ - Local Currency      │ │ - Enter email/phone for launch alert  │
│ - Regional Food Cards │ │ - Quick switch to active cities       │
└───────────┬───────────┘ └───────────────────────────────────────┘
            │
            ▼
┌───────────────────────┐
│ 3. Merchant & Menu    │
│ - Customization Sheet │
│ - Single-Merchant Cart│
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 4. Localized Checkout │ (TZS/Mobile Money in TZ, ZMW in ZM, EUR/Card in FR)
│ - Place Order         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 5. Order Tracking     │ (Live vertical progress timeline)
└───────────────────────┘
```

1. **Global Location Selection Screen (First Screen)**:
   - Header with Starches wordmark and quick light/dark theme toggle.
   - Address search bar with worldwide search support and popular quick-location chips:
     - 🇹🇿 Dar es Salaam (Kinondoni & Mikocheni)
     - 🇿🇲 Lusaka (Kabulonga & Woodlands)
     - 🇫🇷 Paris (Le Marais & 6th Arrondissement)
     - 🇬🇧 London (Soho & Covent Garden)
     - 📍 Pinpoint any other location worldwide
   - Interactive Google Map with a stationary center pin, recenter GPS button, and instant coordinate-to-address resolution.
   - Dynamic location card showing: Detected country, city/neighborhood, active service status badge, and "Confirm delivery location" button.
2. **"Expanding Soon" State (For Non-Serviced Locations)**:
   - When the confirmed location is outside active delivery zones:
     - Clean, friendly visual illustration with delivery scooter or map pin.
     - Headline: *"Starches hasn't reached [City, Country] yet!"*
     - Subtitle: *"We are expanding rapidly and will soon reach you. Enter your details to get notified the day we launch in your neighborhood."*
     - Quick phone/email notification input with immediate confirmation feedback.
     - Action button: *"Try Starches in an Active City"* opening a quick selector (Dar es Salaam, Lusaka, Paris, London) so users can test full app capabilities.
3. **Localized Marketplace Home (Active Locations)**:
   - Sticky header with active city and address (tap to switch location).
   - Dynamic currency and categories matching the region:
     - **Tanzania Hub (TZS)**: Local Swahili (Pilau, Biryani, Mishkaki, Samaki), Fresh Groceries, Tropical Fruits, Drinks.
     - **Zambia Hub (ZMW)**: Nshima & Village Chicken, Braai/Grilled Meats, Fresh Farm Groceries, Cafe & Bakery.
     - **France Hub (EUR €)**: Boulangerie & Patisserie, French Bistros, Fromagerie & Artisanal Grocery, Gourmet Burgers.
     - **UK Hub (GBP £)**: Modern British Eateries, Specialty Grocers, Bakeries, Street Food.
   - Expandable map overlay and feed cards with unboxed metadata (ratings, delivery time, distance, delivery fee).
4. **Merchant Menus & Customization Bottom Sheet**:
   - Merchant details, cuisine tags, delivery times, and food items.
   - Interactive bottom customization sheet for selecting sizes, sauces, sides, and spice levels.
5. **Cart & Localized Checkout**:
   - Single-merchant guard with item quantities and clear pricing in local currency.
   - Payment methods adapted by country:
     - Tanzania: Cash on Delivery & Mobile Money (Vodacom M-Pesa, Airtel Money, Tigo Pesa).
     - Zambia: Cash on Delivery & Mobile Money (MTN Money, Airtel Money).
     - France & International: Card (Visa/Mastercard) and Cash on Delivery.
   - Instant order submission with validated phone number.
6. **Live Order Tracking**:
   - Order reference code, vertical step progress tracker (`Submitted` → `Accepted` → `Preparing` → `Rider Assigned` → `Out for Delivery` → `Delivered`), and rider contact simulation.
7. **Bottom Navigation & Customer Profile**:
   - 5 Persistent Tabs: Home, Search, Orders, Favorites, Account.
   - Account screen with Saved Addresses (across any city), Language Switcher (English, Swahili, French), Currency selector, and Dark/Light mode.

***

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Worldwide Geocoding with Regional Hub Config**
  - *Chosen Approach*: Maintain a modular `serviceHubs` registry defining supported geographic bounds, default currencies, supported payment types, and localized merchant catalogs. Locations outside these bounds automatically trigger the "Expanding Soon" flow.
  - *Why*: Gives true international flexibility while keeping order totals, currencies, and real merchant menus grounded and authentic.
- **Decision 2: Seamless Zone Switching**
  - *Chosen Approach*: When on the "Expanding Soon" screen, users can tap a 1-click shortcut to explore active demonstration cities without having to manually hunt for coordinates.
  - *Why*: Ensures users and evaluators never get stuck on a dead-end screen while testing worldwide coordinates.
- **Decision 3: Zero-Pill Typography & Tactile Mobile Ergonomics**
  - *Chosen Approach*: Adhere strictly to the anti-AI slop visual constitution: unboxed metadata separated by `·`, generous $\ge 44\text{px}$ touch targets, 52px primary buttons, and solid Starches orange (`#FF8A00`) accents without garish gradients.

***

## 4. Technical Architecture & Data Strategy

### System Component Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                   │
│      (Global Theme, Language, Active Location, Region Store, Cart)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌──────────────────────────────┐              ┌──────────────────────────────────┐
│ LocationPickerScreen         │              │ MainCustomerApp                  │
│ - Worldwide Google Map & Pin │              │ - Persistent Bottom Nav (5 Tabs) │
│ - Reverse Geocoding          │              │ - Sticky Delivery Header         │
│ - Active Hub Checker         │              └─────────────────┬────────────────┘
└──────────────────────────────┘                                │
                                  ┌─────────────────────────────┼─────────────────────────────┐
                                  ▼                             ▼                             ▼
                    ┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
                    │ Active Hub:             │   │ Unserviced Region:      │   │ OrdersScreen & Tracking │
                    │ HomeScreen Feed & Map   │   │ OutOfServiceView        │   │ - Active Delivery Map   │
                    │ - Regional Catalog      │   │ - "We'll soon reach you"│   │ - Status Stepper        │
                    │ - Local Currency        │   │ - Launch Waitlist Form  │   └─────────────────────────┘
                    └───────────┬─────────────┘   │ - 1-Click Active Hubs   │                 │
                                │                 └─────────────────────────┘                 │
                                ▼                                                             ▼
                    ┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
                    │ Restaurant & Item Modal │   │ CheckoutScreen          │   │ AccountScreen           │
                    │ - Customization Sheet   │──>│ - Region-specific Pay   │──>│ - Language & Currencies │
                    │ - Single-Merchant Cart  │   │ - Order Confirmation    │   │ - Saved Global Places   │
                    └─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
```

### Data Models & Hub Registry

- `ServiceHub`: `{ id, countryCode, countryName, cityName, center: { lat, lng }, currency: { code, symbol, format }, languages: string[], paymentMethods: PaymentMethod[], radiusKm: number }`
- Supported Hubs:
  - `tz-dar`: Tanzania, Dar es Salaam (TZS, `TSh`, Mobile Money + COD)
  - `zm-lusaka`: Zambia, Lusaka (ZMW, `K`, MTN/Airtel + COD)
  - `fr-paris`: France, Paris (EUR, `€`, Card + Cash)
  - `uk-london`: United Kingdom, London (GBP, `£`, Card + Cash)
- `DeliveryLocation`: `{ id, label, address, city, country, countryCode, lat, lng, isServiced, hubId?: string }`
- `Merchant` & `MenuItem`: Tagged with `hubId`, localized descriptions, and currency-specific pricing.

***

## 5. Implementation Stages & Verification Plan

1. **Brand Theme & Worldwide Hub Infrastructure**:
   - Establish Starches light/dark design system and `serviceHubs` definition for Dar es Salaam, Lusaka, Paris, London, and international out-of-service detection.
2. **Interactive Global Map & Location Picker**:
   - Implement stationary center pin over moving map with global geocoding, reverse geocoding, and quick-picker chips for both active hubs and worldwide destinations.
3. **Out-of-Service / "Expanding Soon" Screen**:
   - Build high-fidelity screen: *"Starches hasn't reached your location yet, but we'll soon reach you!"* with waitlist signup and instant active city preview buttons.
4. **Contextual Marketplace Discovery**:
   - Filter restaurants, food retailers, fresh produce, and menus dynamically based on the selected hub with authentic local dishes and currencies.
5. **Menu Customization, Cart & Region-Aware Checkout**:
   - Item option bottom sheet, single-merchant policy enforcement, localized payment options (M-Pesa/Airtel in TZ/ZM, Card in FR/UK, Cash on Delivery worldwide).
6. **Order Tracking, Account & Multi-Language Settings**:
   - Status tracking stepper with estimated arrival time, saved global addresses, and English/Swahili/French language support.
7. **Verification**:
   - Run `compile_applet` and verify responsiveness across mobile viewports and desktop widths.
