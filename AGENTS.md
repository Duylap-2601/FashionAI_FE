# FashionAI Frontend Working Guide

## Stack And Commands

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, TanStack Query,
Zustand, Axios, Radix UI, Lucide, Motion (Framer), Three.js / React Three Fiber,
Recharts, Zod, socket.io-client, Capacitor (mobile bridge), and @ducanh2912/next-pwa.
Keep this stack when refactoring.

```bash
npm ci
npm run dev              # http://localhost:3001
npm run lint
npm run typecheck
npm run build
npm start                # http://localhost:3001
npm.cmd test             # Node built-in test runner (tests/*.test.cjs)
npm.cmd run check:architecture   # scripts/check-architecture.cjs
```

If PowerShell blocks `.ps1` scripts, use `npm.cmd` / `npx.cmd`.

## Source Structure

```text
src/
├── app/
│   ├── (admin)/admin/
│   │   ├── collections/     # Admin collection management page
│   │   └── dashboard/       # Admin dashboard page
│   ├── (auth)/              # login, register, forgot-password, reset-password,
│   │                        # verify-email, google callback, mobile-auth callback
│   ├── (main)/              # Authenticated user routes
│   │   ├── ai-stylist/      # AI stylist page
│   │   ├── cart/
│   │   ├── chat/
│   │   ├── checkout/
│   │   ├── notifications/
│   │   ├── orders/
│   │   ├── payment/
│   │   ├── products/[id]/
│   │   ├── profile/         # + history/, measurements/, orders/, reviews/,
│   │   │                    #   stylist-history/ sub-pages
│   │   ├── rack/
│   │   ├── subscription/
│   │   └── try-on/
│   ├── api/auth/google/     # Google OAuth route handler
│   ├── offline/             # PWA offline fallback page
│   ├── fonts/
│   ├── globals.css          # Reference stylesheet (do not delete)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (thin wrapper)
├── features/
│   ├── admin/               # components/ constants/ services/ types/
│   │                        # services: queries.ts, mutations.ts, format.ts,
│   │                        #           api.ts, requests.ts, <panel>.ts (type files)
│   │                        # components: dashboard-overview, admin-*-panel,
│   │                        #             admin-*-modal, admin-pagination,
│   │                        #             admin-live-try-on-settings-panel,
│   │                        #             admin-shipping-settings-panel,
│   │                        #             admin-webhook-failures-panel
│   ├── auth/                # components/ constants/ hooks/ services/ store/ types/
│   │                        # hooks: useAuth.ts, use-change-password.ts
│   │                        # store: authStore.ts (Zustand)
│   │                        # services: session.ts, mutations.ts, queries.ts,
│   │                        #           auth-events.ts, auth-utils.ts,
│   │                        #           password-mutations.ts, mutation-keys.ts
│   │                        # components: AuthBootstrap, AdminGuard, AuthLayout,
│   │                        #             OnboardingModal, *-page.tsx
│   ├── cart/                # components/ hooks/ store/ types/
│   │                        # store: cartStore.ts (Zustand)
│   ├── chat/                # components/ constants/ hooks/ services/ types/
│   │                        # services: queries.ts, mutations.ts, chat-utils.ts
│   ├── checkout/            # components/ constants/ hooks/ services/ types/
│   ├── collections/         # components/ hooks/ services/ types/
│   ├── home/                # components/ constants/ types/
│   ├── measurements/        # components/ constants/ hooks/ services/ types/
│   ├── notifications/       # components/ constants/ hooks/ services/ store/ types/
│   │                        # store: notificationStore.ts (Zustand)
│   ├── orders/              # components/ constants/ hooks/ services/ types/
│   ├── payments/            # components/ hooks/ services/ types/
│   ├── products/            # components/ constants/ hooks/ services/ types/
│   │                        # services: queries.ts, query-keys.ts, product-filters.ts,
│   │                        #           products-utils.ts, combo-pricing.ts
│   ├── profile/             # components/ hooks/ services/ types/
│   ├── rack/                # components/ hooks/ services/ types/
│   ├── reviews/             # components/ constants/ hooks/ services/ types/
│   ├── stylist/             # components/ constants/ hooks/ services/ types/
│   ├── subscription/        # components/ constants/ hooks/ services/ types/
│   └── try-on/              # components/ constants/ hooks/ services/ types/
│                            # components: TryOnWorkspace, TryOnResult, TryOnHeader,
│                            #             UploadZone, GenerateButton, LoadingOverlay,
│                            #             ComparisonSlider, CatalogModal,
│                            #             live-try-on-workspace, try-on-page,
│                            #             profile-history-page
├── components/
│   ├── figma/               # ImageWithFallback.tsx
│   ├── layout/              # Layout.tsx, BottomTabBar.tsx, Breadcrumb.tsx,
│   │                        # page-frame.tsx
│   ├── native/              # AppExitModal.tsx, NativeBackButtonHandler.tsx
│   │                        # (Capacitor mobile bridge)
│   ├── providers/           # Providers.tsx, RealtimeProvider.tsx
│   ├── pwa/                 # InstallPrompt.tsx, offline-page.tsx
│   └── ui/                  # shadcn/Radix primitives + custom: AnimateIn,
│                            # HangerIcon, Logo, PageTransition, chart.tsx,
│                            # sidebar.tsx, and full Radix component set
├── hooks/
│   └── usePWAInstall.ts
├── lib/
│   ├── http.ts              # Axios wrapper (GET/POST/PATCH/DELETE)
│   ├── api.ts               # Legacy Axios instance (PUT until migrated)
│   ├── api-interceptors.ts  # Token refresh, single-flight 401 handling
│   ├── http-types.ts        # Shared HTTP generic types
│   ├── realtimeSocket.ts    # socket.io-client wrapper + token cache
│   ├── overlay-manager.ts   # Global overlay/modal orchestration
│   ├── platform.ts          # Capacitor platform detection
│   ├── errors.ts            # Typed error helpers
│   └── utils.ts             # General utilities
├── styles/
│   ├── index.css            # Root entry: imports fonts, tailwind, theme
│   ├── fonts.css
│   ├── tailwind.css
│   ├── theme.css            # CSS custom properties / design tokens
│   └── globals.css          # (reference, do not delete)
├── middleware.ts             # auth_marker cookie guard for protected routes
└── (project root)
    ├── scripts/check-architecture.cjs
    ├── tests/               # Node built-in test runner (*.test.cjs)
    ├── public/              # PWA icons, manifest, screenshots, images
    ├── next.config.mjs      # next-pwa, image domains config
    ├── SRS.md               # Software Requirements Specification
    ├── FE_MIGRATION_PLAN.md # Migration tracking
    └── AGENTS.md            # This file
```

