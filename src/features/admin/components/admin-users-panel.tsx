'use client';

import type { AdminUsersPanelProps } from '@/features/admin/types/admin-users-panel';

export function AdminUsersPanel({ users, setSelectedUser }: AdminUsersPanelProps) {
  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">
      <div className="shrink-0">
        <h1 className="text-heading-h2 font-bold text-neutral-900">Quản lý người dùng</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Xem thông tin và thay đổi tier / vai trò</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-neutral-50 z-10 shadow-2xs">
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-label-sm font-semibold uppercase">
                <th className="px-6 py-3 bg-neutral-50">Thành viên</th>
                <th className="px-4 py-3 bg-neutral-50">Email</th>
                <th className="px-4 py-3 bg-neutral-50">Tier</th>
                <th className="px-4 py-3 text-right bg-neutral-50">Try-On</th>
                <th className="px-4 py-3 bg-neutral-50">Trạng thái</th>
                <th className="px-6 py-3 bg-neutral-50"></th>
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
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-bold capitalize ${u.tier === 'VIP' ? 'bg-amber-100 text-amber-700' : u.tier === 'MEMBER' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                      {u.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-neutral-700">{u.tryOns} lượt</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold ${u.isVerified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
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
  );
}
