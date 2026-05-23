# FlightM - Premium Flight Management Web App (PWA)

A responsive, production-grade flight management application built with Next.js 15, Supabase, and Zustand. Features a cinematic entrance and comprehensive round-trip booking capabilities.

## 🚀 Key Features

- **Cinematic Experience**: Smooth splash screen with a 3D-like flight takeoff animation and sequential typewriter hero reveals.
- **Round-Trip Booking**: Full support for one-way and round-trip journeys with a streamlined two-step flight selection process.
- **Dynamic Seat Selection**: Choose between free **Random Assignment** or paid **Manual Selection** with an interactive seat map.
- **In-flight Dining**: Integrated meal and beverage selection (Standard, Premium, Snack) during the booking flow.
- **Auth-Protected Booking**: Secure booking protocol that requires user authentication before finalizing reservations.
- **PWA Support**: Fully installable on mobile/desktop with offline fallback and advanced caching strategies.
- **Real-time Synchronization**: Live aircraft seat maps with instant availability updates via Supabase Realtime.
- **Atomic Operations**: PostgreSQL RPC functions ensure no double-bookings or data inconsistencies.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Animations**: CSS Keyframes, Lucide React, Framer-inspired transitions
- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: Zustand with `persist` middleware
- **Date Handling**: `date-fns`
- **Icons**: Lucide React

## 📦 Local Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd FlightM
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
   ```bash
   cp .env.example .env.local
   ```

4. **Supabase Configuration**:
   - **Step 1**: Run the initial schema migration in `supabase/migrations/20240521000000_initial_schema.sql`.
   - **Step 2**: Apply the round-trip support migration in `supabase/migrations/20240523000000_round_trip_support.sql`.
   - **Step 3 (Recommended)**: Run `supabase/seed_expanded.sql` to populate a full week of flights and seats across all supported routes.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🏗 Zustand Store Structure (`useFlightStore`)

The application state has been enhanced to handle complex itineraries:
- **`searchQuery`**: Now includes `tripType` and `returnDate`.
- **Itinerary Tracking**: Supports `selectedFlight` (Outbound) and `selectedReturnFlight` (Inbound).
- **Extras**: Tracks `seatSelectionMode` (random/manual) and `foodOption`.
- **Security**: Sensitive passenger data is excluded from persistent storage using `partialize`.

## 🗄 Database Schema Updates

- `bookings`: Now supports `return_flight_id` and `return_seat_id` for atomic round-trip reservations.
- `reserve_seat (RPC)`: Updated to handle multi-segment locking and atomic updates for both legs of a journey in a single transaction.

## 📱 PWA & Performance
- **High Stacking Context**: The splash screen and loading fallbacks use a `z-index` of `100000` to ensure a glitch-free initial load.
- **Optimized Assets**: Uses standard CSS transforms and lightweight SVG icons for maximum performance.

---
*Developed as part of a high-end travel experience prototype.*
