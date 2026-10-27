# StAie. FashionAI - Landing Page Design Brief

## Metadata

| Field | Value |
| --- | --- |
| Version | 1.0 |
| Status | Approved direction, implementation in progress |
| Scope | Public landing page at `/`, products listing at `/products`, landing header, landing footer, announcement bar |
| Owner | StAie. frontend team |
| Related docs | `docs/design-system.md`, `docs/table-design.md`, `AGENTS.md` |
| Last updated | 2026-10-28 |

## Design Read

A premium Vietnamese office-fashion e-commerce landing page for style-conscious professionals. The visual language is editorial luxury, not generic SaaS or cosmetic commerce. It should feel like a fashion magazine cover translated into a storefront: paper, ink, hairlines, large serif type, and product photography that is allowed to breathe.

## Brand Context

StAie. sells tailored office wear and uses AI try-on as a practical purchase aid, not as a gimmick. The landing page must do three jobs in order:

1. Establish taste and trust within the first viewport.
2. Make the current collection and representative products easy to browse.
3. Remove fit anxiety by making AI try-on and AI Stylist visible on desktop and mobile.

The page is a marketing surface, but every control must either navigate, filter, add to cart, or start a real try-on flow. Decorative controls are not allowed.

## Audit Of The Previous Landing

| Problem | Impact |
| --- | --- |
| Teal announcement and newsletter bars competed with the burgundy brand color | Brand recall was diluted |
| Two product grids plus a sale banner created three competing commerce moments | The page had no single browsing path |
| AI try-on and newsletter were hidden on mobile | The strongest USP disappeared on the majority viewport |
| Unverified claims such as `98.4%`, `< 0.1s`, `FPS 60`, and vendor names | Reduced trust and created compliance risk |
| Five-column product grid made product cards cramped | Weak product presentation at 1024-1440 |
| Collection cards and product cards used similar rounded cards | Users could not tell "browse a chapter" from "buy a product" |
| Missing try-on icon and a non-functional wishlist-style control | Broken affordance |
| Footer advertised VNPAY and MoMo although ZaloPay is the active online flow | Payment information was inaccurate |

## Direction: Atelier Paper - Saigon Editorial

The page is structured like a small printed issue. Each section is a chapter with a number, a hairline rule, and one clear editorial idea. Photography is framed like plates in a lookbook. Type does the luxury work, so surfaces stay quiet.

### Six Principles

1. **Editorial before commerce.** A section earns its place by advancing the story, not by filling a grid.
2. **Paper and ink.** The default surface is warm paper with near-black ink. Dark sections are deliberate chapter breaks.
3. **One accent.** Oxblood is the action color. Brass is a line and detail color, never a large fill.
4. **Motion is punctuation.** Reveals and crossfades clarify sequence. They do not perform.
5. **Every control is real.** No dead hearts, no fake success states, no invented statistics.
6. **Mobile keeps the USP.** AI try-on and the newsletter are first-class mobile sections.

### Visual Dials

| Dial | Value | Consequence |
| --- | --- | --- |
| Design variance | 7 / 10 | Asymmetric lookbook, large ghost numerals, editorial headers |
| Motion intensity | 5 / 10 | Slow image crossfades, one-time reveals, restrained hover |
| Visual density | 3 / 10 | Generous section padding, one idea per chapter |

## Palette

Source: brand reference `public/images/image-1.png` (REGAL palette) plus existing app tokens. This palette is brand-owned, not a default warm-craft theme.

| Token | Hex | Role | Usage |
| --- | --- | --- | --- |
| `landing-paper` | `#EFE9E1` | Primary surface | Landing background, header |
| `landing-ivory` | `#FDF8F6` | Raised surface | Product info, newsletter inset |
| `landing-obsidian` | `#11100F` | Ink and dark chapters | Text, lookbook, footer |
| `landing-oxblood` | `#5D1C34` | Action accent | Primary CTA, active state, focus |
| `landing-brass` | `#A67D44` | Decorative accent | Hairlines, large ornament, dark-section labels |
| `landing-brass-ink` | `#7C5722` | Accessible brass text | Small labels on paper |
| `landing-taupe` | `#CDBCAB` | Warm neutral | Dividers, image placeholders |
| `landing-sage` | `#899481` | Support neutral | New badges, quiet blocks |
| `landing-sage-ink` | `#59654F` | Accessible sage text | Small text on paper |
| `landing-muted` | `#6B625A` | Secondary text | Descriptions on paper |
| `landing-line` | `rgba(166, 125, 68, 0.38)` | Hairline | Section rules, card borders |

