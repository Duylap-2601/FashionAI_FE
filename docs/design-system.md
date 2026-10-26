# StAle. Landing Design System

## Purpose

This document is the implementation contract for the landing experience at `/` and the products listing at `/products`. It extends the existing StAle. design tokens. It does not replace the app-wide tokens, table system, or admin styles.

Read `DESIGN.md` for the narrative and section intent. Read this file for tokens, component APIs, states, and code placement.

## Source Of Truth

- Raw tokens live in `src/styles/theme.css`.
- Landing components must use token-backed Tailwind utilities or CSS variables.
- Do not hard-code hex values in components when a token exists.
- The only allowed raw values are one-off decorative gradients and image focal points.
- Fallback media lives in `src/features/home/constants/landing-media.ts`; API images are the default.
- The landing surface is light paper. The app surface remains white.

## Design Tokens

### Color

| Token | Value | Tailwind utility | Role |
| --- | --- | --- | --- |
| `--color-landing-paper` | `#EFE9E1` | `bg-landing-paper` | Primary landing surface |
| `--color-landing-ivory` | `#FDF8F6` | `bg-landing-ivory` | Raised surface, product metadata |
| `--color-landing-obsidian` | `#11100F` | `bg-landing-obsidian` | Ink, lookbook, footer |
| `--color-landing-oxblood` | `#5D1C34` | `bg-landing-oxblood` | Primary action, active, focus |
| `--color-landing-brass` | `#A67D44` | `text-landing-brass` | Decorative lines, dark-surface labels |
| `--color-landing-brass-ink` | `#7C5722` | `text-landing-brass-ink` | Small brass text on paper |
| `--color-landing-taupe` | `#CDBCAB` | `border-landing-taupe` | Dividers, placeholders |
| `--color-landing-sage` | `#899481` | `bg-landing-sage` | New badge, quiet support |
| `--color-landing-sage-ink` | `#59654F` | `text-landing-sage-ink` | Accessible sage text |
| `--color-landing-muted` | `#6B625A` | `text-landing-muted` | Secondary text on paper |
| `--color-landing-line` | `rgba(166, 125, 68, 0.38)` | `border-landing-line` | Hairline rules and outlines |

Rules:

- Oxblood is the only action color.
- Brass is for lines, large ornaments, and labels on obsidian. Small text on paper uses brass-ink.
- Sage is never used for a primary action.
- Error uses the existing `destructive` token. Success uses `landing-sage-ink` on paper.
- Selection color is oxblood with paper text.

### Typography

| Token | Value | Tailwind utility |
| --- | --- | --- |
| `--font-display` | `var(--font-playfair), "Playfair Display", Georgia, serif` | `font-display` |
| `--font-sans` | Existing Be Vietnam Pro stack | `font-sans` |
| `--font-mono` | Existing JetBrains Mono stack | `font-mono` |
| `--text-landing-display` | `clamp(2.7rem, 6.6vw, 6rem)` | `text-landing-display` |
| `--text-landing-h2` | `clamp(2rem, 4vw, 3.25rem)` | `text-landing-h2` |
| `--text-landing-h3` | `clamp(1.25rem, 2vw, 1.65rem)` | `text-landing-h3` |
| `--text-landing-body` | `0.9375rem` | `text-landing-body` |
| `--text-landing-label` | `0.6875rem` | `text-landing-label` |

Defaults:

- Display: line-height `1.1`, tracking `-0.025em`. The extra leading protects Vietnamese diacritics.
- H2: line-height `1.02`, tracking `-0.025em`.
- H3: line-height `1.15`.
- Body: line-height `1.7`.
- Label: line-height `1`, tracking `0.2em`, uppercase.

Rules:

- Playfair is loaded with `next/font/google`, Vietnamese and Latin subsets.
- Italic is allowed only for one word in a display line.
- Do not use `font-serif` for new landing code. Use `font-display`.
- Do not set display copy in all caps. Use uppercase labels instead.

### Spacing

Use the existing spacing scale. Landing section rhythm:

| Context | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Section vertical padding | `64px` | `96px` | `128px` |
| Header height | `64px` | `72px` | `72px` |
| Page gutter | `16px` | `24px` | `32px` |
| Grid gap | `16px` | `20px` | `24px` |

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `rounded-none` | `0` | Hero, collection panels, editorial images |
| `rounded-[2px]` | `2px` | Product media, inputs, square buttons |
| `rounded-full` | `9999px` | Status dots, avatars, filter convention only where explicitly specified |

