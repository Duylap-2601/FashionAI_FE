'use client';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import type { AdminImageDto, AdminProductDto, AdminOrderDto, AdminShipmentDetailDto, AdminShipmentDto, AdminUserDto, ProductImagesResponse } from '@/features/admin/types/api';


import { AdminOrderModal } from '@/features/admin/components/admin-order-modal';
import { AdminLiveTryOnSettingsPanel } from '@/features/admin/components/admin-live-try-on-settings-panel';
import { AdminOrdersPanel } from '@/features/admin/components/admin-orders-panel';
import { AdminOrderIssuesPanel } from '@/features/admin/components/admin-order-issues-panel';
import { AdminOrderIssueModal } from '@/features/admin/components/admin-order-issue-modal';
import { AdminCouponsPanel } from '@/features/admin/components/admin-coupons-panel';
import { AdminProductModal } from '@/features/admin/components/admin-product-modal';
import { AdminProductsPanel } from '@/features/admin/components/admin-products-panel';
import { AdminShippingSettingsPanel } from '@/features/admin/components/admin-shipping-settings-panel';
import { AdminShipmentModal } from '@/features/admin/components/admin-shipment-modal';
import { AdminShipmentsPanel } from '@/features/admin/components/admin-shipments-panel';
import { AdminUserModal } from '@/features/admin/components/admin-user-modal';
import { AdminUsersPanel } from '@/features/admin/components/admin-users-panel';
import { AdminWebhookFailuresPanel } from '@/features/admin/components/admin-webhook-failures-panel';
import { AdminReconciliationPanel } from '@/features/admin/components/admin-reconciliation-panel';
import { DashboardOverview } from '@/features/admin/components/dashboard-overview';
import { fmt } from '@/features/admin/services/format';
import type { ProductImageItem } from '@/features/admin/types/admin-dashboard-page';
import { cancelAdminShipment, confirmManualPayment, createProduct, createShipment, deleteProduct, deleteProductImage, resolveWebhookFailure, simulateAdminShipmentStatus, syncAdminShipment, updateOrderRefund, updateOrderStatus, updateProduct, updateUser, uploadProductImage } from '@/features/admin/services/mutations';
import { fetchAdminOrderIssues, fetchAdminOrders, fetchAdminProducts, fetchAdminShipmentDetail, fetchAdminShipments, fetchAdminStats, fetchAdminUsers, fetchWebhookFailures } from '@/features/admin/services/queries';
import type { AdminOrder, AdminPage, AdminProduct, AdminProductImage, AdminShipment, AdminShipmentDetail, AdminStats, AdminUser, AdminWebhookFailure, GarmentCategory, ProductStatus, UserRole, UserTier } from '@/features/admin/types/admin-dashboard-page';
import type { AdminShipmentFilters } from '@/features/admin/types/admin-shipments-panel';
import type { AdminProductFilters } from '@/features/admin/types/admin-products-panel';
import type { AdminOrderFilters } from '@/features/admin/types/admin-orders-panel';
import type { AdminUserFilters } from '@/features/admin/types/admin-users-panel';
import type { AdminOrderIssueFilters } from '@/features/admin/types/admin-order-issues-panel';
import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AdminCollectionManager } from '@/features/collections/components/AdminCollectionManager';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import type { BackendOrderStatus, OrderIssue, OrderIssueListMeta, OrderIssueListParams, OrderIssueReason, OrderIssueStatus } from '@/features/orders/types/orders';
import { AdminReviewTable } from '@/features/reviews/components/AdminReviewTable';
import { fetchAdminReviewsResponse } from '@/features/reviews/services/queries';
import { getRealtimeSocket } from '@/lib/realtimeSocket';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Radio,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Tag,
  Truck,
  Users
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ApiPaginatedResponse<T = unknown> {
  items?: T[];
  total?: number;
  meta?: { total?: number; totalPages?: number; page?: number };
  __meta?: { total?: number; totalPages?: number; page?: number };
  pagination?: { total?: number; totalPages?: number; page?: number };
}

const ADMIN_PAGES: AdminPage[] = ['dashboard', 'products', 'collections', 'users', 'orders', 'shipments', 'order-issues', 'coupons', 'reviews', 'shipping-settings', 'live-try-on-settings', 'webhook-failures', 'reconciliation'];

function isAdminPage(value: string | null): value is AdminPage {
  return Boolean(value && ADMIN_PAGES.includes(value as AdminPage));
}

