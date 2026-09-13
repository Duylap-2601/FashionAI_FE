import {
  CreateCollectionDto,
  UpdateCollectionDto
} from '@/features/collections/types/collection';
import { http } from '@/lib/http';

export async function createCollection(payload: FormData | CreateCollectionDto) {
  if (payload instanceof FormData) {
    return http.post('/collections', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  const files = payload.coverImages?.filter((item): item is File => typeof item !== 'string') || [];
  const urls = payload.coverImages?.filter((item): item is string => typeof item === 'string') || [];

  if (files.length > 0) {
    const body = new FormData();
    body.append('name', payload.name);
    if (payload.slug) body.append('slug', payload.slug);
    if (payload.description) body.append('description', payload.description);
    if (payload.isPublished !== undefined) body.append('isPublished', String(payload.isPublished));
    if (payload.displayOrder !== undefined) body.append('displayOrder', String(payload.displayOrder));
    files.forEach((file) => body.append('coverImages', file));

    return http.post('/collections', body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } else {
    return http.post('/collections', {
      name: payload.name,
      slug: payload.slug || undefined,
      description: payload.description || undefined,
      isPublished: payload.isPublished,
      displayOrder: payload.displayOrder,
      coverImages: urls.length > 0 ? urls : undefined,
    });
  }
}

export async function updateCollection({
  id,
  data,
}: {
  id: string;
  data: FormData | UpdateCollectionDto;
}) {
  if (data instanceof FormData) {
    return http.patch(`/collections/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  const files = data.coverImages?.filter((item): item is File => typeof item !== 'string') || [];
  const urls = data.coverImages?.filter((item): item is string => typeof item === 'string') || [];

  if (files.length > 0) {
    const body = new FormData();
    if (data.name !== undefined) body.append('name', data.name);
    if (data.slug !== undefined) body.append('slug', data.slug);
    if (data.description !== undefined) body.append('description', data.description);
    if (data.isPublished !== undefined) body.append('isPublished', String(data.isPublished));
    if (data.displayOrder !== undefined) body.append('displayOrder', String(data.displayOrder));
    files.forEach((file) => body.append('coverImages', file));

    return http.patch(`/collections/${id}`, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } else {
    const payload: UpdateCollectionDto = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isPublished !== undefined) payload.isPublished = data.isPublished;
    if (data.displayOrder !== undefined) payload.displayOrder = data.displayOrder;
    if (urls.length > 0) payload.coverImages = urls;

    return http.patch(`/collections/${id}`, payload);
  }
}

export async function deleteCollection(id: string) {
  return http.delete(`/collections/${id}`);
}

export async function addProductToCollection({ collectionId, productId }: { collectionId: string; productId: string }) {
  return http.post(`/collections/${collectionId}/products`, { productId });
}

export async function removeProductFromCollection({ collectionId, productId }: { collectionId: string; productId: string }) {
  return http.delete(`/collections/${collectionId}/products/${productId}`);
}

export { mutationKeys } from './mutation-keys';
