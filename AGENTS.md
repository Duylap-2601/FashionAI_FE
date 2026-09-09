# FashionAI Frontend Working Guide

## Stack And Commands

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, TanStack Query,
Zustand, Axios, Radix UI, and Lucide. Keep this stack when refactoring.

```bash
npm ci
npm run dev       # http://localhost:3001
npm run lint
npm run typecheck
npm run build
npm start         # http://localhost:3001
```

If PowerShell blocks `.ps1` scripts, use `npm.cmd` / `npx.cmd`.

## Source Structure

```text
src/
├── app/                 # Routes, layouts, metadata, route handlers
├── features/
│   └── <feature>/
│       ├── components/  # Page-level and child components
│       ├── hooks/       # React hooks and state/query orchestration
│       ├── services/    # queries.ts (GET), mutations.ts (writes)
│       ├── types/       # Domain types and API DTOs
│       ├── constants/   # Business configuration, options, defaults
│       ├── store/       # Feature-specific Zustand store, if needed
│       ├── schemas/     # Zod validation, if needed
│       └── context/     # React Context, if needed
├── components/          # Shared UI, layout, providers, PWA
├── hooks/               # Hooks not owned by a specific feature
├── lib/                 # HTTP client, realtime, platform, utilities
├── styles/
└── middleware.ts
```

- Only create directories that contain files; do not create `screen/`.
- `public/`, package manifests, config files, and docs live at the project root.
- Alias `@/` points to `src/`.
- `page.tsx` should be a thin wrapper importing the page component from a feature.
  Keep layouts, route handlers, metadata, and route configuration in `app/`.
- Preserve file names when moving files. New file names use kebab-case; React
  components use PascalCase, and hooks start with `use`.

## Business Ownership

- Shopping: `home`, `products`, `collections`, `cart`, `checkout`, `orders`, `payments`.
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
- When rendering images in Next.js UI, use `next/image` (`Image`) instead of `<img>`.
  Use `<img>` only when there is a specific technical constraint and document the reason in review.
- Check Tailwind source discovery after moving files. Do not delete stylesheets only because
  names look duplicated; `app/globals.css` is an existing reference file.
- Preserve URLs, API payloads, cookies, storage keys, query keys, socket events, and streaming behavior.
- Preserve the `/api/backend` proxy and PWA `NetworkOnly` strategy for private APIs.
- `src/lib/auth.ts` is legacy NextAuth code and is not part of the active auth flow.
  Do not reinstall NextAuth or activate this file during structural refactors.

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
