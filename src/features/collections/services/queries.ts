import { mapBackendCollection } from '@/features/collections/services/collection-mapper';
import { getAllCollections, INITIAL_COLLECTIONS } from '@/features/collections/services/local-collections';
import type { BackendCollection } from '@/features/collections/types/collection';
import { mapProduct } from '@/features/products/services/products-utils';
import type { BackendProduct } from '@/features/products/types/products-hook';
import { http } from '@/lib/http';
import { isCancel } from 'axios';

export async function fetchPublishedCollections() {
  try {
    const data = await http.get<BackendCollection[] | { items?: BackendCollection[] }>('/collections/published');
    const rawList: BackendCollection[] = Array.isArray(data)
      ? data
      : data.items || [];

    return rawList.map(mapBackendCollection);
  } catch (err) {
    if (isCancel(err)) throw err;
    console.warn('Backend collections unreachable, falling back to mock collections:', err);
    return INITIAL_COLLECTIONS.filter((c) => c.isPublished);
  }
}

export async function fetchCollection(slug: string | undefined) {
  if (!slug) return null;
  try {
    const data = await http.get<BackendCollection | null>(`/collections/${slug}`);
    if (data) {
      return mapBackendCollection(data);
    }
    return null;
  } catch (err) {
    if (isCancel(err)) throw err;
    const fallback = INITIAL_COLLECTIONS.find(
      (c) => c.slug === slug || c.id === slug
    );
    return fallback ?? null;
  }
}

export async function fetchCollectionProducts(collectionId: string | undefined) {
  if (!collectionId) return [];
  try {
    const data = await http.get<BackendProduct[] | { items?: BackendProduct[] }>(`/collections/${collectionId}/products`);
    const rawList = Array.isArray(data)
      ? data
      : data.items || [];
    return (rawList as BackendProduct[]).map(mapProduct);
  } catch (err) {
    if (isCancel(err)) throw err;
    console.warn(`Could not load products for collection ${collectionId}:`, err);
    return [];
  }
}

export async function fetchAdminAllCollections() {
  try {
    const data = await http.get<BackendCollection[] | { items?: BackendCollection[] }>('/collections');
    const rawList: BackendCollection[] = Array.isArray(data)
      ? data
      : data.items || [];
    return rawList.map(mapBackendCollection);
  } catch (err) {
    if (isCancel(err)) throw err;
    console.warn('Admin collections API failed, falling back to local storage:', err);
    return getAllCollections();
  }
}

export { queryKeys } from './query-keys';
