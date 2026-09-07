'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  BackendCollection,
  Collection,
  mapBackendCollection,
  CreateCollectionDto,
  UpdateCollectionDto,
} from '@/types/collection';
import { INITIAL_COLLECTIONS, getAllCollections } from '@/lib/collections';
import { BackendProduct, mapProduct } from '@/hooks/useProducts';
import type { Product } from '@/lib/data';

// ─── Public Queries (Customer Facing) ──────────────────────────────────────────

/**
 * Fetch all published collections (ordered by displayOrder).
 * Falls back to local initial collections if API call fails or is empty.
 */
export function usePublishedCollections() {
  const query = useQuery<Collection[]>({
    queryKey: ['collections', 'published'],
    queryFn: async () => {
      try {
        const res = await api.get('/collections/published');
        const rawList: BackendCollection[] = Array.isArray(res.data)
          ? res.data
          : res.data?.items || [];

        if (rawList.length > 0) {
          return rawList.map(mapBackendCollection);
        }
        // If backend returned empty list, fallback to mock collections
        return INITIAL_COLLECTIONS.filter((c) => c.isPublished);
      } catch (err) {
        console.warn('Backend collections unreachable, falling back to mock collections:', err);
        return INITIAL_COLLECTIONS.filter((c) => c.isPublished);
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    collections: query.data ?? INITIAL_COLLECTIONS.filter((c) => c.isPublished),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Fetch a single published collection by slug.
 */
export function useCollection(slug?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Collection | null>({
    queryKey: ['collection', slug],
    queryFn: async () => {
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
    },
    enabled: !!slug,
    initialData: () => {
      if (!slug) return undefined;
      const cached = queryClient.getQueryData<Collection[]>(['collections', 'published']);
      return cached?.find((c) => c.slug === slug || c.id === slug);
    },
  });

  return {
    collection: query.data,
    isLoading: query.isLoading && !query.data,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Fetch products belonging to a collection.
 */
export function useCollectionProducts(collectionId?: string) {
  const query = useQuery<Product[]>({
    queryKey: ['collection-products', collectionId],
    queryFn: async () => {
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
    },
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ─── Admin Queries & Mutations (Requires JWT) ──────────────────────────────────

/**
 * Fetch all collections (including unpublished/drafts) for Admin.
 */
export function useAdminAllCollections() {
  const query = useQuery<Collection[]>({
    queryKey: ['admin-collections'],
    queryFn: async () => {
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
    },
  });

  return {
    collections: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Mutation to create a collection (supports multipart/form-data for image uploads).
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FormData | (CreateCollectionDto & { coverImages?: File[] })) => {
      let body: FormData;

      if (payload instanceof FormData) {
        body = payload;
      } else {
        body = new FormData();
        body.append('name', payload.name);
        if (payload.slug) body.append('slug', payload.slug);
        if (payload.description) body.append('description', payload.description);
        if (payload.isPublished !== undefined) body.append('isPublished', String(payload.isPublished));
        if (payload.displayOrder !== undefined) body.append('displayOrder', String(payload.displayOrder));
        if (payload.coverImages && payload.coverImages.length > 0) {
          payload.coverImages.forEach((file) => {
            body.append('coverImages', file);
          });
        }
      }

      const res = await api.post('/collections', body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections', 'published'] });
    },
  });
}

/**
 * Mutation to update a collection.
 */
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: FormData | (UpdateCollectionDto & { coverImages?: File[] });
    }) => {
      let body: FormData;

      if (data instanceof FormData) {
        body = data;
      } else {
        body = new FormData();
        if (data.name !== undefined) body.append('name', data.name);
        if (data.slug !== undefined) body.append('slug', data.slug);
        if (data.description !== undefined) body.append('description', data.description);
        if (data.isPublished !== undefined) body.append('isPublished', String(data.isPublished));
        if (data.displayOrder !== undefined) body.append('displayOrder', String(data.displayOrder));
        if (data.coverImages && data.coverImages.length > 0) {
          data.coverImages.forEach((file) => {
            body.append('coverImages', file);
          });
        }
      }

      const res = await api.patch(`/collections/${id}`, body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections', 'published'] });
    },
  });
}

/**
 * Mutation to delete a collection.
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/collections/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections', 'published'] });
    },
  });
}

/**
 * Mutation to add a product to a collection.
 */
export function useAddProductToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, productId }: { collectionId: string; productId: string }) => {
      const res = await api.post(`/collections/${collectionId}/products`, { productId });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection-products', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
    },
  });
}

/**
 * Mutation to remove a product from a collection.
 */
export function useRemoveProductFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, productId }: { collectionId: string; productId: string }) => {
      const res = await api.delete(`/collections/${collectionId}/products/${productId}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collection-products', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
    },
  });
}