Rules:

- Do not use bright gold `#FFD93D` on the landing page.
- Do not use teal `#15434e` on the landing page.
- Brass is never used for body-size text on paper. Use `landing-brass-ink`.
- Oxblood fills are reserved for primary actions and selection states.
- Dark sections use paper text, not pure white, except for the logo.

## Typography

| Role | Family | Notes |
| --- | --- | --- |
| Display | Playfair Display | Headlines, collection names, large numerals. Italic is used sparingly for one emphasized word. |
| Body | Be Vietnam Pro | Navigation, paragraphs, product metadata, forms. |
| Mono | JetBrains Mono | Chapter numbers, prices, frame labels, issue metadata. |

Rules:

- Playfair is loaded through `next/font/google` with the Vietnamese subset.
- Display line-height is `1.1` with `-0.025em` tracking, enough room for Vietnamese diacritics above and below the baseline.
- Eyebrows and labels are uppercase with `0.18em` to `0.24em` tracking.
- Vietnamese diacritics must be visually checked at every display size.
- Product names use Playfair Display only at 16px and up (product detail title, grid cards). Compact lists (cart, checkout, search, try-on, stylist) use Be Vietnam Pro 500 at 14px. Use the `product-name-title`, `product-name-card` and `product-name-line` utilities from `theme.css` instead of ad-hoc classes.
- Do not use more than one serif family.
- Do not use em-dashes in UI copy. Use a period, comma, or colon.

## Layout System

- Max content width: `1440px`.
- Page gutter: `16px` mobile, `24px` tablet, `32px` desktop.
- Section rhythm: `64px` mobile, `96px` tablet, `128px` desktop.
- Hero: full-bleed image, paper text overlay, minimum `720px` mobile and `860px` desktop.
- Collections: one column on mobile, two on tablet, four on desktop.
- Products: two columns on mobile, three on tablet, four on desktop.
- Lookbook: one featured portrait plate per view on desktop, with look details and thumbnail navigation beside it. The plate uses the full `3/4` image and never extends past the viewport.
- Editorial sections use hairline rules, not cards with shadows.
- Corners are square or `2px`. Pills are reserved for status and filters, not every control.

## Page Narrative

| Chapter | Section | Surface | Purpose |
| --- | --- | --- | --- |
| 00 | Announcement | Obsidian | Service news, one line at a time |
| 01 | Hero | Full-bleed image | Set the season and promise, two CTAs |
| 02 | Collections | Paper | Choose a chapter and update the product grid |
| 03 | Featured products | Ivory | Browse, filter, quick-add, try on |
| 04 | Lookbook | Obsidian | Show styling range and aspiration |
| 05 | AI Try-On | Paper | Explain the real flow in three steps |
| 06 | AI Stylist | Ivory | Show a three-piece capsule and open the stylist |
| 07 | Newsletter and footer | Paper then obsidian | Capture email, close the issue |

Removed from the previous page:

- The sale banner between collections and products.
- The second best-seller product grid.
- Vendor names and unverified performance numbers.
- The dead heart control.
- The teal announcement and newsletter surfaces.

## Section Specifications

### Announcement

- Height: `40px`.
- Four messages, `5s` interval, `4.5s` acceptable if the copy is short.
- Auto-play pauses on hover, focus, and reduced-motion preference.
- Internal links use `next/link`.
- One live region, no layout shift.

### Header

- Sticky, `72px` tall on landing, paper background at `92%` opacity with blur.
- Logo, five inline links at `xl`, search, rack, cart, account.
- Inline links: Collections, Products, Lookbook, AI Stylist, Try-On.
- Login control is a square outline button on landing, not a pill.
- The existing app header remains unchanged for non-landing routes.

### Hero

