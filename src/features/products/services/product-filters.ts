import type { CategoryGroup } from '@/features/products/types/product-filters';
import type { GarmentType, Product } from '@/features/products/types/products';

export function matchesGarmentType(product: Product, garmentType?: GarmentType): boolean {
  if (!garmentType) return true;

  if (product.garmentType && product.garmentType.toUpperCase() === garmentType.toUpperCase()) {
    return true;
  }

  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();

  switch (garmentType) {
    case 'SHIRT':
      return (
        name.includes('sơ mi') ||
        name.includes('shirt') ||
        category.includes('sơ mi') ||
        category.includes('shirt')
      );
    case 'VEST':
      return (
        name.includes('gile') ||
        name.includes('ghi lê') ||
        ((name.includes('vest') || category.includes('vest')) &&
          !name.includes('blazer') &&
          !category.includes('blazer'))
      );
    case 'JACKET':
      return (
        name.includes('blazer') ||
        name.includes('khoác') ||
        name.includes('jacket') ||
        name.includes('kaki') ||
        name.includes('cardigan') ||
        category.includes('blazer') ||
        category.includes('jacket') ||
        category.includes('khoác')
      );
    case 'PANTS':
      return (
        name.includes('quần') ||
        name.includes('pant') ||
        name.includes('trouser') ||
        category.includes('quần') ||
        category.includes('pant')
      );
    case 'SKIRT':
      return (
        name.includes('chân váy') ||
        name.includes('skirt') ||
        category.includes('chân váy') ||
        category.includes('skirt') ||
        (name.includes('váy') && !name.includes('đầm') && !name.includes('dress'))
      );
    case 'DRESS':
      return (
        name.includes('đầm') ||
        name.includes('dress') ||
        category.includes('đầm') ||
        category.includes('dress')
      );
    case 'JUMPSUIT':
      return (
        name.includes('jumpsuit') ||
        category.includes('jumpsuit')
      );
    default:
      return false;
  }
}

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
