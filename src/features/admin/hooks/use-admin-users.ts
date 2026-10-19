'use client';

import { DEFAULT_ADMIN_PAGINATION, EMPTY_USER_FILTERS } from '@/features/admin/constants/admin-dashboard-page';
import { useAdminListPanelProps } from '@/features/admin/hooks/use-admin-paginated-list';
import { paginateUsers } from '@/features/admin/services/admin-list-filters';
import { loadAdminUsers } from '@/features/admin/services/admin-list-loaders';
import { updateUser } from '@/features/admin/services/mutations';
import type { AdminPagination, AdminUser } from '@/features/admin/types/admin-dashboard-page';
import type { AdminUserFilters } from '@/features/admin/types/admin-users-panel';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UsersView {
  source: AdminUser[];
  filters: AdminUserFilters;
  page: number;
  pageSize: number;
}

/** Users tải một lần (tối đa ADMIN_USERS_FETCH_LIMIT) rồi lọc + phân trang phía client. */
export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [filters, setFilters] = useState<AdminUserFilters>(EMPTY_USER_FILTERS);
  const [pagination, setPagination] = useState<AdminPagination>(DEFAULT_ADMIN_PAGINATION);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Ghi đồng bộ trong handler: AdminPagination gọi onPageSizeChange rồi onPageChange(1) liền nhau.
  const viewRef = useRef<UsersView>({
    source: [],
    filters: EMPTY_USER_FILTERS,
    page: DEFAULT_ADMIN_PAGINATION.page,
    pageSize: DEFAULT_ADMIN_PAGINATION.pageSize,
  });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const showUsers = useCallback((source: AdminUser[], nextFilters: AdminUserFilters, page: number, pageSize: number) => {
    const result = paginateUsers(source, nextFilters, page, pageSize);
    viewRef.current = { source, filters: nextFilters, page: result.pagination.page, pageSize };
    setAllUsers(source);
    setFilters(nextFilters);
    setUsers(result.items);
    setPagination(result.pagination);
  }, []);

  const fetchUsers = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsFetching(true);
    try {
      const list = await loadAdminUsers(viewRef.current.filters, controller.signal);
      if (controller.signal.aborted) return;
      const { filters: currentFilters, page, pageSize } = viewRef.current;
      showUsers(list, currentFilters, page, pageSize);
    } catch (e) {
      if (controller.signal.aborted) return;
      console.error('Backend API users fetch failed:', e);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      if (controllerRef.current === controller) setIsFetching(false);
    }
  }, [showUsers]);

  const changeFilters = useCallback((nextFilters: AdminUserFilters) => {
    const { source, pageSize } = viewRef.current;
    if (source.length > 0) {
      showUsers(source, nextFilters, 1, pageSize);
      return;
    }
    viewRef.current = { ...viewRef.current, filters: nextFilters, page: 1 };
    setFilters(nextFilters);
    void fetchUsers();
  }, [fetchUsers, showUsers]);

  const patchFilters = useCallback((patch: Partial<AdminUserFilters>) => {
    changeFilters({ ...viewRef.current.filters, ...patch });
  }, [changeFilters]);

  const resetFilters = useCallback(() => changeFilters(EMPTY_USER_FILTERS), [changeFilters]);

  const changePage = useCallback((page: number) => {
    const { source, filters: currentFilters, pageSize } = viewRef.current;
    showUsers(source, currentFilters, page, pageSize);
  }, [showUsers]);

  const changePageSize = useCallback((pageSize: number) => {
    const { source, filters: currentFilters } = viewRef.current;
    showUsers(source, currentFilters, 1, pageSize);
  }, [showUsers]);

  const handleUpdateUser = useCallback(async (id: string, patch: Partial<Pick<AdminUser, 'tier' | 'role'>>) => {
    try {
      const body: Record<string, string> = {};
      if (patch.tier) body.tier = patch.tier;
      if (patch.role) body.role = patch.role;
      await updateUser(id, body);
      const { source, filters: currentFilters, page, pageSize } = viewRef.current;
      showUsers(source.map(u => u.id === id ? { ...u, ...patch } : u), currentFilters, page, pageSize);
      setSelectedUser(prev => prev?.id === id ? { ...prev, ...patch } : prev);
      toast.success('Cập nhật người dùng thành công');
    } catch (e) {
      toast.error('Không thể cập nhật người dùng.');
      console.error(e);
    }
  }, [showUsers]);

  const { panelProps } = useAdminListPanelProps({
    pagination,
    isFetching,
    filters,
    changePage,
    changePageSize,
    patchFilters,
    resetFilters,
  });

  return {
    users,
    allUsers,
    fetchUsers,
    panelProps,
    selectedUser,
    setSelectedUser,
    handleUpdateUser,
  };
}
