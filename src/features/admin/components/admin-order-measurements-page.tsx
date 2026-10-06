'use client';

import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { ORDER_STATUS_CFG } from '@/features/admin/constants/admin-dashboard-page';
import { fmt } from '@/features/admin/services/format';
import { updateOrderStatus } from '@/features/admin/services/mutations';
import { allMeasurementFields } from '@/features/measurements/constants/profile-measurements-page';
import { useUserMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { useOrder } from '@/features/orders/hooks/useOrders';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Package,
  Phone,
  Printer,
  Scissors,
  User,
  UserCheck
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminOrderMeasurementsPage() {
  const params = useParams();
  const id = params?.id as string;

  const { order, isLoading, isError, refetch } = useOrder(id);
  const { measurements: userMeasurements, isLoading: isLoadingUserMeasurements } = useUserMeasurements(
    order?.userId
  );

  const [expandedSnapshots, setExpandedSnapshots] = useState<Record<string, boolean>>({});
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const toggleSnapshot = (itemId: string) => {
    setExpandedSnapshots(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleQuickStatusUpdate = async (newStatus: BackendOrderStatus) => {
    if (!order?.id || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(order.id, { status: newStatus });
      toast.success(`Đã cập nhật trạng thái sang "${ORDER_STATUS_CFG[newStatus]?.label || newStatus}"`);
      refetch();
    } catch {
      toast.error('Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
            <p className="text-body-sm text-neutral-600">Đang tải phiếu may đo...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (isError || !order) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-neutral-100 p-6 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center max-w-md w-full shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-body-lg font-bold text-neutral-900 mb-1">Không tìm thấy đơn hàng</h2>
            <p className="text-body-sm text-neutral-500 mb-6">Mã đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-semibold rounded-xl hover:bg-brand-navy/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Dashboard</span>
            </Link>
          </div>
        </div>
      </AdminGuard>
    );
  }

  const statusCfg = ORDER_STATUS_CFG[order.status] || {
    label: order.status,
    cls: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    icon: FileText,
  };
  const StatusIcon = statusCfg.icon;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans p-4 md:p-8 print:bg-white print:p-0">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* Top Navigation & Actions Bar (Hidden when printing) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-body-sm font-semibold text-neutral-600 hover:text-brand-navy transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Quản lý đơn hàng</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Quick Status Transitions for Tailor Workflow */}
              {order.status === 'MEASUREMENT_REVIEW' && (
                <button
                  type="button"
                  onClick={() => handleQuickStatusUpdate('MEASUREMENT_CONFIRMED')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl hover:bg-purple-800 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chốt số đo (MEASUREMENT_CONFIRMED)</span>
                </button>
              )}

              {order.status === 'MEASUREMENT_CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => handleQuickStatusUpdate('TAILORING')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-700 text-white text-xs font-bold rounded-xl hover:bg-indigo-800 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-xs"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Bắt đầu may (TAILORING)</span>
                </button>
              )}

              {order.status === 'TAILORING' && (
                <button
                  type="button"
                  onClick={() => handleQuickStatusUpdate('QUALITY_CHECK')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-700 text-white text-xs font-bold rounded-xl hover:bg-cyan-800 disabled:opacity-50 transition-colors border-0 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chuyển sang QC</span>
                </button>
              )}

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-brand-navy border border-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-brand-navy" />
                <span>In phiếu may đo</span>
              </button>
            </div>
          </div>

          {/* Main Paper / Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 md:p-8 print:border-none print:shadow-none print:p-0">

            {/* Document Header */}
            <div className="border-b border-neutral-200 pb-6 mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5D1C34] mb-1">
                  <Scissors className="w-4 h-4" />
                  <span>FashionAI Atelier • Phiếu Kỹ Thuật May Đo</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Đơn Hàng #{order.orderCode}
                </h1>
                <p className="text-xs text-neutral-500 font-mono mt-1">Mã hệ thống: {order.id}</p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{statusCfg.label}</span>
                </span>
                <span className="text-xs text-neutral-500">
                  Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Customer & Delivery Information Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-brand-navy" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Khách hàng</p>
                  <p className="text-body-sm font-bold text-neutral-900 truncate">{order.shippingInfo?.name || 'Khách vãng lai'}</p>
                  {order.userId && <p className="text-[11px] text-neutral-500 font-mono">User ID: {order.userId}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-brand-navy" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Liên hệ & Địa chỉ</p>
                  <p className="text-body-sm font-semibold text-neutral-800">{order.shippingInfo?.phone || '—'}</p>
                  <p className="text-xs text-neutral-600 line-clamp-2 mt-0.5">{order.shippingInfo?.address || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-brand-navy" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Ghi chú & Tổng tiền</p>
                  <p className="text-xs text-neutral-700 italic">{order.shippingInfo?.notes || 'Không có ghi chú'}</p>
                  <p className="text-body-sm font-bold text-brand-navy mt-1">Tổng đơn: {fmt(order.totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Main Content Layout: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* LEFT: Order Items & Tailor Garment Measurements (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-purple-700" />
                    <h2 className="text-lg font-bold text-neutral-900">
                      Sản phẩm & Thông số may đo ({order.items?.length || 0} món)
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">Lọc theo loại trang phục</span>
                </div>

                {order.items && order.items.length > 0 ? (
                  <div className="space-y-6">
                    {order.items.map((item, idx) => {
                      const itemId = item.id || `item-${idx}`;
                      const isExpanded = !!expandedSnapshots[itemId];
                      const rawImg = item.product?.images?.[0];
                      const img = typeof rawImg === 'string' ? rawImg : '/images/726470431_1311184104081177_6052756217829444481_n.png';
                      const name = item.productNameSnapshot || item.product?.name || `Trang phục #${item.productId}`;

                      return (
                        <div key={itemId} className="rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-2xs">
                          {/* Item Card Header */}
                          <div className="p-4 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <Image
                                src={img}
                                alt={name}
                                width={56}
                                height={64}
                                className="w-14 h-16 object-cover rounded-xl bg-neutral-200 shrink-0 border border-neutral-200"
                              />
                              <div className="min-w-0">
                                <h3 className="text-body-md font-bold text-neutral-900 truncate">{name}</h3>
                                <div className="flex items-center gap-2.5 text-xs text-neutral-500 mt-1">
                                  <span>Màu: <strong className="text-neutral-800">{item.color || 'Mặc định'}</strong></span>
                                  <span>•</span>
                                  <span>Vải: <strong className="text-neutral-800">{item.fabricSnapshot || 'Tiêu chuẩn'}</strong></span>
                                  <span>•</span>
                                  <span>SL: <strong className="text-brand-navy font-bold">{item.quantity}</strong></span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-body-sm font-bold text-brand-navy">{fmt(item.price * item.quantity)}</span>
                            </div>
                          </div>

                          {/* Garment Measurements Display (Backend-filtered by garment type) */}
                          <div className="p-5">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                                <Scissors className="w-3.5 h-3.5 text-purple-700" />
                                Số đo may đo thành phẩm (measurementDisplay):
                              </span>
                              {item.measurementDisplay && item.measurementDisplay.length > 0 && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                                  {item.measurementDisplay.length} thông số
                                </span>
                              )}
                            </div>

                            {item.measurementDisplay && item.measurementDisplay.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {item.measurementDisplay.map((m) => (
                                  <div
                                    key={m.field}
                                    className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between"
                                  >
                                    <span className="text-[11.5px] font-medium text-neutral-600 mb-1">{m.label}</span>
                                    <span className="text-base font-extrabold text-purple-950 font-mono tracking-tight">
                                      {m.value} <span className="text-xs font-normal text-purple-700">{m.unit}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : item.measurementDisplay && item.measurementDisplay.length === 0 ? (
                              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Chưa đủ dữ liệu số đo bắt buộc cho loại trang phục này. Thợ may cần yêu cầu khách bổ sung số đo.</span>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-400 italic">Không có thông số may đo cho sản phẩm này.</p>
                            )}

                            {/* Raw 16-field snapshot accordion for cross-referencing */}
                            {item.measurementSnapshot && Object.keys(item.measurementSnapshot).length > 0 && (
                              <div className="mt-4 pt-4 border-t border-neutral-100">
                                <button
                                  type="button"
                                  onClick={() => toggleSnapshot(itemId)}
                                  className="w-full flex items-center justify-between text-xs font-semibold text-neutral-600 hover:text-brand-navy py-1 bg-transparent border-0 cursor-pointer"
                                >
                                  <span>Đối chiếu bảng 16 số đo thô ban đầu (measurementSnapshot)</span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {isExpanded && (
                                  <div className="mt-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    {Object.entries(item.measurementSnapshot).map(([key, val]) => {
                                      if (val === null || val === undefined || val === '') return null;
                                      return (
                                        <div key={key} className="bg-white p-2 rounded-lg border border-neutral-200 flex flex-col">
                                          <span className="text-[10.5px] text-neutral-500 font-mono truncate">{key}</span>
                                          <span className="font-bold text-neutral-900 font-mono mt-0.5">{String(val)} cm</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-400 text-body-sm">
                    Đơn hàng không có sản phẩm nào.
                  </div>
                )}
              </div>

              {/* RIGHT: Customer Profile Measurements (Route GET /users/:id/measurements) (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-brand-navy" />
                    <h2 className="text-lg font-bold text-neutral-900">
                      Hồ sơ số đo của khách hàng
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">GET /users/:id/measurements</span>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-4">
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 leading-relaxed">
                    Dữ liệu số đo cá nhân hiện tại lưu trong tài khoản của người dùng. Dùng để đối chiếu khi cần khách cập nhật số đo mới cho đơn hàng.
                  </div>

                  {isLoadingUserMeasurements ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-neutral-500">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-navy" />
                      <span>Đang tải hồ sơ số đo khách hàng...</span>
                    </div>
                  ) : !order.userId ? (
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 italic text-center">
                      Đơn hàng không có mã định danh tài khoản khách hàng (khách vãng lai).
                    </div>
                  ) : userMeasurements && Object.values(userMeasurements).some(v => v !== null && v !== undefined) ? (
                    <div className="space-y-4">
                      {/* Overview group */}
                      <div>
                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Chỉ số tổng quan</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center text-xs">
                            <span className="text-neutral-600">Chiều cao</span>
                            <span className="font-bold text-brand-navy font-mono">
                              {userMeasurements.height ? `${userMeasurements.height} cm` : '—'}
                            </span>
                          </div>
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center text-xs">
                            <span className="text-neutral-600">Cân nặng</span>
                            <span className="font-bold text-brand-navy font-mono">
                              {userMeasurements.weight ? `${userMeasurements.weight} kg` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Measurements List */}
                      <div>
                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Số đo chi tiết</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {allMeasurementFields.filter(f => f.id !== 'height' && f.id !== 'weight').map((field) => {
                            const val = userMeasurements[field.id as keyof typeof userMeasurements];
                            if (val === null || val === undefined) return null;
                            return (
                              <div
                                key={field.id}
                                className="p-2 bg-neutral-50 rounded-lg border border-neutral-200 flex justify-between items-center"
                              >
                                <span className="text-neutral-600">{field.label}:</span>
                                <span className="font-bold text-neutral-900 font-mono">{val} {field.unit}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 italic">
                      Khách hàng chưa cập nhật số đo nào trong hồ sơ cá nhân.
                    </div>
                  )}
                </div>

                {/* Tailor Work Notes Callout */}
                <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Lưu ý dành cho xưởng may</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-amber-800 leading-relaxed">
                    <li>Ưu tiên may theo các thông số trong bảng <strong>measurementDisplay</strong> của từng món.</li>
                    <li>Nếu cần đối chiếu thêm chiều dài phụ hoặc độ cử động, xem bảng 16 số đo thô hoặc hồ sơ cá nhân.</li>
                    <li>Sau khi cắt và hoàn tất rập may, hãy chuyển trạng thái sang <strong>Đang may (TAILORING)</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Document Signature for Print Preview */}
            <div className="hidden print:grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-neutral-300 text-center text-xs text-neutral-600">
              <div>
                <p className="font-bold text-neutral-900 mb-12">Người lập phiếu</p>
                <p className="border-t border-neutral-400 pt-2 w-36 mx-auto">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-neutral-900 mb-12">Thợ cắt / Kỹ thuật</p>
                <p className="border-t border-neutral-400 pt-2 w-36 mx-auto">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-neutral-900 mb-12">Quản lý kiểm tra (QC)</p>
                <p className="border-t border-neutral-400 pt-2 w-36 mx-auto">(Ký và ghi rõ họ tên)</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