- Full-bleed portrait photography with `object-cover` and a left-to-right obsidian gradient.
- One two-line headline and two CTAs. No supporting tagline.
- Headline: `Máº·c Ä‘Ãºng dÃ¡ng. Sá»‘ng Ä‘Ãºng cháº¥t.` rendered as two explicit block lines with one italic accent per line.
- Primary CTA: `KhÃ¡m phÃ¡ bá»™ sÆ°u táº­p` to `#collections`.
- Secondary CTA: `Thá»­ Ä‘á»“ AI` to `/try-on`.
- Slide metadata: index and previous and next controls. Do not repeat the collection name or season over the image.
- Auto-play `6s`, pause on hover and focus, disabled under reduced motion.
- Slides are built from published collections and use each collection's real cover image. The local campaign image is only a fallback when the collection has no cover or the remote image fails. Never return `null`; use the local fallback when the list is empty.
- The first image is `priority`; other slide images load normally.

### Collections

- Header includes chapter `02`, eyebrow, serif title, and a link to `/products`.
- Four editorial panels, one per published collection.
- Panels are image-first with an overlaid chapter number, season, name, tagline, item count, and `Má»Ÿ chÆ°Æ¡ng`.
- The selected panel gets a brass inset rule and `Äang xem`, not a rounded ring.
- Selecting a panel updates the product grid and scrolls to `#featured-products`.
- Panels are buttons with `aria-pressed`; no `div` click handlers.
- Collection panels must not look like product cards. They have no white metadata block below the image and no add-to-cart control.

### Featured Products

- Header includes chapter `03`, the selected collection name, and a link to `/products`.
- Filter tabs are underlined text tabs, not filled pills.
- Four columns desktop, two columns mobile.
- Card: image, brand, serif product name, price in mono, rating when real, quick add, try-on, detail.
- Hover reveals the second gallery image when available.
- Try-on uses a visible `Sparkles` icon and links to `/try-on?productId=...`.
- Badges: sale in oxblood, new in sage.
- Empty state uses ivory surface and a single sentence.

### Lookbook

- Chapter `04`, obsidian surface.
- One featured portrait plate at a time, with look details, previous and next controls, and a three-thumbnail selector beside it. It must not become another row of collection-style cards.
- The plate is `3/4`, matching the portrait source, and capped at `min(62svh, 600px)` tall so the full look fits on screen.
- Details show `Look 01 / 03`, the look title, the styling note, and `Thử outfit này`.
- Thumbnails are small `3/4` buttons with `aria-pressed`; the active one gets a brass border.
- The plate crossfades between looks, with no auto-play.
- Each look links to the try-on flow.
- Lookbook plates come from the selected collection's `lookbookImages` or `coverImages`. The local plate is used only when the collection has no images or a remote image fails.

### AI Try-On

- Chapter `05`, paper surface.
- Left: heading, honest copy, three steps, primary and secondary CTA.
- Right: a compact framed image, `420px` wide on desktop and aligned with the height of the left copy. It must not become a second full-width hero.
- The frame carries corner marks, `TRY-ON STUDIO`, `FRAME 01`, and `áº¢NH MINH HOáº `.
- No vendor names, accuracy percentages, latency claims, or fake result badges.
- Steps: choose garment, upload photo or open camera, review and add to cart.
- Visible on mobile. No `hidden md:block`.

### AI Stylist

- Chapter `06`, ivory surface.
- Left: one sentence about styling with real catalog products, CTA to `/ai-stylist`.
- Right: a three-piece capsule from the current catalog, labeled `Lá»›p ngoÃ i`, `Ná»n`, `Äiá»ƒm nháº¥n`.
- Capsule cards are minimal image-and-text links, visually distinct from product cards.
- No "add whole outfit" action in this phase. The CTA is the only conversion point.

### Newsletter And Footer

- Chapter `07`.
- Newsletter uses paper surface with an ivory inset, one email field, one submit button, inline validation, and an honest success message.
- Do not promise a discount that is not implemented.
- Footer is the back cover: obsidian, four columns, payment methods `COD`, `Chuyá»ƒn khoáº£n`, `ZaloPay`, and a large ghost wordmark.
- Phone, address, and email remain the existing business values.
- Footer spacing includes the mobile bottom-tab clearance.

## Products Page

Scope: the catalog at `/products`. It uses the landing tokens, the landing header variant, and the shared `ProductCard`, but it is a working page, not an editorial chapter. There is no chapter number, no masthead, and no breadcrumb: the toolbar sits directly under the header so products start above the fold on mobile.

