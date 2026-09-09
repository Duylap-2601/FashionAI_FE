import type { AdminUser } from '@/features/admin/types/admin-dashboard-page';
import React from 'react';

export interface AdminUsersPanelProps {
  users: AdminUser[];
  setSelectedUser: React.Dispatch<React.SetStateAction<AdminUser | null>>;
}
