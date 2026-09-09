import type { AdminUser } from '@/features/admin/types/admin-dashboard-page';
import React from 'react';

export interface AdminUserModalProps {
  setSelectedUser: React.Dispatch<React.SetStateAction<AdminUser | null>>;
  selectedUser: AdminUser;
  handleUpdateUser: (id: string, patch: Partial<Pick<AdminUser, "tier" | "role">>) => Promise<void>;
}
