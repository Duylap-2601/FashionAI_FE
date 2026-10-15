'use client';

import { isAdminPage } from '@/features/admin/constants/admin-dashboard-page';
import { useLatestRef } from '@/features/admin/hooks/use-latest-ref';
import type { AdminNavigateEventDetail, AdminPage } from '@/features/admin/types/admin-dashboard-page';
import type { AdminShipmentFilters } from '@/features/admin/types/admin-shipments-panel';
import { useCallback, useEffect, useState } from 'react';

export interface AdminNavigateOptions {
  orderCode?: string;
  shipmentCode?: string;
}

/** Tab đang mở, đồng bộ vào `?tab=` (kèm mã đơn/mã vận đơn) bằng replaceState. */
export function useAdminTabs() {
  const [activeTab, setActiveTab] = useState<AdminPage>('dashboard');

  const navigateAdminTab = useCallback((tab: AdminPage, options?: AdminNavigateOptions) => {
    setActiveTab(tab);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    url.searchParams.delete('orderCode');
    url.searchParams.delete('shipmentCode');
    if (tab === 'orders' && options?.orderCode) url.searchParams.set('orderCode', options.orderCode);
    if (tab === 'shipments') {
      if (options?.shipmentCode) url.searchParams.set('shipmentCode', options.shipmentCode);
      if (options?.orderCode) url.searchParams.set('orderCode', options.orderCode);
    }
    window.history.replaceState(null, '', `${url.pathname}?${url.searchParams.toString()}`);
  }, []);

  return { activeTab, setActiveTab, navigateAdminTab };
}

interface UseAdminNavigationEventsOptions {
  setActiveTab: (tab: AdminPage) => void;
  navigateAdminTab: (tab: AdminPage, options?: AdminNavigateOptions) => void;
  /** Mở tab đơn hàng theo mã đơn: điền mã vào ô tìm kiếm. */
  onSearchOrder: (orderCode: string) => void;
  /** Lọc tab vận đơn theo mã GHN hoặc mã đơn. */
  onShipmentTarget: (filters: AdminShipmentFilters) => void;
  /** Đóng drawer đơn hàng/vận đơn trước khi chuyển sang tab vận đơn. */
  onCloseDetails: () => void;
}

/** Đọc tab/mã đơn trên URL khi mở trang và nghe event `admin:navigate` (bấm vào notification). */
export function useAdminNavigationEvents(options: UseAdminNavigationEventsOptions) {
  const optionsRef = useLatestRef(options);

  useEffect(() => {
    const { setActiveTab, onSearchOrder, onShipmentTarget } = optionsRef.current;
    const sp = new URLSearchParams(window.location.search);
    const tabParam = sp.get('tab');
    if (isAdminPage(tabParam)) setActiveTab(tabParam);
    const orderCodeParam = sp.get('orderCode');
    if (orderCodeParam && tabParam !== 'shipments') onSearchOrder(orderCodeParam);
    const shipmentCodeParam = sp.get('shipmentCode');
    if (shipmentCodeParam) {
      onShipmentTarget({ providerOrderCode: shipmentCodeParam });
    } else if (tabParam === 'shipments' && orderCodeParam) {
      onShipmentTarget({ orderCode: orderCodeParam });
    }

    const handleAdminNavigate = (e: Event) => {
      const detail = (e as CustomEvent<AdminNavigateEventDetail | undefined>).detail;
      const targetTab = detail?.tab;
      if (!detail || !isAdminPage(targetTab)) return;
      const current = optionsRef.current;
      const orderCode = detail.orderCode ? String(detail.orderCode) : undefined;
      const shipmentCode = detail.shipmentCode ? String(detail.shipmentCode) : undefined;
      current.navigateAdminTab(targetTab, { orderCode, shipmentCode });
      if (targetTab === 'orders' && orderCode) current.onSearchOrder(orderCode);
      if (targetTab === 'shipments') {
        current.onCloseDetails();
        if (shipmentCode) current.onShipmentTarget({ providerOrderCode: shipmentCode });
        else if (orderCode) current.onShipmentTarget({ orderCode });
      }
    };

    window.addEventListener('admin:navigate', handleAdminNavigate);
    return () => window.removeEventListener('admin:navigate', handleAdminNavigate);
  }, [optionsRef]);
}
