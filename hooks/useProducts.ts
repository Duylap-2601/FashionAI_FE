'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product } from '@/lib/data';

interface BackendProduct {
  id: string;
  name: string;
  description?: string | null;
  category: 'UPPER' | 'LOWER' | 'FULL_BODY';
  color?: string | null;
  size?: string | null;
  price: string | number;
  garmentUrl: string;
  images?: { imageUrl: string; isMain: boolean }[];
}

export function useProducts() {
  const query = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products', { params: { limit: 100 } });
      return ((res.data || []) as BackendProduct[]).map(mapProduct);
    },
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useProduct(id?: string) {
  const query = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return mapProduct(res.data as BackendProduct);
    },
    enabled: !!id,
  });

  return {
    product: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

function mapProduct(product: BackendProduct): Product {
  const image =
    product.images?.find((item) => item.isMain)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    product.garmentUrl;
  const priceNumber = Number(product.price);
  const colorName = product.color || 'Mac dinh';
  const size = product.size || 'M';

  return {
    id: product.id,
    name: product.name,
    brand: 'FashionAI',
    price: Number.isFinite(priceNumber) ? `${priceNumber.toLocaleString('vi-VN')} đ` : `${product.price}`,
    numericPrice: Number.isFinite(priceNumber) ? priceNumber : 0,
    category: mapCategory(product.category),
    image,
    gallery: product.images?.map((item) => item.imageUrl) || [image],
    colors: [{ name: colorName, hex: guessColorHex(colorName) }],
    sizes: [size],
    isGuest: false,
  };
}

function mapCategory(category: BackendProduct['category']) {
  switch (category) {
    case 'LOWER':
      return 'Quan/Vay';
    case 'FULL_BODY':
      return 'Toan than';
    case 'UPPER':
    default:
      return 'Ao';
  }
}

function guessColorHex(color: string) {
  const normalized = color.toLowerCase();
  if (normalized.includes('navy') || normalized.includes('xanh')) return '#1f2a44';
  if (normalized.includes('trang') || normalized.includes('white')) return '#ffffff';
  if (normalized.includes('den') || normalized.includes('black')) return '#111111';
  if (normalized.includes('khaki') || normalized.includes('be')) return '#c8ad7f';
  return '#8b8f98';
}
