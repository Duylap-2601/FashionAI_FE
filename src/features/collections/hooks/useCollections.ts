'use client';

import { mutationKeys } from '@/features/collections/services/mutation-keys';
import { queryKeys as collectionsQueryKeys } from '@/features/collections/services/query-keys';
import { addProductToCollection, createCollection, deleteCollection, removeProductFromCollection, updateCollection } from '@/features/collections/services/mutations';
import { fetchAdminAllCollections, fetchCollection, fetchCollectionProducts, fetchPublishedCollections } from '@/features/collections/services/queries';
import { INITIAL_COLLECTIONS } from '@/features/collections/services/local-collections';
import {
  Collection
} from '@/features/collections/types/collection';
import type { Product } from '@/features/products/types/products';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ─── Public Queries (Customer Facing) ──────────────────────────────────────────

/**
 * Fetch all published collections (ordered by displayOrder).
 * Falls back to local initial collections if API call fails or is empty.
 */
export function usePublishedCollections() {
  const query = useQuery<Collection[]>({
    queryKey: collectionsQueryKeys.collections('published'),
    queryFn: fetchPublishedCollections,
    staleTime: 60 * 1000,
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
    queryKey: collectionsQueryKeys.collection(slug),
    queryFn: () => fetchCollection(slug),
    enabled: !!slug,
    initialData: () => {
      if (!slug) return undefined;
      const cached = queryClient.getQueryData<Collection[]>(collectionsQueryKeys.collections('published'));
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
    queryKey: collectionsQueryKeys.collectionProducts(collectionId),
    queryFn: () => fetchCollectionProducts(collectionId),
    enabled: !!collectionId,
    staleTime: 60 * 1000,
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
    queryKey: collectionsQueryKeys.adminCollections(),
    queryFn: fetchAdminAllCollections,
  });

  return {
    collections: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Mutation to create a collection (supports multipart/form-data for image uploads and JSON for URL lists).
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.createCollection(),
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.adminCollections() });
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.collections('published') });
    },
  });
}

/**
 * Mutation to update a collection.
 */
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.updateCollection(),
    mutationFn: updateCollection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.adminCollections() });
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.collections('published') });
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.collection(variables.id) });
    },
  });
}

/**
 * Mutation to delete a collection.
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.deleteCollection(),
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.adminCollections() });
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.collections('published') });
    },
  });
}

/**
 * Mutation to add a product to a collection.
 */
export function useAddProductToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.addProductToCollection(),
    mutationFn: addProductToCollection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.collectionProducts(variables.collectionId) });
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.adminCollections() });
    },
  });
}

/**
 * Mutation to remove a product from a collection.
 */
export function useRemoveProductFromCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.removeProductFromCollection(),
    mutationFn: removeProductFromCollection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.collectionProducts(variables.collectionId) });
      queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.adminCollections() });
    },
  });
}