Do not use `rounded-xl` or `rounded-2xl` for landing cards. Pills are not the default control shape.

### Border

- Hairline: `1px` with `border-landing-line`.
- Dark hairline: `1px` with `border-landing-paper/15`.
- Strong outline: `1px` with `border-landing-obsidian`.
- Selected collection: `2px` inset brass rule, not a shadow ring.

### Shadow

The landing page does not use decorative drop shadows on cards. Image depth comes from contrast and framing. Glows and colored shadows are not allowed.

### Texture

`.landing-paper-texture` adds a very low-contrast grain using two radial gradients. Apply it to the main paper surface only, never to dark sections or images.

### Motion

| Token | Value |
| --- | --- |
| Fast | `150ms` |
| Base | `250ms` |
| Reveal | `700ms` |
| Hero crossfade | `900ms` |
| Ease | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Reveal distance | `24px` |

Rules:

- Animate opacity and transform only.
- Use `LandingReveal` for one-time section entrances.
- Use Motion's `useReducedMotion` and provide a non-animated path.
- Do not animate layout properties.

## Layout

### Container

```text
mx-auto w-full max-w-[1440px] px-4 md:px-8
```

### Breakpoints

Use Tailwind defaults. The landing design is validated at `390`, `768`, `1024`, `1280`, and `1440`.

### Anchor Offset

Every section with an `id` that is linked from navigation uses `scroll-mt-24` or more to clear the sticky header and announcement bar.

## Components

### `LandingSectionHeading`

File: `src/features/home/components/LandingSectionHeading.tsx`

```ts
interface LandingSectionHeadingProps {
  chapter: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  inverted?: boolean;
  className?: string;
}
```

Rules:

- Renders a top hairline, chapter number in mono, eyebrow in label style, title in display type.
- `inverted` switches text to paper and the hairline to paper at low opacity.
- `action` sits at the end on desktop and below on mobile.
- The component is a server component. Pass client links as children.

### `LandingReveal`

File: `src/features/home/components/LandingReveal.tsx`

```ts
interface LandingRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}
```

Rules:

- Client component.
- One-time reveal with `viewport={{ once: true }}`.
- Disabled when reduced motion is preferred.
- Do not wrap a grid in a way that changes grid item semantics. Wrap the whole section block instead.

### `CollectionPanel`

File: `src/features/home/components/CollectionCarousel.tsx`

The component continues to accept `collections`, `selectedCollectionId`, and `onSelectCollection`. Each panel is a `button`.

Visual contract:

- Image fills a `3/4` frame.
- Chapter number top-left, season top-right.
- Bottom copy block is overlaid on the image.
- Thin brass rule that grows on hover.
- Selected state: `aria-pressed`, brass inset border, `Đang xem`.
- No white metadata block below the image.
- No add-to-cart control.

States:

| State | Visual |
| --- | --- |
| Default | Image, gradient, paper text |
| Hover | Image scale 1.04, rule grows |
| Focus-visible | Oxblood outline offset |
| Selected | Brass inset rule and `Đang xem` |
| Error image | Local collection fallback |

### `ProductCard`

File: `src/features/products/components/listing/ProductCard.tsx`. The landing `ProductGrid` and the products page both render this one component.

Visual contract:

- Image `3/4` on ivory surface.
- Info block below the image on paper or ivory.
- Brand label, serif name, mono price, optional real rating.
- Sale badge oxblood, new badge sage.
- Quick add, try-on, detail controls.
- Try-on icon is `Sparkles` and is never empty.
- Collection panels and product cards must not share the same silhouette.

States:

| State | Visual |
| --- | --- |
| Default | Image and metadata |
| Hover | Second image if present, actions rise |
| Focus-visible | Oxblood outline |
| Added | Toast with `Xem giỏ` action |
| Unavailable | Disabled add control |
| Empty filter | Ivory empty state |

### `HeroBanner`

File: `src/features/home/components/HeroBanner.tsx`

```ts
interface HeroBannerProps {
  collections: Collection[];
}
```

Contract:

- Builds slides from collections, with a local fallback campaign if the list is empty.
- Each slide uses the collection cover image (`thumbnail` or `coverImages[0]`), matching the real collection data.
- Full-bleed image, paper text, obsidian gradients, `object-position: 50% 0%` to keep the face and garment in frame.
- The headline is two explicit block lines, `Mặc đúng dáng.` and `Sống đúng chất.`, with one italic accent per line.
- No supporting tagline and no collection name or season over the image.
- Bottom metadata is limited to the slide index and controls.
- Auto-play `6s` except when paused or reduced motion.
- Pause on hover and focus.
- Previous and next controls are at least `44px`.
- Active slide is announced in a polite live region.
- First slide image uses `priority`.

States:

| State | Visual |
| --- | --- |
| Default | Full-bleed image, copy, controls |
| Paused | No visible change, autoplay stops |
| Single slide | Controls may be hidden, metadata remains |
| Empty collection data | Local campaign fallback |
| Image error | Local campaign fallback |
| Reduced motion | No auto-play, no scale |

### `EditorialLookbook`

File: `src/features/home/components/EditorialLookbook.tsx`

Contract:

- Obsidian section with chapter `04` and a heading/action row.
- One featured portrait plate per view on desktop, with details and a three-thumbnail selector beside it. This is not a row of collection-style cards.
- The plate is `3/4`, matching the portrait source, and capped at `min(62svh, 600px)` tall so the full look fits on screen.
- Details show the look index, title, styling note, and `Thử outfit này`.
- Prev and next controls are at least `44px`; thumbnails are buttons with `aria-pressed`.
- The plate crossfades between looks; there is no auto-play.
- Looks use the selected collection's `lookbookImages` or `coverImages`, with the local plate only on missing or failed images.
- The look title uses the real collection name, and the note uses the real tagline or description when available.
- Each look links to `/try-on`.

### `AiTryOnFeatureBanner`

File: `src/features/home/components/AiTryOnFeatureBanner.tsx`

Props:

```ts
interface AiTryOnFeatureBannerProps {
  previewProduct?: Product;
}
```

Contract:

- Visible on mobile.
- Three honest steps, no vendor or metric claims.
- Primary CTA to `/try-on`.
- Secondary CTA to `/try-on?productId=...` when a product is available.
- Preview image is a compact `420px` plate on desktop (`4/5` aspect), aligned with the left copy. Do not stretch it across the remaining grid.
- On mobile the plate stays centered at the same maximum width instead of full-bleed.
- Preview uses the first selected product's real image, with the local preview only when no product or on image error.
- Preview image is labeled `ẢNH MINH HOẠ`.
- HUD labels are decorative and must not imply a live AI result.

### `AiStylistCapsule`

File: `src/features/home/components/AiStylistCapsule.tsx`

Props:

```ts
interface AiStylistCapsuleProps {
  products: Product[];
}
```

Contract:

- Displays up to three products from the current catalog.
- Labels: `Lớp ngoài`, `Nền`, `Điểm nhấn`.
- Each item links to `/products/{id}`.
- CTA to `/ai-stylist`.
- No add-to-cart and no whole-outfit purchase in this phase.

### `NewsletterBar`

File: `src/features/home/components/NewsletterBar.tsx`

Contract:

- Visible on mobile.
- Single email field with a visible label or `sr-only` label.
- Inline validation and an `aria-live` status message.
- Success copy must not promise a discount or delivery that is not implemented.
- Submit is a real form submission handler, not a decorative button.

### `LandingHeader` and `LandingFooter`

Files: `src/components/layout/Layout.tsx`

Contract:

- Only `variant="landing"` and `footerVariant="marketing"` receive the landing styling.
- Non-landing routes keep the current header, simple footer, and auth behavior.
- Landing inline navigation appears at `xl`.
- Landing login control is square, not a pill.
- Footer payment methods are `COD`, `Chuyển khoản`, `ZaloPay`.
- Footer includes a mobile bottom-tab clearance.
- The header search (desktop input and mobile icon) is hidden on `/products`, which has its own toolbar search.

## Products Listing

Page: `src/features/products/components/products-page.tsx`, rendered by `src/app/(main)/products/page.tsx`. The page owns filter state, queries, and scrolling; the components below only render.

### Sticky Offsets

| Element | Below `xl` | From `xl` |
| --- | --- | --- |
| `ProductToolbar` | `top: 72px`, `105px` tall | `top: 72px`, `57px` tall |
| `DesktopFilterSidebar` (`md` and up) | `top: 201px` | `top: 153px` |
| Results `scroll-margin-top` | `193px` mobile, `201px` from `md` | `153px` |

