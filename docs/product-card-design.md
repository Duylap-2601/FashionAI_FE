# ProductCard — Shared Component Design Specification

## 1. Objective

Implement a single, reusable `ProductCard` component for the StAle fashion e-commerce website.

The same component must be used on both the Landing Page and the Products Page, maintaining a consistent visual identity while supporting optional interactions and responsive layouts.

The design must match the existing StAle landing page: premium fashion editorial, understated luxury, warm ivory surfaces, oxblood accents, refined typography, and image-focused product presentation.

**Core principle:** One component, one visual design, reusable across all product listing contexts.

## 2. Visual Design

Reuse the existing design tokens and Tailwind utilities from the landing page.

- Background: `landing-paper`
- Primary text: `landing-obsidian`
- Accent and current price: `landing-oxblood`
- Secondary text: `landing-muted`
- Borders: `landing-line`
- New-product badge: `landing-sage`
- Rating: `landing-brass` and `landing-brass-ink`

Do not introduce a separate color palette, typography system, or visual style for the Products Page.

### Product Image

- Use a consistent 3:4 aspect ratio.
- Use `object-cover` and `object-top` for garment photography.
- Apply a subtle image scale transition on hover, approximately `1.03`.
- When a valid secondary gallery image exists, crossfade to it on hover.
- Provide a branded fallback for failed or missing images.
- Use Next.js `Image` with responsive sizing.
- Ensure the image area remains stable to prevent layout shifts.

### Product Badges

Position badges in the upper-left corner of the image.

**Sale badge**
- Oxblood background with light text.
- Display the calculated discount percentage.
- Only show when the original price is greater than the current price.

**New-product badge**
- Sage background with obsidian text.
- Use the existing Vietnamese label `Mới`.
- Display when the product is new and no valid sale badge takes priority.

Keep badges compact and avoid unnecessary promotional labels.

### Quick Actions

Position quick actions along the bottom of the product image.

**Add to cart**
- Obsidian background with light text.
- Shopping bag icon and the concise label `Thêm giỏ` when space permits.
- Oxblood hover state.
- Reuse the existing cart hook and toast notification.

**AI try-on**
- Light background with a subtle border.
- Use the existing Sparkles icon.
- Navigate to `/try-on?productId={product.id}`.

On desktop, actions may appear on hover. On mobile, they must remain accessible without hover.

Prevent action clicks from triggering product navigation. Do not add a product with an invalid default variant when selection is required.

### Product Information

Display information directly beneath the image.

**Brand**
- Small uppercase text.
- Muted color and restrained letter spacing.
- Truncate long names gracefully.
- Preserve the existing brand fallback.

**Rating**
- Show only when valid rating or review information exists.
- Use the existing brass star icon.
- Display the review count when available.
- Never fabricate ratings.

**Product name**
- Use the existing `font-display` typography.
- Approximately `1.05rem` on desktop, adapted for smaller screens.
- Maximum two lines using `line-clamp-2`.
- Obsidian text with a subtle oxblood hover state.
- Link to `/products/{product.id}`.

**Pricing**
- Current price: compact monospace typography in oxblood.
- Original price: smaller, muted, and struck through.
- Only show the original price when it exceeds the current price.
- Reuse existing formatted price fields and currency formatting.

Maintain consistent alignment and restrained spacing across product cards.

## 3. Component API

Implement one component:

```tsx
type ProductCardProps = {
  product: Product;
  showQuickAdd?: boolean;
  showTryOn?: boolean;
  showRating?: boolean;
  imagePriority?: boolean;
};
```

Adapt this API to the existing project types and conventions. Optional props must have sensible defaults.

Do not add page-specific props such as `isLandingPage`, `isProductsPage`, or `showHeading`. The card must not contain section headings, product filters, sorting controls, or pagination.

## 4. Shared Usage

Use the same component directly in both pages.

**Landing Page:**

```tsx
<div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
  {featuredProducts.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

**Products Page:**

```tsx
<div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

These examples illustrate shared usage. Each page may configure its own grid columns and spacing, but must not implement a separate product card.

## 5. Existing Data and Behavior

Reuse the existing `Product` type and fields, including:

- `id`
- `name`
- `brand`
- `image`
- `gallery`
- `price`
- `numericPrice`
- `originalPrice`
- `originalPriceFormatted`
- `isNew`
- `rating`
- `reviewCount`
- `colors`

Preserve existing functionality:

- Product detail navigation.
- Cart integration and notifications.
- AI try-on navigation.
- Secondary image hover.
- Image error handling.
- Discount calculation.
- Product color and variant handling.

Avoid duplicating business logic or introducing incompatible product models.

## 6. Accessibility and Performance

- Provide descriptive image alt text.
- Give icon-only buttons accessible labels.
- Support keyboard navigation and visible focus states.
- Ensure quick actions work on touch devices.
- Respect reduced-motion preferences.
- Avoid nested interactive elements.
- Use responsive image sizes and stable image dimensions.
- Prioritize only genuinely above-the-fold images.
- Avoid unnecessary client-side state and dependencies.

## 7. Implementation Requirements

1. Refactor the existing product card markup and interaction logic into one reusable `ProductCard`.
2. Replace duplicated card markup wherever it exists.
3. Use the same component on the Landing Page and Products Page.
4. Preserve the existing StAle landing page design tokens and visual hierarchy.
5. Keep page-level headings, category navigation, filters, sorting, and pagination outside the card.
6. Preserve existing cart, try-on, routing, and product variant behavior.
7. Do not redesign unrelated pages or introduce unnecessary abstractions.

## 8. Acceptance Criteria

- Both pages render the same `ProductCard` implementation.
- Product imagery, typography, badges, and pricing remain visually consistent.
- Responsive layouts work on mobile, tablet, and desktop.
- All existing card interactions continue to work.
- Product filtering, sorting, and pagination remain unaffected.
- No duplicated card implementation or unnecessary abstraction is introduced.

**Final direction:** Build one polished, production-ready `ProductCard` that reflects StAle's premium editorial identity and can be reused throughout the storefront without visual inconsistency.