- Only create directories that contain files; do not create `screen/`.
- `public/`, package manifests, config files, and docs live at the project root.
- Alias `@/` points to `src/`.
- `page.tsx` should be a thin wrapper importing the page component from a feature.
  Keep layouts, route handlers, metadata, and route configuration in `app/`.
- Preserve file names when moving files. New file names use kebab-case; React
  components use PascalCase, and hooks start with `use`.
- `features/admin/services/` uses per-panel type files (e.g., `admin-orders-panel.ts`)
  alongside `queries.ts` and `mutations.ts`; follow the same pattern when adding panels.
- `products/services/` contains utility modules (`product-filters.ts`, `products-utils.ts`,
  `combo-pricing.ts`) in addition to `queries.ts`; keep them here, not in `lib/`.

## Business Ownership

- Shopping: `home`, `products`, `collections`, `cart`, `checkout`, `orders`, `payments`.
  Checkout and order pricing are backend-owned: the frontend may request quotes
  for display, but must not calculate or submit authoritative product totals,
  shipping fees, or discount amounts.
- Account: `auth`, `profile`, `measurements`, `subscription`.
- AI and interaction: `try-on`, `stylist`, `rack`, `chat`, `notifications`, `reviews`.
- `admin` owns the dashboard. Collection/review management belongs to the relevant feature.
- Quota belongs to `subscription`. History belongs to its business feature even when
  the URL is under `/profile`.
- Product types, mappers, and mock product data belong to `products`.
  Local collection storage belongs to `collections`; preserve the existing fallback behavior.

## Dependencies And Server/Client Boundaries

- Shared UI and utilities must not import feature business logic.
- Layout/providers may compose features; features must not import back from those
  orchestration components.
- A feature may use modules from related business features, but do not create circular
  dependencies or import from `app/`.
- Import the exact module needed; do not create barrels that mix server and client modules.
- Auth infrastructure exception: low-level HTTP client and realtime modules may use
  auth store/session utilities, but must not import auth React hooks/components.
- Login/refresh uses raw `fetch` independently; do not call Axios with interceptors from it.
  Preserve single-flight refresh and the shared token cache used by realtime.
- Use `src/lib/http.ts` for maintained Axios GET, POST, PATCH, and DELETE calls.
  Feature services should import `http` or named methods from `@/lib/http`; components
  and hooks must call feature services instead of the HTTP wrapper directly.
- `http` returns the payload after the existing Axios interceptor unwraps the backend
  envelope. Do not read `.data` from wrapper results unless that is a real backend
  payload field. Use generics in services for response, body, and query DTOs.
- Keep raw `fetch` for login/refresh, `/api/backend` proxy route handlers, streaming
  chat flows, external URLs, and service functions that intentionally return `Response`.
  Existing PUT endpoints remain on `api.put` until they are migrated explicitly.
- For uploads, send caller-built `FormData` through `http.post` or `http.patch`; the
  wrapper removes manual multipart `Content-Type` so Axios/browser can set boundaries.
  Keep long-running AI timeouts on the request options.
- Pass cancellation via `options.signal` or the final `AbortController` argument. The
  controller signal takes precedence. Services with fallback data must rethrow Axios
  cancellation instead of returning mock, local, empty, or success fallback data.
