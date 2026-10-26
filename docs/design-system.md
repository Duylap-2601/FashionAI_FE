# StAle. Landing Design System

## Purpose

This document is the implementation contract for the landing experience at `/`. It extends the existing StAle. design tokens. It does not replace the app-wide tokens, table system, or admin styles.

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

File: `src/features/home/components/ProductGrid.tsx`

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
