# AGENTS

Quick orientation for automated agents working in this repo.

## Project Summary
- Next.js App Router app for Montreal motorcycle parking discovery.
- Key features: map + markers, address search, spot details sheet, i18n (en/fr), theming, analytics, user authentication, community contributions (photos + fullness).

## Tech Stack
- Framework: Next.js 16 (App Router)
- UI: React 19, TailwindCSS v4, Radix UI wrappers (from shadcn)
- State: Zustand
- Data Fetching: @tanstack/react-query
- Maps: Maplibre GL via react-map-gl, Mapbox search + reverse geocoding
- Data: Drizzle ORM + PostgreSQL (Neon)
- i18n: next-intl
- Analytics: posthog-js
- 3D: @react-three/fiber + drei (motorcycle model)
- Auth: better-auth (Google/Facebook OAuth)
- Image Upload: Cloudinary via next-cloudinary
- Animations: motion (framer-motion)
- Notifications: sonner
- Mobile UI: vaul (drawer)

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
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `CLOUDINARY_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

See `.env.template` for placeholders.

## App Structure
- `app/[locale]/page.tsx`: landing page (3D scene + CTA)
- `app/[locale]/map/page.tsx`: map page (server fetch + cache)
- `app/[locale]/sign-in/page.tsx`: sign-in page
- `app/[locale]/layout.tsx`: locale-aware layout
- `app/globals.css`: global styles

## Core Feature Flow
- Data source: Montreal open data API (motorcycle parking rules)
- `src/lib/api/parkings.ts`: fetches remote data, normalizes, upserts to DB, resolves addresses via Mapbox
- `src/lib/db/schema.ts`: Drizzle schema for `parkings`, `locations`, `user`, `session`, `account`, `verification`, `parking_spot_contributions`
- `app/[locale]/map/page.tsx`: server-side cached `getParkings()` -> `ParkingMap`
- `src/components/ParkingMap.tsx`: Maplibre map + markers + geolocate + sheet
- `src/components/ParkingSpotSheet/`: detailed sheet for a selected parking spot
  - `ParkingSpotSheet.tsx`: main sheet component with marker
  - `ParkingSpotViews/ParkingSpotMainView.tsx`: displays spot details + contributions
  - `ParkingSpotViews/ParkingSpotContributeView.tsx`: form to submit contribution
  - `ContributionCard.tsx`: individual contribution display
  - `FullnessSlider.tsx`: slider for fullness level
  - `ParkingUpdateForm.tsx`: form wrapper for contribution submission
- `src/components/SearchAddressButton.tsx`: Mapbox search dialog, sets store coordinates
- `src/lib/zustand/store.ts`: map-related UI state

## Authentication
- better-auth with Google and Facebook OAuth providers
- `src/lib/auth.ts`: server-side auth config
- `src/lib/auth-client.ts`: client-side auth hooks
- `app/api/auth/[...all]/route.ts`: auth API routes (handled by better-auth)
- User roles: `user` (default), `admin` (can ban users, delete any contribution)

## API Routes
- `app/api/auth/[...all]/route.ts`: better-auth handler
- `app/api/contributions/route.ts`: GET (list) / POST (create) contributions
- `app/api/contributions/[id]/route.ts`: DELETE contribution (owner or admin)
- `app/api/contributions/check/route.ts`: check if user can contribute (rate limit)
- `app/api/sign-cloudinary-params/route.ts`: generate Cloudinary upload signature
- `app/api/user/ban/route.ts`: ban/unban users (admin only)
- `app/api/user/delete/route.ts`: delete user account

## Community Contributions
- Users can submit photos + fullness level (0-100) for parking spots
- Rate limit: 1 contribution per parking spot per 18 hours
- Display limit: latest 5 contributions shown per parking spot
- `src/lib/api/contributions.ts`: contribution CRUD operations
- `src/lib/api/cloudinary.ts`: Cloudinary image upload helpers

## i18n
- Messages in `messages/en.json`, `messages/fr.json`
- Routing via `src/i18n/routing.ts` and `src/i18n/navigation.ts`
- Locale switch: `src/i18n/LocaleSwitch.tsx`

## Theming
- `src/components/ThemeProvider.tsx`: next-themes provider
- `src/components/layout/ThemeSwitcher.tsx`: user toggle

## Analytics
- posthog events are sent in map/search/clipboard/contribution flows (see components).

## UI Components
- Base UI primitives in `src/components/ui/*` (Radix-based)
- Shared layout in `src/components/layout/*`

## 3D Asset
- `public/motorcycle.glb` rendered in `src/components/MotorcycleScene.tsx`

## Notes for Agents
- No test suite detected (no `*.test.*` / `*.spec.*` files).
- App uses both Tailwind and styled-components (see `ParkingSpotSheet.tsx`).
- Avoid modifying `.env` values; use `.env.template` for docs.