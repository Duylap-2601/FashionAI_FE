'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, Users, ShoppingBag,
  Settings, LogOut, TrendingUp, Sparkles,
  CreditCard, Crown, ArrowUpRight, ArrowDownRight,
  Save, ExternalLink, Bell, Search, Filter,
  Eye, Pencil, Trash2, ChevronUp, ChevronDown, X,
  CheckCircle2, XCircle, Clock, Truck, RotateCcw, Copy,
  Ban, ShieldCheck, Mail, Phone, Calendar, MapPin, RefreshCw,
  AlertTriangle, ChevronRight
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useNotificationStore } from '@/store/notificationStore';
import type { BackendOrderStatus } from '@/hooks/useOrders';

type AdminPage = 'dashboard' | 'products' | 'users' | 'orders' | 'quota';

type GarmentCategory = 'UPPER' | 'LOWER' | 'FULL_BODY';
type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
type UserTier = 'FREE' | 'MEMBER' | 'VIP';
type UserRole = 'USER' | 'ADMIN';

interface AdminProductImage {
  id: string;
  imageUrl: string;
  isMain?: boolean;
}

interface AdminProduct {
  id: string;
  name: string;
  category: GarmentCategory;
  price: number;
  status: ProductStatus;
  image: string;
  garmentUrl?: string;
  images?: (AdminProductImage | string)[];
  description?: string;
  material?: string;
  color?: string;
  colors?: { name: string; hex: string }[];
  stock?: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  role: UserRole;
  isVerified: boolean;
  joinDate: string;
  tryOns: number;
  orders: number;
  spent: number;
}

interface AdminOrder {
  id: string;
  code: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: BackendOrderStatus;
  date: string;
  payment: string;
  address?: string;
  phone?: string;
}

interface AdminStats {
  userCount: number;
  productCount: number;
  orderCount: number;
  tryOnCount: number;
  tryOnToday: number;
  stylistCount: number;
  totalRevenue: number;
}

const CATEGORY_LABEL: Record<GarmentCategory, string> = {
  UPPER: 'Áo',
  LOWER: 'Quần / Váy',
  FULL_BODY: 'Toàn thân',
};

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', 'Free'];

const PRODUCT_STATUS_CFG: Record<ProductStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Đang bán', cls: 'bg-green-50 text-green-700 border border-green-200' },
  DRAFT: { label: 'Bản nháp', cls: 'bg-neutral-100 text-neutral-600 border border-neutral-200' },
  ARCHIVED: { label: 'Ngừng bán', cls: 'bg-red-50 text-red-600 border border-red-200' },
};

