'use client';

import { fmt } from '@/features/admin/services/format';
import type { UserTier } from '@/features/admin/types/admin-dashboard-page';
import type { AdminUserModalProps } from '@/features/admin/types/admin-user-modal';
import {
  X
} from 'lucide-react';
import { motion } from 'motion/react';

export function AdminUserModal({ setSelectedUser, selectedUser, handleUpdateUser }: AdminUserModalProps) {
  return (
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
                  className={`flex-1 py-2 rounded-lg font-semibold text-label-sm border cursor-pointer ${selectedUser.role === 'USER' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-neutral-200 text-neutral-600'
                    }`}
                >
                  USER
                </button>
                <button
                  onClick={() => handleUpdateUser(selectedUser.id, { role: 'ADMIN' })}
                  className={`flex-1 py-2 rounded-lg font-semibold text-label-sm border cursor-pointer ${selectedUser.role === 'ADMIN' ? 'bg-brand-navy/10 text-brand-navy border-brand-navy/30' : 'bg-white border-neutral-200 text-neutral-600'
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
  );
}