The header is `72px` plus a `1px` hairline. The toolbar has only a bottom border, so when it sticks its top edge sits under the header hairline. If the header or toolbar height changes, update these offsets together.

### `ProductToolbar`

File: `src/features/products/components/listing/ProductToolbar.tsx`

```ts
interface ProductToolbarProps {
  categories: CategoryCount[];
  activeTab: string;
  searchQuery: string;
  isFilterOpen: boolean;
  activeFilterCount: number;
  sortBy: SortBy;
  onSelectTab: (tab: string) => void;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onOpenSort: () => void;
  onSortChange: (sort: SortBy) => void;
}
```

Contract:

- Renders `CategoryTabs`, the search field with a visible clear button, `Bộ lọc`, and sort.
- Sort is a native `select` from `md`. Below `md`, an icon button calls `onOpenSort`.
- `Bộ lọc` sets `aria-expanded` and fills oxblood while open.
- Sort options come from `SORT_OPTIONS` in `constants/product-filters.ts`.

### `CategoryTabs`

File: `src/features/products/components/listing/CategoryTabs.tsx`

- A `role="group"` row of buttons with `aria-pressed`. The active tab gets oxblood text and a `1px` oxblood underline.
- Below `xl` the row scrolls horizontally, bleeds to the page edge, and fades over the last `32px`.

### Filter Panels

Files: `src/features/products/components/listing/FilterSections.tsx`, `src/features/products/components/listing/ProductFilterPanels.tsx`

- `FilterSections` renders `Danh mục`, `Màu sắc`, and `Khoảng giá`. Groups are separated by hairlines and headed by brass-ink labels.
- Category rows are real checkboxes (`sr-only` input with a styled box). Swatches are buttons with `aria-pressed` and a visible name. Light swatches are flagged with `light: true` in `AVAILABLE_COLORS`.
- The price range reads its bounds from `PRICE_FILTER`.
- `DesktopFilterSidebar` is an `aside` that is visible from `md`. Render it only when the breakpoint is resolved to desktop.
- `MobileFilterSheet` and `MobileSortSheet` are Radix Dialog bottom sheets at `z-[100]`, above the bottom tab bar (`z-[90]`). Pass `open` only when the breakpoint is resolved to mobile, so a hidden dialog never traps focus on desktop.

### `ProductResultsHeader`

File: `src/features/products/components/listing/ProductResultsHeader.tsx`

- Mono count in a polite live region, `Đang tải sản phẩm` while loading, and `Trang X / Y` on desktop.
- Active filters render as square removable chips, followed by `Xoá tất cả`.

### `ProductList`

File: `src/features/products/components/listing/ProductList.tsx`

| State | Visual |
| --- | --- |
| Loading | Taupe skeleton, 8 cards, same grid |
| Empty | Ivory block, one sentence, `Xoá bộ lọc` |
| API error with fallback data | Ivory notice with `Thử lại` |
| Desktop | Pagination: `Trang trước`, mono page numbers, `Trang sau`. The current page is oxblood with `aria-current="page"` |
| Mobile | `shown / total` count, hairline progress bar, and `Xem thêm`. The page also loads the next page ahead with an IntersectionObserver on the same block |

Grid: `grid-cols-2`, then `md:grid-cols-3 lg:grid-cols-4`. With the sidebar open: `md:grid-cols-2 lg:grid-cols-3`.

## Account Pages

### `AccountShell` and account pages

Files: `src/features/profile/components/account-shell.tsx`, `src/features/profile/components/account-ui.tsx`

Contract:

- Wraps `/profile`, `/profile/measurements`, `/profile/orders`, `/profile/reviews` and `/notifications`. Menu items come from `src/features/profile/constants/account-nav.ts`.
- From `lg`: `200px` sticky menu at `top-[105px]` (header `73px` plus `32px`), active item has a `2px` oxblood left rule on a brass hairline. Below `lg`: an underline tab row that scrolls horizontally inside the page gutter.
- Page header: brass label, `text-landing-h2` Playfair title, one muted sentence, optional actions on the right.
- `account-ui.tsx` primitives: `AccountSection` (hairline top, Playfair `1.375rem` heading, optional right action), `AccountStatePanel` (empty and error), `AccountPagination` (square arrows, mono `page / total`), `AccountDialog` (Radix, `z-[100]`/`z-[101]`, bottom sheet below `sm`), `AccountConfirmDialog`, plus `accountButtonClassName` (`primary` oxblood fill, `outline` hairline, `danger` destructive outline, `quiet` text) and `accountInputClassName`.
- `OrderStatusLabel` renders a dot and an uppercase label from `STATUS_CONFIG` in `src/features/orders/constants/profile-orders-page.ts`; tones map to brass, oxblood, sage, taupe and destructive.
- `StarRating` takes `tone="landing"` for oxblood stars on paper; admin keeps the default amber.
- Only backend-backed controls: profile edits the name only, measurements save the backend fields, notification tabs are not shown because the list endpoint does not filter by type.