const ORDER_STATUS_CFG: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
  PENDING: { label: 'Chờ xác nhận', cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  PAID: { label: 'Đã thanh toán', cls: 'bg-blue-50 text-blue-700 border border-blue-200', icon: CheckCircle2 },
  CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-blue-50 text-blue-700 border border-blue-200', icon: CheckCircle2 },
  SHIPPING: { label: 'Đang giao', cls: 'bg-brand-navy/8 text-brand-navy border border-brand-navy/20', icon: Truck },
  DELIVERED: { label: 'Đã giao', cls: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
  RETURNED: { label: 'Hoàn trả', cls: 'bg-neutral-100 text-neutral-600 border border-neutral-300', icon: RotateCcw },
  EXPIRED: { label: 'Hết hạn', cls: 'bg-neutral-100 text-neutral-500 border border-neutral-300', icon: XCircle },
  FAILED: { label: 'Thất bại', cls: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
};

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminPage>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
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

interface ProductImageItem {
  id: string;
  imageId?: string;
  url: string;
  isMain?: boolean;
  file?: File;
  isExisting?: boolean;
}

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
      const res = await api.delete(`/products/${editingProduct.id}/images/${itemToRemove.imageId}`);
      toast.dismiss(deletingToast);
      toast.success('Xóa ảnh sản phẩm thành công');

      const updatedProd = res.data?.data || res.data;
      if (updatedProd && Array.isArray(updatedProd.images)) {
        // Cập nhật editingProduct
        setEditingProduct(prev => prev ? ({
          ...prev,
          garmentUrl: updatedProd.garmentUrl || prev.garmentUrl,
          images: updatedProd.images,
        }) : prev);

        // Chuyển đổi images mới từ backend
        const mappedBackendImages: ProductImageItem[] = updatedProd.images.map((img: any, i: number) => {
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
    } catch (e: any) {
      toast.dismiss(deletingToast);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
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
        const rawImages: any[] = Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : product.image
          ? [{ id: '', imageUrl: product.image, isMain: true }]
          : product.garmentUrl
          ? [{ id: '', imageUrl: product.garmentUrl, isMain: true }]
          : [];
        return rawImages.map((img: any, i: number) => {
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
      const res = await api.get('/products', { params: { limit: 100 } });
      const list = (Array.isArray(res.data) ? res.data : res.data?.items || []) as any[];
      setProducts(list.map((p) => {
        const rawImages: any[] = Array.isArray(p.images) ? p.images : [];
        const normalizedImages: AdminProductImage[] = rawImages.map((img: any, idx: number) => {
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
      const res = await api.get('/orders/all', { params: { limit: 100 } });
      const list = (Array.isArray(res.data) ? res.data : res.data?.items || []) as any[];
      setOrders(list.map((o) => {
        const ship = o.shippingInfo;
        return {
          id: o.id,
          code: `#${o.orderCode}`,
          customer: ship?.name || o.user?.name || 'Khách hàng',
          email: o.user?.email || ship?.phone || '',
          items: o.items?.length || 1,
          total: Number(o.amount),
          status: o.status as BackendOrderStatus,
          date: o.createdAt?.substring(0, 10),
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
      const res = await api.get('/users', { params: { limit: 100 } });
      const list = (Array.isArray(res.data) ? res.data : res.data?.items || []) as any[];
      setUsers(list.map((u) => ({
        id: u.id,
        name: u.name || 'Người dùng',
        email: u.email,
        tier: (u.tier || 'FREE') as UserTier,
        role: (u.role || 'USER') as UserRole,
        isVerified: Boolean(u.isVerified),
        joinDate: u.createdAt?.substring(0, 10),
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
      const res = await api.get('/admin/stats');
      setStats(res.data as AdminStats);
    } catch (e) {
      console.warn('Backend API stats fetch failed.', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    Promise.all([fetchProducts(), fetchOrders(), fetchUsers(), fetchStats()])
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, [fetchProducts, fetchOrders, fetchUsers, fetchStats]);

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
        await api.put(`/products/${editingProduct.id}`, {
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
            await api.post(`/products/${editingProduct.id}/images`, imageForm, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch {
            // Fallback: upload từng ảnh nếu backend nhận single file
            for (const file of newFiles) {
              const singleForm = new FormData();
              singleForm.append('image', file);
              await api.post(`/products/${editingProduct.id}/images`, singleForm, {
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

        await api.post('/products', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Tạo sản phẩm mới thành công');
      }
      closeProductEditor();
      await fetchProducts();
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Xóa sản phẩm thành công');
      await fetchProducts();
    } catch (e) {
      toast.error('Không thể xóa sản phẩm này.');
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: BackendOrderStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status } : null);
      toast.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (e) {
      toast.error('Không thể cập nhật trạng thái đơn hàng.');
      console.error(e);
    }
  };

  const handleUpdateUser = async (id: string, patch: Partial<Pick<AdminUser, 'tier' | 'role'>>) => {
    try {
      const body: Record<string, string> = {};
      if (patch.tier) body.tier = patch.tier;
      if (patch.role) body.role = patch.role;
      await api.patch(`/users/${id}`, body);
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
            { id: 'users', label: 'Người dùng', icon: Users },
            { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
            { id: 'quota', label: 'Cài đặt Quota', icon: Settings },
          ] as { id: AdminPage; label: string; icon: LucideIcon }[]).map(item => {
            const IconComponent = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSearchQuery(''); }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-body-sm font-medium transition-all text-left w-full border-0 cursor-pointer ${
                  active ? 'bg-white text-brand-navy shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/8 bg-transparent'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                {item.label}
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
               activeTab === 'users' ? 'Quản lý người dùng' :
               activeTab === 'orders' ? 'Quản lý đơn hàng' : 'Cài đặt Quota'}
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
                Promise.all([fetchProducts(), fetchOrders(), fetchUsers(), fetchStats()]).finally(() => setIsLoading(false));
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
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-heading-h2 font-bold text-neutral-900">Tổng quan kinh doanh</h1>
                <p className="text-body-sm text-neutral-500 mt-1">Theo dõi doanh thu, trạng thái đơn hàng, kho sản phẩm và thành viên</p>
              </div>
              <button
                onClick={() => { setIsLoading(true); Promise.all([fetchProducts(), fetchOrders(), fetchUsers(), fetchStats()]).finally(() => setIsLoading(false)); }}
                className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-label-sm font-bold border-0 cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Làm mới
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Doanh thu */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-neutral-500 font-medium">Doanh thu đã thanh toán</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[26px] font-bold text-neutral-900">{fmt(totalRevenue)}</span>
                  <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
                    <span>Giá trị TB: <strong className="text-neutral-700">{avgOrderValue > 0 ? fmt(avgOrderValue) : '0đ'}</strong>/đơn</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> Đã thu</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Đơn hàng */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-neutral-500 font-medium">Tổng đơn hàng</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[26px] font-bold text-neutral-900">{totalOrders.toLocaleString('vi-VN')}</span>
                  <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
                    <span>{pendingOrders > 0 ? <strong className="text-amber-600 font-bold">{pendingOrders} đơn chờ duyệt</strong> : '0 đơn chờ duyệt'}</span>
                    <span className="text-neutral-600 font-medium">{deliveredOrders} đã giao</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Sản phẩm trong kho */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-neutral-500 font-medium">Sản phẩm trong kho</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[26px] font-bold text-neutral-900">{totalProducts.toLocaleString('vi-VN')}</span>
                  <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
                    <span className="text-green-600 font-medium">{activeProducts} đang bán</span>
                    {outOfStockCount > 0 ? (
                      <span className="text-red-500 font-semibold">{outOfStockCount} hết hàng</span>
                    ) : (
                      <span className="text-neutral-400">Đủ tồn kho</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 4: Người dùng đăng ký */}
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-neutral-500 font-medium">Người dùng đăng ký</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[26px] font-bold text-neutral-900">{totalUsers.toLocaleString('vi-VN')}</span>
                  <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
                    <span className="text-brand-gold font-semibold">{memberUsers + vipUsers} hội viên VIP/Member</span>
                    <span className="text-neutral-400">{users.filter(u => u.isVerified).length} đã xác thực</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Order Status Flow */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-label-sm font-bold text-neutral-800 uppercase tracking-wide">Tiến độ xử lý đơn hàng</h4>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-label-sm font-semibold text-brand-navy hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                >
                  Quản lý đơn hàng <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => setActiveTab('orders')}
                  className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-amber-700 text-label-sm font-semibold mb-1">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Chờ xác nhận</span>
                    <span className="text-body-md font-bold">{pendingOrders}</span>
                  </div>
                  <span className="text-[11px] text-amber-600/80">Cần duyệt & đóng gói</span>
                </div>

                <div
                  onClick={() => setActiveTab('orders')}
                  className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-blue-700 text-label-sm font-semibold mb-1">
                    <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Đang giao hàng</span>
                    <span className="text-body-md font-bold">{shippingOrders}</span>
                  </div>
                  <span className="text-[11px] text-blue-600/80">Đang vận chuyển</span>
                </div>

                <div
                  onClick={() => setActiveTab('orders')}
                  className="p-3 bg-green-50/70 border border-green-200/60 rounded-xl cursor-pointer hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center justify-between text-green-700 text-label-sm font-semibold mb-1">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Đã giao hàng</span>
                    <span className="text-body-md font-bold">{deliveredOrders}</span>
                  </div>
                  <span className="text-[11px] text-green-600/80">Giao thành công</span>
                </div>

                <div
                  onClick={() => setActiveTab('orders')}
                  className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center justify-between text-neutral-700 text-label-sm font-semibold mb-1">
                    <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Đã hủy / Hoàn</span>
                    <span className="text-body-md font-bold">{cancelledOrders}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">Đơn huỷ hoặc trả hàng</span>
                </div>
              </div>
            </div>

            {/* Chart: Revenue Trend */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-body-lg font-bold text-neutral-900">Biến động doanh thu theo thời gian</h3>
                  <p className="text-body-sm text-neutral-500 mt-0.5">Dữ liệu doanh số thực tế tổng hợp theo ngày</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
                    {([7, 14, 30] as const).map(days => (
                      <button
                        key={days}
                        onClick={() => {
                          setChartDays(days);
                          setHoveredPoint(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all border-0 cursor-pointer ${
                          chartDays === days
                            ? 'bg-white text-brand-navy shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-800 bg-transparent'
                        }`}
                      >
                        {days} ngày
                      </button>
                    ))}
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5D1C34] bg-[#5D1C34]/10 px-2.5 py-1.5 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-[#5D1C34]" /> Doanh thu (VNĐ)
                  </span>
                </div>
              </div>
              {renderRevenueChart()}
            </div>

            {/* Two Columns: Recent Orders & Inventory Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recent Orders (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-body-lg font-bold text-neutral-900">Đơn hàng mới nhất</h3>
                    <p className="text-body-sm text-neutral-500 mt-0.5">5 giao dịch phát sinh gần đây</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-label-sm font-semibold text-brand-navy hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                  >
                    Xem tất cả ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-body-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                      <tr>
                        <th className="px-5 py-3">Mã đơn</th>
                        <th className="px-4 py-3">Khách hàng</th>
                        <th className="px-4 py-3 text-right">Tổng tiền</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {orders.slice(0, 5).map(o => {
                        const cfg = ORDER_STATUS_CFG[o.status] || ORDER_STATUS_CFG.PENDING;
                        const Icon = cfg.icon;
                        return (
                          <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-neutral-800 font-mono text-[13px]">{o.code}</td>
                            <td className="px-4 py-3.5">
                              <p className="font-medium text-neutral-900 line-clamp-1">{o.customer}</p>
                              <p className="text-[11px] text-neutral-400">{o.date}</p>
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-brand-navy">{fmt(o.total)}</td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="text-label-sm font-semibold text-brand-navy hover:underline bg-transparent border-0 cursor-pointer"
                              >
                                Chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-neutral-400">Chưa có đơn hàng nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Inventory & Products Status (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-body-lg font-bold text-neutral-900">Tình trạng kho hàng</h3>
                    <p className="text-body-sm text-neutral-500 mt-0.5">Theo dõi số lượng tồn kho sản phẩm</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-label-sm font-semibold text-brand-navy hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                  >
                    Quản lý ({products.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto max-h-[380px]">
                  {products.slice(0, 5).map(p => {
                    const stock = p.stock ?? 0;
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock < 10;
                    return (
                      <div
                        key={p.id}
                        className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                        onClick={() => openProductEditor(p)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-200 shrink-0 border border-neutral-200"
                          />
                          <div className="min-w-0">
                            <p className="text-body-sm font-semibold text-neutral-900 truncate">{p.name}</p>
                            <p className="text-label-sm text-neutral-500">{CATEGORY_LABEL[p.category] || p.category} • {fmt(p.price)}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {isOutOfStock ? 'Hết hàng' : isLowStock ? `Còn ${stock}` : `Kho: ${stock}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {products.length === 0 && (
                    <div className="p-8 text-center text-neutral-400 text-body-sm">Chưa có sản phẩm trong kho</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB: PRODUCTS ──────────────────────────────────────────────────── */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-heading-h2 font-bold text-neutral-900">Danh mục sản phẩm</h1>
                <p className="text-body-sm text-neutral-500 mt-1">Cấu hình phôi ảnh cho tính năng Try-On</p>
              </div>
              <button
                onClick={() => openProductEditor(null)}
                className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-label-sm font-bold border-0 cursor-pointer flex items-center gap-2"
              >
                + Thêm sản phẩm
              </button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-neutral-100 flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="pl-9 pr-4 py-2 border border-neutral-200 rounded-xl bg-white text-body-sm w-64 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                      <th className="px-6 py-3">Sản phẩm</th>
                      <th className="px-4 py-3">Danh mục</th>
                      <th className="px-4 py-3 text-right">Giá bán</th>
                      <th className="px-4 py-3 text-right">Tồn kho</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-6 py-3">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-body-sm">
                    {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-100" />
                              {p.images && p.images.length > 1 && (
                                <span className="absolute -bottom-1 -right-1 bg-brand-navy text-white text-[9px] font-bold px-1 rounded-full border border-white shadow-2xs">
                                  +{p.images.length}
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-neutral-900 line-clamp-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-500">{CATEGORY_LABEL[p.category] || p.category}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-brand-navy">{fmt(p.price)}</td>
                        <td className="px-4 py-3.5 text-right font-medium text-neutral-700">
                          {p.stock ?? 0}
                          {p.stock === 0 && <span className="ml-1 text-red-500">(Hết hàng)</span>}
                          {p.stock !== undefined && p.stock > 0 && p.stock < 10 && <span className="ml-1 text-amber-500">(Sắp hết)</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${PRODUCT_STATUS_CFG[p.status]?.cls || ''}`}>
                            {PRODUCT_STATUS_CFG[p.status]?.label || p.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 flex gap-2">
                          <button
                            onClick={() => openProductEditor(p)}
                            className="w-8 h-8 rounded-lg hover:bg-neutral-100 border-0 bg-transparent flex items-center justify-center text-neutral-500 hover:text-brand-navy cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 border-0 bg-transparent flex items-center justify-center text-neutral-500 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-neutral-400">Chưa có sản phẩm nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: USERS ─────────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-heading-h2 font-bold text-neutral-900">Quản lý người dùng</h1>
              <p className="text-body-sm text-neutral-500 mt-1">Xem thông tin và thay đổi tier / vai trò</p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                      <th className="px-6 py-3">Thành viên</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3 text-right">Try-On</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-body-sm">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold font-sans">
                              {u.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-neutral-950">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-600">{u.email}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-label-sm font-bold capitalize ${
                            u.tier === 'VIP' ? 'bg-amber-100 text-amber-700' : u.tier === 'MEMBER' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {u.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-neutral-700">{u.tryOns} lượt</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${
                            u.isVerified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                          }`}>
                            {u.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                          >
                            Quản lý
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-neutral-400">Chưa có người dùng nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: ORDERS ────────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-heading-h2 font-bold text-neutral-900">Quản lý Đơn hàng</h1>
              <p className="text-body-sm text-neutral-500 mt-1">Theo dõi, kiểm tra thanh toán và chuyển trạng thái vận chuyển</p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                      <th className="px-6 py-3">Mã đơn</th>
                      <th className="px-4 py-3">Khách hàng</th>
                      <th className="px-4 py-3 text-right">Tổng tiền</th>
                      <th className="px-4 py-3">Ngày đặt</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-body-sm">
                    {orders.map(o => {
                      const cfg = ORDER_STATUS_CFG[o.status] || ORDER_STATUS_CFG.PENDING;
                      const Icon = cfg.icon;
                      return (
                        <tr key={o.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-3.5 font-semibold text-neutral-800">{o.code}</td>
                          <td className="px-4 py-3.5">{o.customer}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-brand-navy">{fmt(o.total)}</td>
                          <td className="px-4 py-3.5 text-neutral-500">{o.date}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold ${cfg.cls}`}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-neutral-400">Chưa có đơn hàng nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: QUOTA USAGE ────────────────────────────────────────────────── */}
        {activeTab === 'quota' && (() => {
          // Config per tier (matches backend AI_ACTION_LIMITS)
          const TIER_QUOTA: Record<UserTier, { tryon: number | null; label: string; color: string; bg: string; badge: string }> = {
            FREE:   { tryon: null,  label: 'Free',   color: 'text-neutral-500', bg: 'bg-neutral-100', badge: 'bg-neutral-200 text-neutral-700' },
            MEMBER: { tryon: 10,   label: 'Member', color: 'text-blue-600',    bg: 'bg-blue-50',     badge: 'bg-blue-100 text-blue-700' },
            VIP:    { tryon: 30,   label: 'VIP',    color: 'text-brand-gold',  bg: 'bg-amber-50',    badge: 'bg-amber-100 text-amber-700' },
          };

          const freeUsers   = users.filter(u => u.tier === 'FREE');
          const memberUsers = users.filter(u => u.tier === 'MEMBER');
          const vipUsers    = users.filter(u => u.tier === 'VIP');

          const totalTryOnToday = stats?.tryOnToday ?? 0;
          const totalTryOnAll   = stats?.tryOnCount ?? 0;

          // Top users by try-on count (top 20)
          const topTryOnUsers = [...users]
            .sort((a, b) => b.tryOns - a.tryOns)
            .slice(0, 20);

          const maxTryOns = topTryOnUsers[0]?.tryOns || 1;

          return (
            <div className="flex flex-col gap-8 max-w-[1000px]">
              <div>
                <h1 className="text-heading-h2 font-bold text-neutral-900">Thống kê sử dụng Quota</h1>
                <p className="text-body-sm text-neutral-500 mt-1">Tổng hợp lượt try-on AI và phân bổ theo gói thành viên</p>
              </div>

              {/* ── Stats overview ───────────────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {([
                  { label: 'Try-on hôm nay', value: totalTryOnToday, icon: Sparkles, color: 'text-brand-gold', bg: 'bg-amber-50' },
                  { label: 'Tổng try-on mọi thời gian', value: totalTryOnAll, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Tài khoản MEMBER', value: memberUsers.length, icon: Crown, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Tài khoản VIP', value: vipUsers.length, icon: ShieldCheck, color: 'text-brand-gold', bg: 'bg-amber-50' },
                ] as const).map(card => {
                  const CardIcon = card.icon;
                  return (
                    <div key={card.label} className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 flex flex-col gap-3">
                      <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                        <CardIcon className={`w-4.5 h-4.5 ${card.color}`} />
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString('vi-VN')}</div>
                        <div className="text-label-sm text-neutral-500 mt-0.5">{card.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Tier config table (read-only reference) ──────────────── */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <h2 className="text-body-sm font-bold text-neutral-800">Cấu hình Quota theo Gói</h2>
                  <span className="ml-auto text-label-xs text-neutral-400 italic">Cấu hình backend — chỉ xem</span>
                </div>
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-500 text-label-xs uppercase tracking-wide">
                      <th className="px-6 py-3 text-left font-semibold">Gói</th>
                      <th className="px-6 py-3 text-center font-semibold">Số tài khoản</th>
                      <th className="px-6 py-3 text-center font-semibold">Try-On / ngày</th>
                      <th className="px-6 py-3 text-center font-semibold">AI Stylist / ngày</th>
                      <th className="px-6 py-3 text-center font-semibold">Chatbot / ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      { tier: 'FREE'   as UserTier, tryon: '—', stylist: '—',  chat: '10',       count: freeUsers.length },
                      { tier: 'MEMBER' as UserTier, tryon: '10', stylist: '10', chat: 'Unlimited', count: memberUsers.length },
                      { tier: 'VIP'    as UserTier, tryon: '30', stylist: '30', chat: 'Unlimited', count: vipUsers.length },
                    ]).map((row, i) => {
                      const cfg = TIER_QUOTA[row.tier];
                      return (
                        <tr key={row.tier} className={`border-t border-neutral-100 ${i % 2 === 1 ? 'bg-neutral-50/50' : ''}`}>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-label-xs font-bold ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-neutral-800">{row.count.toLocaleString('vi-VN')}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold ${row.tryon === '—' ? 'text-neutral-400' : 'text-brand-navy'}`}>{row.tryon}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold ${row.stylist === '—' ? 'text-neutral-400' : 'text-brand-navy'}`}>{row.stylist}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold ${row.chat === 'Unlimited' ? 'text-green-600' : row.chat === '—' ? 'text-neutral-400' : 'text-brand-navy'}`}>{row.chat}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Top users by try-on usage ────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <h2 className="text-body-sm font-bold text-neutral-800">Top người dùng Try-On nhiều nhất</h2>
                  <span className="ml-auto text-label-xs text-neutral-400 italic">Tổng lịch sử</span>
                </div>
                {topTryOnUsers.length === 0 ? (
                  <div className="px-6 py-12 text-center text-neutral-400 text-body-sm">
                    Chưa có dữ liệu try-on
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {topTryOnUsers.map((u, idx) => {
                      const cfg = TIER_QUOTA[u.tier];
                      const dailyLimit = cfg.tryon;
                      const pct = dailyLimit ? Math.min(100, Math.round((u.tryOns / maxTryOns) * 100)) : Math.round((u.tryOns / maxTryOns) * 100);
                      return (
                        <div key={u.id} className="px-6 py-3.5 flex items-center gap-4">
                          {/* Rank */}
                          <span className={`w-6 text-center text-label-xs font-bold shrink-0 ${idx < 3 ? 'text-brand-gold' : 'text-neutral-400'}`}>
                            {idx + 1}
                          </span>
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center shrink-0 text-brand-navy font-bold text-xs uppercase">
                            {u.name.charAt(0)}
                          </div>
                          {/* Name + email */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-body-sm font-semibold text-neutral-800 truncate">{u.name}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                            </div>
                            <span className="text-label-xs text-neutral-400 truncate block">{u.email}</span>
                          </div>
                          {/* Progress bar */}
                          <div className="hidden sm:flex flex-col items-end gap-1 min-w-[140px]">
                            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-navy rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-label-xs text-neutral-500">{u.tryOns.toLocaleString('vi-VN')} lượt</span>
                          </div>
                          {/* Count badge */}
                          <span className="sm:hidden text-body-sm font-bold text-brand-navy shrink-0">{u.tryOns}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Tier distribution breakdown ──────────────────────────── */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
                <h2 className="text-body-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-400" />
                  Phân bổ người dùng theo Gói
                </h2>
                <div className="flex flex-col gap-3">
                  {([
                    { tier: 'VIP'    as UserTier, count: vipUsers.length },
                    { tier: 'MEMBER' as UserTier, count: memberUsers.length },
                    { tier: 'FREE'   as UserTier, count: freeUsers.length },
                  ]).map(row => {
                    const cfg = TIER_QUOTA[row.tier];
                    const pct = users.length > 0 ? Math.round((row.count / users.length) * 100) : 0;
                    return (
                      <div key={row.tier} className="flex items-center gap-3">
                        <span className={`w-16 text-label-xs font-bold shrink-0 ${cfg.badge} px-2 py-0.5 rounded-full text-center`}>{cfg.label}</span>
                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${row.tier === 'VIP' ? 'bg-brand-gold' : row.tier === 'MEMBER' ? 'bg-blue-500' : 'bg-neutral-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-label-xs text-neutral-600 font-semibold w-20 text-right shrink-0">
                          {row.count} người ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

      </main>

      {/* ─── DRAWER: USER DETAIL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-full max-w-[440px] bg-white shadow-2xl flex flex-col z-10"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
                <h2 className="text-body-lg font-bold text-neutral-900">Chi tiết người dùng</h2>
                <button onClick={() => setSelectedUser(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 border-0 bg-transparent cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-[20px]">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{selectedUser.name}</h3>
                    <p className="text-body-sm text-neutral-500">{selectedUser.email}</p>
                    <p className="text-label-sm text-neutral-400 mt-0.5">Tham gia: {selectedUser.joinDate}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-body-sm font-semibold text-neutral-700 mb-1.5">Phân quyền (Tier)</label>
                    <select
                      value={selectedUser.tier}
                      onChange={e => handleUpdateUser(selectedUser.id, { tier: e.target.value as UserTier })}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300"
                    >
                      <option value="FREE">Free Account</option>
                      <option value="MEMBER">Gold Member</option>
                      <option value="VIP">VIP Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-body-sm font-semibold text-neutral-700 mb-1.5">Vai trò hệ thống</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateUser(selectedUser.id, { role: 'USER' })}
                        className={`flex-1 py-2 rounded-lg font-semibold text-label-sm border cursor-pointer ${
                          selectedUser.role === 'USER' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-neutral-200 text-neutral-600'
                        }`}
                      >
                        USER
                      </button>
                      <button
                        onClick={() => handleUpdateUser(selectedUser.id, { role: 'ADMIN' })}
                        className={`flex-1 py-2 rounded-lg font-semibold text-label-sm border cursor-pointer ${
                          selectedUser.role === 'ADMIN' ? 'bg-brand-navy/10 text-brand-navy border-brand-navy/30' : 'bg-white border-neutral-200 text-neutral-600'
                        }`}
                      >
                        ADMIN
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 flex flex-col gap-2 text-body-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Lượt Try-On</span>
                      <span className="font-semibold text-neutral-800">{selectedUser.tryOns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Số đơn hàng</span>
                      <span className="font-semibold text-neutral-800">{selectedUser.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Đã chi tiêu</span>
                      <span className="font-semibold text-brand-navy">{fmt(selectedUser.spent)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DRAWER: ORDER DETAIL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-full max-w-[480px] bg-white shadow-2xl flex flex-col z-10"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
                <div>
                  <h2 className="text-body-lg font-bold text-neutral-900">Chi tiết đơn hàng</h2>
                  <p className="text-label-sm text-neutral-500 font-mono">{selectedOrder.code}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 border-0 bg-transparent cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div>
                  <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Thông tin giao nhận</p>
                  <p className="text-body-sm font-medium text-neutral-800">Khách hàng: {selectedOrder.customer}</p>
                  <p className="text-body-sm text-neutral-600 mt-1">Điện thoại: {selectedOrder.phone || '—'}</p>
                  <p className="text-body-sm text-neutral-600 mt-1">Địa chỉ: {selectedOrder.address || '—'}</p>
                  <p className="text-body-sm text-neutral-600 mt-1">Email: {selectedOrder.email || '—'}</p>
                </div>

                <div>
                  <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Thanh toán</p>
                  <p className="text-body-sm text-neutral-600">Phương thức: {selectedOrder.payment || '—'}</p>
                  <p className="text-body-sm font-bold text-brand-navy mt-1">Tổng tiền: {fmt(selectedOrder.total)}</p>
                </div>

                <div>
                  <label className="block text-body-sm font-semibold text-neutral-700 mb-2">Trạng thái vận chuyển</label>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value as BackendOrderStatus)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300"
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="SHIPPING">Đang giao hàng</option>
                    <option value="DELIVERED">Đã giao hàng</option>
                    <option value="CANCELLED">Hủy đơn</option>
                    <option value="RETURNED">Hoàn trả</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DIALOG: PRODUCT EDITOR ─────────────────────────────────────────── */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeProductEditor}
            />
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto p-6 relative z-10 animate-in zoom-in-95 duration-200"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 className="text-body-lg font-bold text-neutral-900 mb-4">
                {editingProduct.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Blazer Nam Cổ Điển..."
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Giá bán *</label>
                    <input
                      type="number"
                      value={editingProduct.price || ''}
                      onChange={e => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      placeholder="850000"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Tồn kho *</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.stock ?? 0}
                      onChange={e => setEditingProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      placeholder="100"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Danh mục *</label>
                    <select
                      value={editingProduct.category || 'UPPER'}
                      onChange={e => setEditingProduct(prev => ({ ...prev, category: e.target.value as GarmentCategory }))}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300"
                    >
                      <option value="UPPER">Áo (UPPER)</option>
                      <option value="LOWER">Quần / Váy (LOWER)</option>
                      <option value="FULL_BODY">Toàn thân (FULL_BODY)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Trạng thái</label>
                    <select
                      value={editingProduct.status || 'ACTIVE'}
                      onChange={e => setEditingProduct(prev => ({ ...prev, status: e.target.value as ProductStatus }))}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300"
                    >
                      <option value="ACTIVE">Đang bán</option>
                      <option value="DRAFT">Bản nháp</option>
                      <option value="ARCHIVED">Ngừng bán</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-body-sm font-medium text-neutral-700">Màu sắc</label>
                    <button
                      type="button"
                      onClick={addColor}
                      className="text-label-sm font-semibold text-brand-navy hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      + Thêm màu
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(editingProduct.colors || []).map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={c.hex || '#000000'}
                          onChange={e => updateColor(i, { hex: e.target.value })}
                          className="w-10 h-10 rounded-lg border border-neutral-300 p-0.5 cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={c.name}
                          onChange={e => updateColor(i, { name: e.target.value })}
                          placeholder="Tên màu (vd: Burgundy)"
                          className="flex-1 h-10 px-3 rounded-lg border border-neutral-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeColor(i)}
                          className="w-9 h-9 rounded-lg hover:bg-red-50 border-0 bg-transparent flex items-center justify-center text-neutral-400 hover:text-red-600 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(editingProduct.colors || []).length === 0 && (
                      <p className="text-label-sm text-neutral-400">Chưa có màu nào. Nhấn "Thêm màu" để bổ sung.</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Hình thức sản xuất</label>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[13px] text-neutral-700 font-medium flex items-center gap-2">
                    <span className="text-semantic-success font-bold">✓ May đo theo số đo (Made-to-Measure)</span>
                    <span className="text-neutral-400 text-[12px]">(Khách hàng cung cấp số đo tại Profile)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-body-sm font-medium text-neutral-700">
                      Ảnh sản phẩm {editingProduct.id ? '' : '*'} ({productImages.length} ảnh)
                    </label>
                    <label className="text-label-sm font-semibold text-brand-navy hover:underline cursor-pointer flex items-center gap-1">
                      <span>+ Thêm ảnh</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={e => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleSelectImages(e.target.files);
                          }
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5 mb-2">
                    {productImages.map((img, idx) => {
                      const isPrimary = Boolean(img.isMain) || (productImages.every(p => !p.isMain) && idx === 0);
                      const isOnlyImage = productImages.length === 1;

                      return (
                        <div
                          key={img.id}
                          className={`relative group rounded-xl border bg-neutral-50 overflow-hidden aspect-square flex items-center justify-center shadow-2xs transition-all ${
                            isPrimary ? 'border-brand-navy ring-2 ring-brand-navy/30' : 'border-neutral-200'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`Ảnh ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Primary Badge or Set Primary Button */}
                          {isPrimary ? (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-navy/95 text-white text-[9px] font-bold rounded shadow-xs">
                              Ảnh chính
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute top-1 left-1 px-1.5 py-0.5 bg-white/90 hover:bg-white text-neutral-800 text-[9px] font-semibold rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0"
                              title="Đặt làm ảnh chính"
                            >
                              Đặt chính
                            </button>
                          )}

                          {/* Remove Image Button */}
                          <button
                            type="button"
                            disabled={isOnlyImage}
                            onClick={() => handleRemoveImage(img)}
                            className={`absolute top-1 right-1 w-6 h-6 rounded flex items-center justify-center transition-opacity border-0 cursor-pointer ${
                              isOnlyImage
                                ? 'bg-neutral-400/80 text-white cursor-not-allowed opacity-0 group-hover:opacity-60'
                                : 'bg-red-600/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100'
                            }`}
                            title={isOnlyImage ? 'Sản phẩm phải có ít nhất 1 ảnh' : 'Xóa ảnh này'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add More Dropzone / Card */}
                    <label className="border-2 border-dashed border-neutral-300 hover:border-brand-navy/60 hover:bg-neutral-100/50 rounded-xl aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-neutral-400 hover:text-brand-navy">
                      <Package className="w-5 h-5" />
                      <span className="text-[11px] font-semibold">+ Thêm</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={e => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleSelectImages(e.target.files);
                          }
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-label-sm text-neutral-400">
                    JPG, PNG hoặc WEBP · Tải lên nhiều ảnh cùng lúc · Ảnh đầu tiên là ảnh đại diện (nhấn "Đặt chính" để đổi).
                  </p>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Chất liệu vải (Material)</label>
                  <input
                    type="text"
                    value={editingProduct.material || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, material: e.target.value }))}
                    placeholder="VD: 100% Cotton Oxford, Premium Wool pha cashmere..."
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#5D1C34]/20 focus:border-[#5D1C34]"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Mô tả</label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={e => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả ngắn về sản phẩm..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    onClick={closeProductEditor}
                    className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 transition-colors cursor-pointer bg-white"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    className="px-5 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl font-bold border-0 cursor-pointer shadow-sm"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </div>
    </AdminGuard>
  );
}