### Structure

| Order | Element | Notes |
| --- | --- | --- |
| 1 | Header | Landing variant. The header search (desktop input and mobile icon) is hidden on `/products`; the toolbar search replaces it. |
| 2 | Toolbar | Sticky under the header at `72px`, paper at `95%` with blur, one hairline at the bottom |
| 3 | Filter sidebar | Desktop only, toggled by `Bộ lọc`, sticky under the toolbar |
| 4 | Results header | Mono product count, page index on desktop, removable filter chips, `Xoá tất cả` |
| 5 | Product grid | Shared `ProductCard` |
| 6 | Pagination or load more | Numbered pagination from `md`; below `md`, infinite load with `Xem thêm` and a hairline progress bar |

### Toolbar

- Garment tabs are uppercase underlined text tabs with `aria-pressed`, the same treatment as the landing filter tabs. Tabs show no counts.
- Search is a square `2px` input on ivory. It filters as the user types (300ms debounce) and has a clear button.
- `Bộ lọc` is a square outline button that shows the number of active sidebar filters and fills oxblood while the sidebar is open.
- Sort is a native select from `md`. Below `md` it is an icon button that opens a sort sheet.
- Below `xl` the toolbar has two rows (search and buttons, then tabs). Tabs scroll horizontally and fade at the right edge. From `xl` everything fits in one row.
- There is no grid or list toggle.

### Filters

- Groups in order: `Danh mục` (checkboxes), `Màu sắc` (swatch buttons with names and `aria-pressed`), `Khoảng giá` (range input with a mono value).
- Light swatches (`Trắng`, `Kem`, `Be`) carry a taupe border and a dark check.
- Filters apply immediately. The desktop sidebar has no `Áp dụng` button.
- Mobile filter and sort open as bottom sheets with a focus trap and Esc to close, layered above the bottom tab bar. The filter sheet footer has `Xoá tất cả` and `Xem N sản phẩm`.

### Grid And States

- Two columns on mobile, three on tablet, four on desktop. With the sidebar open: two at `md`, three from `lg`.
- Loading uses a taupe skeleton in the same grid.
- Empty uses an ivory block with one sentence and `Xoá bộ lọc`.
- When the API fails and fallback products show, an ivory notice offers `Thử lại`.
- Changing a filter or page scrolls back to the top of the grid only when the user has scrolled past it.

## Product Detail

Route: `/products/[id]`. The page is the product chapter of the catalog: one gallery plate, one purchase panel, then detail tabs and reviews. It uses the landing tokens, the shared `ProductCard` for related products, and keeps the existing API, cart, rack, measurement and analytics flows.

### Structure

| Order | Element | Surface | Notes |
| --- | --- | --- | --- |
| 1 | Breadcrumb | Paper | `Trang chủ / Sản phẩm / Danh mục / Tên sản phẩm`, label type, no dead category link |
| 2 | Gallery | Paper | `3/4` plate on ivory, thumbnails below, hover magnifier and lightbox |
| 3 | Purchase panel | Ivory | Brand, serif title, real rating, mono price, combo, colour, quantity, CTAs |
| 4 | Detail tabs | Paper | Underline tabs for `Mô tả sản phẩm` and `Quy trình may đo` |
| 5 | Reviews | Ivory | Rating overview, review list, write review and delete dialogs |
| 6 | Related products | Paper | Shared `ProductCard` grid |

### Gallery

- Main image is a `3/4` frame on ivory with a hairline border and `2px` corners. No shadow, no glassmorphism.
- Thumbnails are square buttons with `aria-pressed`; the active one gets a `2px` oxblood border, not a rounded ring.
- The hover magnifier, fullscreen lightbox, zoom, pan and keyboard shortcuts stay functional. Chrome is obsidian and paper with mono counters, not gold or amber.
- The main image opens the lightbox through a real button. Decorative overlays are `aria-hidden`.
- Failed images use `LANDING_MEDIA.productFallback`.

### Purchase Panel