## Try-On

Files: `src/features/try-on/components/try-on-page.tsx`, `TryOnHeader.tsx`, `TryOnWorkspace.tsx`, `live-try-on-workspace.tsx`, `garment-slot.tsx`

- `TryOnHeader`: brass label, Playfair title, mode copy, `TryOnSegmented` mode switch (`aria-pressed`, oxblood fill when selected) and the photo quota in mono. `SubscriptionNotice` is an ivory block with a brass left rule.
- `garment-slot.tsx` exports `GarmentSlot` (`78x104` ivory thumbnail button, brass label, `product-name-line`, mono price, quiet `Đổi món` / `Bỏ chọn`), `GarmentColorPicker` (`role="radiogroup"`, square chips with a round swatch, hidden below two valid colours), `TryOnSegmented`, `tryOnButtonClassName` (`primary`, `outline`, `quiet`, `inverse`) and `tryOnFocusRing`.
- Live stage: `bg-landing-obsidian`, square, `lg:h-[640px]`. Stage buttons are `40px` square obsidian chips with a paper hairline and `aria-label`s. The capture viewer is a Radix dialog over `obsidian/90` with arrow-key navigation.
- Session dock: `fixed inset-x-0 bottom-[64px]` on mobile (flush above the `64px` bottom tab bar), `md:bottom-4 md:right-6 md:w-[400px]` with a hairline border, static in the side column from `lg`.
- Photo frame: `aspect-[3/4]`, `max-w-[540px]`, hairline border on ivory. The empty state is a dashed taupe frame with `Chọn ảnh` (primary) and `Chụp ảnh` (outline). The before/after slider uses square `Trước` / `Sau` tags and a range input for keyboard use.
- `CatalogModal`: Radix dialog at `z-[100]`/`z-[101]`, bottom sheet below `sm`, underline category tabs, `3/4` product tiles with an oxblood border and check when selected.
- `SubscriptionRequiredModal` (subscription feature) uses the same paper dialog and lists Member and VIP from `usePlans()`.

## Rack, Cart And Notifications

- `CartLine` (`src/features/cart/components/cart-line.tsx`) is shared by `CartSlideOver` (Radix dialog sheet from the right, `md:w-[420px]`) and `/cart`. Quantity uses a square stepper with labelled buttons; unavailable lines show a destructive note and a disabled stepper.
- `MannequinDressForm` keeps its pointer logic; chrome is a hairline frame, square tool buttons, an oxblood outline on the selected piece and mono layer and scale tags. Rack image and price helpers live in `src/features/rack/services/rack-images.ts`.
- `NotificationBell`, `NotificationPanel` and `NotificationItem` take `tone` (`landing` default, `admin` for the dashboard topbar). The landing panel is `380px`, square, paper, with button rows.
- Account history pages and `/subscription` use `AccountShell` and the `account-ui` primitives. `SubscriptionPlans` builds features and the comparison table from `PlanItem.quotas`; `DEFAULT_PLANS` is only a fallback when the plans request fails.

## State Matrix

| Element | Default | Hover | Focus-visible | Active / selected | Disabled |
| --- | --- | --- | --- | --- | --- |
| Primary CTA | Paper fill, ink text | Brass fill | Oxblood outline | `scale(0.99)` | 50% opacity |
| Secondary CTA | Transparent, paper border | Paper fill, ink text | Brass outline | `scale(0.99)` | 50% opacity |
| Text link | Ink or muted | Oxblood | Oxblood outline | Underline | Muted |
| Collection panel | Image and overlay | Image scale, rule grows | Oxblood outline | Brass inset, `Đang xem` | Not used |
| Product card | Image and info | Second image, actions | Oxblood outline | Added toast | Add disabled |
| Filter tab | Muted text | Ink | Oxblood outline | Oxblood text and underline | Not used |
| Input | Paper/ivory, hairline | Brass border | Oxblood outline | Filled | 50% opacity |

