# AGENTS

Quick orientation for automated agents working in this repo.

## Project Summary
- Next.js App Router app for Montreal motorcycle parking discovery.
- Key features: map + markers, address search, spot details sheet, i18n (en/fr), theming, analytics.

## Tech Stack
- Framework: Next.js 16 (App Router)
- UI: React 19, TailwindCSS v4, Radix UI wrappers (from shadcn)
- State: Zustand
- Maps: Maplibre GL via react-map-gl, Mapbox search + reverse geocoding
- Data: Drizzle ORM + PostgreSQL (Neon)
- i18n: next-intl
- Analytics: posthog-js
- 3D: @react-three/fiber + drei (motorcycle model)

## Running the App
- Dev: `bun run dev`
- Build: `bun run build`
- Start: `bun run start`
- Lint: `bun run lint`

## Environment Variables
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEON_CONNECTION_STRING`

See `.env.template` for placeholders.

## App Structure
- `app/[locale]/page.tsx`: landing page (3D scene + CTA)
- `app/[locale]/map/page.tsx`: map page (server fetch + cache)
- `app/[locale]/layout.tsx`: locale-aware layout
- `app/globals.css`: global styles

## Core Feature Flow
- Data source: Montreal open data API (motorcycle parking rules)
- `src/lib/api/parkings.ts`: fetches remote data, normalizes, upserts to DB, resolves addresses via Mapbox
- `src/lib/db/schema.ts`: Drizzle schema for `parkings` and `parking_addresses`
- `app/[locale]/map/page.tsx`: server-side cached `getParkings()` -> `ParkingMap`
- `src/components/ParkingMap.tsx`: Maplibre map + markers + geolocate + sheet
- `src/components/ParkingSpotSheet.tsx`: detailed sheet for a selected parking spot
- `src/components/SearchAddressButton.tsx`: Mapbox search dialog, sets store coordinates
- `src/lib/zustand/*`: map-related UI state

## i18n
- Messages in `messages/en.json`, `messages/fr.json`
- Routing via `src/i18n/routing.ts` and `src/i18n/navigation.ts`
- Locale switch: `src/i18n/LocaleSwitch.tsx`

## Theming
- `src/components/ThemeProvider.tsx`: next-themes provider
- `src/components/layout/ThemeSwitcher.tsx`: user toggle

## Analytics
- posthog events are sent in map/search/clipboard flows (see components).

## UI Components
- Base UI primitives in `src/components/ui/*` (Radix-based)
- Shared layout in `src/components/layout/*`

## 3D Asset
- `public/motorcycle.glb` rendered in `src/components/MotorcycleScene.tsx`

## Notes for Agents
- No test suite detected (no `*.test.*` / `*.spec.*` files).
- App uses both Tailwind and styled-components (see `ParkingSpotSheet.tsx`).
- Avoid modifying `.env` values; use `.env.template` for docs.
