'use client';

import { fmt } from '@/features/admin/services/format';
import type { AdminOrderModalProps } from '@/features/admin/types/admin-order-modal';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import {
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const ORDER_STATUS_OPTIONS: Record<BackendOrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING: 'Chờ xác nhận',
  PAID: 'Đã thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  MEASUREMENT_REVIEW: 'Kiểm tra số đo',
  MEASUREMENT_CONFIRMED: 'Chốt số đo',
  TAILORING: 'Đang may',
  QUALITY_CHECK: 'QC',
  READY_TO_SHIP: 'Sẵn sàng giao',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Hủy đơn',
  RETURN_REQUESTED: 'Yêu cầu hoàn trả',
  RETURN_APPROVED: 'Duyệt hoàn trả',
  RETURNING: 'Đang hoàn trả',
  RETURNED: 'Hoàn trả',
  EXPIRED: 'Hết hạn',
  FAILED: 'Thất bại',
};

const NEXT_ORDER_STATUSES: Partial<Record<BackendOrderStatus, BackendOrderStatus[]>> = {
  PENDING: ['CANCELLED', 'EXPIRED', 'FAILED'],
  PAID: ['MEASUREMENT_REVIEW', 'CANCELLED'],
  MEASUREMENT_REVIEW: ['MEASUREMENT_CONFIRMED', 'CANCELLED'],
  MEASUREMENT_CONFIRMED: ['TAILORING', 'CANCELLED'],
  TAILORING: ['QUALITY_CHECK'],
  QUALITY_CHECK: ['READY_TO_SHIP', 'TAILORING'],
  READY_TO_SHIP: ['CANCELLED'],
  SHIPPING: ['RETURN_REQUESTED', 'RETURNING', 'RETURNED'],
  DELIVERED: ['COMPLETED', 'RETURN_REQUESTED', 'RETURNING', 'RETURNED'],
  COMPLETED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURN_APPROVED', 'RETURNING', 'RETURNED', 'CANCELLED'],
  RETURN_APPROVED: ['RETURNING', 'RETURNED'],
  RETURNING: ['RETURNED'],
};