## Auth Pages

### `AuthSplitLayout`

File: `src/features/auth/components/AuthLayout.tsx`, rendered once by the route layout `src/app/(auth)/(split)/layout.tsx`. Pages inside that group render only their form content and must not wrap themselves in the layout again.

- Used by login, register, and forgot password. `AuthCenteredLayout` in the same file still serves verify email, reset password, and the OAuth callbacks, and keeps its old styling.
- Left plate: `aside`, `lg` and up, `sticky top-0 h-svh`. It uses a `next/image` fill with `LANDING_MEDIA.look02`, lazy-loaded so mobile never downloads it.
- Right column: `main` with a `Trang chủ` link and a centred `max-w-[420px]` form slot.
- Side swap: `/register` adds `lg:flex-row-reverse`. `aside` and `main` are `motion` elements with `layout="position"` (`800ms`, `cubic-bezier(0.22, 1, 0.36, 1)`), and the plate sits above the form column (`z-10`) while it slides.
- Form slot: keyed by pathname. It enters with opacity and `x: ±32px` after `200ms`. The direction comes from `SPLIT_ROUTE_ORDER` (login 0, forgot password 1, register 2) and is derived during render, not stored in a ref. The slot container clips horizontal overflow so the offset never creates a scrollbar.
- Reduced motion turns off `layout` and the enter offset.
- When adding a route to the group, add it to `SPLIT_ROUTE_ORDER`.

### Form Primitives

File: `src/features/auth/components/auth-form.tsx`

| Export | Use |
| --- | --- |
| `AuthHeading` | Eyebrow, Playfair `h1` with `text-balance`, optional muted line |
| `AuthField` | Uppercase label bound to `id`, optional right-aligned action (for example `Quên mật khẩu?`) |
| `authInputClassName` | `48px` square input on ivory, hairline border, brass hover, oxblood focus outline |
| `PasswordInput` | Input with a `48px` show or hide toggle and Vietnamese labels |
| `AuthAlert` | `error`, `notice`, or `success` left-ruled block; `role="alert"` for errors, `role="status"` otherwise |
| `AuthSubmitButton` | Oxblood primary with spinner and loading label |
| `AuthDivider` | Hairlines with `hoặc` |
| `AuthCheckbox` | Native checkbox over a styled square so the browser `required` bubble anchors correctly |
| `authTextLinkClassName` | Oxblood semibold text link with underline on hover |

Rules:

- Auth pages compose these primitives. Do not restyle inputs or buttons inline.
- Do not reintroduce `rounded-xl` inputs, gradient buttons, or hand-rolled SVG icons on these pages. The Google mark is the only inline SVG.

## Icons

- Use Lucide only.
- Default stroke width `1.75`.
- Sizes: `14` inline, `16` controls, `20` section accents.
- Do not use Material Symbols, emoji, or hand-rolled SVG icons.
- The logo is the only custom wordmark.

## Content Rules

- Body copy is Vietnamese.
- Labels are uppercase with tracking.
- No emoji.
- No em-dashes.
- No vendor names in AI copy.
- No unverified numbers.
- Prices are rendered from product data.
- Product names are not rewritten for length; use line clamping.
- Buttons use verbs: `Khám phá`, `Thử đồ`, `Mở phòng thử`, `Nhờ AI Stylist`.

## Accessibility

- All images have alt text that describes the garment or editorial intent.
- Decorative HUD labels are `aria-hidden`.
- Collection panels are buttons with `aria-pressed`.
- Carousel has labelled previous and next buttons and a polite live region.
- Auto-play pauses on hover and focus and is disabled for reduced motion.
- Inputs have labels, `aria-invalid` when appropriate, and an `aria-live` message.
- Focus-visible rings are never removed.
- Touch targets are at least `44px` for primary controls.
- Text contrast meets WCAG AA.

## Implementation Map

