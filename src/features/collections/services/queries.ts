import { mapBackendCollection } from '@/features/collections/services/collection-mapper';
import { getAllCollections, INITIAL_COLLECTIONS } from '@/features/collections/services/local-collections';
import type { BackendCollection } from '@/features/collections/types/collection';
import { mapProduct } from '@/features/products/services/products-utils';
import type { BackendProduct } from '@/features/products/types/products-hook';
import { api } from '@/lib/api';

export async function fetchPublishedCollections() {
  try {
    const res = await api.get('/collections/published');
    const rawList: BackendCollection[] = Array.isArray(res.data)
      ? res.data
      : res.data?.items || [];

    return rawList.map(mapBackendCollection);
  } catch (err) {
    console.warn('Backend collections unreachable, falling back to mock collections:', err);
    return INITIAL_COLLECTIONS.filter((c) => c.isPublished);
  }
}

export async function fetchCollection(slug: string | undefined) {
  if (!slug) return null;
  try {
    const res = await api.get(`/collections/${slug}`);
    if (res.data) {
      return mapBackendCollection(res.data as BackendCollection);
    }
    return null;
  } catch {
    const fallback = INITIAL_COLLECTIONS.find(
      (c) => c.slug === slug || c.id === slug
    );
    return fallback ?? null;
  }
}

export async function fetchCollectionProducts(collectionId: string | undefined) {
  if (!collectionId) return [];
  try {
    const res = await api.get(`/collections/${collectionId}/products`);
    const rawList = Array.isArray(res.data)
      ? res.data
      : res.data?.items || [];
    return (rawList as BackendProduct[]).map(mapProduct);
  } catch (err) {
    console.warn(`Could not load products for collection ${collectionId}:`, err);
    return [];
  }
}

export async function fetchAdminAllCollections() {
  try {
    const res = await api.get('/collections');
    const rawList: BackendCollection[] = Array.isArray(res.data)
      ? res.data
      : res.data?.items || [];
    return rawList.map(mapBackendCollection);
  } catch (err) {
    console.warn('Admin collections API failed, falling back to local storage:', err);
    return getAllCollections();
  }
}

export { queryKeys } from './query-keys';