- Brand is a brass-ink label. Category is a square hairline label, not a pill.
- Title uses `product-name-title`. Price uses the mono face and oxblood. Original price is mono and muted with a line-through. Sale badge is an oxblood fill with paper text and square corners.
- Rating shows only real review data. There is no `5.0` fallback when a product has no reviews.
- Combo options are square buttons with `aria-pressed`. Colour swatches are real buttons with `aria-label` and `aria-pressed`; light swatches carry a taupe border. No dead swatch placeholders.
- Quantity is a square stepper with mono count. The subtotal is labelled `Tạm tính`.
- Primary action is oxblood with paper text. Try-on uses a visible `Sparkles` icon and links to `/try-on?productId=...`. AI Stylist is an outline action. Rack pin is an outline action with `aria-pressed`.
- Measurement status uses sage for complete and destructive or brass for missing. The panel links to `/profile/measurements`.
- Assurances only state what is real: made to the saved measurements, measurement advice, and the 7-day defect window from the return policy. No delivery-time guarantee.

### Detail Tabs

- Tabs are underline text tabs with `role="tablist"` and `aria-selected`.
- Headings use Playfair, body uses the landing body size and muted colour.
- Description, material and styling notes sit on hairline rules and ivory blocks, not rounded cards with shadows.
- Missing material reads `Đang cập nhật` instead of inventing a fabric.
- The measurement process uses mono step numbers. The closing note links to `/return-policy` and states the real 7-day window, not an unpublished free-alteration promise.
- The AI Stylist CTA is an outline button, not a brass gradient block.

### Reviews

- The review section sits on ivory with a top hairline. The heading is Playfair and the write-review action is a square oxblood button.
- Stars use `StarRating tone="landing"`. Distribution bars use oxblood and taupe, never amber.
- Rating filters are underline text tabs, not filled pills.
- Review cards are square paper blocks with hairlines. The verified purchase label uses sage-ink, not a green pill.
- Delete review and delete reply use the shared paper Radix dialog (`AccountConfirmDialog`), not `window.confirm` or hand-rolled overlays.
- User photos use `next/image` with `unoptimized` for data URLs.

### States

| State | Visual |
| --- | --- |
| Loading | Paper and taupe skeleton in the same two-column layout |
| Not found | Ivory block, Playfair title, one sentence, oxblood square CTA |
| No reviews | Ivory block with one sentence and a write-review action |
| Missing measurements | Brass or destructive note with a link to measurements |
| Image error | Local product fallback |

### Accessibility

- Thumbnails, combo options, colour swatches, rack pin and rating filters expose `aria-pressed`.
- Tabs expose `role="tablist"` and `aria-selected`.
- Focus rings are oxblood on paper. Touch targets are at least `44px` for primary controls.
- The lightbox traps focus, closes on Esc and restores focus to the opener.

### Honest Copy

- No fake ratings, fake discounts or invented fabric claims.
- No delivery-time guarantee unless the backend exposes it.
- The 7-day defect window and warranty wording match the policy constants.
- Copy is Vietnamese. No emoji, no em-dashes.

## Account Pages

Routes: `/profile`, `/profile/measurements`, `/profile/orders`, `/profile/reviews`, `/notifications` (the five links in the header account menu).

- One shared `AccountShell`: a sticky left menu from `lg` (name, plan, the five pages, then addresses, try-on history, AI Stylist history, plan) and a scrolling underline tab row below `lg`. Each page opens with a brass `Tài khoản` label, a Playfair title and one sentence.
- Sections are hairline-topped, with a Playfair heading and at most one text link on the right. No cards with shadows, no pills, no coloured badge fills.
- Status is a coloured dot plus an uppercase label: brass for waiting on payment or returns, oxblood dot for in progress, sage for delivered or complete, taupe for closed, destructive for failed.
- Prices, order codes, dates in tables, counts and measurements use the mono face.
- Only controls the backend stores are shown. Profile edits only the name (`PUT /users/me` accepts `name` and `avatarUrl`); phone and address live in the address book. Measurements save the 16 backend fields; there is no body-type, preferred-size, fit or style-note control. Notifications have no type filter because `GET /notifications` does not filter by type.
- Order filters send exactly one backend status each, following the real flow `CREATED → MEASUREMENT_REVIEW → TAILORING → READY_TO_SHIP → SHIPPING → DELIVERED → COMPLETED`.
- Dialogs (change password, cancel order, delete review, write review) use one paper Radix dialog that sits above the mobile bottom tab bar and becomes a bottom sheet below `sm`.

