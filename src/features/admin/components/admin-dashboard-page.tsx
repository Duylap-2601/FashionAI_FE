'use client';
import { getErrorMessage, getErrorStatus } from '@/lib/errors';
import type { AdminImageDto, AdminProductDto, AdminOrderDto, AdminUserDto, ProductImagesResponse } from '@/features/admin/types/api';


import { AdminOrderModal } from '@/features/admin/components/admin-order-modal';
import { AdminOrdersPanel } from '@/features/admin/components/admin-orders-panel';
import { AdminProductModal } from '@/features/admin/components/admin-product-modal';
import { AdminProductsPanel } from '@/features/admin/components/admin-products-panel';
import { AdminQuotaPanel } from '@/features/admin/components/admin-quota-panel';
import { AdminUserModal } from '@/features/admin/components/admin-user-modal';
import { AdminUsersPanel } from '@/features/admin/components/admin-users-panel';
import { AdminWebhookFailuresPanel } from '@/features/admin/components/admin-webhook-failures-panel';
import { DashboardOverview } from '@/features/admin/components/dashboard-overview';
import { fmt } from '@/features/admin/services/format';
import type { ProductImageItem } from '@/features/admin/types/admin-dashboard-page';
import { confirmManualPayment, createProduct, deleteProduct, deleteProductImage, resolveWebhookFailure, updateOrderRefund, updateOrderStatus, updateProduct, updateUser, uploadProductImage } from '@/features/admin/services/mutations';
import { fetchAdminOrders, fetchAdminProducts, fetchAdminStats, fetchAdminUsers, fetchWebhookFailures } from '@/features/admin/services/queries';
import type { AdminOrder, AdminPage, AdminProduct, AdminProductImage, AdminStats, AdminUser, AdminWebhookFailure, GarmentCategory, ProductStatus, UserRole, UserTier } from '@/features/admin/types/admin-dashboard-page';
import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AdminCollectionManager } from '@/features/collections/components/AdminCollectionManager';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import { AdminReviewTable } from '@/features/reviews/components/AdminReviewTable';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ExternalLink,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  Users
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminPage>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
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
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null);
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);

  const handleSelectImages = useCallback((files: FileList | File[]) => {
    const newItems: ProductImageItem[] = Array.from(files).map(file => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));
    setProductImages(prev => [...prev, ...newItems]);
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

      const updatedProd = (res.data?.data || res.data) as ProductImagesResponse;
      if (updatedProd && Array.isArray(updatedProd.images)) {
        // Cập nhật editingProduct


        // Chuyển đổi images mới từ backend
        const mappedBackendImages: ProductImageItem[] = updatedProd.images.map((img: AdminImageDto, i: number) => {
          if (typeof img === 'string') {
            return { id: `existing-${i}-${img}`, imageId: undefined, url: img, isMain: i === 0, isExisting: true };
          }
          const url = img.imageUrl || img.url || '';
          return {
            id: `existing-${img.id || i}-${url}`,
            imageId: img.id,
            url,
            isMain: Boolean(img.isMain),
            isExisting: true,
          };
        });

        setEditingProduct(prev => prev ? ({
          ...prev,
          garmentUrl: updatedProd.garmentUrl || prev.garmentUrl,
          images: mappedBackendImages.map(image => ({ id: image.imageId || '', imageUrl: image.url, isMain: image.isMain })),
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
            };
          }
          const url = img.imageUrl || img.url || '';
          return {
            id: `existing-${img.id || i}-${url}`,
            imageId: img.id,
            url,
            isMain: Boolean(img.isMain),
            isExisting: true,
          };
        });
      }
      return [];
    });
    setEditingProduct(product ? product : { stock: 0, status: 'ACTIVE', category: 'UPPER' });
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

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetchAdminProducts({ params: { limit: 100 } });
      const list = (Array.isArray(res.data) ? res.data : res.data?.items || []) as AdminProductDto[];
      setProducts(list.map((p) => {
        const rawImages: AdminImageDto[] = Array.isArray(p.images) ? p.images : [];
        const normalizedImages: AdminProductImage[] = rawImages.map((img: AdminImageDto, idx: number) => {
          if (typeof img === 'string') {
            return { id: '', imageUrl: img, isMain: idx === 0 };
          }
          return {
            id: img.id || '',
            imageUrl: img.imageUrl || img.url || '',
            isMain: Boolean(img.isMain),
          };
        }).filter((item: AdminProductImage) => Boolean(item.imageUrl));

        const mainImage = normalizedImages.find(img => img.isMain)?.imageUrl || normalizedImages[0]?.imageUrl;
        const primaryImg = p.garmentUrl || mainImage || '/images/731163514_999523332788054_1114320478812927640_n.png';
        return {
          id: p.id,
          name: p.name,
          category: p.category as GarmentCategory,
          price: Number(p.price),
          stock: p.stock ?? 0,
          status: p.status as ProductStatus,
          image: primaryImg,
          images: normalizedImages,
          garmentUrl: p.garmentUrl,
          description: p.description,
          color: p.color,
          colors: Array.isArray(p.colors) ? p.colors : undefined,
        };
      }));
    } catch (e) {
      console.error('Backend API products fetch failed:', e);
      toast.error('Không thể tải danh sách sản phẩm');
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetchAdminOrders({ params: { limit: 100 } });
      const list = (Array.isArray(res.data) ? res.data : res.data?.items || []) as AdminOrderDto[];
      setOrders(list.map((o) => {
        const ship = o.shippingInfo;
        return {
          id: o.id,
          code: `#${o.orderCode}`,
          orderCode: Number(o.orderCode),
          customer: ship?.name || o.user?.name || 'Khách hàng',
          email: o.user?.email || ship?.phone || '',
          items: o.items?.length || 1,
          total: Number(o.amount),
          status: o.status as BackendOrderStatus,
          refundStatus: o.refundStatus,
          date: o.createdAt?.substring(0, 10) || '',
          payment: o.payments?.[0]?.provider || 'COD',
          address: ship?.address,
          phone: ship?.phone,
        };
      }));
    } catch (e) {
      console.error('Backend API orders fetch failed:', e);
      toast.error('Không thể tải danh sách đơn hàng');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetchAdminUsers({ params: { limit: 100 } });
      const list = (Array.isArray(res.data) ? res.data : res.data?.items || []) as AdminUserDto[];
      setUsers(list.map((u) => ({
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
      })));
    } catch (e) {
      console.error('Backend API users fetch failed:', e);
      toast.error('Không thể tải danh sách người dùng');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetchAdminStats();
      setStats(res.data as AdminStats);
    } catch (e) {
      console.warn('Backend API stats fetch failed.', e);
    }
  }, []);

  const fetchWebhookFailuresList = useCallback(async () => {
    try {
      const res = await fetchWebhookFailures();
      const list = (Array.isArray(res.data) ? res.data : res.data?.items || []) as AdminWebhookFailure[];
      setWebhookFailures(list);
    } catch (e) {
      console.warn('Backend API webhook failures fetch failed.', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    Promise.all([fetchProducts(), fetchOrders(), fetchUsers(), fetchStats(), fetchWebhookFailuresList()])
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, [fetchProducts, fetchOrders, fetchUsers, fetchStats, fetchWebhookFailuresList]);

  // Auto-refresh orders and stats when new notification arrives in realtime
  const recentNotifications = useNotificationStore((s) => s.recentNotifications);
  const latestNotifId = recentNotifications[0]?.id;

  useEffect(() => {
    if (latestNotifId) {
      fetchOrders();
      fetchStats();
    }
  }, [latestNotifId, fetchOrders, fetchStats]);

  // Handle smart navigation from notification clicks
  useEffect(() => {
    const handleAdminNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
        if (customEvent.detail.orderCode) {
          setSearchQuery(String(customEvent.detail.orderCode));
        }
      }
    };

    window.addEventListener('admin:navigate', handleAdminNavigate);
    return () => {
      window.removeEventListener('admin:navigate', handleAdminNavigate);
    };
  }, []);

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct?.price) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (!editingProduct?.category) {
      toast.error('Vui lòng chọn danh mục.');
      return;
    }
    const newFiles = productImages.filter(item => item.file).map(item => item.file!);

    // Sản phẩm mới bắt buộc phải có ít nhất 1 ảnh; khi sửa thì có thể giữ nguyên ảnh cũ.
    if (!editingProduct.id && productImages.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh sản phẩm.');
      return;
    }

    // Bỏ các màu chưa đặt tên; đồng bộ color = phần tử đầu để tương thích ngược.
    const colors = (editingProduct.colors || []).filter(c => c.name.trim());
    const primaryColor = colors[0]?.name;
    const stock = editingProduct.stock ?? 0;

    try {
      if (editingProduct.id) {
        // PUT /products/:id chỉ nhận JSON (không upload file) → cập nhật thông tin trước.
        await updateProduct(editingProduct.id, {
          name: editingProduct.name,
          price: editingProduct.price,
          category: editingProduct.category,
          color: primaryColor || undefined,
          colors,
          stock,
          material: editingProduct.material || undefined,
          description: editingProduct.description || undefined,
          status: editingProduct.status || 'ACTIVE',
        });

        // Nếu admin chọn thêm ảnh mới → upload qua endpoint ảnh.
        if (newFiles.length > 0) {
          const imageForm = new FormData();
          newFiles.forEach((file, index) => {
            imageForm.append('images', file);
            if (index === 0) imageForm.append('image', file);
          });
          imageForm.append('isMain', 'true');
          try {
            await uploadProductImage(editingProduct.id, imageForm, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch {
            // Fallback: upload từng ảnh nếu backend nhận single file
            for (const file of newFiles) {
              const singleForm = new FormData();
              singleForm.append('image', file);
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
        form.append('stock', String(stock));
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
      await updateOrderStatus(id, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
      toast.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không thể cập nhật trạng thái đơn hàng.'));
      console.error(e);
    }
  };

  const handleConfirmManualPayment = async (orderCode: number, reference: string, note: string) => {
    try {
      await confirmManualPayment(orderCode, { reference, note });
      setOrders(prev => prev.map(o => o.orderCode === orderCode ? { ...o, status: 'PAID' } : o));
      if (selectedOrder?.orderCode === orderCode) setSelectedOrder(prev => prev ? { ...prev, status: 'PAID' } : null);
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
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
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
      const dayPaidOrders = dayOrders.filter(
        o => o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'SHIPPING' || o.status === 'CONFIRMED'
      );
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
  const totalRevenue = stats?.totalRevenue ?? orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'SHIPPING' || o.status === 'CONFIRMED').reduce((acc, o) => acc + o.total, 0);
  const paidOrdersCount = orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'SHIPPING' || o.status === 'CONFIRMED').length;
  const avgOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

  const totalOrders = stats?.orderCount ?? orders.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const shippingOrders = orders.filter(o => o.status === 'SHIPPING' || o.status === 'CONFIRMED').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'PAID').length;
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED' || o.status === 'FAILED' || o.status === 'RETURNED' || o.status === 'EXPIRED').length;

  const totalProducts = stats?.productCount ?? products.length;
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
  const outOfStockCount = products.filter(p => (p.stock ?? 0) === 0).length;

  const totalUsers = stats?.userCount ?? users.length;
  const memberUsers = users.filter(u => u.tier === 'MEMBER').length;
  const vipUsers = users.filter(u => u.tier === 'VIP').length;

  return (
    <AdminGuard>
      <div className="flex bg-neutral-100 min-h-screen text-neutral-800 font-sans">

        {/* SIDEBAR */}
        <aside className="w-[240px] shrink-0 bg-brand-navy flex flex-col min-h-screen sticky top-0">
          <div className="px-6 pt-7 pb-6 border-b border-white/10 flex flex-col gap-1">
            <span className="text-white font-bold text-heading-h3 tracking-wide">FashionAI</span>
            <span className="inline-flex items-center self-start px-2 py-0.5 bg-brand-gold text-white text-[9px] font-bold tracking-widest rounded-full uppercase">
              Admin Panel
            </span>
          </div>

          <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
            {([
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'products', label: 'Sản phẩm', icon: Package },
              { id: 'collections', label: 'Bộ sưu tập', icon: Layers },
              { id: 'users', label: 'Người dùng', icon: Users },
              { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
              { id: 'webhook-failures', label: 'Giao dịch lỗi', icon: AlertTriangle },
              { id: 'reviews', label: 'Đánh giá', icon: MessageSquare },
              { id: 'quota', label: 'Cài đặt Quota', icon: Settings },
            ] as { id: AdminPage; label: string; icon: LucideIcon }[]).map(item => {
              const IconComponent = item.icon;
              const active = activeTab === item.id;
              const unresolvedCount = item.id === 'webhook-failures' ? webhookFailures.filter(f => !f.resolved).length : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSearchQuery(''); }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-body-sm font-medium transition-all text-left w-full border-0 cursor-pointer ${active ? 'bg-white text-brand-navy shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/8 bg-transparent'
                    }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  {item.label}
                  {unresolvedCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                      {unresolvedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-3 pb-6 flex flex-col gap-2 border-t border-white/10 pt-4">
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-body-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors w-full border-0 bg-transparent cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
          {/* ADMIN TOPBAR */}
          <header className="h-16 px-6 md:px-8 bg-white border-b border-neutral-200 flex items-center justify-between shrink-0 z-30 sticky top-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-body-sm font-semibold text-neutral-500">Quản trị</span>
              <span className="text-neutral-300">/</span>
              <span className="text-body-sm font-bold text-brand-navy">
                {activeTab === 'dashboard' ? 'Tổng quan kinh doanh' :
                  activeTab === 'products' ? 'Quản lý sản phẩm' :
                    activeTab === 'collections' ? 'Quản lý bộ sưu tập' :
                      activeTab === 'users' ? 'Quản lý người dùng' :
                        activeTab === 'orders' ? 'Quản lý đơn hàng' :
                          activeTab === 'webhook-failures' ? 'Giao dịch lỗi' :
                            activeTab === 'reviews' ? 'Quản lý đánh giá sản phẩm' : 'Cài đặt Quota'}
              </span>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium text-neutral-600 hover:text-brand-navy hover:bg-neutral-100 transition-colors border border-neutral-200/80"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem cửa hàng</span>
              </Link>

              <button
                onClick={() => {
                  setIsLoading(true);
                  Promise.all([fetchProducts(), fetchOrders(), fetchUsers(), fetchStats(), fetchWebhookFailuresList()]).finally(() => setIsLoading(false));
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
                <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  A
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[13px] font-bold text-neutral-800 leading-tight">Admin FashionAI</span>
                  <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">Quản trị viên</span>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">

            {/* ─── TAB: DASHBOARD ─────────────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <DashboardOverview
                setIsLoading={setIsLoading}
                fetchProducts={fetchProducts}
                fetchOrders={fetchOrders}
                fetchUsers={fetchUsers}
                fetchStats={fetchStats}
                totalRevenue={totalRevenue}
                avgOrderValue={avgOrderValue}
                totalOrders={totalOrders}
                pendingOrders={pendingOrders}
                deliveredOrders={deliveredOrders}
                totalProducts={totalProducts}
                activeProducts={activeProducts}
                outOfStockCount={outOfStockCount}
                totalUsers={totalUsers}
                memberUsers={memberUsers}
                vipUsers={vipUsers}
                users={users}
                setActiveTab={setActiveTab}
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
              />
            )}

            {/* ─── TAB: USERS ─────────────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <AdminUsersPanel users={users} setSelectedUser={setSelectedUser} />
            )}

            {/* ─── TAB: ORDERS ────────────────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <AdminOrdersPanel orders={orders} setSelectedOrder={setSelectedOrder} />
            )}

            {/* ─── TAB: WEBHOOK FAILURES ──────────────────────────────────────────── */}
            {activeTab === 'webhook-failures' && (
              <AdminWebhookFailuresPanel failures={webhookFailures} onResolve={handleResolveWebhookFailure} />
            )}

            {/* ─── TAB: QUOTA USAGE ────────────────────────────────────────────────── */}
            {activeTab === 'quota' && <AdminQuotaPanel users={users} stats={stats} />}

            {/* ─── TAB: COLLECTIONS ──────────────────────────────────────────────── */}
            {activeTab === 'collections' && <AdminCollectionManager />}

            {/* ─── TAB: REVIEWS ──────────────────────────────────────────────────── */}
            {activeTab === 'reviews' && <AdminReviewTable />}

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
              <AdminOrderModal setSelectedOrder={setSelectedOrder} selectedOrder={selectedOrder} handleUpdateOrderStatus={handleUpdateOrderStatus} handleConfirmManualPayment={handleConfirmManualPayment} handleUpdateRefund={handleUpdateRefund} />
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
                handleRemoveImage={handleRemoveImage}
                handleSaveProduct={handleSaveProduct}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </AdminGuard>
  );
}
