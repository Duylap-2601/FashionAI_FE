'use client';

import React, { useState } from 'react';
import {
  Package, Search, ChevronDown, ChevronRight, ChevronUp,
  Truck, CheckCircle2, Clock, XCircle, RotateCcw,
  MapPin, Phone, Copy, ExternalLink, Sparkles, ShoppingBag, Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { AnimateIn, StaggerContainer, StaggerItem } from '@/components/ui/AnimateIn';
import { motion, AnimatePresence } from 'motion/react';
import { useOrders, useCancelOrder, Order, OrderItem } from '@/hooks/useOrders';
import { useCart } from '@/store/cartStore';
import { WriteReviewModal } from '@/components/reviews/WriteReviewModal';

type OrderStatus = 'PENDING' | 'PAID' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'EXPIRED' | 'FAILED';

const STATUS_CONFIG: Record<string, {
  label: string;
  icon: LucideIcon;
  badge: string;
  step: number;
}> = {
  PENDING:   { label: 'Chờ xác nhận', icon: Clock,        badge: 'bg-amber-50 text-amber-700 border border-amber-200',   step: 0 },
  PAID:      { label: 'Đã thanh toán', icon: CheckCircle2, badge: 'bg-blue-50 text-blue-700 border border-blue-200',       step: 1 },
  CONFIRMED: { label: 'Đã xác nhận',  icon: CheckCircle2, badge: 'bg-blue-50 text-blue-700 border border-blue-200',       step: 1 },
  SHIPPING:  { label: 'Đang giao',    icon: Truck,         badge: 'bg-brand-navy/8 text-brand-navy border border-brand-navy/20', step: 2 },
  DELIVERED: { label: 'Đã giao',      icon: CheckCircle2, badge: 'bg-green-50 text-green-700 border border-green-200',    step: 3 },
  CANCELLED: { label: 'Đã hủy',       icon: XCircle,      badge: 'bg-red-50 text-red-600 border border-red-200',          step: -1 },
  RETURNED:  { label: 'Hoàn trả',     icon: RotateCcw,    badge: 'bg-neutral-100 text-neutral-600 border border-neutral-300', step: -1 },
  EXPIRED:   { label: 'Hết hạn',      icon: XCircle,      badge: 'bg-neutral-100 text-neutral-500 border border-neutral-300', step: -1 },
  FAILED:    { label: 'Thất bại',     icon: XCircle,      badge: 'bg-red-50 text-red-600 border border-red-200',          step: -1 },
};

const FILTER_TABS = [
  { id: 'all',       label: 'Tất cả' },
  { id: 'pending',   label: 'Chờ xác nhận' },
  { id: 'shipping',  label: 'Đang giao' },
  { id: 'delivered', label: 'Đã giao' },
  { id: 'cancelled', label: 'Đã hủy' },
];

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateFull(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

const STEPS = ['Đặt hàng', 'Xác nhận', 'Đang giao', 'Đã nhận'];

function TrackingBar({ status }: { status: string }) {
  const step = STATUS_CONFIG[status]?.step ?? 0;
  if (step < 0) return null;

  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((label, i) => {
        const done = i <= step;
        const active = i === step;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                done
                  ? 'bg-brand-navy border-brand-navy'
                  : 'bg-white border-neutral-300'
              }`}>
                {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${
                active ? 'text-brand-navy' : done ? 'text-neutral-600' : 'text-neutral-400'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-[2px] flex-1 mx-1 mb-4 rounded-full transition-colors ${
                i < step ? 'bg-brand-navy' : 'bg-neutral-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function getProductImage(item: OrderItem) {
  if (item.product?.images) {
    try {
      const parsed = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0].url || parsed[0];
      }
    } catch (e) {
      // Fallback
    }
  }
  return 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=120&h=160&fit=crop&auto=format';
}

function OrderCard({
  order,
  onReviewItem,
}: {
  order: Order;
  onReviewItem?: (item: OrderItem, orderId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { cancelOrder, isCancelling } = useCancelOrder();
  const { addToCart, setIsCartOpen } = useCart();
  const [copied, setCopied] = useState(false);

  const status = order.status || 'PENDING';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  const orderCode = order.id.substring(0, 8).toUpperCase();

  const copyCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCancel = () => {
    if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderCode}?`)) {
      cancelOrder(order.id);
    }
  };

  const handleReorder = () => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach(item => {
      addToCart({
        productId: item.productId,
        name: item.product?.name || 'Sản phẩm công sở',
        price: item.price,
        quantity: item.quantity,
        color: item.color || 'Mặc định',
        image: getProductImage(item),
        variant: `Màu: ${item.color || 'Mặc định'} · May đo`
      });
    });
    setIsCartOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Link href={`/orders/${order.id}`} className="text-body-sm font-semibold text-neutral-900 hover:text-brand-navy hover:underline">
              #{orderCode}
            </Link>
            <button onClick={copyCode} title="Sao chép mã" className="text-neutral-400 hover:text-brand-navy transition-colors">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="text-label-sm text-neutral-400">{fmtDate(order.createdAt)}</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-semibold ${cfg.badge}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-body-md font-bold text-brand-navy">{fmt(order.totalAmount)}</span>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-label-sm font-medium text-neutral-500 hover:text-brand-navy transition-colors font-sans border-0 bg-transparent cursor-pointer"
          >
            Chi tiết {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Items preview (always visible) */}
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="flex -space-x-3">
          {order.items.slice(0, 3).map(item => (
            <img
              key={item.id}
              src={getProductImage(item)}
              alt={item.product?.name || 'Sản phẩm'}
              className="w-12 h-14 rounded-lg object-cover border-2 border-white shadow-sm"
            />
          ))}
          {order.items.length > 3 && (
            <div className="w-12 h-14 rounded-lg bg-neutral-100 border-2 border-white flex items-center justify-center text-label-sm font-semibold text-neutral-500">
              +{order.items.length - 3}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-body-sm font-medium text-neutral-900 truncate">
            {order.items[0]?.product?.name || 'Sản phẩm công sở'}
          </p>
          {order.items.length > 1 && (
            <p className="text-label-sm text-neutral-500">và {order.items.length - 1} sản phẩm khác</p>
          )}
        </div>

        {/* CTA actions */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Link
            href={`/orders/${order.id}`}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg text-label-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Xem trang đơn <ExternalLink className="w-3 h-3" />
          </Link>
          {status === 'DELIVERED' && (
            <Link
              href="/try-on"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy/8 text-brand-navy rounded-lg text-label-sm font-medium hover:bg-brand-navy/12 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Try-On lại
            </Link>
          )}
          {status === 'PENDING' && (
            <button 
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-label-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-55"
            >
              Hủy đơn
            </button>
          )}
          <button
            type="button"
            onClick={handleReorder}
            className="px-3 py-1.5 bg-brand-navy text-white rounded-lg text-label-sm font-semibold hover:bg-brand-navy/90 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3" /> Mua lại
          </button>
        </div>
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 px-5 py-5 flex flex-col gap-6">

              {/* Tracking bar */}
              {STATUS_CONFIG[status]?.step >= 0 && (
                <div>
                  <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Trạng thái vận chuyển</p>
                  <TrackingBar status={status} />
                </div>
              )}

              {/* Items detail */}
              <div>
                <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Sản phẩm</p>
                <div className="flex flex-col gap-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img src={getProductImage(item)} alt={item.product?.name || 'Sản phẩm'} className="w-14 h-18 rounded-lg object-cover border border-neutral-100 shrink-0" style={{ height: 72 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold text-neutral-900 truncate">{item.product?.name || 'Sản phẩm công sở'}</p>
                        <p className="text-label-sm text-neutral-500 mt-0.5">Màu: {item.color || 'Mặc định'} · May đo</p>
                        <p className="text-label-sm text-neutral-500 mt-0.5">x{item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-body-sm font-bold text-brand-navy">{fmt(item.price * item.quantity)}</span>
                        {status === 'DELIVERED' && onReviewItem && (
                          <button
                            type="button"
                            onClick={() => onReviewItem(item, order.id)}
                            className="px-3 py-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-label-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            Đánh giá
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary + Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Địa chỉ nhận hàng</p>
                  <div className="flex flex-col gap-1.5 text-body-sm text-neutral-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <span>{order.shippingInfo?.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>{order.shippingInfo?.phone}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Thanh toán</p>
                  <div className="flex flex-col gap-2 text-body-sm">
                    <div className="flex justify-between text-neutral-600">
                      <span>Phí giao hàng</span>
                      <span>Miễn phí</span>
                    </div>
                    <div className="flex justify-between font-bold text-brand-navy pt-2 border-t border-neutral-100">
                      <span>Tổng cộng</span>
                      <span>{fmt(order.totalAmount)}</span>
                    </div>
                    <p className="text-label-sm text-neutral-500 mt-1">Thanh toán: {order.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-brand-navy/5 rounded-2xl flex items-center justify-center mb-5">
        <ShoppingBag className="w-9 h-9 text-brand-navy/40" />
      </div>
      <h3 className="text-heading-h3 font-semibold text-neutral-900 mb-2">Chưa có đơn hàng nào</h3>
      <p className="text-body-sm text-neutral-500 mb-6 max-w-[280px]">Hãy khám phá bộ sưu tập và đặt đơn hàng đầu tiên của bạn.</p>
      <Link
        href="/products"
        className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-xl text-label-sm font-semibold hover:bg-brand-navy/90 transition-colors"
      >
        Xem sản phẩm <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, isLoading } = useOrders();
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reviewModalItem, setReviewModalItem] = useState<{ item: OrderItem; orderId: string } | null>(null);

  const filtered = orders.filter(o => {
    const status = o.status || 'pending';
    const matchFilter = activeFilter === 'all' || status.toLowerCase() === activeFilter.toLowerCase();
    
    const orderCode = o.id.substring(0, 8).toUpperCase();
    const matchSearch = !search ||
      orderCode.includes(search.toUpperCase()) ||
      o.items.some(i => (i.product?.name || '').toLowerCase().includes(search.toLowerCase()));
    
    return matchFilter && matchSearch;
  });

  const countByStatus = (id: string) => {
    if (id === 'all') return orders.length;
    return orders.filter(o => (o.status || 'pending').toLowerCase() === id.toLowerCase()).length;
  };

  return (
    <div className="min-h-screen bg-brand-cream pb-16 md:pb-12">
      {/* Page header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-heading-h1 font-bold text-brand-navy">Đơn hàng</h1>
              <p className="text-body-sm text-neutral-500 mt-1">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm mã đơn, sản phẩm..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-body-sm focus:outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-6">

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 no-scrollbar">
          {FILTER_TABS.map(tab => {
            const count = countByStatus(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full text-label-sm font-semibold transition-colors border-0 cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-brand-navy text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-navy/30'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyOrders />
        ) : (
          <StaggerContainer className="flex flex-col gap-4">
            {filtered.map(order => (
              <StaggerItem key={order.id}>
                <OrderCard
                  order={order}
                  onReviewItem={(item, orderId) => setReviewModalItem({ item, orderId })}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Modal viết review khi click từ đơn hàng đã nhận */}
      {reviewModalItem && (
        <WriteReviewModal
          isOpen={!!reviewModalItem}
          onClose={() => setReviewModalItem(null)}
          productId={reviewModalItem.item.productId}
          productName={reviewModalItem.item.product?.name || 'Sản phẩm'}
          productImage={getProductImage(reviewModalItem.item)}
          orderId={reviewModalItem.orderId}
        />
      )}
    </div>
  );
}
