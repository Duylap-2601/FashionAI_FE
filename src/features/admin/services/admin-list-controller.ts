import type { AdminListQuery, AdminListResult } from '@/features/admin/types/admin-dashboard-page';

export interface AdminListControllerOptions<TItem, TFilters> {
  initialQuery: AdminListQuery<TFilters>;
  load: (query: AdminListQuery<TFilters>, signal: AbortSignal) => Promise<AdminListResult<TItem>>;
  /** false khi tab đang ẩn: đổi trang/bộ lọc chỉ ghi nhận query, lần fetch kế tiếp sẽ dùng nó. */
  isEnabled: () => boolean;
  onQueryChange: (query: AdminListQuery<TFilters>) => void;
  onFetchingChange: (isFetching: boolean) => void;
  onResult: (result: AdminListResult<TItem>, query: AdminListQuery<TFilters>) => void;
  onError: (error: unknown) => void;
}

/**
 * Query + vòng đời request của một list admin, không phụ thuộc React.
 * - Query được ghi đồng bộ: AdminPagination gọi onPageSizeChange rồi onPageChange(1) liền nhau,
 *   lần gọi sau phải thấy pageSize mới.
 * - Request mới huỷ request cũ; kết quả/lỗi của request đã huỷ bị bỏ qua.
 */
export function createAdminListController<TItem, TFilters>(options: AdminListControllerOptions<TItem, TFilters>) {
  let query = options.initialQuery;
  let current: AbortController | null = null;

  const updateQuery = (patch: Partial<AdminListQuery<TFilters>>) => {
    query = { ...query, ...patch };
    options.onQueryChange(query);
    return query;
  };

  const fetch = async (patch: Partial<AdminListQuery<TFilters>> = {}): Promise<AdminListResult<TItem> | null> => {
    const requestQuery = updateQuery(patch);
    current?.abort();
    const controller = new AbortController();
    current = controller;
    options.onFetchingChange(true);
    try {
      const result = await options.load(requestQuery, controller.signal);
      if (controller.signal.aborted) return null;
      options.onResult(result, requestQuery);
      return result;
    } catch (error) {
      // Bị huỷ vì có request mới hơn hoặc unmount: không phải lỗi cần báo.
      if (controller.signal.aborted) return null;
      options.onError(error);
      return null;
    } finally {
      if (current === controller) options.onFetchingChange(false);
    }
  };

  const run = (patch: Partial<AdminListQuery<TFilters>>) => {
    if (options.isEnabled()) void fetch(patch);
    else updateQuery(patch);
  };

  return {
    getQuery: () => query,
    fetch,
    changePage: (page: number) => run({ page }),
    changePageSize: (pageSize: number) => run({ page: 1, pageSize }),
    changeFilters: (filters: TFilters) => run({ page: 1, filters }),
    abort: () => current?.abort(),
  };
}
