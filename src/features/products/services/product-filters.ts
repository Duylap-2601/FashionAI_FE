import type { CategoryGroup } from '@/features/products/types/product-filters';
import type { Product } from '@/features/products/types/products';

export function getCategoryGroup(product: Product): CategoryGroup {
  const cat = (product.category || '').trim();
  const catLower = cat.toLowerCase();
  const name = (product.name || '').toLowerCase();

  if (cat === 'Suit đầy đủ') return 'Suit đầy đủ';
  if (cat === 'Quần & Váy') return 'Quần & Váy';
  if (cat === 'Áo') return 'Áo';

  if (
    catLower.includes('suit') ||
    catLower.includes('full_body') ||
    catLower.includes('toan than') ||
    catLower.includes('one-piece') ||
    name.includes('suit') ||
    name.includes('nguyên bộ') ||
    name.includes('combo')
  ) {
    return 'Suit đầy đủ';
  }

  if (
    catLower.includes('lower') ||
    catLower.includes('bottom') ||
    catLower.includes('quan') ||
    catLower.includes('vay') ||
    name.includes('quần') ||
    name.includes('váy') ||
    name.includes('chân váy')
  ) {
    return 'Quần & Váy';
  }

  return 'Áo';
}