## Try-On Page

Route: `/try-on`. Two modes share one page: `Trực tiếp` (camera, the default) and `Bằng ảnh` (upload a photo). The mode switch sits in the page header next to the title, with the remaining photo quota under it in photo mode.

- Header: brass `Phòng thử` label, Playfair `Thử đồ AI`, one sentence that changes with the mode. No separate hero block.
- Live mode: the camera stage is the one obsidian surface on the page, square, with paper text and brass hairlines. Overlays (status, applied garments, auto-capture) are square obsidian chips without blur. The session dock (timer in mono, `Bắt đầu thử đồ`, `Tạm dừng`, `Kết thúc`) sits in the side column from `lg`, floats bottom-right at `md`, and is a full-width paper bar above the bottom tab bar on mobile. The floating chat is hidden on `/try-on` so it never covers the dock.
- Photo mode: a `3/4` paper frame for the upload, the photo or the before/after slider, capped at `540px` wide. The side column holds the garment slots and the oxblood `Thử trang phục` button with the quota cost.
- Both modes use the same garment slot (ivory thumbnail, brass layer label, product name, mono price, `Đổi món` / `Bỏ chọn`) and the same colour picker (shown only when a product has two or more valid colours).
- Only real controls: there is no sample-photo button, because a stock photo cannot be submitted. The upgrade dialog reads plan prices and try-on limits from `GET /payments/plans` instead of hard-coding them.

## Rack, Cart, Notifications And Plans

- `/rack`: saved pieces on the left (underline category tabs with mono counts, `3/4` ivory tiles that are real buttons with `aria-pressed`), the mannequin on the right in a hairline frame. The mannequin is an obsidian form on a brass pole, not a gradient. The canvas keeps drag, wheel-to-scale and layer order; the footer shows the mono outfit total and one oxblood action into Thử đồ AI.
- Cart: the slide-over and `/cart` share one line component (ivory thumbnail, product name, square quantity stepper with mono count, mono line total). The summary says `Tạm tính` because shipping is quoted at checkout. Assurances only state what is true: made to the saved measurements, 7 days to report a defect after completion, payment by ZaloPay.
- Header notifications: a paper dropdown with a Playfair title, mono unread count, rows as real buttons and an uppercase link to `/notifications`. The admin topbar keeps its own look through `tone="admin"`.
- `/subscription` and the account history pages (`/profile/addresses`, `/profile/history`, `/profile/stylist-history`) sit in the account shell. Plan prices, durations and daily limits come from `GET /payments/plans`; there are no "most popular" badges and no render-priority claim.

## Responsive Behavior

| Breakpoint | Hero | Collections | Products | Lookbook |
| --- | --- | --- | --- | --- |
| 390 | Text overlay, controls below copy | 1 column | 2 columns | 1 column |
| 768 | Text overlay, larger headline | 2 columns | 3 columns | 1 column |
| 1024 | Wider copy block | 2 columns | 3 columns | Plate and details side by side |
| 1280 | Inline nav visible | 4 columns | 4 columns | Plate and details side by side |
| 1440 | Full container | 4 columns | 4 columns | Plate and details side by side |

No horizontal overflow at any breakpoint. Anchors must not hide behind the sticky header; use `scroll-mt`.

## Auth Pages

Scope: `/login`, `/register`, and `/forgot-password`. These pages share `AuthSplitLayout`. The other auth routes (verify email, reset password, OAuth callbacks) keep `AuthCenteredLayout` until they are redesigned.

### Layout

- From `lg`: a sticky obsidian plate on the left (`46%` of the width) and the form on paper on the right. Below `lg`: the form only, with the logo at the top.
- The plate uses local portrait media (`LANDING_MEDIA.look02`) with an obsidian gradient. It carries the light logo, a brass label, the two-line Playfair line `Chuẩn dáng từ đầu, / đẹp từng đường may.` with one italic word, and three numbered account benefits.
- Benefits only state what an account actually unlocks: measurements saved in the profile, a cart synced across devices, and AI try-on and AI Stylist.
- Every page has a `Trang chủ` link on the outer edge of the form column, so there is always a way back to the store.

### Transition