function AdminDashboardContent() {
  const { logout, currentUser } = useAuth();
  const adminName = currentUser.name && currentUser.name !== 'Khách' ? currentUser.name : 'Admin FashionAI';
  const adminInitial = adminName.charAt(0).toUpperCase() || 'A';

  const [activeTab, setActiveTab] = useState<AdminPage>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateAdminTab = useCallback((tab: AdminPage, options?: { orderCode?: string; shipmentCode?: string }) => {
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

  const handleDashboardTabChange: React.Dispatch<React.SetStateAction<AdminPage>> = useCallback((value) => {
    const nextTab = typeof value === 'function' ? value(activeTab) : value;
    navigateAdminTab(nextTab);
  }, [activeTab, navigateAdminTab]);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productFilters, setProductFilters] = useState<AdminProductFilters>({
    category: '',
    status: '',
    search: '',
  });
  const [productPagination, setProductPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [isProductsFetching, setIsProductsFetching] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [userFilters, setUserFilters] = useState<AdminUserFilters>({
    search: '',
    tier: '',
    role: '',
    isVerified: '',
  });
  const [userPagination, setUserPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [isUsersFetching, setIsUsersFetching] = useState(false);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderFilters, setOrderFilters] = useState<AdminOrderFilters>({
    search: '',
    status: '',
    paymentStatus: '',
    fromDate: '',
    toDate: '',
  });
  const [orderPagination, setOrderPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [isOrdersFetching, setIsOrdersFetching] = useState(false);

  const [shipments, setShipments] = useState<AdminShipment[]>([]);
  const [shipmentFilters, setShipmentFilters] = useState<AdminShipmentFilters>({});
  const [shipmentPagination, setShipmentPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [isShipmentsFetching, setIsShipmentsFetching] = useState(false);

  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [issueFilters, setIssueFilters] = useState<AdminOrderIssueFilters>({
    status: '',
    reason: '',
  });
  const [issuePagination, setIssuePagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [isIssuesFetching, setIsIssuesFetching] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<OrderIssue | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [webhookFailures, setWebhookFailures] = useState<AdminWebhookFailure[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Chart States
  const [chartDays, setChartDays] = useState<7 | 14 | 30>(7);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    dateKey: string;
    fullDate: string;
    revenue: number;
    ordersCount: number;
  } | null>(null);

  // Modal / Editor States
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<AdminShipmentDetail | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null);
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);

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

  const handleRemoveImage = useCallback(async (itemToRemove: ProductImageItem) => {
    // Nếu là file mới chọn cục bộ (chưa lưu vào DB) -> chỉ xóa local
    if (!itemToRemove.isExisting || itemToRemove.file || !itemToRemove.imageId) {
      setProductImages(prev => {
        const target = prev.find(item => item.id === itemToRemove.id);
        if (target?.file) {
          URL.revokeObjectURL(target.url);
        }
        return prev.filter(item => item.id !== itemToRemove.id);
      });
      return;
    }

    // Nếu là ảnh đã tồn tại trên Backend:
    // Kiểm tra ràng buộc: sản phẩm phải còn ít nhất 1 ảnh
    if (productImages.length <= 1) {
      toast.error('Sản phẩm phải có ít nhất 1 ảnh. Hãy upload ảnh khác trước khi xóa ảnh này.');
      return;
    }

    if (!editingProduct?.id) return;

    const deletingToast = toast.loading('Đang xóa ảnh sản phẩm...');
    try {
      const res = await deleteProductImage(editingProduct.id, itemToRemove.imageId);
      toast.dismiss(deletingToast);
      toast.success('Xóa ảnh sản phẩm thành công');

      const updatedProd = (res && typeof res === 'object' && 'data' in res ? res.data : res) as ProductImagesResponse;
      if (updatedProd && Array.isArray(updatedProd.images)) {
        // Cập nhật editingProduct


        // Chuyển đổi images mới từ backend
        const mappedBackendImages: ProductImageItem[] = updatedProd.images.map((img: AdminImageDto, i: number) => {
          if (typeof img === 'string') {
            return { id: `existing-${i}-${img}`, imageId: undefined, url: img, isMain: i === 0, isExisting: true, colorName: null };
          }
          const url = img.imageUrl || img.url || '';
          return {
            id: `existing-${img.id || i}-${url}`,
            imageId: img.id,
            url,
            isMain: Boolean(img.isMain),
            isExisting: true,
            colorName: img.colorName ?? null,
          };
        });

        setEditingProduct(prev => prev ? ({
          ...prev,
          garmentUrl: updatedProd.garmentUrl || prev.garmentUrl,
          images: mappedBackendImages.map(image => ({
            id: image.imageId || '',
            imageUrl: image.url,
            isMain: image.isMain,
            colorName: image.colorName ?? null,
          })),
        }) : prev);

        // Giữ lại các ảnh mới chưa lưu nếu người dùng vừa chọn thêm
        setProductImages(prev => {
          const unsavedNewFiles = prev.filter(i => i.file);
          return [...mappedBackendImages, ...unsavedNewFiles];
        });

        // Đồng bộ danh sách products ngoài bảng
        setProducts(prev => prev.map(p => {
          if (p.id === editingProduct.id) {
            const mainImg = mappedBackendImages.find(m => m.isMain)?.url || mappedBackendImages[0]?.url || p.image;
            return {
              ...p,
              image: updatedProd.garmentUrl || mainImg,
              garmentUrl: updatedProd.garmentUrl || p.garmentUrl,
              images: mappedBackendImages.map(m => ({ id: m.imageId || '', imageUrl: m.url, isMain: m.isMain })),
            };
          }
          return p;
        }));
      } else {
        // Fallback xóa local
        setProductImages(prev => prev.filter(item => item.id !== itemToRemove.id));
      }
    } catch (e: unknown) {
      toast.dismiss(deletingToast);
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, '');
      if (status === 400) {
        toast.error(msg || 'Sản phẩm phải có ít nhất 1 ảnh. Hãy upload ảnh khác trước khi xóa ảnh này.');
      } else if (status === 404) {
        toast.error('Không tìm thấy ảnh, vui lòng tải lại trang');
      } else {
        toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Xóa ảnh thất bại.'));
      }
    }
  }, [editingProduct?.id, productImages.length]);

  const handleSetPrimaryImage = useCallback((index: number) => {
    setProductImages(prev => {
      if (index <= 0 || index >= prev.length) return prev;
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [{ ...item, isMain: true }, ...rest.map(r => ({ ...r, isMain: false }))];
    });
  }, []);

  const openProductEditor = useCallback((product: Partial<AdminProduct> | null) => {
    setProductImages(prev => {
      prev.forEach(img => {
        if (img.file) URL.revokeObjectURL(img.url);
      });
      if (product) {
        const rawImages: AdminImageDto[] = Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : product.image
            ? [{ id: '', imageUrl: product.image, isMain: true }]
            : product.garmentUrl
              ? [{ id: '', imageUrl: product.garmentUrl, isMain: true }]
              : [];
        return rawImages.map((img: AdminImageDto, i: number) => {
          if (typeof img === 'string') {
            return {
              id: `existing-${i}-${img}`,
              imageId: undefined,
              url: img,
              isMain: i === 0,
              isExisting: true,
              colorName: null,
            };
          }
          const url = img.imageUrl || img.url || '';
          return {
            id: `existing-${img.id || i}-${url}`,
            imageId: img.id,
            url,
            isMain: Boolean(img.isMain),
            isExisting: true,
            colorName: img.colorName ?? null,
          };
        });
      }
      return [];
    });
    setEditingProduct(product ? product : { status: 'ACTIVE', category: 'UPPER' });
  }, []);

  const closeProductEditor = useCallback(() => {
    setProductImages(prev => {
      prev.forEach(img => {
        if (img.file) URL.revokeObjectURL(img.url);
      });
      return [];
    });
    setEditingProduct(null);
  }, []);

  // ─── Colors / Sizes editors ────────────────────────────────────────────────
  const addColor = useCallback(() => {
    setEditingProduct(prev => ({ ...prev, colors: [...(prev?.colors || []), { name: '', hex: '#5D1C34' }] }));
  }, []);

  const updateColor = useCallback((index: number, patch: Partial<{ name: string; hex: string }>) => {
    setEditingProduct(prev => {
      const next = [...(prev?.colors || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, colors: next };
    });
  }, []);

  const removeColor = useCallback((index: number) => {
    setEditingProduct(prev => ({ ...prev, colors: (prev?.colors || []).filter((_, i) => i !== index) }));
  }, []);

  const fetchProducts = useCallback(async (
    page = productPagination.page,
    limit = productPagination.pageSize,
    filters = productFilters
  ) => {
    setIsProductsFetching(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (filters.search) {
        params.search = filters.search;
        params.q = filters.search;
      }
      if (filters.category && filters.category !== 'ALL') params.category = filters.category;
      if (filters.status && filters.status !== 'ALL') params.status = filters.status;

      const res = await fetchAdminProducts({ params });
      const resObj = res as ApiPaginatedResponse<AdminProductDto> | undefined;
      const rawList = (Array.isArray(res) ? res : resObj?.items || []) as AdminProductDto[];
      const mappedList: AdminProduct[] = rawList.map((p) => {
        const rawImages: AdminImageDto[] = Array.isArray(p.images) ? p.images : [];
        const normalizedImages: AdminProductImage[] = rawImages.map((img: AdminImageDto, idx: number) => {
          if (typeof img === 'string') {
            return { id: '', imageUrl: img, isMain: idx === 0, colorName: null };
          }
          return {
            id: img.id || '',
            imageUrl: img.imageUrl || img.url || '',
            isMain: Boolean(img.isMain),
            colorName: img.colorName ?? null,
          };
        }).filter((item: AdminProductImage) => Boolean(item.imageUrl));

        const mainImage = normalizedImages.find(img => img.isMain)?.imageUrl || normalizedImages[0]?.imageUrl;
        const primaryImg = p.garmentUrl || mainImage || '/images/731163514_999523332788054_1114320478812927640_n.png';
        return {
          id: p.id,
          name: p.name,
          category: p.category as GarmentCategory,
          garmentType: p.garmentType,
          price: Number(p.price),
          status: p.status as ProductStatus,
          image: primaryImg,
          images: normalizedImages,
          garmentUrl: p.garmentUrl,
          description: p.description,
          color: p.color,
          colors: Array.isArray(p.colors) ? p.colors : undefined,
        };
      });

      const meta = resObj?.__meta || resObj?.meta || resObj?.pagination;
      const serverTotal = typeof meta?.total === 'number' ? meta.total : typeof resObj?.total === 'number' ? resObj.total : undefined;

      if (serverTotal !== undefined) {
        setProducts(mappedList);
        setProductPagination(prev => ({
          ...prev,
          page,
          pageSize: limit,
          total: serverTotal,
          totalPages: typeof meta?.totalPages === 'number' ? meta.totalPages : Math.ceil(serverTotal / limit) || 1,
        }));
      } else {
        let filtered = mappedList;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
        }
        if (filters.category && filters.category !== 'ALL') {
          filtered = filtered.filter(p => p.category === filters.category);
        }
        if (filters.status && filters.status !== 'ALL') {
          filtered = filtered.filter(p => p.status === filters.status);
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const pageItems = filtered.slice((page - 1) * limit, page * limit);
        setProducts(pageItems);
        setProductPagination(prev => ({
          ...prev,
          page,
          pageSize: limit,
          total,
          totalPages,
        }));
      }
    } catch (e) {
      console.error('Backend API products fetch failed:', e);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setIsProductsFetching(false);
    }
  }, [productPagination.page, productPagination.pageSize, productFilters]);

  const fetchOrders = useCallback(async (
    page = orderPagination.page,
    limit = orderPagination.pageSize,
    filters = orderFilters
  ) => {
    setIsOrdersFetching(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (filters.search?.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.status && filters.status !== 'ALL') params.status = filters.status;
      if (filters.paymentStatus && filters.paymentStatus !== 'ALL') params.paymentStatus = filters.paymentStatus;
      if (filters.fromDate?.trim()) params.fromDate = filters.fromDate.trim();
      if (filters.toDate?.trim()) params.toDate = filters.toDate.trim();

      const res = await fetchAdminOrders({ params });
      const resObj = res as ApiPaginatedResponse<AdminOrderDto> | undefined;
      const rawList = (Array.isArray(res) ? res : resObj?.items || []) as AdminOrderDto[];
      const mappedList: AdminOrder[] = rawList.map((o) => {
        const ship = o.shippingInfo;
        const totalVnd = o.totalVnd !== undefined && o.totalVnd !== null ? Number(o.totalVnd) : undefined;
        return {
          id: o.id,
          code: `#${o.orderCode}`,
          orderCode: Number(o.orderCode),
          customer: ship?.name || o.user?.name || 'Khách hàng',
          email: o.user?.email || ship?.phone || '',
          items: o.items?.length || 1,
          total: totalVnd !== undefined ? totalVnd : Number(o.amount),
          totalVnd,
          itemsSubtotalVnd: o.itemsSubtotalVnd !== undefined && o.itemsSubtotalVnd !== null ? Number(o.itemsSubtotalVnd) : undefined,
          shippingFeeVnd: o.shippingFeeVnd !== undefined && o.shippingFeeVnd !== null ? Number(o.shippingFeeVnd) : undefined,
          discountVnd: o.discountVnd !== undefined && o.discountVnd !== null ? Number(o.discountVnd) : undefined,
          amountPaidVnd: o.amountPaidVnd !== undefined && o.amountPaidVnd !== null ? Number(o.amountPaidVnd) : undefined,
          amountRefundedVnd: o.amountRefundedVnd !== undefined && o.amountRefundedVnd !== null ? Number(o.amountRefundedVnd) : undefined,
          status: o.status as BackendOrderStatus,
          displayStatus: o.displayStatus,
          paymentStatus: o.paymentStatus,
          refundStatus: o.refundStatus,
          date: o.createdAt?.substring(0, 10) || '',
          payment: o.payments?.[0]?.provider || 'COD',
          address: ship?.address,
          phone: ship?.phone,
          payments: o.payments,
          refunds: o.refunds,
          shipment: o.shipment || null,
        };
      });

      const meta = resObj?.__meta || resObj?.meta || resObj?.pagination;
      const serverTotal = typeof meta?.total === 'number' ? meta.total : typeof resObj?.total === 'number' ? resObj.total : undefined;

      if (serverTotal !== undefined) {
        setOrders(mappedList);
        setOrderPagination(prev => ({
          ...prev,
          page,
          pageSize: limit,
          total: serverTotal,
          totalPages: typeof meta?.totalPages === 'number' ? meta.totalPages : Math.ceil(serverTotal / limit) || 1,
        }));
      } else {
        let filtered = mappedList;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(o =>
            o.code.toLowerCase().includes(q) ||
            o.customer.toLowerCase().includes(q) ||
            o.email.toLowerCase().includes(q) ||
            (o.phone && o.phone.includes(q))
          );
        }
        if (filters.status && filters.status !== 'ALL') {
          filtered = filtered.filter(o => o.status === filters.status);
        }
        if (filters.paymentStatus && filters.paymentStatus !== 'ALL') {
          filtered = filtered.filter(o => o.paymentStatus === filters.paymentStatus);
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const pageItems = filtered.slice((page - 1) * limit, page * limit);
        setOrders(pageItems);
        setOrderPagination(prev => ({
          ...prev,
          page,
          pageSize: limit,
          total,
          totalPages,
        }));
      }
    } catch (e) {
      console.error('Backend API orders fetch failed:', e);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setIsOrdersFetching(false);
    }
  }, [orderPagination.page, orderPagination.pageSize, orderFilters]);

  const fetchShipments = useCallback(async (
    page = shipmentPagination.page,
    limit = shipmentPagination.pageSize,
    filters = shipmentFilters
  ) => {
    setIsShipmentsFetching(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        ...Object.fromEntries(
          Object.entries(filters)
            .filter(([, value]) => value !== undefined && value !== '')
            .map(([key, value]) => [key, typeof value === 'boolean' ? String(value) : value]),
        ),
      };
      const res = await fetchAdminShipments({ params });
      const resObj = res as ApiPaginatedResponse<AdminShipmentDto> | undefined;
      const rawList = (Array.isArray(res) ? res : resObj?.items || []) as AdminShipmentDto[];

      const meta = resObj?.__meta || resObj?.meta || resObj?.pagination;
      const serverTotal = typeof meta?.total === 'number' ? meta.total : typeof resObj?.total === 'number' ? resObj.total : undefined;

      if (serverTotal !== undefined) {
        setShipments(rawList);
        setShipmentPagination(prev => ({
          ...prev,
          page,
          pageSize: limit,
          total: serverTotal,
          totalPages: typeof meta?.totalPages === 'number' ? meta.totalPages : Math.ceil(serverTotal / limit) || 1,
        }));
      } else {
        const total = rawList.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const pageItems = rawList.slice((page - 1) * limit, page * limit);
        setShipments(pageItems);
        setShipmentPagination(prev => ({
          ...prev,
          page,
          pageSize: limit,
          total,
          totalPages,
        }));
      }
    } catch (e) {
      console.error('Backend API shipments fetch failed:', e);
      toast.error('Không thể tải danh sách vận đơn');
    } finally {
      setIsShipmentsFetching(false);
    }
  }, [shipmentPagination.page, shipmentPagination.pageSize, shipmentFilters]);

  const applyUserFiltersAndPagination = useCallback((
    sourceList: AdminUser[],
    filters: AdminUserFilters,
    page: number,
    pageSize: number
  ) => {
    let filtered = Array.isArray(sourceList) ? sourceList : [];

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }

    if (filters.tier && filters.tier !== 'ALL') {
      filtered = filtered.filter(u => u.tier === filters.tier);
    }

    if (filters.role && filters.role !== 'ALL') {
      filtered = filtered.filter(u => u.role === filters.role);
    }

    if (filters.isVerified === 'VERIFIED') {
      filtered = filtered.filter(u => Boolean(u.isVerified));
    } else if (filters.isVerified === 'UNVERIFIED') {
      filtered = filtered.filter(u => !u.isVerified);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    setUsers(pageItems);
    setUserPagination({
      page: safePage,
      pageSize,
      total,
      totalPages,
    });
  }, []);

  const fetchUsers = useCallback(async (
    page = userPagination.page,
    limit = userPagination.pageSize,
    filters = userFilters
  ) => {
    setIsUsersFetching(true);
    try {
      const params: Record<string, string | number> = {
        page: 1,
        limit: 1000,
      };
      if (filters.search) {
        params.search = filters.search;
        params.q = filters.search;
      }
      if (filters.tier && filters.tier !== 'ALL') params.tier = filters.tier;
      if (filters.role && filters.role !== 'ALL') params.role = filters.role;
      if (filters.isVerified && filters.isVerified !== 'ALL') {
        params.isVerified = filters.isVerified === 'VERIFIED' ? 'true' : 'false';
      }

      const res = await fetchAdminUsers({ params });
      const resObj = res as ApiPaginatedResponse<AdminUserDto> | undefined;
      const rawList = (Array.isArray(res) ? res : resObj?.items || []) as AdminUserDto[];
      const mappedList: AdminUser[] = rawList.map((u) => ({
        id: u.id,
        name: u.name || 'Người dùng',
        email: u.email,
        tier: (u.tier || 'FREE') as UserTier,
        role: (u.role || 'USER') as UserRole,
        isVerified: Boolean(u.isVerified),
        joinDate: u.createdAt?.substring(0, 10) || '',
        tryOns: u.tryOns || 0,
        orders: u.orders || 0,
        spent: Number(u.spent || 0),
      }));

      setAllUsers(mappedList);
      applyUserFiltersAndPagination(mappedList, filters, page, limit);
    } catch (e) {
      console.error('Backend API users fetch failed:', e);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsUsersFetching(false);
    }
  }, [userPagination.page, userPagination.pageSize, userFilters, applyUserFiltersAndPagination]);

  // ─── Products Pagination & Filter Handlers ───
  const handleProductFilterChange = useCallback((patch: Partial<AdminProductFilters>) => {
    setProductFilters(prev => {
      const next = { ...prev, ...patch };
      setProductPagination(p => ({ ...p, page: 1 }));
      fetchProducts(1, productPagination.pageSize, next);
      return next;
    });
  }, [fetchProducts, productPagination.pageSize]);

  const handleResetProductFilters = useCallback(() => {
    const empty: AdminProductFilters = { category: '', status: '', search: '' };
    setProductFilters(empty);
    setProductPagination(p => ({ ...p, page: 1 }));
    fetchProducts(1, productPagination.pageSize, empty);
  }, [fetchProducts, productPagination.pageSize]);

  const handleProductPageChange = useCallback((page: number) => {
    setProductPagination(prev => ({ ...prev, page }));
    fetchProducts(page, productPagination.pageSize, productFilters);
  }, [fetchProducts, productPagination.pageSize, productFilters]);

  const handleProductPageSizeChange = useCallback((size: number) => {
    setProductPagination(prev => ({ ...prev, page: 1, pageSize: size }));
    fetchProducts(1, size, productFilters);
  }, [fetchProducts, productFilters]);

  // ─── Orders Pagination & Filter Handlers ───
  const handleOrderFilterChange = useCallback((patch: Partial<AdminOrderFilters>) => {
    setOrderFilters(prev => {
      const next = { ...prev, ...patch };
      setOrderPagination(p => ({ ...p, page: 1 }));
      fetchOrders(1, orderPagination.pageSize, next);
      return next;
    });
  }, [fetchOrders, orderPagination.pageSize]);

  const handleResetOrderFilters = useCallback(() => {
    const empty: AdminOrderFilters = { search: '', status: '', paymentStatus: '', fromDate: '', toDate: '' };
    setOrderFilters(empty);
    setOrderPagination(p => ({ ...p, page: 1 }));
    fetchOrders(1, orderPagination.pageSize, empty);
  }, [fetchOrders, orderPagination.pageSize]);

  const handleOrderPageChange = useCallback((page: number) => {
    setOrderPagination(prev => ({ ...prev, page }));
    fetchOrders(page, orderPagination.pageSize, orderFilters);
  }, [fetchOrders, orderPagination.pageSize, orderFilters]);

  const handleOrderPageSizeChange = useCallback((size: number) => {
    setOrderPagination(prev => ({ ...prev, page: 1, pageSize: size }));
    fetchOrders(1, size, orderFilters);
  }, [fetchOrders, orderFilters]);

  // ─── Users Pagination & Filter Handlers ───
  const handleUserFilterChange = useCallback((patch: Partial<AdminUserFilters>) => {
    setUserFilters(prev => {
      const next = { ...prev, ...patch };
      if (allUsers.length > 0) {
        applyUserFiltersAndPagination(allUsers, next, 1, userPagination.pageSize);
      } else {
        fetchUsers(1, userPagination.pageSize, next);
      }
      return next;
    });
  }, [allUsers, userPagination.pageSize, applyUserFiltersAndPagination, fetchUsers]);

  const handleResetUserFilters = useCallback(() => {
    const empty: AdminUserFilters = { search: '', tier: '', role: '', isVerified: '' };
    setUserFilters(empty);
    if (allUsers.length > 0) {
      applyUserFiltersAndPagination(allUsers, empty, 1, userPagination.pageSize);
    } else {
      fetchUsers(1, userPagination.pageSize, empty);
    }
  }, [allUsers, userPagination.pageSize, applyUserFiltersAndPagination, fetchUsers]);

  const handleUserPageChange = useCallback((page: number) => {
    applyUserFiltersAndPagination(allUsers, userFilters, page, userPagination.pageSize);
  }, [allUsers, userFilters, userPagination.pageSize, applyUserFiltersAndPagination]);

  const handleUserPageSizeChange = useCallback((size: number) => {
    applyUserFiltersAndPagination(allUsers, userFilters, 1, size);
  }, [allUsers, userFilters, applyUserFiltersAndPagination]);

  // ─── Shipments Pagination Handlers ───
  const handleShipmentPageChange = useCallback((page: number) => {
    setShipmentPagination(prev => ({ ...prev, page }));
    fetchShipments(page, shipmentPagination.pageSize, shipmentFilters);
  }, [fetchShipments, shipmentPagination.pageSize, shipmentFilters]);

  const handleShipmentPageSizeChange = useCallback((size: number) => {
    setShipmentPagination(prev => ({ ...prev, page: 1, pageSize: size }));
    fetchShipments(1, size, shipmentFilters);
  }, [fetchShipments, shipmentFilters]);

  const handleShipmentFiltersChange = useCallback((action: React.SetStateAction<AdminShipmentFilters>) => {
    setShipmentFilters(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      setShipmentPagination(p => ({ ...p, page: 1 }));
      fetchShipments(1, shipmentPagination.pageSize, next);
      return next;
    });
  }, [fetchShipments, shipmentPagination.pageSize]);

  const handleShipmentFiltersChangeRef = React.useRef(handleShipmentFiltersChange);

  useEffect(() => {
    handleShipmentFiltersChangeRef.current = handleShipmentFiltersChange;
  }, [handleShipmentFiltersChange]);

  const fetchIssues = useCallback(async (
    page = issuePagination.page,
    limit = issuePagination.pageSize,
    filters = issueFilters
  ) => {
    setIsIssuesFetching(true);
    try {
      const params: OrderIssueListParams = {
        page,
        limit,
        status: (filters.status || undefined) as OrderIssueStatus | undefined,
        reason: (filters.reason || undefined) as OrderIssueReason | undefined,
      };
      const res = await fetchAdminOrderIssues(params);
      const resObj = res as { data?: OrderIssue[]; meta?: OrderIssueListMeta; items?: OrderIssue[]; total?: number } | undefined;
      const list: OrderIssue[] = Array.isArray(res)
        ? res
        : resObj?.data || resObj?.items || [];
      const meta = (res as { __meta?: OrderIssueListMeta }).__meta || resObj?.meta;
      const total = typeof meta?.total === 'number'
        ? meta.total
        : typeof resObj?.total === 'number'
          ? resObj.total
          : list.length;
      const totalPages = typeof meta?.totalPages === 'number'
        ? meta.totalPages
        : Math.ceil(total / limit) || 1;

      setIssues(list);
      setIssuePagination(prev => ({
        ...prev,
        page,
        pageSize: limit,
        total,
        totalPages,
      }));
    } catch (e) {
      console.error('Fetch order issues failed:', e);
      toast.error('Không thể tải danh sách báo lỗi đơn hàng.');
    } finally {
      setIsIssuesFetching(false);
    }
  }, [issuePagination.page, issuePagination.pageSize, issueFilters]);

  const handleIssuePageChange = useCallback((page: number) => {
    fetchIssues(page, issuePagination.pageSize, issueFilters);
  }, [fetchIssues, issuePagination.pageSize, issueFilters]);

  const handleIssuePageSizeChange = useCallback((size: number) => {
    fetchIssues(1, size, issueFilters);
  }, [fetchIssues, issueFilters]);

  const handleIssueFilterChange = useCallback((patch: Partial<AdminOrderIssueFilters>) => {
    setIssueFilters(prev => {
      const next = { ...prev, ...patch };
      fetchIssues(1, issuePagination.pageSize, next);
      return next;
    });
  }, [fetchIssues, issuePagination.pageSize]);

  const handleResetIssueFilters = useCallback(() => {
    setIssueFilters({ status: '', reason: '' });
    fetchIssues(1, issuePagination.pageSize, { status: '', reason: '' });
  }, [fetchIssues, issuePagination.pageSize]);

  useEffect(() => {
    if (activeTab === 'order-issues') {
      fetchIssues();
    }
  }, [activeTab, fetchIssues]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetchAdminStats();
      console.log('[DEBUG_BE_STATS]', res);
      setStats(res as AdminStats);
    } catch (e) {
      console.warn('Backend API stats fetch failed.', e);
    }
  }, []);

  const fetchWebhookFailuresList = useCallback(async () => {
    try {
      const res = await fetchWebhookFailures();
      const list = (Array.isArray(res) ? res : res && typeof res === 'object' && 'items' in res ? res.items : []) as AdminWebhookFailure[];
      setWebhookFailures(list);
    } catch (e) {
      console.warn('Backend API webhook failures fetch failed.', e);
    }
  }, []);

  const fetchReviewsData = useCallback(async () => {
    try {
      const res = await fetchAdminReviewsResponse();
      if (Array.isArray(res)) {
        setReviewsCount(res.length);
        if (res.length > 0) {
          const sum = res.reduce((acc: number, r: { rating?: number }) => acc + (Number(r.rating) || 0), 0);
          setAvgRating(Math.round((sum / res.length) * 10) / 10);
        }
        return;
      } else if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        const list = Array.isArray(obj.data) ? obj.data : Array.isArray(obj.items) ? obj.items : Array.isArray(obj.reviews) ? obj.reviews : [];
        const total = typeof obj.total === 'number' ? obj.total : (obj.meta as { total?: number })?.total ?? list.length;
        if (total > 0 || list.length > 0) {
          setReviewsCount(total);
          if (list.length > 0) {
            const sum = list.reduce((acc: number, r: { rating?: number }) => acc + (Number(r.rating) || 0), 0);
            setAvgRating(Math.round((sum / list.length) * 10) / 10);
          }
          return;
        }
      }
    } catch {
      // Backend may not have implemented /products/admin/reviews yet; fallback
    }

    setReviewsCount(0);
    setAvgRating(0);
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    Promise.all([fetchProducts(), fetchOrders(), fetchShipments(), fetchUsers(), fetchStats(), fetchWebhookFailuresList(), fetchReviewsData()])
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, [fetchProducts, fetchOrders, fetchShipments, fetchUsers, fetchStats, fetchWebhookFailuresList, fetchReviewsData]);

  // Auto-refresh orders and stats when new notification arrives in realtime
  const recentNotifications = useNotificationStore((s) => s.recentNotifications);
  const latestNotifId = recentNotifications[0]?.id;

  useEffect(() => {
    if (latestNotifId) {
      fetchOrders();
      fetchShipments();
      fetchStats();
    }
  }, [latestNotifId, fetchOrders, fetchShipments, fetchStats]);

  // Realtime socket listeners & visibility-based periodic sync (30s)
  useEffect(() => {
    const socket = getRealtimeSocket();
    const handleRealtimeOrderUpdate = () => {
      fetchOrders();
      fetchShipments();
      fetchStats();
    };

    if (socket) {
      socket.on('notification', handleRealtimeOrderUpdate);
      socket.on('order:created', handleRealtimeOrderUpdate);
      socket.on('order:updated', handleRealtimeOrderUpdate);
      socket.on('order_status', handleRealtimeOrderUpdate);
      socket.on('shipment:created', handleRealtimeOrderUpdate);
      socket.on('shipment:updated', handleRealtimeOrderUpdate);
      socket.on('shipment_status', handleRealtimeOrderUpdate);
    }

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
        fetchShipments();
        fetchStats();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('notification', handleRealtimeOrderUpdate);
        socket.off('order:created', handleRealtimeOrderUpdate);
        socket.off('order:updated', handleRealtimeOrderUpdate);
        socket.off('order_status', handleRealtimeOrderUpdate);
        socket.off('shipment:created', handleRealtimeOrderUpdate);
        socket.off('shipment:updated', handleRealtimeOrderUpdate);
        socket.off('shipment_status', handleRealtimeOrderUpdate);
      }
    };
  }, [fetchOrders, fetchShipments, fetchStats]);

  // Handle smart navigation from notification clicks & URL search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const tabParam = sp.get('tab');
      if (isAdminPage(tabParam)) {
        setActiveTab(tabParam);
      }
      const orderCodeParam = sp.get('orderCode');
      if (orderCodeParam && tabParam !== 'shipments') {
        setSearchQuery(orderCodeParam);
      }
      const shipmentCodeParam = sp.get('shipmentCode');
      if (shipmentCodeParam) {
        handleShipmentFiltersChangeRef.current({ providerOrderCode: shipmentCodeParam });
      } else if (tabParam === 'shipments' && orderCodeParam) {
        handleShipmentFiltersChangeRef.current({ orderCode: orderCodeParam });
      }
    }

    const handleAdminNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetTab = customEvent.detail?.tab as AdminPage | undefined;
      if (targetTab && isAdminPage(targetTab)) {
        navigateAdminTab(targetTab, {
          orderCode: customEvent.detail.orderCode ? String(customEvent.detail.orderCode) : undefined,
          shipmentCode: customEvent.detail.shipmentCode ? String(customEvent.detail.shipmentCode) : undefined,
        });
        if (targetTab === 'orders' && customEvent.detail.orderCode) {
          setSearchQuery(String(customEvent.detail.orderCode));
        }
        if (targetTab === 'shipments') {
          setSelectedOrder(null);
          setSelectedShipment(null);
          if (customEvent.detail.shipmentCode) {
            handleShipmentFiltersChangeRef.current({ providerOrderCode: String(customEvent.detail.shipmentCode) });
          } else if (customEvent.detail.orderCode) {
            handleShipmentFiltersChangeRef.current({ orderCode: String(customEvent.detail.orderCode) });
          }
        }
      }
    };

    window.addEventListener('admin:navigate', handleAdminNavigate);
    return () => {
      window.removeEventListener('admin:navigate', handleAdminNavigate);
    };
  }, [navigateAdminTab]);

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct?.price) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (!editingProduct?.category) {
      toast.error('Vui lòng chọn danh mục.');
      return;
    }
    const newItems = productImages.filter(item => item.file);
    const newFiles = newItems.map(item => item.file!);

    // Sản phẩm mới bắt buộc phải có ít nhất 1 ảnh; khi sửa thì có thể giữ nguyên ảnh cũ.
    if (!editingProduct.id && productImages.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh sản phẩm.');
      return;
    }

    // Bỏ các màu chưa đặt tên; normalize hex (#RRGGBB); đồng bộ color = phần tử đầu để tương thích ngược.
    const normalizeHex = (hex?: string): string => {
      if (!hex) return '#000000';
      let h = hex.trim();
      if (!h.startsWith('#')) h = '#' + h;
      if (/^#[0-9A-Fa-f]{3}$/.test(h)) {
        h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
      }
      if (/^#[0-9A-Fa-f]{6}$/.test(h)) {
        return h.toUpperCase();
      }
      return '#000000';
    };

    const colors = (editingProduct.colors || [])
      .map(c => ({ name: c.name.trim(), hex: normalizeHex(c.hex) }))
      .filter(c => c.name.length > 0);

    // Tự động bổ sung các màu đã gán cho ảnh nhưng chưa có trong danh sách colors
    // để backend chấp nhận hợp lệ và không bị mất màu khi lưu
    productImages.forEach(img => {
      if (img.colorName && img.colorName.trim()) {
        const cTrim = img.colorName.trim();
        const exists = colors.some(c => c.name.toLowerCase() === cTrim.toLowerCase());
        if (!exists) {
          const hex = cTrim.toLowerCase().includes('đen') ? '#111111' : '#000000';
          colors.push({ name: cTrim, hex });
        }
      }
    });

    const primaryColor = colors[0]?.name;

    const resolveImageColor = (cName?: string | null): string | null => {
      if (!cName) return null;
      const match = colors.find(c => c.name.toLowerCase() === cName.trim().toLowerCase());
      return match ? match.name : null;
    };

    const newColors = newItems.map(item => resolveImageColor(item.colorName));

    try {
      if (editingProduct.id) {
        const existingImagesPayload = productImages
          .filter(item => item.isExisting && item.imageId)
          .map(item => ({
            id: item.imageId!,
            colorName: resolveImageColor(item.colorName),
          }));

        // PUT /products/:id chỉ nhận JSON (không upload file) → cập nhật thông tin trước.
        await updateProduct(editingProduct.id, {
          name: editingProduct.name,
          price: editingProduct.price,
          category: editingProduct.category,
          garmentType: editingProduct.garmentType ?? null,
          color: primaryColor || undefined,
          colors,
          material: editingProduct.material || undefined,
          description: editingProduct.description || undefined,
          status: editingProduct.status || 'ACTIVE',
          images: existingImagesPayload,
        });

        // Nếu admin chọn thêm ảnh mới → upload qua endpoint ảnh.
        if (newFiles.length > 0) {
          const imageForm = new FormData();
          newFiles.forEach((file, index) => {
            imageForm.append('images', file);
            if (index === 0) imageForm.append('image', file);
          });
          imageForm.append('isMainIndex', '0');
          imageForm.append('isMain', 'true');
          imageForm.append('imageColors', JSON.stringify(newColors));
          try {
            await uploadProductImage(editingProduct.id, imageForm, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch {
            // Fallback: upload từng ảnh nếu backend nhận single file
            for (let i = 0; i < newFiles.length; i++) {
              const file = newFiles[i];
              const singleColor = newColors[i];
              const singleForm = new FormData();
              singleForm.append('image', file);
              singleForm.append('images', file);
              singleForm.append('imageColors', JSON.stringify([singleColor]));
              await uploadProductImage(editingProduct.id, singleForm, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            }
          }
        }
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        // POST /products nhận multipart: upload nhiều ảnh
        const form = new FormData();
        form.append('name', editingProduct.name);
        form.append('price', String(editingProduct.price));
        form.append('category', editingProduct.category);
        form.append('status', editingProduct.status || 'ACTIVE');
        if (editingProduct.material) form.append('material', editingProduct.material);
        if (editingProduct.description) form.append('description', editingProduct.description);
        if (primaryColor) form.append('color', primaryColor);
        if (colors.length > 0) form.append('colors', JSON.stringify(colors));

        if (newFiles.length > 0) {
          newFiles.forEach((file) => {
            form.append('images', file);
          });
          // Gửi thêm field 'image' của ảnh đầu tiên để tương thích
          form.append('image', newFiles[0]);
          form.append('imageColors', JSON.stringify(newColors));
        }

        await createProduct(form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Tạo sản phẩm mới thành công');
      }
      closeProductEditor();
      await fetchProducts();
    } catch (e) {
      const msg = getErrorMessage(e, 'Có lỗi xảy ra khi lưu sản phẩm.');
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id);
      toast.success('Xóa sản phẩm thành công');
      await fetchProducts();
    } catch (e) {
      toast.error('Không thể xóa sản phẩm này.');
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: BackendOrderStatus) => {
    try {
      const res = await updateOrderStatus(id, { status });
      const rawData = res as { order?: AdminOrderDto; data?: AdminOrderDto } & AdminOrderDto;
      const updatedOrder = rawData?.order || rawData?.data || rawData;
      const targetStatus: BackendOrderStatus = (updatedOrder?.status || status) as BackendOrderStatus;

      setOrders(prev => prev.map(o => {
        if (o.id !== id) return o;
        const ship = updatedOrder?.shippingInfo;
        return {
          ...o,
          status: targetStatus,
          displayStatus: updatedOrder?.displayStatus || o.displayStatus,
          refundStatus: updatedOrder?.refundStatus || o.refundStatus,
          paymentStatus: updatedOrder?.paymentStatus || o.paymentStatus,
          customer: ship?.name || updatedOrder?.user?.name || o.customer,
          email: updatedOrder?.user?.email || ship?.phone || o.email,
          address: ship?.address || o.address,
          phone: ship?.phone || o.phone,
          shipment: updatedOrder?.shipment || o.shipment,
        };
      }));

      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => {
          if (!prev) return prev;
          const ship = updatedOrder?.shippingInfo;
          return {
            ...prev,
            status: targetStatus,
            displayStatus: updatedOrder?.displayStatus || prev.displayStatus,
            refundStatus: updatedOrder?.refundStatus || prev.refundStatus,
            paymentStatus: updatedOrder?.paymentStatus || prev.paymentStatus,
            customer: ship?.name || updatedOrder?.user?.name || prev.customer,
            email: updatedOrder?.user?.email || ship?.phone || prev.email,
            address: ship?.address || prev.address,
            phone: ship?.phone || prev.phone,
          };
        });
      }

      toast.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể cập nhật trạng thái đơn hàng.'));
      console.error(e);
    }
  };

  const handleCreateShipment = async (id: string, signal?: AbortSignal) => {
    try {
      const res = await createShipment(id, undefined, { signal });
      if (signal?.aborted) return;
      const rawData = res as { order?: AdminOrderDto; data?: AdminOrderDto } & AdminOrderDto;
      const updatedOrder = rawData?.order || rawData?.data || rawData;
      const targetStatus: BackendOrderStatus = (updatedOrder?.status || 'SHIPPING') as BackendOrderStatus;

      setOrders(prev => prev.map(o => {
        if (o.id !== id) return o;
        const ship = updatedOrder?.shippingInfo;
        return {
          ...o,
          status: targetStatus,
          displayStatus: updatedOrder?.displayStatus || o.displayStatus,
          refundStatus: updatedOrder?.refundStatus || o.refundStatus,
          paymentStatus: updatedOrder?.paymentStatus || o.paymentStatus,
          customer: ship?.name || updatedOrder?.user?.name || o.customer,
          email: updatedOrder?.user?.email || ship?.phone || o.email,
          address: ship?.address || o.address,
          phone: ship?.phone || o.phone,
          shipment: updatedOrder?.shipment || o.shipment,
        };
      }));

      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => {
          if (!prev) return prev;
          const ship = updatedOrder?.shippingInfo;
          return {
            ...prev,
            status: targetStatus,
            displayStatus: updatedOrder?.displayStatus || prev.displayStatus,
            refundStatus: updatedOrder?.refundStatus || prev.refundStatus,
            paymentStatus: updatedOrder?.paymentStatus || prev.paymentStatus,
            customer: ship?.name || updatedOrder?.user?.name || prev.customer,
            email: updatedOrder?.user?.email || ship?.phone || prev.email,
            address: ship?.address || prev.address,
            phone: ship?.phone || prev.phone,
            shipment: updatedOrder?.shipment || prev.shipment,
          };
        });
      }

      await fetchShipments();
      toast.success('Đã tạo vận đơn GHN thành công');
    } catch (e) {
      if (signal?.aborted) return;
      toast.error(getErrorMessage(e, 'Không thể tạo vận đơn.'));
      console.error(e);
    }
  };

  const handleViewShipment = async (shipment: AdminShipment) => {
    try {
      const res = await fetchAdminShipmentDetail(shipment.id);
      const detail = (res && typeof res === 'object' && 'data' in res ? res.data : res) as AdminShipmentDetailDto;
      setSelectedShipment(detail);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể tải chi tiết vận đơn.'));
    }
  };

  const handleSyncShipment = async (id: string) => {
    try {
      const res = await syncAdminShipment(id);
      const detail = (res && typeof res === 'object' && 'data' in res ? res.data : res) as AdminShipmentDetailDto;
      setSelectedShipment(prev => prev?.id === id ? detail : prev);
      await Promise.all([fetchShipments(), fetchOrders()]);
      toast.success('Đã đồng bộ GHN');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể đồng bộ vận đơn.'));
    }
  };

  const handleSimulatePickedShipment = async (id: string) => {
    try {
      await simulateAdminShipmentStatus(id, {
        status: 'PICKED',
        reason: 'Admin staging pickup simulation',
      });
      const detailRes = await fetchAdminShipmentDetail(id);
      const detail = (detailRes && typeof detailRes === 'object' && 'data' in detailRes ? detailRes.data : detailRes) as AdminShipmentDetailDto;
      setSelectedShipment(prev => prev?.id === id ? detail : prev);
      await Promise.all([fetchShipments(), fetchOrders()]);
      toast.success('Đã giả lập shipper lấy hàng thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể giả lập đã lấy hàng.'));
    }
  };

  const handleCancelShipment = async (shipmentOrId: AdminShipment | string) => {
    const id = typeof shipmentOrId === 'string' ? shipmentOrId : shipmentOrId.id;
    const reason = window.prompt('Lý do hủy vận đơn (tùy chọn)') || undefined;
    try {
      const res = await cancelAdminShipment(id, { reason });
      const detail = (res && typeof res === 'object' && 'data' in res ? res.data : res) as AdminShipmentDetailDto;
      setSelectedShipment(prev => prev?.id === id ? detail : prev);
      await Promise.all([fetchShipments(), fetchOrders()]);
      toast.success('Đã hủy vận đơn');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể hủy vận đơn.'));
    }
  };

  const handleSimulateDelivered = async (id: string) => {
    try {
      await simulateAdminShipmentStatus(id, {
        status: 'DELIVERED',
        reason: 'Admin staging delivery simulation',
      });
      const detailRes = await fetchAdminShipmentDetail(id);
      const detail = (detailRes && typeof detailRes === 'object' && 'data' in detailRes ? detailRes.data : detailRes) as AdminShipmentDetailDto;
      setSelectedShipment(prev => prev?.id === id ? detail : prev);
      await Promise.all([fetchShipments(), fetchOrders()]);
      toast.success('Đã giả lập giao hàng thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể giả lập giao hàng.'));
    }
  };

  const handleOpenOrderFromShipment = (orderCode: number) => {
    const order = orders.find(item => item.orderCode === orderCode);
    if (order) setSelectedOrder(order);
    navigateAdminTab('orders', { orderCode: String(orderCode) });
    setSearchQuery(String(orderCode));
  };

  const handleConfirmManualPayment = async (orderCode: number, reference: string, note: string) => {
    try {
      const res = await confirmManualPayment(orderCode, { reference, note });
      const rawData = res as { order?: AdminOrderDto; data?: AdminOrderDto } & AdminOrderDto;
      const updatedOrder = rawData?.order || rawData?.data || rawData;
      const targetStatus: BackendOrderStatus = (updatedOrder?.status || 'MEASUREMENT_REVIEW') as BackendOrderStatus;

      setOrders(prev => prev.map(o => {
        if (o.orderCode !== orderCode) return o;
        const ship = updatedOrder?.shippingInfo;
        return {
          ...o,
          status: targetStatus,
          displayStatus: updatedOrder?.displayStatus || o.displayStatus,
          refundStatus: updatedOrder?.refundStatus || o.refundStatus,
          paymentStatus: updatedOrder?.paymentStatus || o.paymentStatus,
          customer: ship?.name || updatedOrder?.user?.name || o.customer,
          email: updatedOrder?.user?.email || ship?.phone || o.email,
          address: ship?.address || o.address,
          phone: ship?.phone || o.phone,
        };
      }));

      if (selectedOrder?.orderCode === orderCode) {
        setSelectedOrder(prev => {
          if (!prev) return prev;
          const ship = updatedOrder?.shippingInfo;
          return {
            ...prev,
            status: targetStatus,
            displayStatus: updatedOrder?.displayStatus || prev.displayStatus,
            refundStatus: updatedOrder?.refundStatus || prev.refundStatus,
            paymentStatus: updatedOrder?.paymentStatus || prev.paymentStatus,
            customer: ship?.name || updatedOrder?.user?.name || prev.customer,
            email: updatedOrder?.user?.email || ship?.phone || prev.email,
            address: ship?.address || prev.address,
            phone: ship?.phone || prev.phone,
          };
        });
      }

      toast.success('Xác nhận thanh toán thủ công thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể xác nhận thanh toán thủ công.'));
      console.error(e);
    }
  };

  const handleUpdateRefund = async (id: string, reference: string, note: string) => {
    try {
      await updateOrderRefund(id, { refundStatus: 'COMPLETED', evidence: { reference }, internalNote: note });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, refundStatus: 'COMPLETED' } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, refundStatus: 'COMPLETED' } : null);
      toast.success('Đã ghi nhận hoàn tiền thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể ghi nhận hoàn tiền.'));
      console.error(e);
    }
  };

  const handleResolveWebhookFailure = async (id: string) => {
    try {
      await resolveWebhookFailure(id);
      setWebhookFailures(prev => prev.map(f => f.id === id ? { ...f, resolved: true, resolvedAt: new Date().toISOString() } : f));
      toast.success('Đã đánh dấu xử lý xong');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể đánh dấu xử lý.'));
      console.error(e);
    }
  };

  const handleUpdateUser = async (id: string, patch: Partial<Pick<AdminUser, 'tier' | 'role'>>) => {
    try {
      const body: Record<string, string> = {};
      if (patch.tier) body.tier = patch.tier;
      if (patch.role) body.role = patch.role;
      await updateUser(id, body);
      setAllUsers(prev => {
        const next = prev.map(u => u.id === id ? { ...u, ...patch } : u);
        applyUserFiltersAndPagination(next, userFilters, userPagination.page, userPagination.pageSize);
        return next;
      });
      if (selectedUser?.id === id) setSelectedUser(prev => prev ? { ...prev, ...patch } : null);
      toast.success('Cập nhật người dùng thành công');
    } catch (e) {
      toast.error('Không thể cập nhật người dùng.');
      console.error(e);
    }
  };

  // ─── Dynamic Revenue Chart Calculations ──────────────────────────────────
  const chartData = React.useMemo(() => {
    const list: {
      dateKey: string;
      label: string;
      fullDate: string;
      revenue: number;
      ordersCount: number;
    }[] = [];

    const now = new Date();
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().substring(0, 10);
      const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const fullDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

      const dayOrders = orders.filter(o => o.date === dateKey);
      const dayPaidOrders = dayOrders.filter(o => o.paymentStatus === 'PAID');
      const revenue = dayPaidOrders.reduce((sum, o) => sum + o.total, 0);

      list.push({
        dateKey,
        label,
        fullDate,
        revenue,
        ordersCount: dayOrders.length,
      });
    }

    return list;
  }, [orders, chartDays]);

  const maxRevenue = React.useMemo(() => {
    const max = Math.max(...chartData.map(d => d.revenue), 0);
    return max > 0 ? max : 500000;
  }, [chartData]);

  const chartPoints = React.useMemo(() => {
    const len = chartData.length;
    const paddingX = 40;
    const width = 600 - paddingX * 2;
    const topY = 35;
    const bottomY = 175;
    const height = bottomY - topY;

    return chartData.map((d, idx) => {
      const x = len <= 1 ? 300 : paddingX + (idx / (len - 1)) * width;
      const y = maxRevenue > 0 ? bottomY - (d.revenue / maxRevenue) * height : bottomY;
      return {
        ...d,
        x,
        y,
      };
    });
  }, [chartData, maxRevenue]);

  // SVGs responsive custom path calculations for dynamic revenue trend
  const renderRevenueChart = () => {
    if (chartPoints.length === 0) return null;

    const pathD = `M ${chartPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const startX = chartPoints[0].x;
    const endX = chartPoints[chartPoints.length - 1].x;
    const areaD = `M ${startX} 180 L ${chartPoints.map(p => `${p.x} ${p.y}`).join(' L ')} L ${endX} 180 Z`;

    const totalPeriodRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalPeriodOrders = chartData.reduce((sum, d) => sum + d.ordersCount, 0);

    return (
      <div className="w-full flex flex-col gap-4">
        {/* Quick summary numbers for this period */}
        <div className="flex flex-wrap items-center gap-4 py-2.5 px-4 bg-neutral-50 rounded-xl border border-neutral-200/70 text-body-sm">
          <div>
            <span className="text-neutral-500 text-label-sm">Doanh thu {chartDays} ngày: </span>
            <strong className="text-brand-navy font-bold">{fmt(totalPeriodRevenue)}</strong>
          </div>
          <div className="w-px h-4 bg-neutral-200 hidden sm:block" />
          <div>
            <span className="text-neutral-500 text-label-sm">Tổng đơn: </span>
            <strong className="text-neutral-800 font-bold">{totalPeriodOrders} đơn</strong>
          </div>
          <div className="w-px h-4 bg-neutral-200 hidden sm:block" />
          <div>
            <span className="text-neutral-500 text-label-sm">Trung bình ngày: </span>
            <strong className="text-neutral-800 font-bold">{fmt(Math.round(totalPeriodRevenue / chartDays))}</strong>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full">
          <svg
            className="w-full h-[240px]"
            viewBox="0 0 600 210"
            fill="none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5D1C34" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#5D1C34" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines & Y-axis labels */}
            <line x1="25" y1="35" x2="575" y2="35" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
            <text x="25" y="30" className="text-[9px] fill-neutral-400 font-sans">{fmt(maxRevenue)}</text>

            <line x1="25" y1="105" x2="575" y2="105" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
            <text x="25" y="100" className="text-[9px] fill-neutral-400 font-sans">{fmt(Math.round(maxRevenue / 2))}</text>

            <line x1="25" y1="180" x2="575" y2="180" stroke="#E5E7EB" strokeWidth="1" />
            <text x="25" y="175" className="text-[9px] fill-neutral-400 font-sans">0đ</text>

            {/* Area & Line */}
            <path d={areaD} fill="url(#revenueGradient)" />
            <path d={pathD} stroke="#5D1C34" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points & Labels */}
            {chartPoints.map((p, idx) => {
              const isHovered = hoveredPoint?.dateKey === p.dateKey;
              return (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(p)}>
                  {/* Invisible hit box for easy hovering */}
                  <rect
                    x={p.x - (600 / chartDays) / 2}
                    y={10}
                    width={600 / chartDays}
                    height={190}
                    fill="transparent"
                  />
                  {/* Vertical guide line on hover */}
                  {isHovered && (
                    <line
                      x1={p.x}
                      y1={35}
                      x2={p.x}
                      y2={180}
                      stroke="#5D1C34"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}
                  {/* Point circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? '#FFFFFF' : '#5D1C34'}
                    stroke="#5D1C34"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all"
                  />
                  {/* X-axis date label */}
                  <text
                    x={p.x}
                    y={198}
                    textAnchor="middle"
                    className={`text-[10px] font-sans ${isHovered ? 'fill-neutral-900 font-bold' : 'fill-neutral-400'}`}
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredPoint && (
            <div
              className="absolute top-2 pointer-events-none transition-all duration-150 bg-brand-navy text-white text-body-sm px-3.5 py-2.5 rounded-xl shadow-xl z-20"
              style={{
                left: `${Math.min(Math.max((hoveredPoint.x / 600) * 100, 15), 85)}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="text-[11px] text-white/70 font-semibold">{hoveredPoint.fullDate}</p>
              <p className="text-[14px] font-bold text-brand-gold mt-0.5">{fmt(hoveredPoint.revenue)}</p>
              <p className="text-[11px] text-white/90 mt-0.5">{hoveredPoint.ordersCount} đơn hàng</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Dashboard Derived Business Metrics ───────────────────────────────────
  const NON_REVENUE_STATUSES: BackendOrderStatus[] = ['CANCELLED', 'FAILED', 'EXPIRED', 'PENDING', 'RETURNED'];
  const rawStats = (stats || {}) as Record<string, unknown>;

  const totalRevenue = typeof stats?.totalRevenue === 'number'
    ? stats.totalRevenue
    : orders.filter(o => !NON_REVENUE_STATUSES.includes(o.status)).reduce((acc, o) => acc + o.total, 0);

  const refundedRevenue = Number(
    rawStats.refundedAmount
    ?? rawStats.productRefunded
    ?? rawStats.refundedRevenue
    ?? rawStats.refunded_revenue
    ?? rawStats.refundRevenue
    ?? rawStats.refund_revenue
    ?? 0
  );

  const rawProductRev = rawStats.productRevenue
    ?? rawStats.product_revenue
    ?? rawStats.orderRevenue
    ?? rawStats.order_revenue;
  const productRevenue = typeof rawProductRev === 'number'
    ? rawProductRev
    : orders.filter(o => !NON_REVENUE_STATUSES.includes(o.status)).reduce((acc, o) => acc + o.total, 0);

  const rawSubRev = rawStats.subscriptionRevenue
    ?? rawStats.subscription_revenue
    ?? rawStats.subscriptionsRevenue
    ?? rawStats.subscriptions_revenue
    ?? rawStats.packageRevenue
    ?? rawStats.package_revenue
    ?? rawStats.subRevenue;
  const subscriptionRevenue = (typeof rawSubRev === 'number' && rawSubRev > 0)
    ? rawSubRev
    : Math.max(0, totalRevenue - productRevenue);

  const rawNetSubRev = rawStats.netSubscriptionRevenue
    ?? rawStats.net_subscription_revenue
    ?? rawStats.netPackageRevenue;
  const netSubscriptionRevenue = typeof rawNetSubRev === 'number'
    ? rawNetSubRev
    : subscriptionRevenue;

  const rawNetProductRev = rawStats.netProductRevenue
    ?? rawStats.net_product_revenue
    ?? rawStats.netOrderRevenue;
  const netProductRevenue = typeof rawNetProductRev === 'number'
    ? rawNetProductRev
    : productRevenue;

  const expectedNet = Math.max(0, totalRevenue - refundedRevenue);
  const rawNetRev = rawStats.netRevenue ?? rawStats.net_revenue;
  const netRevenue = (typeof rawNetRev === 'number' && rawNetRev <= productRevenue && subscriptionRevenue > 0)
    ? rawNetRev + netSubscriptionRevenue
    : (typeof rawNetRev === 'number' ? rawNetRev : expectedNet);

  const effectivePaidOrders = typeof stats?.paidOrders === 'number' && stats.paidOrders > 0
    ? stats.paidOrders
    : orders.filter(o => !NON_REVENUE_STATUSES.includes(o.status)).length;
  const avgOrderValue = effectivePaidOrders > 0
    ? Math.round(totalRevenue / effectivePaidOrders)
    : 0;

  const totalOrders = stats?.orderCount ?? orders.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const shippingOrders = orders.filter(o => o.status === 'SHIPPING' || o.status === 'READY_TO_SHIP').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED' || o.status === 'FAILED' || o.status === 'RETURNED' || o.status === 'EXPIRED').length;

  const totalProducts = stats?.productCount ?? products.length;
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length;

  const userSource = allUsers.length > 0 ? allUsers : users;
  const totalUsers = stats?.userCount ?? userSource.length;
  const memberUsers = userSource.filter(u => u.tier === 'MEMBER').length;
  const vipUsers = userSource.filter(u => u.tier === 'VIP').length;

  const totalReviews = (typeof stats?.reviewCount === 'number' && stats.reviewCount > 0)
    ? stats.reviewCount
    : (reviewsCount || (typeof stats?.totalReviews === 'number' ? stats.totalReviews : 0));
  const finalAvgRating = (typeof stats?.avgRating === 'number' && stats.avgRating > 0)
    ? stats.avgRating
    : avgRating;

  return (
    <div className="flex bg-neutral-100 h-screen overflow-hidden text-neutral-800 font-sans">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

        {/* SIDEBAR */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] shrink-0 bg-brand-navy flex flex-col h-screen lg:h-full transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="px-5 pt-6 pb-5 border-b border-white/10 flex flex-col gap-1 shrink-0">
            <span className="text-white font-bold text-heading-h3 tracking-wide">FashionAI</span>
            <span className="inline-flex items-center self-start px-2 py-0.5 bg-brand-gold text-brand-navy text-[9px] font-bold tracking-widest rounded-full uppercase">
              Admin Panel
            </span>
          </div>

          <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto min-h-0 no-scrollbar">
            {([
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: 'Sản phẩm', icon: Package },
              { id: 'collections', label: 'Bộ sưu tập', icon: Layers },
              { id: 'users', label: 'Người dùng', icon: Users },
              { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
              { id: 'shipments', label: 'Vận đơn', icon: Truck },
              { id: 'order-issues', label: 'Báo lỗi & Đổi trả', icon: ShieldAlert },
              { id: 'coupons', label: 'Mã giảm giá', icon: Tag },
              { id: 'reconciliation', label: 'Đối soát giao dịch lạ', icon: AlertTriangle },
              { id: 'reviews', label: 'Đánh giá', icon: MessageSquare },
              { id: 'shipping-settings', label: 'Cài đặt GHN', icon: Truck },
              { id: 'live-try-on-settings', label: 'Live Try-On', icon: Radio },
            ] as { id: AdminPage; label: string; icon: LucideIcon }[]).map(item => {
              const IconComponent = item.icon;
              const active = activeTab === item.id;
              const unresolvedCount = (item.id === 'reconciliation' || item.id === 'webhook-failures')
                ? webhookFailures.filter(f => !f.resolved).length
                : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => { navigateAdminTab(item.id); setSearchQuery(''); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-body-sm font-medium transition-all text-left w-full border-0 cursor-pointer ${active ? 'bg-white text-brand-navy shadow-xs font-semibold' : 'text-white/75 hover:text-white hover:bg-white/10 bg-transparent'
                    }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {unresolvedCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                      {unresolvedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-3 pb-5 flex flex-col gap-2 border-t border-white/10 pt-3 shrink-0">
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-body-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors w-full border-0 bg-transparent cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* ADMIN TOPBAR */}
          <header className="h-16 px-4 md:px-8 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0 z-30 sticky top-0 shadow-2xs">
            <div className="flex items-center gap-2 md:gap-3">
              {/* Hamburger - chỉ hiện trên mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 border-0 bg-transparent cursor-pointer"
                aria-label="Mở menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-body-sm font-bold text-brand-navy">
                {activeTab === 'dashboard' ? 'Tổng quan kinh doanh' :
                  activeTab === 'products' ? 'Quản lý sản phẩm' :
                    activeTab === 'collections' ? 'Quản lý bộ sưu tập' :
                      activeTab === 'users' ? 'Quản lý người dùng' :
                        activeTab === 'orders' ? 'Quản lý đơn hàng' :
                          activeTab === 'shipments' ? 'Quản lý vận đơn' :
                            activeTab === 'order-issues' ? 'Quản lý Báo lỗi & Đổi trả' :
                              activeTab === 'coupons' ? 'Quản lý mã giảm giá' :
                                (activeTab === 'webhook-failures' || activeTab === 'reconciliation') ? 'Đối soát giao dịch lạ' :
                                  activeTab === 'reviews' ? 'Quản lý đánh giá sản phẩm' :
                                    activeTab === 'shipping-settings' ? 'Cài đặt GHN' : 'Cài đặt Live Try-On'}
              </span>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => {
                  setIsLoading(true);
                  Promise.all([fetchProducts(), fetchOrders(), fetchShipments(), fetchUsers(), fetchStats(), fetchWebhookFailuresList()]).finally(() => setIsLoading(false));
                }}
                disabled={isLoading}
                title="Làm mới dữ liệu"
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer border-0 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {/* Chuông thông báo Realtime Notification Bell */}
              <div className="relative flex items-center justify-center">
                <NotificationBell />
              </div>

              <div className="h-5 w-px bg-neutral-200" />

              {/* Admin User Info */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
                  {currentUser.avatar ? (
                    <Image src={currentUser.avatar} alt={adminName} width={32} height={32} unoptimized className="w-full h-full object-cover" />
                  ) : (
                    adminInitial
                  )}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[13px] font-bold text-neutral-800 leading-tight">{adminName}</span>
                  <span className="text-[10px] font-bold text-brand-navy uppercase tracking-wider">Quản trị viên</span>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-h-0 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar">

            {/* ─── TAB: DASHBOARD ─────────────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <DashboardOverview
                totalRevenue={totalRevenue}
                avgOrderValue={avgOrderValue}
                totalOrders={totalOrders}
                pendingOrders={pendingOrders}
                deliveredOrders={deliveredOrders}
                totalProducts={totalProducts}
                activeProducts={activeProducts}
                totalUsers={totalUsers}
                memberUsers={memberUsers}
                vipUsers={vipUsers}
                users={userSource}
                setActiveTab={handleDashboardTabChange}
                shippingOrders={shippingOrders}
                cancelledOrders={cancelledOrders}
                setChartDays={setChartDays}
                setHoveredPoint={setHoveredPoint}
                chartDays={chartDays}
                renderRevenueChart={renderRevenueChart}
                orders={orders}
                setSelectedOrder={setSelectedOrder}
                products={products}
                openProductEditor={openProductEditor}
                refundedRevenue={refundedRevenue}
                netRevenue={netRevenue}
                subscriptionRevenue={subscriptionRevenue}
                productRevenue={productRevenue}
                netSubscriptionRevenue={netSubscriptionRevenue}
                netProductRevenue={netProductRevenue}
                totalReviews={totalReviews}
                avgRating={finalAvgRating}
                tryOnToday={stats?.tryOnToday ?? 0}
                tryOnCount={stats?.tryOnCount ?? 0}
                stylistCount={stats?.stylistCount ?? 0}
              />
            )}

            {/* ─── TAB: PRODUCTS ──────────────────────────────────────────────────── */}
            {activeTab === 'products' && (
              <AdminProductsPanel
                openProductEditor={openProductEditor}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                products={products}
                handleDeleteProduct={handleDeleteProduct}
                filters={productFilters}
                onFilterChange={handleProductFilterChange}
                onResetFilters={handleResetProductFilters}
                currentPage={productPagination.page}
                totalPages={productPagination.totalPages}
                totalItems={productPagination.total}
                pageSize={productPagination.pageSize}
                onPageChange={handleProductPageChange}
                onPageSizeChange={handleProductPageSizeChange}
                isFetching={isProductsFetching}
              />
            )}

            {/* ─── TAB: USERS ─────────────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <AdminUsersPanel
                users={users}
                setSelectedUser={setSelectedUser}
                filters={userFilters}
                onFilterChange={handleUserFilterChange}
                onResetFilters={handleResetUserFilters}
                currentPage={userPagination.page}
                totalPages={userPagination.totalPages}
                totalItems={userPagination.total}
                pageSize={userPagination.pageSize}
                onPageChange={handleUserPageChange}
                onPageSizeChange={handleUserPageSizeChange}
                isFetching={isUsersFetching}
              />
            )}

            {/* ─── TAB: ORDERS ────────────────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <AdminOrdersPanel
                orders={orders}
                setSelectedOrder={setSelectedOrder}
                filters={orderFilters}
                onFilterChange={handleOrderFilterChange}
                onResetFilters={handleResetOrderFilters}
                currentPage={orderPagination.page}
                totalPages={orderPagination.totalPages}
                totalItems={orderPagination.total}
                pageSize={orderPagination.pageSize}
                onPageChange={handleOrderPageChange}
                onPageSizeChange={handleOrderPageSizeChange}
                isFetching={isOrdersFetching}
              />
            )}

            {/* ─── TAB: SHIPMENTS ─────────────────────────────────────────────────── */}
            {activeTab === 'shipments' && (
              <AdminShipmentsPanel
                shipments={shipments}
                filters={shipmentFilters}
                setFilters={handleShipmentFiltersChange}
                onView={handleViewShipment}
                onSimulatePicked={handleSimulatePickedShipment}
                onCancel={handleCancelShipment}
                onOpenOrder={handleOpenOrderFromShipment}
                currentPage={shipmentPagination.page}
                totalPages={shipmentPagination.totalPages}
                totalItems={shipmentPagination.total}
                pageSize={shipmentPagination.pageSize}
                onPageChange={handleShipmentPageChange}
                onPageSizeChange={handleShipmentPageSizeChange}
                isFetching={isShipmentsFetching}
              />
            )}

            {/* ─── TAB: ORDER ISSUES ─────────────────────────────────────────────── */}
            {activeTab === 'order-issues' && (
              <AdminOrderIssuesPanel
                issues={issues}
                filters={issueFilters}
                onFilterChange={handleIssueFilterChange}
                onResetFilters={handleResetIssueFilters}
                currentPage={issuePagination.page}
                totalPages={issuePagination.totalPages}
                totalItems={issuePagination.total}
                pageSize={issuePagination.pageSize}
                onPageChange={handleIssuePageChange}
                onPageSizeChange={handleIssuePageSizeChange}
                isFetching={isIssuesFetching}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
              />
            )}

            {/* ─── TAB: RECONCILIATION / WEBHOOK FAILURES ─────────────────────────── */}
            {(activeTab === 'reconciliation' || activeTab === 'webhook-failures') && (
              <AdminReconciliationPanel onStatsRefresh={() => fetchStats()} />
            )}

            {/* ─── TAB: SHIPPING SETTINGS ─────────────────────────────────────────── */}
            {activeTab === 'shipping-settings' && <AdminShippingSettingsPanel />}

            {/* ─── TAB: LIVE TRY-ON SETTINGS ──────────────────────────────────────── */}
            {activeTab === 'live-try-on-settings' && <AdminLiveTryOnSettingsPanel />}

            {/* ─── TAB: COLLECTIONS ──────────────────────────────────────────────── */}
            {activeTab === 'collections' && <AdminCollectionManager />}

            {/* ─── TAB: REVIEWS ──────────────────────────────────────────────────── */}
            {activeTab === 'reviews' && <AdminReviewTable />}

            {/* ─── TAB: COUPONS ──────────────────────────────────────────────────── */}
            {activeTab === 'coupons' && <AdminCouponsPanel />}

          </main>

          {/* ─── DRAWER: USER DETAIL ────────────────────────────────────────────── */}
          <AnimatePresence>
            {selectedUser && (
              <AdminUserModal setSelectedUser={setSelectedUser} selectedUser={selectedUser} handleUpdateUser={handleUpdateUser} />
            )}
          </AnimatePresence>

          {/* ─── DRAWER: ORDER DETAIL ────────────────────────────────────────────── */}
          <AnimatePresence>
            {selectedOrder && (
              <AdminOrderModal setSelectedOrder={setSelectedOrder} selectedOrder={selectedOrder} handleUpdateOrderStatus={handleUpdateOrderStatus} handleConfirmManualPayment={handleConfirmManualPayment} handleUpdateRefund={handleUpdateRefund} handleCreateShipment={handleCreateShipment} />
            )}
          </AnimatePresence>

          {/* ─── DRAWER: SHIPMENT DETAIL ─────────────────────────────────────────── */}
          <AnimatePresence>
            {selectedShipment && (
              <AdminShipmentModal
                shipment={selectedShipment}
                onClose={() => setSelectedShipment(null)}
                onSync={handleSyncShipment}
                onCancel={handleCancelShipment}
                onSimulateDelivered={handleSimulateDelivered}
                onOpenOrder={handleOpenOrderFromShipment}
              />
            )}
          </AnimatePresence>

          {/* ─── DIALOG: PRODUCT EDITOR ─────────────────────────────────────────── */}
          <AnimatePresence>
            {editingProduct && (
              <AdminProductModal
                closeProductEditor={closeProductEditor}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                addColor={addColor}
                updateColor={updateColor}
                removeColor={removeColor}
                productImages={productImages}
                handleSelectImages={handleSelectImages}
                handleSetPrimaryImage={handleSetPrimaryImage}
                handleSetImageColor={handleSetImageColor}
                handleRemoveImage={handleRemoveImage}
                handleSaveProduct={handleSaveProduct}
              />
            )}
          </AnimatePresence>

          {/* ─── DIALOG: ORDER ISSUE DETAIL ──────────────────────────────────────── */}
          <AdminOrderIssueModal
            issue={selectedIssue}
            isOpen={Boolean(selectedIssue)}
            onClose={() => setSelectedIssue(null)}
            onSuccess={() => {
              fetchIssues();
              fetchOrders();
            }}
          />

        </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
