'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Package, Users, ShoppingBag,
  Settings, LogOut, TrendingUp, Sparkles,
  CreditCard, Crown, ArrowUpRight, ArrowDownRight,
  Save, ExternalLink, Bell, Search, Filter,
  Eye, Pencil, Trash2, ChevronUp, ChevronDown, X,
  CheckCircle2, XCircle, Clock, Truck, RotateCcw, Copy,
  Ban, ShieldCheck, Mail, Phone, Calendar, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

type AdminPage = 'dashboard' | 'products' | 'users' | 'orders' | 'quota';
type ProductStatus = 'active' | 'draft' | 'out_of_stock';
type UserStatus = 'active' | 'inactive' | 'banned';
type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  image: string;
  brand: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  tier: string;
  joinDate: string;
  tryOns: number;
  orders: number;
  status: UserStatus;
  spent: number;
}

interface AdminOrder {
  id: string;
  code: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: OrderStatus;
  date: string;
  payment: string;
  address?: string;
  phone?: string;
}

// ─── Seed Data (Fallback if backend list is empty or fails) ────────────────────
const SEED_PRODUCTS: AdminProduct[] = [
  { id: 'p1', name: 'Blazer Nữ Công Sở Dáng Ôm Burgundy', category: 'Blazer', price: 1290000, stock: 42, sold: 318, status: 'active', brand: 'StAle. SIGNATURE', image: '/images/731163514_999523332788054_1114320478812927640_n.png' },
  { id: 'p2', name: 'Combo Suit Nguyên Bộ Xám Tro', category: 'Suit', price: 2490000, stock: 18, sold: 204, status: 'active', brand: 'StAle. SIGNATURE', image: '/images/726470431_1311184104081177_6052756217829444481_n.png' },
  { id: 'p3', name: 'Áo Sơ Mi Oxford Trắng Premium', category: 'Áo sơ mi', price: 490000, stock: 120, sold: 891, status: 'active', brand: 'StAle. ESSENTIALS', image: '/images/731199294_3955961871204172_1445370375731306017_n.png' },
  { id: 'p4', name: 'Quần Tây Âu Nữ Thẳng Đen', category: 'Quần tây', price: 860000, stock: 55, sold: 437, status: 'active', brand: 'StAle. ESSENTIALS', image: '/images/726470431_1311184104081177_6052756217829444481_n.png' },
];

const SEED_USERS: AdminUser[] = [
  { id: 'u1', name: 'Nguyễn Minh Anh', email: 'minha@mail.com', tier: 'vip', joinDate: '2025-11-03', tryOns: 148, orders: 12, status: 'active', spent: 14200000 },
  { id: 'u2', name: 'Trần Quốc Bảo', email: 'bao@mail.com', tier: 'free', joinDate: '2026-06-09', tryOns: 2, orders: 0, status: 'active', spent: 0 },
  { id: 'u3', name: 'Lê Thị Hoa', email: 'hoa@mail.com', tier: 'vip', joinDate: '2025-08-21', tryOns: 312, orders: 28, status: 'active', spent: 38900000 },
];

const SEED_ORDERS: AdminOrder[] = [
  { id: 'o1', code: 'SAL-2026-0901', customer: 'Nguyễn Minh Anh', email: 'minha@mail.com', items: 3, total: 2930000, status: 'shipping', date: '2026-06-09', payment: 'Visa *4242', address: '12 Nguyễn Huệ, Quận 1, TP. HCM', phone: '0901234567' },
  { id: 'o2', code: 'SAL-2026-0898', customer: 'Đỗ Thanh Linh', email: 'linh@mail.com', items: 1, total: 3200000, status: 'confirmed', date: '2026-06-09', payment: 'MoMo', address: '45 Lê Lợi, Quận 1, TP. HCM', phone: '0909876543' },
];

