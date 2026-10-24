'use client';

import { DEFAULT_PRODUCT_COLOR_HEX } from '@/features/admin/constants/admin-dashboard-page';
import { useLatestRef } from '@/features/admin/hooks/use-latest-ref';
import { toEditorImages, toProductImageItems, toProductImagesPayload, unwrapData } from '@/features/admin/services/admin-mappers';
import { createProduct, deleteProductImage, updateProduct, uploadProductImage } from '@/features/admin/services/mutations';
import {
  buildCreateProductForm,
  buildProductImagesForm,
  buildSingleProductImageForm,
  resolveImageColor,
  resolveProductColors,
} from '@/features/admin/services/product-editor';
import type { AdminProduct, ProductColor, ProductImageItem } from '@/features/admin/types/admin-dashboard-page';
import type { ProductImagesResponse } from '@/features/admin/types/api';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import type React from 'react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

const MULTIPART_OPTIONS = { headers: { 'Content-Type': 'multipart/form-data' } };
const MIN_IMAGE_MESSAGE = 'Sản phẩm phải có ít nhất 1 ảnh. Hãy upload ảnh khác trước khi xóa ảnh này.';

type NewImageItem = ProductImageItem & { file: File };

function revokeLocalPreviews(items: ProductImageItem[]) {
  items.forEach(img => {
    if (img.file) URL.revokeObjectURL(img.url);
  });
}

async function uploadNewImages(productId: string, files: File[], imageColors: (string | null)[]) {
  try {
    await uploadProductImage(productId, buildProductImagesForm(files, imageColors), MULTIPART_OPTIONS);
  } catch {
    // Fallback: upload từng ảnh nếu backend nhận single file
    for (let i = 0; i < files.length; i++) {
      await uploadProductImage(productId, buildSingleProductImageForm(files[i], imageColors[i]), MULTIPART_OPTIONS);
    }
  }
}

interface UseAdminProductEditorOptions {
  setProducts: React.Dispatch<React.SetStateAction<AdminProduct[]>>;
  /** Tải lại bảng sản phẩm sau khi lưu. */
  onSaved: () => Promise<unknown>;
}

