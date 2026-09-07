import { Collection, CreateCollectionDto, UpdateCollectionDto } from '@/types/collection';

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Elegance Office 2026',
    slug: 'elegance-office-2026',
    season: 'SPRING / SUMMER 2026',
    tagline: 'Tinh tế từng đường may, bản lĩnh nơi công sở',
    description: 'Bộ sưu tập hội tụ những thiết kế blazer may đo tinh xảo, chất liệu vải tuyết mưa dệt cao cấp tôn lên vóc dáng thanh lịch của quý cô văn phòng hiện đại.',
    coverImages: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=85',
    lookbookImages: [
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=85',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=85',
    ],
    isPublished: true,
    displayOrder: 1,
    productIds: ['p1', 'p2', 'p3'],
    itemCount: 18,
    createdAt: '2026-02-15T08:00:00.000Z',
    updatedAt: '2026-03-01T10:30:00.000Z',
  },
  {
    id: 'col-2',
    name: 'Urban Power Suit',
    slug: 'urban-power-suit',
    season: 'AUTUMN / WINTER 2026',
    tagline: 'Cấu trúc tối giản, phong thái quyền uy',
    description: 'Dòng suit công sở phá cách với phom dáng suông phóng khoáng kết hợp ve áo cổ điển, mang lại sự tự tin tối đa cho các buổi đàm phán quan trọng.',
    coverImages: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=85',
    lookbookImages: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=85',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=85',
    ],
    isPublished: true,
    displayOrder: 2,
    productIds: ['p2', 'p4', 'p5'],
    itemCount: 24,
    createdAt: '2026-02-20T09:00:00.000Z',
    updatedAt: '2026-03-02T14:15:00.000Z',
  },
  {
    id: 'col-3',
    name: 'Monochrome Tailoring',
    slug: 'monochrome-tailoring',
    season: 'SIGNATURE 2026',
    tagline: 'Nghệ thuật tương phản đen & trắng kinh điển',
    description: 'Cặp màu đen - trắng vượt thời gian trong phom dáng hiện đại. Đơn giản nhưng đầy sức hút, dễ dàng kết hợp cho mọi dịp từ công sở đến sự kiện tối.',
    coverImages: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=85',
    lookbookImages: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1000&q=85',
    ],
    isPublished: true,
    displayOrder: 3,
    productIds: ['p1', 'p3', 'p6'],
    itemCount: 15,
    createdAt: '2026-03-01T11:00:00.000Z',
    updatedAt: '2026-03-05T16:20:00.000Z',
  },
  {
    id: 'col-4',
    name: 'Neo Executive Pre-Fall',
    slug: 'neo-executive-pre-fall',
    season: 'PRE-FALL 2026',
    tagline: 'Tái định nghĩa chuẩn mực trang phục lãnh đạo',
    description: 'Dự án bộ sưu tập mới chuẩn bị ra mắt. Hiện đang ở trạng thái bản nháp để Admin kiểm duyệt.',
    coverImages: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=85',
    isPublished: false,
    displayOrder: 4,
    productIds: ['p4', 'p5'],
    itemCount: 12,
    createdAt: '2026-03-06T12:00:00.000Z',
    updatedAt: '2026-03-07T09:00:00.000Z',
  },
];

const STORAGE_KEY = 'fashionai_mock_collections_v1';

/**
 * Get all collections. Uses localStorage if in browser and available, falls back to INITIAL_COLLECTIONS.
 */
export function getAllCollections(): Collection[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Initialize storage with defaults
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COLLECTIONS));
    } catch {
      // ignore localStorage errors
    }
  }
  return INITIAL_COLLECTIONS;
}

/**
 * Get only published collections (for landing page and customer facing views).
 */
export function getPublishedCollections(): Collection[] {
  return getAllCollections().filter((c) => c.isPublished);
}

/**
 * Get single collection by slug or ID.
 */
export function getCollectionByIdOrSlug(idOrSlug: string): Collection | undefined {
  return getAllCollections().find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}

/**
 * Save / Update a collection.
 */
export function saveCollection(data: Partial<Collection> & { id?: string }): Collection {
  const current = getAllCollections();
  let updatedCollection: Collection;

  if (data.id) {
    const existingIndex = current.findIndex((c) => c.id === data.id);
    if (existingIndex >= 0) {
      updatedCollection = {
        ...current[existingIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      } as Collection;
      current[existingIndex] = updatedCollection;
    } else {
      updatedCollection = {
        id: data.id,
        name: data.name || 'Bộ sưu tập mới',
        slug: data.slug || `collection-${Date.now()}`,
        season: data.season || '2026',
        tagline: data.tagline || '',
        description: data.description || '',
        coverImages: data.coverImages && data.coverImages.length > 0 ? data.coverImages : [
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
        ],
        thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=85',
        isPublished: data.isPublished ?? true,
        displayOrder: data.displayOrder ?? 0,
        productIds: data.productIds || [],
        itemCount: data.itemCount || 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      current.unshift(updatedCollection);
    }
  } else {
    const id = `col-${Date.now()}`;
    const slug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `col-${Date.now()}`;
    updatedCollection = {
      id,
      name: data.name || 'Bộ sưu tập mới',
      slug,
      season: data.season || '2026',
      tagline: data.tagline || '',
      description: data.description || '',
      coverImages: data.coverImages && data.coverImages.length > 0 ? data.coverImages : [
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=85',
      ],
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=85',
      isPublished: data.isPublished ?? true,
      displayOrder: data.displayOrder ?? 0,
      productIds: data.productIds || [],
      itemCount: data.itemCount || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    current.unshift(updatedCollection);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event('collections_updated'));
    } catch {
      // ignore
    }
  }

  return updatedCollection;
}

/**
 * Toggle publish status of a collection.
 */
export function togglePublishCollection(id: string): Collection | null {
  const current = getAllCollections();
  const index = current.findIndex((c) => c.id === id);
  if (index === -1) return null;

  current[index] = {
    ...current[index],
    isPublished: !current[index].isPublished,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event('collections_updated'));
    } catch {
      // ignore
    }
  }

  return current[index];
}

/**
 * Delete a collection.
 */
export function deleteCollection(id: string): boolean {
  const current = getAllCollections();
  const next = current.filter((c) => c.id !== id);
  if (next.length === current.length) return false;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('collections_updated'));
    } catch {
      // ignore
    }
  }
  return true;
}