export function AdminOrderModal({ setSelectedOrder, selectedOrder, handleUpdateOrderStatus, handleConfirmManualPayment, handleUpdateRefund, handleCreateShipment }: AdminOrderModalProps) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [refundNote, setRefundNote] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const createShipmentAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const isPending = selectedOrder.status === 'PENDING';
  const refundRequired = selectedOrder.refundStatus === 'REQUIRED' || selectedOrder.refundStatus === 'PROCESSING';
  const refundCompleted = selectedOrder.refundStatus === 'COMPLETED';
  const statusOptions = [selectedOrder.status, ...(NEXT_ORDER_STATUSES[selectedOrder.status] ?? [])];
  const canCreateShipment = selectedOrder.status === 'READY_TO_SHIP' && selectedOrder.paymentStatus === 'PAID' && !selectedOrder.shipment;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      createShipmentAbortRef.current?.abort();
    };
  }, []);

  const onConfirmManualPayment = async () => {
    if (!note.trim()) {
      toast.error('Vui lòng nhập ghi chú xác nhận.');
      return;
    }
    setSubmitting(true);
    try {
      await handleConfirmManualPayment(selectedOrder.orderCode, note.trim(), note.trim());
      setNote('');
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirmRefund = async () => {
    if (!refundNote.trim()) {
      toast.error('Vui lòng nhập ghi chú xác nhận hoàn tiền.');
      return;
    }
    setRefundSubmitting(true);
    try {
      await handleUpdateRefund(selectedOrder.id, refundNote.trim(), refundNote.trim());
      setRefundNote('');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus: BackendOrderStatus) => {
    handleUpdateOrderStatus(selectedOrder.id, newStatus);
  };

  const onCreateShipment = async () => {
    if (creatingShipment) return;
    createShipmentAbortRef.current?.abort();

    const controller = new AbortController();
    createShipmentAbortRef.current = controller;
    setCreatingShipment(true);

    try {
      await handleCreateShipment(selectedOrder.id, controller.signal);
    } finally {
      if (createShipmentAbortRef.current === controller) {
        createShipmentAbortRef.current = null;
      }
      if (mountedRef.current) {
        setCreatingShipment(false);
      }
    }
  };

  return (
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
            <p className="text-body-sm text-neutral-600 mt-1">Trạng thái: {selectedOrder.paymentStatus || '—'}</p>
            <p className="text-body-sm font-bold text-brand-navy mt-1">Tổng tiền: {fmt(selectedOrder.total)}</p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Vận chuyển</p>
            {selectedOrder.shipment ? (
              <div className="text-body-sm text-neutral-700 space-y-1">
                <p>Provider: <span className="font-semibold">{selectedOrder.shipment.provider}</span></p>
                <p>Mã GHN: <span className="font-mono font-semibold">{selectedOrder.shipment.providerOrderCode || '—'}</span></p>
                <p>Trạng thái: {selectedOrder.shipment.status}{selectedOrder.shipment.rawStatus ? ` · ${selectedOrder.shipment.rawStatus}` : ''}</p>
                <p>Dự kiến giao: {selectedOrder.shipment.expectedDeliveryTime?.substring(0, 16).replace('T', ' ') || '—'}</p>
                <p>Sync cuối: {selectedOrder.shipment.lastSyncedAt?.substring(0, 16).replace('T', ' ') || '—'}</p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('admin:navigate', { detail: { tab: 'shipments', shipmentCode: selectedOrder.shipment?.providerOrderCode, orderCode: selectedOrder.orderCode } }))}
                  className="mt-2 text-brand-navy font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Xem trong tab Vận đơn
                </button>
              </div>
            ) : (
              <div className="text-body-sm text-neutral-600">
                <p>Đơn chưa có vận đơn.</p>
                {canCreateShipment ? (
                  <button
                    onClick={onCreateShipment}
                    disabled={creatingShipment}
                    className="mt-3 h-9 px-4 rounded-lg bg-brand-navy text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
                  >
                    {creatingShipment ? 'Đang tạo...' : 'Tạo vận đơn GHN'}
                  </button>
                ) : (
                  <p className="mt-2 text-label-sm text-neutral-500">Chỉ tạo vận đơn khi đơn sẵn sàng giao và đã thanh toán.</p>
                )}
              </div>
            )}
          </div>

          {refundCompleted && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-body-sm font-semibold text-emerald-800">Đã hoàn tiền cho khách</p>
            </div>
          )}

          {refundRequired && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-body-sm font-semibold text-amber-800 mb-2">Cần hoàn tiền cho khách</p>
              <p className="text-label-sm text-amber-700 mb-3">
                Đơn đã bị hủy sau khi khách đã thanh toán. Sau khi admin chuyển khoản hoàn lại tiền, ghi chú lại để lưu vết.
              </p>
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Ghi chú xác nhận đã hoàn tiền (ví dụ: đã chuyển khoản ngày ... qua ...)"
                  value={refundNote}
                  onChange={e => setRefundNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 text-body-sm resize-none"
                />
                <button
                  onClick={onConfirmRefund}
                  disabled={refundSubmitting}
                  className="h-9 rounded-lg bg-amber-600 text-white text-body-sm font-semibold hover:bg-amber-700 disabled:opacity-50 border-0 cursor-pointer"
                >
                  {refundSubmitting ? 'Đang xác nhận...' : 'Xác nhận đã hoàn tiền'}
                </button>
              </div>
            </div>
          )}

          {isPending && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-body-sm font-semibold text-amber-800 mb-2">Xác nhận thanh toán thủ công</p>
              <p className="text-label-sm text-amber-700 mb-3">
                Dùng khi khách đã chuyển khoản và đã nhận được tiền nhưng hệ thống chưa tự cập nhật trạng thái.
              </p>
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Ghi chú xác nhận (ví dụ: đã nhận tiền qua sao kê ngày ...)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 text-body-sm resize-none"
                />
                <button
                  onClick={onConfirmManualPayment}
                  disabled={submitting}
                  className="h-9 rounded-lg bg-amber-600 text-white text-body-sm font-semibold hover:bg-amber-700 disabled:opacity-50 border-0 cursor-pointer"
                >
                  {submitting ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền'}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-body-sm font-semibold text-neutral-700 mb-2">Trạng thái đơn hàng</label>
            <select
              value={selectedOrder.status}
              onChange={e => handleStatusChange(e.target.value as BackendOrderStatus)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-300"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{ORDER_STATUS_OPTIONS[status]}</option>
              ))}
            </select>
            {isPending && (
              <p className="text-label-sm text-neutral-500 mt-1">
                Đơn đang chờ thanh toán chỉ có thể hủy, hoặc xác nhận thanh toán thủ công ở trên khi đã nhận được tiền.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