- Use `'use client'` only when browser APIs, React state, or client hooks are required.
  Route handlers and middleware must not import browser state or client components.

## Feature Checklist

1. Put UI, hooks, services, types, and state inside the owning feature.
2. HTTP GET logic goes in `services/queries.ts`; POST/PUT/PATCH/DELETE logic goes in
   `services/mutations.ts`. Components and hooks call services, not HTTP directly.
   Streaming/socket flows may use a dedicated service module to manage connection lifecycle.
3. Export query/mutation key factories as tuple `as const`; preserve existing keys and
   invalidation behavior during refactors.
4. Domain types and API DTOs live in `types/`. Use literal unions when the value set is known.
   Do not use `any` or `as any`; define concrete types/interfaces instead. When data is
   unknown, use `unknown` and type guards before using it.
5. If Zod schemas exist, place them in `schemas/` and infer form types with `z.infer`.
   Do not change existing validation only because files are being moved.
6. Extract business constants, options, and defaults. Do not move every JSX literal,
   CSS class, or text label into constants.
7. Auth uses the existing `useAuth` and Zustand `useAuthStore`, updated through `setSession`.
   Preserve middleware, `AuthBootstrap`, and `AdminGuard`; do not add a new auth provider.
8. Keep Lucide and the current UI system. Lazy loading is for optional heavy UI only;
   do not apply it broadly in ways that change render timing or SSR behavior.

## Styles And Compatibility

- Root layout uses `src/styles/index.css`; preserve the import order for fonts, Tailwind, and theme.
- Design tokens (colors, radii, spacing) live in `src/styles/theme.css` as CSS custom properties.
  Do not hard-code raw color values; reference tokens instead.
- When rendering images in Next.js UI, use `next/image` (`Image`) instead of `<img>`.
  Use `<img>` only when there is a specific technical constraint and document the reason in review.
- Check Tailwind source discovery after moving files. Do not delete stylesheets only because
  names look duplicated; `app/globals.css` is an existing reference file.
- Preserve URLs, API payloads, cookies, storage keys, query keys, socket events, and streaming behavior.
- Protected routes (middleware): `/try-on`, `/profile`, `/ai-stylist`, `/chat`, `/checkout`,
  `/admin` — all guarded by the `auth_marker` cookie. Do not add or remove routes here
  without updating both `middleware.ts` and the relevant feature guard.
- Preserve checkout/order pricing ownership. Checkout requests should send cart
  items, structured GHN address fields, coupon code, and an optional total for
  backend double-checking; do not send client-resolved `shippingFee` or
  `discountAmount` as a source of truth.
- Admin GHN pickup origin is configured in the admin dashboard and persisted by
  the backend. Keep the UI sending legacy GHN IDs/codes for province, district,
  and ward; do not hard-code pickup address environment values in the frontend.
- Preserve the `/api/backend` proxy and PWA `NetworkOnly` strategy for private APIs.
- `src/lib/auth.ts` is legacy NextAuth code and is not part of the active auth flow.
  Do not reinstall NextAuth or activate this file during structural refactors.
- Capacitor native bridge (`src/components/native/`) handles Android back-button and
  app-exit modal. Keep these components client-only and do not import from SSR paths.

## Documentation Rules

- Keep this `AGENTS.md` in English.
- Update `AGENTS.md` whenever a change introduces or modifies project structure,
  workflow, conventions, coding rules, verification rules, or architectural boundaries.
- Do not update `AGENTS.md` for ordinary feature code changes that do not affect how future
  contributors or agents should work.

## Workflow

1. Read code, configuration, and the Git working tree before proposing changes.
2. Batch clarification questions into one round when possible; do not ask for information
   that can be read from the repository.
3. When planning: write the plan, use subagent review when useful, edit, and iterate while
   implementation-impacting issues remain.
4. When implementing: preserve uncommitted content, including newly untracked files.
   Do not reset, stash, or overwrite user changes.
5. Move files in groups, check imports, and compare diagnostics after each group.

## Verification

- Run lint and typecheck separately: Next build currently ignores these two error classes.
- Run `npm.cmd test` for unit tests and `npm.cmd run check:architecture` after HTTP
  boundary changes. If an e2e script is unavailable in `package.json`, state that e2e
  could not be run rather than claiming it passed.
- Baseline before refactor: 7 TypeScript errors in legacy NextAuth and 56 ESLint errors.
  Do not add new errors; compare diagnostics for moved files and clearly report baseline errors.
  Do not disable additional rules or add ignores to bypass checks.
- PWA builds may regenerate tracked files under `public/`. Use a temporary worktree copy for
  builds so those files are not overwritten.
- Check desktop/mobile, purchasing, auth/OAuth, admin permissions, AI/quota, streaming,
  notification/reconnect, and offline behavior. Auth must verify that multiple 401 requests
  create only one refresh and that refresh responses missing user data preserve the current session.
- Clearly state when verification requires backend services or a test account; do not claim
  integrated flows were tested based only on a successful build.
