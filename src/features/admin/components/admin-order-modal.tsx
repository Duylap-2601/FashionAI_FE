'use client';

import { fmt } from '@/features/admin/services/format';
import type { AdminOrderModalProps } from '@/features/admin/types/admin-order-modal';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import {
  X
} from 'lucide-react';
import { motion } from 'motion/react';

export function AdminOrderModal({ setSelectedOrder, selectedOrder, handleUpdateOrderStatus }: AdminOrderModalProps) {
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
            <p className="text-body-sm font-bold text-brand-navy mt-1">Tổng tiền: {fmt(selectedOrder.total)}</p>
          </div>

          <div>
            <label className="block text-body-sm font-semibold text-neutral-700 mb-2">Trạng thái đơn hàng</label>
            <select
              value={selectedOrder.status}
              onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value as BackendOrderStatus)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-300"
            >
              <option value="PENDING">Chờ xác nhận</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="MEASUREMENT_REVIEW">Kiểm tra số đo</option>
              <option value="MEASUREMENT_CONFIRMED">Chốt số đo</option>
              <option value="TAILORING">Đang may</option>
              <option value="QUALITY_CHECK">QC</option>
              <option value="READY_TO_SHIP">Sẵn sàng giao</option>
              <option value="SHIPPING">Đang giao hàng</option>
              <option value="DELIVERED">Đã giao hàng</option>
              <option value="CANCELLED">Hủy đơn</option>
              <option value="RETURNED">Hoàn trả</option>
            </select>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
