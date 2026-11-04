'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const UPLOAD_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export interface SelectedImageFile {
  id: string;
  file: File;
  url: string;
}

export type ImageFileRejection =
  | { reason: 'limit'; maxFiles: number }
  | { reason: 'type'; file: File }
  | { reason: 'size'; file: File; maxSizeBytes: number };

/** Message for a rejected pick; `noun` names what is being uploaded, e.g. "ảnh chứng từ". */
export function describeImageFileRejection(rejection: ImageFileRejection, noun = 'ảnh') {
  if (rejection.reason === 'limit') return `Chỉ được chọn tối đa ${rejection.maxFiles} ${noun}.`;
  if (rejection.reason === 'type') {
    return `Ảnh "${rejection.file.name}" không hợp lệ. Chỉ chấp nhận định dạng JPG, PNG, WEBP.`;
  }
  return `Ảnh "${rejection.file.name}" vượt quá ${Math.round(rejection.maxSizeBytes / 1024 / 1024)}MB.`;
}

interface UseImageFileSelectionOptions {
  maxFiles: number;
  maxSizeBytes?: number;
  acceptedTypes?: readonly string[];
  onReject?: (rejection: ImageFileRejection) => void;
}

/**
 * Picked image files plus object URLs for previews. URLs are revoked only when an
 * image is removed, cleared or the component unmounts, so previews that are still
 * on screen never break when more files are added.
 */
export function useImageFileSelection({
  maxFiles,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  acceptedTypes = UPLOAD_IMAGE_TYPES,
  onReject,
}: UseImageFileSelectionOptions) {
  const [items, setItems] = useState<SelectedImageFile[]>([]);
  const liveUrlsRef = useRef(new Set<string>());

  useEffect(() => {
    const liveUrls = liveUrlsRef.current;
    return () => {
      liveUrls.forEach((url) => URL.revokeObjectURL(url));
      liveUrls.clear();
    };
  }, []);

  const add = (input: FileList | File[] | null) => {
    if (!input || input.length === 0) return;
    const room = maxFiles - items.length;
    const picked = Array.from(input);
    if (picked.length > room) onReject?.({ reason: 'limit', maxFiles });
    if (room <= 0) return;

    const accepted: SelectedImageFile[] = [];
    for (const file of picked.slice(0, room)) {
      if (!acceptedTypes.includes(file.type)) {
        onReject?.({ reason: 'type', file });
        continue;
      }
      if (file.size > maxSizeBytes) {
        onReject?.({ reason: 'size', file, maxSizeBytes });
        continue;
      }
      const url = URL.createObjectURL(file);
      liveUrlsRef.current.add(url);
      accepted.push({ id: url, file, url });
    }
    if (accepted.length > 0) setItems((prev) => [...prev, ...accepted]);
  };

  const remove = useCallback((id: string) => {
    URL.revokeObjectURL(id);
    liveUrlsRef.current.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Stable so callers can reset the selection from effects.
  const clear = useCallback(() => {
    liveUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    liveUrlsRef.current.clear();
    setItems([]);
  }, []);

  return {
    items,
    files: items.map((item) => item.file),
    add,
    remove,
    clear,
    canAddMore: items.length < maxFiles,
  };
}
