# FlightM - Flight Management Web App (PWA)

A responsive, production-like flight management application built with Next.js 14, Supabase, and Zustand.

## 🚀 Features

- **Flight Search**: Search flights by origin, destination, and date.
- **Interactive Seat Selection**: Live aircraft seat map with real-time availability updates using Supabase Realtime.
- **Booking Flow**: Seamless journey from search to confirmation with PNR generation.
- **Booking Management**: View, reschedule, and cancel bookings.
- **PWA Support**: Installable on mobile/desktop with offline fallback and caching.
- **Atomic Operations**: Prevents double-booking using PostgreSQL RPC functions.
- **Security**: Row Level Security (RLS) ensures users only access their own data.

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: Zustand with `persist` middleware
- **PWA**: `next-pwa`
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
   - Run the migration script in `supabase/migrations/20240521000000_initial_schema.sql` in your Supabase SQL Editor.
   - Run the seed script in `supabase/seed.sql` to populate initial flights and seats.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🏗 Zustand Store Structure

The application uses two primary Zustand stores:

### `useFlightStore`
Manages the flight booking journey state.
- **Fields**: `searchQuery`, `selectedFlight`, `selectedSeat`, `passengerData`, `currentStep`.
- **Persistence**: Saved to `localStorage` via `persist` middleware.
- **Security**: Uses `partialize` to exclude sensitive fields like `passport_no` from being saved to `localStorage`.
- **Optimistic UI**: Tracks seat selection before database confirmation.

### `useUserStore`
Manages user authentication and session.
- **Fields**: `session`, `bookings` (cache).
- **Persistence**: Only the `session` object is persisted to ensure seamless logins.

## 🗄 Database Schema

- `flights`: Flight details (route, time, aircraft, price).
- `seats`: Dynamic seat map for each flight with availability and class info.
- `bookings`: Link between users, flights, and seats.
- `passengers`: Personal details for each booking.
- `reschedules`: History of flight changes.

### Atomic Operations (RPC)
- `reserve_seat`: Uses `SELECT FOR UPDATE` to lock a seat row, ensuring no two users can book the same seat simultaneously.
- `cancel_booking`: Updates booking status and frees the seat atomically, enforcing a 2-hour departure rule.

## 📱 PWA & Offline Support
- **Manifest**: Located in `public/manifest.json`.
- **Offline Fallback**: Custom page at `/offline` shown when connection is lost.
- **Caching**: 
    - `StaleWhileRevalidate` for flight searches.
    - `CacheFirst` for static assets.

---
*Developed as part of an Internship Application.*
