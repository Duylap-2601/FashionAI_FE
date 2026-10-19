/**
 * Matches AI-suggested outfit items to real products in the shop catalog.
 * Uses keyword matching on product names, descriptions, and categories.
 */
import type { Product } from '@/features/products/types/products';
import type { OutfitItem } from '@/features/stylist/types/stylist';

/** Vietnamese + English category keywords mapped to garment types */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  SHIRT: ['áo sơ mi', 'sơ mi', 'shirt', 'blouse', 'áo thun', 'thun', 'tee', 'polo', 'áo polo'],
  VEST: ['vest', 'gile', 'áo gile', 'waistcoat'],
  JACKET: ['blazer', 'jacket', 'áo khoác', 'khoác', 'áo blazer', 'cardigan'],
  PANTS: ['quần', 'pants', 'trouser', 'chino', 'jeans', 'short', 'quần short'],
  SKIRT: ['váy', 'skirt', 'chân váy'],
  DRESS: ['đầm', 'dress', 'jumpsuit', 'playsuit'],
  ACCESSORIES: ['thắt lưng', 'belt', 'túi', 'bag', 'giày', 'shoes', 'phụ kiện', 'accessory', 'cà vạt', 'tie', 'khăn', 'scarf'],
};

/** Tokenize a text into lowercase words for matching */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9àáâãèéêìíòóôõùúýăđơư\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Score a product against an outfit item name */
function scoreProductForItem(product: Product, itemName: string): number {
  const itemTokens = tokenize(itemName);
  const productText = [product.name, product.category, product.description ?? '']
    .join(' ')
    .toLowerCase();

  let score = 0;

  // Direct substring match on full item name (highest weight)
  if (productText.includes(itemName.toLowerCase())) {
    score += 10;
  }

  // Token-level match
  for (const token of itemTokens) {
    if (token.length < 2) continue;
    if (productText.includes(token)) {
      score += 2;
    }
  }

  // Category keyword match
  for (const [, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const categoryMatch = keywords.some((kw) => itemName.toLowerCase().includes(kw));
    if (categoryMatch) {
      const productMatchesCategory = keywords.some((kw) => productText.includes(kw));
      if (productMatchesCategory) score += 3;
    }
  }

  return score;
}

/** Given an outfit item name, find the best-matching product from the catalog */
export function findMatchingProduct(
  itemName: string,
  catalog: Product[],
  threshold = 2,
): Product | null {
  if (!itemName || catalog.length === 0) return null;

  let best: { product: Product; score: number } | null = null;

  for (const product of catalog) {
    const score = scoreProductForItem(product, itemName);
    if (score >= threshold && (!best || score > best.score)) {
      best = { product, score };
    }
  }

  return best?.product ?? null;
}

/**
 * Given a list of outfit item names, return a deduplicated list of matching products.
 * At most `maxResults` products are returned.
 */
export function findOutfitProducts(
  itemNames: string[],
  catalog: Product[],
  maxResults = 3,
): Product[] {
  const seen = new Set<string>();
  const results: Product[] = [];

  for (const name of itemNames) {
    if (results.length >= maxResults) break;
    const match = findMatchingProduct(name, catalog);
    if (match && !seen.has(match.id)) {
      seen.add(match.id);
      results.push(match);
    }
  }

  return results;
}
