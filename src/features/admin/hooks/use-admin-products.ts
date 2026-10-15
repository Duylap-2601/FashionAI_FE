'use client';

import { EMPTY_PRODUCT_FILTERS } from '@/features/admin/constants/admin-dashboard-page';
import { useAdminPaginatedList } from '@/features/admin/hooks/use-admin-paginated-list';
import { loadAdminProducts } from '@/features/admin/services/admin-list-loaders';
import { deleteProduct } from '@/features/admin/services/mutations';
import type { AdminProduct } from '@/features/admin/types/admin-dashboard-page';
import type { AdminProductFilters } from '@/features/admin/types/admin-products-panel';
import { useCallback } from 'react';
import { toast } from 'sonner';

function handleProductsError(error: unknown) {
  console.error('Backend API products fetch failed:', error);
  toast.error('Không thể tải danh sách sản phẩm');
}

export function useAdminProducts() {
  const list = useAdminPaginatedList<AdminProduct, AdminProductFilters>({
    initialFilters: EMPTY_PRODUCT_FILTERS,
    load: loadAdminProducts,
    onError: handleProductsError,
  });
  const { fetchList } = list;

  const handleDeleteProduct = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id);
      toast.success('Xóa sản phẩm thành công');
      await fetchList();
    } catch (e) {
      toast.error('Không thể xóa sản phẩm này.');
      console.error(e);
    }
  }, [fetchList]);

  return { ...list, handleDeleteProduct };
}