| Concern | Module |
| --- | --- |
| Color, type, texture tokens | `src/styles/theme.css` |
| Playfair loading | `src/app/layout.tsx` |
| Logo font | `src/components/ui/Logo.tsx` |
| Fallback media | `src/features/home/constants/landing-media.ts` |
| Hero | `src/features/home/components/HeroBanner.tsx` |
| Collections | `src/features/home/components/CollectionCarousel.tsx` |
| Products | `src/features/home/components/ProductGrid.tsx` |
| Lookbook | `src/features/home/components/EditorialLookbook.tsx` |
| AI Try-On | `src/features/home/components/AiTryOnFeatureBanner.tsx` |
| AI Stylist | `src/features/home/components/AiStylistCapsule.tsx` |
| Newsletter | `src/features/home/components/NewsletterBar.tsx` |
| Announcement | `src/features/home/components/AnnouncementBar.tsx` |
| Page composition | `src/features/home/components/LandingPageClient.tsx` |
| Landing shell | `src/components/layout/Layout.tsx` |
| Shared heading | `src/features/home/components/LandingSectionHeading.tsx` |
| Shared reveal | `src/features/home/components/LandingReveal.tsx` |
| Shared product card | `src/features/products/components/listing/ProductCard.tsx` |
| Products page composition | `src/features/products/components/products-page.tsx` |
| Products toolbar and tabs | `src/features/products/components/listing/ProductToolbar.tsx`, `CategoryTabs.tsx` |
| Products filters | `src/features/products/components/listing/FilterSections.tsx`, `ProductFilterPanels.tsx` |
| Products results and grid | `src/features/products/components/listing/ProductResultsHeader.tsx`, `ProductList.tsx` |
| Filter and sort constants | `src/features/products/constants/product-filters.ts` |
| Account shell and primitives | `src/features/profile/components/account-shell.tsx`, `account-ui.tsx` |
| Account pages | `profile-page.tsx`, `profile-measurements-page.tsx`, `profile-orders-page.tsx`, `profile-reviews-page.tsx`, `notifications-page.tsx` |
| Try-on page | `try-on-page.tsx`, `TryOnHeader.tsx`, `TryOnWorkspace.tsx`, `live-try-on-workspace.tsx`, `garment-slot.tsx` |
| Cart line, slide-over and page | `cart-line.tsx`, `CartSlideOver.tsx`, `cart-page.tsx` |
| Rack | `rack-page.tsx`, `MannequinDressForm.tsx`, `services/rack-images.ts` |
| Plans | `subscription-page.tsx`, `subscription-plans.tsx`, `current-subscription.tsx`, `subscription-history.tsx` |

## Do Not

- Do not add a sale banner to the landing page.
- Do not add a second product grid.
- Do not use teal or bright gold on the landing page.
- Do not use vendor names or fake AI statistics.
- Do not use `rounded-2xl` cards or glassmorphism.
- Do not use purple gradients or generic SaaS gradients.
- Do not hard-code `#5D1C34` when `landing-oxblood` exists.
- Do not hide AI try-on or newsletter on mobile.
- Do not use a `div` with `onClick` for a collection panel.
- Do not promise a discount in the newsletter.
- Do not change the app header outside the landing variant.
- Do not add a new font family without updating this document.
- Do not show the header search on `/products` or add a second search field to that page.
- Do not add a masthead or breadcrumb to `/products`.
- Do not add a grid or list toggle unless a list view exists.

## Verification

Run:

```bash
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run check:architecture
```

Manual checks:

- `390px`: hero readable, collection panels usable, product grid two columns, AI try-on and newsletter visible.
- `768px`: collections two columns, products three columns, no overflow.
- `1024px`: lookbook shows three portrait plates in one row, AI try-on preview no taller than the copy block.
- `1280px`: inline nav visible and not crowded.
- Keyboard: tab through header, hero, collections, filters, product actions, lookbook, forms.
- Reduced motion: no auto-play, no reveal transforms.
- Images: hero and cards show fallback when a remote image fails.

## Changelog

| Date | Change |
| --- | --- |
| 2026-10-25 | Initial contract |
| 2026-10-25 | Synced display metrics, full-bleed hero rules, local-first media, and the compact AI try-on preview |
| 2026-10-25 | Lookbook contract: one capped `3/4` plate with side details and thumbnails so each look fits on screen |
| 2026-10-25 | Landing data and imagery now come from the API; local media is fallback-only |
| 2026-10-26 | Products listing contract: toolbar, filter panels, results header, grid states, sticky offsets; fixed the `ProductCard` file path |
| 2026-10-26 | `AccountShell` contract for the five account pages, account primitives, order status tones and the landing tone of `StarRating` |
| 2026-10-26 | Try-on contract: header mode switch, shared garment slot and colour picker, live stage and session dock, photo frame, catalog dialog |
| 2026-10-26 | Cart line and slide-over, rack and mannequin chrome, notification `tone`, plans from `/payments/plans` |