- The three pages share one persistent route layout, so the plate survives navigation.
- `/login` and `/forgot-password` put the plate on the left. `/register` swaps it to the right. Moving between login and register slides the plate across in `800ms` with the landing ease while the form column moves the other way.
- The new form fades in with a `32px` horizontal offset after a `200ms` delay. It enters from the right when moving forward (login, forgot password, register) and from the left when moving back. Below `lg`, where there is no plate, only the form slides.
- First load does not animate. Under reduced motion, nothing slides: the layout swaps instantly and the form appears without movement.
- The motion uses transforms only (Motion `layout="position"`), so heights never distort.

### Form

- Heading: brass-ink eyebrow, Playfair title, one muted line with the cross-link (`Tạo tài khoản` or `Đăng nhập`).
- Labels are uppercase with tracking. Inputs are `48px` tall, square `2px`, on ivory with a hairline border, and use the oxblood focus outline.
- The primary submit is an oxblood fill with paper text and an arrow, and turns obsidian on hover. Google sign-in is a secondary outline button below an `hoặc` divider. The Google mark keeps its brand colours.
- Messages use one left-ruled ivory block: error with the destructive rule, notice with brass, success with sage-ink.
- Register shows a three-segment length meter (destructive, brass, sage-ink) and the two rules the backend enforces: at least 8 characters, and a matching confirmation.

### Honest States

- No testimonials, ratings, or user photos on auth pages.
- No `Ghi nhớ đăng nhập` checkbox: the session length does not depend on it.
- Forgot password does not claim that an email was sent, because the backend never reveals whether an account exists. The copy says the link was sent if the email is registered, and that it is valid for 1 hour (the backend token lifetime).
- `Gửi lại email` sends the request again. `Dùng email khác` returns to the form.

## Motion

| Element | Behavior |
| --- | --- |
| Hero image | `900ms` crossfade, no aggressive zoom |
| Hero copy | `500ms` fade and `12px` rise when the slide changes |
| Section reveal | `700ms` fade and `24px` rise, once |
| Product image hover | `500ms` scale to `1.03` |
| Collection image hover | `700ms` scale to `1.04` |
| Buttons | `150-200ms` color and border transitions |

Reduced motion:

- No auto-play.
- No reveal transform, content is immediately visible.
- No image scale on hover.
- Keep color and focus transitions.

## Accessibility

- Text contrast meets WCAG AA. Brass text on paper uses `landing-brass-ink`.
- Interactive targets are at least `44px` where practical.
- Focus rings use oxblood on paper and brass on dark.
- Collection panels are buttons with `aria-pressed`.
- Carousel controls have Vietnamese labels and a live region for the active slide.
- Auto-play pauses on hover and focus.
- Images have meaningful Vietnamese alt text.
- Forms have labels, inline errors, and `aria-live`.
- The page is fully keyboard navigable.

## Performance

- Hero first image uses `priority`; all other images are lazy by default.
- Use `next/image` with correct `sizes` for every fill image.
- No background video and no large WebGL scene on the landing page.
- Motion is transform and opacity only.
- Avoid layout shift by reserving aspect ratios for all media.
- Target LCP under `2.5s` on desktop and CLS under `0.1`.

## Asset Strategy

Real API data is the source of truth. Products, collection names, seasons, counts, cover images, and lookbook images come from the backend. The local manifest below is fallback-only media.

| Slot | Fallback asset |
| --- | --- |
| Hero | `public/images/726470431_1311184104081177_6052756217829444481_n.png` |
| Look 01 | `public/images/731163514_999523332788054_1114320478812927640_n.png` |
| Look 02 | `public/images/726470431_1311184104081177_6052756217829444481_n.png` |
| Look 03 | `public/images/731199294_3955961871204172_1445370375731306017_n.png` |
| AI try-on preview | `public/images/731163514_999523332788054_1114320478812927640_n.png` |
| Product fallback | `public/images/731163514_999523332788054_1114320478812927640_n.png` |

The hero uses `collection.coverImages[0]`, collection panels use the first cover image, the lookbook uses `lookbookImages` or `coverImages`, and the AI try-on preview uses the selected product image. Fallback media is centralized in `src/features/home/constants/landing-media.ts` and is only used when the API has no image or a remote image fails.

