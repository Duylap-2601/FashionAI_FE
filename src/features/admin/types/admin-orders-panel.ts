import type { AdminOrder } from '@/features/admin/types/admin-dashboard-page';
import React from 'react';

export interface AdminOrdersPanelProps {
  orders: AdminOrder[];
  setSelectedOrder: React.Dispatch<React.SetStateAction<AdminOrder | null>>;
}
