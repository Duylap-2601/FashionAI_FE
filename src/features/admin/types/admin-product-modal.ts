import type { AdminProduct, ProductImageItem } from '@/features/admin/types/admin-dashboard-page';
import React from 'react';

export interface AdminProductModalProps {
  closeProductEditor: () => void;
  editingProduct: Partial<AdminProduct>;
  setEditingProduct: React.Dispatch<React.SetStateAction<Partial<AdminProduct> | null>>;
  addColor: () => void;
  updateColor: (index: number, patch: Partial<{ name: string; hex: string; }>) => void;
  removeColor: (index: number) => void;
  productImages: ProductImageItem[];
  handleSelectImages: (files: FileList | File[]) => void;
  handleSetPrimaryImage: (index: number) => void;
  handleRemoveImage: (itemToRemove: ProductImageItem) => Promise<void>;
  handleSaveProduct: () => Promise<void>;
}