The real campaign images may be portrait or landscape. The hero keeps a full-bleed composition with `object-position` set to `50% 0%` so the face and garment remain in frame. If the real campaign focal point differs, tune the hero focal point without changing the data flow.

## Copy Rules

- Vietnamese first, sentence case for body, uppercase for labels.
- No emoji in UI copy.
- No vendor names in customer-facing AI copy.
- No performance or accuracy numbers unless the backend exposes a verified metric.
- No promises of discounts or email delivery that the product does not implement.
- Use `Thá»­ Ä‘á»“ AI`, not `Virtual Try-On` in Vietnamese UI.
- Use `AI Stylist` as the product name.
- Prices use the existing formatted product values.

## Decisions Log

| Decision | Reason |
| --- | --- |
| Docs first | The page has many new tokens and component contracts; implementation needs a single source of truth |
| Full-bleed hero | Agreed direction; portrait mock works with focal-point cropping |
| Collection panels differ from product cards | Two different jobs: browse a chapter vs buy a product |
| No sale banner | It interrupted the collection-to-product path |
| One product grid | Keeps a single browsing moment |
| Landing-only header and footer restyle | Limits risk to authenticated app pages |
| AI Stylist CTA only | The add-whole-outfit flow is not part of this phase |
| Honest AI copy | Removes vendor names and unverified metrics |
| API-first landing data | Products, collections, and their images now come from the backend; local media is fallback-only |
| Compact AI try-on preview | The image supports the three steps instead of competing with them |
| No hero tagline or collection label | The two-line headline and CTAs carry the first screen without clutter |
| No masthead or breadcrumb on `/products` | The catalog is a working page; products start right under the toolbar |
| One search field on `/products` | The header and toolbar searches duplicated each other, and the header search did not filter while already on the page |
| Single-plate lookbook viewer | A row of three cards read as a second collection grid; one capped portrait plate with side details keeps the lookbook distinct and fully visible on screen |
| One account shell | The five account pages share one menu and heading so moving between them does not change the frame |
| Honest account controls | Fields and filters the backend ignores were removed instead of restyled: profile phone, birthday, gender, job and address; body type; preferred sizes; notification type tabs |
| Mode switch in the try-on header | Live and photo are two ways to do the same job; the switch belongs to the page, not to either workspace |
| Plans from the API | Hard-coded prices drifted (the upgrade dialog said 49.000đ for a 34.000đ plan), so plan cards, the comparison table and dialogs read `/payments/plans` |

## Acceptance Criteria

- `/` renders the eight chapters above in order.
- No sale banner and no second product grid.
- Hero never renders empty and always shows a usable CTA.
- Collection panels are keyboard-operable and visually distinct from product cards.
- Product try-on controls show a visible icon and navigate to a real try-on URL.
- AI Try-On and newsletter are visible at `390px`.
- No teal, bright gold, fake statistics, or vendor names on the landing page.
- Header and footer changes do not affect non-landing routes.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run check:architecture` pass.
- Mobile, tablet, and desktop layouts have no horizontal overflow.
- `/products` shows one search field, no masthead or breadcrumb, and no dead controls.

## Changelog

| Date | Change |
| --- | --- |
| 2026-10-25 | Initial approved direction |
| 2026-10-25 | Synced docs with the full-bleed hero without tagline, local-first media, display line-height `1.1`, and compact AI try-on preview |
| 2026-10-25 | Lookbook is a single capped portrait plate with side details and thumbnails, not a horizontal card row |
| 2026-10-25 | Landing now reads real products and collections from the API, including cover, lookbook, and product images; local media is fallback-only |
| 2026-10-26 | Added the products page spec: toolbar, filters, grid states, and one search field |
| 2026-10-26 | Account pages (profile, measurements, orders, reviews, notifications) on one `AccountShell`, with controls limited to what the backend stores |
| 2026-10-26 | Try-on page (live and photo modes) on Atelier Paper, with shared garment slots, a real-price upgrade dialog and no sample-photo control |
| 2026-10-26 | Rack, cart, header notifications, address book, try-on and AI Stylist history, and plans on Atelier Paper |
| 2026-10-28 | Added the product detail spec: paper and ivory surfaces, gallery lightbox, purchase panel, detail tabs, honest review states, and related products |

