'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Search,
  Zap,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { ChatSession } from '@/types/chat';
import { UserQuota } from '@/hooks/useQuota';

interface SessionSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  quota?: UserQuota;
  onClose?: () => void;
  isLoading?: boolean;
}

export function SessionSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  quota,
  onClose,
  isLoading = false,
}: SessionSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtered and grouped sessions
  const groupedSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? sessions.filter((s) => (s.title || '').toLowerCase().includes(query))
      : sessions;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 7 * 86400000;

    const groups: { label: string; items: ChatSession[] }[] = [
      { label: 'Hôm nay', items: [] },
      { label: 'Hôm qua', items: [] },
      { label: '7 ngày qua', items: [] },
      { label: 'Cũ hơn', items: [] },
    ];

    filtered.forEach((sess) => {
      const sessDate = sess.updatedAt ? new Date(sess.updatedAt).getTime() : now.getTime();
      if (sessDate >= today) {
        groups[0].items.push(sess);
      } else if (sessDate >= yesterday) {
        groups[1].items.push(sess);
      } else if (sessDate >= sevenDaysAgo) {
        groups[2].items.push(sess);
      } else {
        groups[3].items.push(sess);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [sessions, searchQuery]);

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title || 'Cuộc trò chuyện mới');
  };

  const handleSaveRename = (sessionId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  // Quota Calculations
  const quotaUsed = quota?.used ?? 0;
  const quotaLimit = quota?.limit ?? 50;
  const isUnlimited = Boolean(quota?.unlimited || quota?.tier?.toLowerCase() === 'vip');
  const quotaRemaining = isUnlimited ? null : Math.max(0, quotaLimit - quotaUsed);
  const quotaPercent = isUnlimited ? 0 : Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));
  const isNearLimit = quotaPercent >= 85;

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-neutral-200/80 select-none">
      
      {/* Header with New Chat Button */}
      <div className="p-4 border-b border-neutral-100 space-y-3">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            if (onClose) onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-navy hover:bg-brand-navy/90 active:scale-[0.99] text-white rounded-xl font-bold text-body-sm transition-all shadow-xs group cursor-pointer"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          <span>Cuộc trò chuyện mới</span>
        </button>

        {/* Search filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm đoạn chat..."
            className="w-full pl-8 pr-3 py-2 text-body-sm bg-neutral-50 border border-neutral-200/70 rounded-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-brand-navy/60 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Session list area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 no-scrollbar">
        {isLoading ? (
          <div className="space-y-2.5 px-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-neutral-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : groupedSessions.length === 0 ? (
          <div className="text-center py-10 px-4">
            <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-body-sm text-neutral-500 font-medium">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có đoạn chat nào'}
            </p>
            <p className="text-[12px] text-neutral-400 mt-1">
              Bắt đầu trò chuyện để lưu lại lịch sử
            </p>
          </div>
        ) : (
          groupedSessions.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                {group.label}
              </div>

              <div className="space-y-0.5">
                {group.items.map((sess) => {
                  const isActive = sess.id === currentSessionId;
                  const isEditing = editingId === sess.id;
                  const isConfirming = confirmDeleteId === sess.id;

                  return (
                    <div
                      key={sess.id}
                      onClick={() => {
                        if (!isEditing && !isConfirming) {
                          onSelectSession(sess.id);
                          if (onClose) onClose();
                        }
                      }}
                      className={`group/item relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#5D1C34]/10 text-brand-navy font-semibold'
                          : 'hover:bg-neutral-100 text-neutral-700 font-medium'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#5D1C34] rounded-r-full" />
                      )}

                      {/* Title or Edit Input */}
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveRename(sess.id, e)}
                          className="flex items-center gap-1.5 w-full mr-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            autoFocus
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveRename(sess.id)}
                            className="flex-1 px-2 py-1 text-body-sm bg-white border border-brand-navy rounded-md focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="p-1 text-green-700 hover:bg-green-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <MessageSquare
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[#5D1C34]' : 'text-neutral-400 group-hover/item:text-neutral-600'
                            }`}
                          />
                          <span className="text-body-sm truncate block">
                            {sess.title || 'Cuộc trò chuyện mới'}
                          </span>
                        </div>
                      )}

                      {/* Action buttons (Rename / Delete) */}
                      {!isEditing && (
                        <div
                          className={`flex items-center gap-1 shrink-0 ${
                            isConfirming
                              ? 'opacity-100'
                              : 'opacity-0 group-hover/item:opacity-100 transition-opacity'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isConfirming ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                              <span className="text-[11px] font-bold text-red-700 px-1">Xóa?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteSession(sess.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1 text-neutral-500 hover:bg-neutral-200 rounded transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              {onRenameSession && (
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(sess, e)}
                                  title="Đổi tên"
                                  className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-md transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(sess.id)}
                                title="Xóa đoạn chat"
                                className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Quota Card */}
      <div className="p-3.5 border-t border-neutral-200/80 bg-neutral-50/70">
        <div className="p-3 bg-white border border-neutral-200/80 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-gold fill-brand-gold" />
              <span className="text-[12px] font-bold text-neutral-800">Lượt Chatbot</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                quota?.tier?.toLowerCase() === 'vip'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : quota?.tier?.toLowerCase() === 'member'
                  ? 'bg-[#5D1C34]/10 text-[#5D1C34] border border-[#5D1C34]/20'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {quota?.tier || 'Free'}
            </span>
          </div>

          {/* Quota metric */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-neutral-500 font-medium">Hôm nay</span>
            <span className="font-bold text-neutral-900">
              {isUnlimited ? (
                <span className="text-emerald-700">Không giới hạn (VIP)</span>
              ) : (
                <>
                  <strong className={isNearLimit ? 'text-red-600' : 'text-neutral-900'}>
                    {quotaUsed}
                  </strong>
                  <span className="text-neutral-400 font-normal"> / {quotaLimit} lượt</span>
                </>
              )}
            </span>
          </div>

          {/* Progress bar */}
          {!isUnlimited && (
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isNearLimit ? 'bg-red-500' : quotaPercent > 60 ? 'bg-amber-500' : 'bg-brand-navy'
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