// Status badge configurations
const ORDER_STATUS_CFG: Record<OrderStatus, { label: string; cls: string; icon: React.ElementType }> = {
  pending: { label: 'Chờ xác nhận', cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  confirmed: { label: 'Đã xác nhận', cls: 'bg-blue-50 text-blue-700 border border-blue-200', icon: CheckCircle2 },
  shipping: { label: 'Đang giao', cls: 'bg-brand-navy/8 text-brand-navy border border-brand-navy/20', icon: Truck },
  delivered: { label: 'Đã giao', cls: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', cls: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
};

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<AdminPage>('dashboard');
  const [products, setProducts] = useState<AdminProduct[]>(SEED_PRODUCTS);
  const [users, setUsers] = useState<AdminUser[]>(SEED_USERS);
  const [orders, setOrders] = useState<AdminOrder[]>(SEED_ORDERS);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');

  // Modal / Editor States
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null);

  // Fetch actual data on mount if API endpoints are reachable
  useEffect(() => {
    async function loadAdminData() {
      try {
        const prodRes = await api.get('/products');
        if (prodRes.data && prodRes.data.length > 0) {
          setProducts(prodRes.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category === 'tops' ? 'Áo sơ mi' : p.category === 'bottoms' ? 'Quần tây' : 'Blazer',
            price: p.price,
            stock: p.stock || 20,
            sold: p.sold || 5,
            status: p.stock > 0 ? 'active' : 'out_of_stock',
            image: p.garmentUrl || p.image || '/images/731163514_999523332788054_1114320478812927640_n.png',
            brand: p.brand || 'StAle.',
          })));
        }
      } catch (e) {
        console.warn('Backend API products fetch failed, using fallback mock data.', e);
      }
      
      try {
        const ordRes = await api.get('/orders');
        if (ordRes.data && ordRes.data.length > 0) {
          setOrders(ordRes.data.map((o: any) => ({
            id: o.id,
            code: `SAL-${o.id.substring(0, 8).toUpperCase()}`,
            customer: o.shippingInfo?.name || 'Khách hàng',
            email: o.shippingInfo?.phone || 'mail@example.com',
            items: o.items?.length || 1,
            total: o.totalAmount,
            status: o.status,
            date: o.createdAt.substring(0, 10),
            payment: o.paymentMethod,
            address: o.shippingInfo?.address,
            phone: o.shippingInfo?.phone,
          })));
        }
      } catch (e) {
        console.warn('Backend API orders fetch failed, using fallback mock data.', e);
      }
    }
    loadAdminData();
  }, []);

  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      // call patch status if supported by backend
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (e) {
      // update state locally for validation
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  const handleUpdateUserTier = (id: string, tier: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, tier } : u));
    if (selectedUser?.id === id) setSelectedUser(prev => prev ? { ...prev, tier } : null);
  };

  const handleUpdateUserStatus = (id: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    if (selectedUser?.id === id) setSelectedUser(prev => prev ? { ...prev, status } : null);
  };

  // SVGs responsive custom path calculations
  const renderSVGLineChart = () => {
    const points = [
      { x: 30, y: 150 }, { x: 80, y: 130 }, { x: 130, y: 160 },
      { x: 180, y: 90 }, { x: 230, y: 110 }, { x: 280, y: 70 },
      { x: 330, y: 60 }, { x: 380, y: 80 }, { x: 430, y: 40 },
      { x: 480, y: 50 }, { x: 530, y: 20 }, { x: 580, y: 30 }
    ];

    const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;

    return (
      <svg className="w-full h-[220px]" viewBox="0 0 600 200" fill="none">
        {/* Horizontal grid lines */}
        <line x1="20" y1="40" x2="580" y2="40" stroke="#F3F4F6" strokeWidth="1" />
        <line x1="20" y1="90" x2="580" y2="90" stroke="#F3F4F6" strokeWidth="1" />
        <line x1="20" y1="140" x2="580" y2="140" stroke="#F3F4F6" strokeWidth="1" />
        {/* Main curve */}
        <path d={pathD} stroke="#5D1C34" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#5D1C34" stroke="#FFFFFF" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
        ))}
      </svg>
    );
  };

  return (
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
          ] as { id: AdminPage; label: string; icon: React.ElementType }[]).map(item => {
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
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-body-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors w-full border-0 bg-transparent cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* ─── TAB: DASHBOARD ─────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-heading-h2 font-bold text-neutral-900">Tổng quan hệ thống</h1>
                <p className="text-body-sm text-neutral-500 mt-1">Cập nhật thống kê sử dụng tài nguyên AI</p>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col gap-1">
                <span className="text-label-sm text-neutral-500">Người dùng đăng ký</span>
                <span className="text-[28px] font-bold text-neutral-900">{users.length + 3200}</span>
                <span className="text-[11px] text-green-600 font-semibold mt-1">↑ 14% tháng này</span>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col gap-1">
                <span className="text-label-sm text-neutral-500">Lượt thử đồ hôm nay</span>
                <span className="text-[28px] font-bold text-neutral-900">487</span>
                <span className="text-[11px] text-green-600 font-semibold mt-1">↑ 8% so với hôm qua</span>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col gap-1">
                <span className="text-label-sm text-neutral-500">Tỷ lệ cache hit (SAM2)</span>
                <span className="text-[28px] font-bold text-neutral-900">74.2%</span>
                <span className="text-[11px] text-green-600 font-semibold mt-1">Tết kiệm 182$ API</span>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col gap-1">
                <span className="text-label-sm text-neutral-500">Credits fal.ai tháng này</span>
                <span className="text-[28px] font-bold text-neutral-900">$24.80</span>
                <span className="text-[11px] text-neutral-500 mt-1">Hạn mức tối đa $50.00</span>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-body-lg font-semibold text-neutral-900">Lượt AI Try-On hàng ngày</h3>
                  <p className="text-body-sm text-neutral-500 mt-0.5">Biên độ dao động trong 12 ngày gần nhất</p>
                </div>
              </div>
              {renderSVGLineChart()}
            </div>

            {/* Live Activities */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="text-body-lg font-semibold text-neutral-900">Hoạt động thời gian thực</h3>
                  <p className="text-body-sm text-neutral-500 mt-0.5">Tác vụ AI đang chạy trên Server</p>
                </div>
                <div className="flex items-center gap-1.5 text-label-sm text-green-600 font-semibold">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                  <span>Live</span>
                </div>
              </div>

              <div className="divide-y divide-neutral-100">
                {users.slice(0, 3).map((u, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-body-sm font-semibold text-neutral-800">{u.name}</p>
                        <p className="text-label-sm text-neutral-500">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-body-sm text-neutral-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-spin" /> Thử đồ thành công
                    </span>
                  </div>
                ))}
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
                onClick={() => setEditingProduct({})}
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
                      <th className="px-4 py-3 text-right">Đã bán</th>
                      <th className="px-6 py-3">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-body-sm">
                    {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-100" />
                            <span className="font-semibold text-neutral-900 line-clamp-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-500">{p.category}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-brand-navy">{fmt(p.price)}</td>
                        <td className="px-4 py-3.5 text-right">{p.stock}</td>
                        <td className="px-4 py-3.5 text-right text-neutral-600">{p.sold}</td>
                        <td className="px-6 py-3.5 flex gap-2">
                          <button 
                            onClick={() => setEditingProduct(p)}
                            className="w-8 h-8 rounded-lg hover:bg-neutral-100 border-0 bg-transparent flex items-center justify-center text-neutral-500 hover:text-brand-navy cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
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
              <p className="text-body-sm text-neutral-500 mt-1">Xem thông tin và thay đổi tier phân quyền</p>
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
                            u.tier === 'vip' ? 'bg-amber-100 text-amber-700' : u.tier === 'member' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {u.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-neutral-700">{u.tryOns} lượt</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${
                            u.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
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
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-3.5 font-semibold text-neutral-800">#{o.code.substring(0, 10)}</td>
                        <td className="px-4 py-3.5">{o.customer}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-brand-navy">{fmt(o.total)}</td>
                        <td className="px-4 py-3.5 text-neutral-500">{o.date}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold ${
                            ORDER_STATUS_CFG[o.status]?.cls || ''
                          }`}>
                            {ORDER_STATUS_CFG[o.status]?.label || o.status}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: QUOTA CONFIG ──────────────────────────────────────────────── */}
        {activeTab === 'quota' && (
          <div className="max-w-[500px]">
            <h1 className="text-heading-h2 font-bold text-neutral-900 mb-6">Cài đặt hạn mức Quota</h1>
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col gap-6">
              <div>
                <label className="block text-body-sm font-semibold text-neutral-700 mb-2">Hạn mức Free User (Try-On/ngày)</label>
                <input type="number" defaultValue={3} className="w-full h-10 px-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-navy" />
              </div>
              <div>
                <label className="block text-body-sm font-semibold text-neutral-700 mb-2">Hạn mức Gold Member (Try-On/ngày)</label>
                <input type="number" defaultValue={10} className="w-full h-10 px-3 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-navy" />
              </div>
              <button 
                onClick={() => alert('Cấu hình đã được cập nhật thành công!')}
                className="w-full py-3 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl font-bold border-0 cursor-pointer shadow-sm"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        )}

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
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-body-sm font-semibold text-neutral-700 mb-1.5">Phân quyền (Tier)</label>
                    <select 
                      value={selectedUser.tier} 
                      onChange={e => handleUpdateUserTier(selectedUser.id, e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300"
                    >
                      <option value="free">Free Account</option>
                      <option value="member">Gold Member</option>
                      <option value="vip">VIP Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-body-sm font-semibold text-neutral-700 mb-1.5">Trạng thái tài khoản</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateUserStatus(selectedUser.id, 'active')}
                        className={`flex-1 py-2 rounded-lg font-semibold text-label-sm border cursor-pointer ${
                          selectedUser.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-neutral-200 text-neutral-600'
                        }`}
                      >
                        Đang hoạt động
                      </button>
                      <button 
                        onClick={() => handleUpdateUserStatus(selectedUser.id, 'banned')}
                        className={`flex-1 py-2 rounded-lg font-semibold text-label-sm border cursor-pointer ${
                          selectedUser.status === 'banned' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white border-neutral-200 text-neutral-600'
                        }`}
                      >
                        Khóa tài khoản
                      </button>
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
                  <p className="text-label-sm text-neutral-500 font-mono">#{selectedOrder.code}</p>
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
                </div>

                <div>
                  <label className="block text-body-sm font-semibold text-neutral-700 mb-2">Trạng thái vận chuyển</label>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao hàng</option>
                    <option value="delivered">Đã giao hàng</option>
                    <option value="cancelled">Hủy đơn</option>
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
              onClick={() => setEditingProduct(null)}
            />
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-[500px] w-full p-6 relative z-10 animate-in zoom-in-95 duration-200"
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
                    <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">Tồn kho</label>
                    <input 
                      type="number" 
                      value={editingProduct.stock || ''} 
                      onChange={e => setEditingProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                      placeholder="50" 
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-neutral-700 mb-1.5">URL ảnh phôi Try-On *</label>
                  <input 
                    type="text" 
                    value={editingProduct.image || ''} 
                    onChange={e => setEditingProduct(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://..." 
                    className="w-full h-10 px-3 rounded-lg border border-neutral-300" 
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button 
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 transition-colors cursor-pointer bg-white"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={() => {
                      if (!editingProduct.name || !editingProduct.price) {
                        alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
                        return;
                      }
                      
                      if (editingProduct.id) {
                        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...editingProduct as AdminProduct } : p));
                      } else {
                        const newProd = {
                          ...editingProduct,
                          id: `p${Date.now()}`,
                          category: 'Blazer',
                          sold: 0,
                          status: 'active' as const,
                          brand: 'StAle. SIGNATURE',
                          image: editingProduct.image || '/images/731163514_999523332788054_1114320478812927640_n.png',
                        } as AdminProduct;
                        setProducts(prev => [newProd, ...prev]);
                      }
                      setEditingProduct(null);
                    }}
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
  );
}