/** State của dialog tạo/sửa sản phẩm: thông tin, màu, ảnh (ảnh mới giữ preview cục bộ đến khi lưu). */
export function useAdminProductEditor({ setProducts, onSaved }: UseAdminProductEditorOptions) {
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null);
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);
  const onSavedRef = useLatestRef(onSaved);

  const openProductEditor = useCallback((product: Partial<AdminProduct> | null) => {
    setProductImages(prev => {
      revokeLocalPreviews(prev);
      return product ? toEditorImages(product) : [];
    });
    setEditingProduct(product ? product : { status: 'ACTIVE', category: 'UPPER' });
  }, []);

  const closeProductEditor = useCallback(() => {
    setProductImages(prev => {
      revokeLocalPreviews(prev);
      return [];
    });
    setEditingProduct(null);
  }, []);

  const handleSelectImages = useCallback((files: FileList | File[]) => {
    const newItems: ProductImageItem[] = Array.from(files).map(file => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
      colorName: null,
    }));
    setProductImages(prev => [...prev, ...newItems]);
  }, []);

  const handleSetImageColor = useCallback((index: number, colorName: string | null) => {
    setProductImages(prev => prev.map((item, i) => i === index ? { ...item, colorName: colorName || null } : item));
  }, []);

  const handleSetPrimaryImage = useCallback((index: number) => {
    setProductImages(prev => {
      if (index <= 0 || index >= prev.length) return prev;
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [{ ...item, isMain: true }, ...rest.map(r => ({ ...r, isMain: false }))];
    });
  }, []);

  const productId = editingProduct?.id;
  const imageCount = productImages.length;

  const handleRemoveImage = useCallback(async (itemToRemove: ProductImageItem) => {
    // Ảnh mới chọn cục bộ (chưa lưu vào DB) -> chỉ xóa local
    if (!itemToRemove.isExisting || itemToRemove.file || !itemToRemove.imageId) {
      setProductImages(prev => {
        const target = prev.find(item => item.id === itemToRemove.id);
        if (target?.file) URL.revokeObjectURL(target.url);
        return prev.filter(item => item.id !== itemToRemove.id);
      });
      return;
    }

    // Ảnh đã lưu trên backend: sản phẩm phải còn ít nhất 1 ảnh
    if (imageCount <= 1) {
      toast.error(MIN_IMAGE_MESSAGE);
      return;
    }
    if (!productId) return;

    const deletingToast = toast.loading('Đang xóa ảnh sản phẩm...');
    try {
      const updated = unwrapData<ProductImagesResponse>(await deleteProductImage(productId, itemToRemove.imageId));
      toast.dismiss(deletingToast);
      toast.success('Xóa ảnh sản phẩm thành công');

      if (!updated || !Array.isArray(updated.images)) {
        setProductImages(prev => prev.filter(item => item.id !== itemToRemove.id));
        return;
      }

      const backendImages = toProductImageItems(updated.images);
      const imagesPayload = toProductImagesPayload(backendImages);
      setEditingProduct(prev => prev ? {
        ...prev,
        garmentUrl: updated.garmentUrl || prev.garmentUrl,
        images: imagesPayload,
      } : prev);
      // Giữ lại các ảnh mới chưa lưu nếu người dùng vừa chọn thêm
      setProductImages(prev => [...backendImages, ...prev.filter(i => i.file)]);
      // Đồng bộ bảng sản phẩm
      setProducts(prev => prev.map(p => {
        if (p.id !== productId) return p;
        const mainImg = backendImages.find(m => m.isMain)?.url || backendImages[0]?.url || p.image;
        return {
          ...p,
          image: updated.garmentUrl || mainImg,
          garmentUrl: updated.garmentUrl || p.garmentUrl,
          images: imagesPayload,
        };
      }));
    } catch (e: unknown) {
      toast.dismiss(deletingToast);
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, '');
      if (status === 400) toast.error(msg || MIN_IMAGE_MESSAGE);
      else if (status === 404) toast.error('Không tìm thấy ảnh, vui lòng tải lại trang');
      else toast.error(msg || 'Xóa ảnh thất bại.');
    }
  }, [imageCount, productId, setProducts]);

  const addColor = useCallback(() => {
    setEditingProduct(prev => ({ ...prev, colors: [...(prev?.colors || []), { name: '', hex: DEFAULT_PRODUCT_COLOR_HEX }] }));
  }, []);

  const updateColor = useCallback((index: number, patch: Partial<ProductColor>) => {
    setEditingProduct(prev => {
      const next = [...(prev?.colors || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, colors: next };
    });
  }, []);

  const removeColor = useCallback((index: number) => {
    setEditingProduct(prev => ({ ...prev, colors: (prev?.colors || []).filter((_, i) => i !== index) }));
  }, []);

  const handleSaveProduct = useCallback(async () => {
    const product = editingProduct;
    if (!product?.name || !product?.price) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (!product.category) {
      toast.error('Vui lòng chọn danh mục.');
      return;
    }
    // Sản phẩm mới bắt buộc phải có ít nhất 1 ảnh; khi sửa thì có thể giữ nguyên ảnh cũ.
    if (!product.id && productImages.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh sản phẩm.');
      return;
    }

    const newItems = productImages.filter((item): item is NewImageItem => Boolean(item.file));
    const newFiles = newItems.map(item => item.file);
    const colors = resolveProductColors(product.colors, productImages);
    const newImageColors = newItems.map(item => resolveImageColor(colors, item.colorName));

    try {
      if (product.id) {
        // PUT /products/:id chỉ nhận JSON (không upload file) → cập nhật thông tin trước.
        await updateProduct(product.id, {
          name: product.name,
          price: product.price,
          category: product.category,
          garmentType: product.garmentType ?? null,
          layerRole: product.layerRole ?? null,
          color: colors[0]?.name || undefined,
          colors,
          material: product.material || undefined,
          description: product.description || undefined,
          status: product.status || 'ACTIVE',
          images: productImages
            .filter(item => item.isExisting && item.imageId)
            .map(item => ({ id: item.imageId as string, colorName: resolveImageColor(colors, item.colorName) })),
        });
        // Admin chọn thêm ảnh mới → upload qua endpoint ảnh.
        if (newFiles.length > 0) await uploadNewImages(product.id, newFiles, newImageColors);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await createProduct(buildCreateProductForm({
          name: product.name,
          price: product.price,
          category: product.category,
          garmentType: product.garmentType ?? null,
          layerRole: product.layerRole ?? null,
          status: product.status,
          material: product.material,
          description: product.description,
          colors,
          files: newFiles,
          imageColors: newImageColors,
        }), MULTIPART_OPTIONS);
        toast.success('Tạo sản phẩm mới thành công');
      }
      closeProductEditor();
      await onSavedRef.current();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Có lỗi xảy ra khi lưu sản phẩm.'));
    }
  }, [closeProductEditor, editingProduct, onSavedRef, productImages]);

  return {
    editingProduct,
    setEditingProduct,
    productImages,
    openProductEditor,
    closeProductEditor,
    handleSelectImages,
    handleSetImageColor,
    handleSetPrimaryImage,
    handleRemoveImage,
    addColor,
    updateColor,
    removeColor,
    handleSaveProduct,
  };
}
