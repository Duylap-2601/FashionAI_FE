'use client';

import { cn } from '@/components/ui/utils';
import type { SessionSidebarProps } from '@/features/chat/types/session-sidebar';
import { ChatSession } from '@/features/chat/types/chat';
import {
  Check,
  Edit2,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const iconButton = `flex h-8 w-8 items-center justify-center rounded-[2px] transition-colors ${focusRing}`;

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
  const tier = quota?.tier?.toLowerCase();
  const isUnlimited = Boolean(quota?.unlimited || tier === 'vip');
  const quotaPercent = isUnlimited ? 0 : Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));
  const isNearLimit = quotaPercent >= 85;

  return (
    <aside className="flex h-full w-full select-none flex-col border-r border-landing-line/70 bg-landing-ivory text-landing-obsidian">

      {/* Header with New Chat Button */}
      <div className="space-y-3 border-b border-landing-line/70 p-4">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            if (onClose) onClose();
          }}
          className={`group flex h-11 w-full items-center justify-center gap-2 rounded-[2px] bg-landing-oxblood text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:bg-landing-oxblood/90 ${focusRing}`}
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90 motion-reduce:transition-none" strokeWidth={1.75} />
          <span>Cuộc trò chuyện mới</span>
        </button>

        {/* Search filter */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-landing-muted" strokeWidth={1.75} aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm đoạn chat"
            aria-label="Tìm đoạn chat"
            className={`h-10 w-full rounded-[2px] border border-landing-line bg-landing-paper/60 pl-8 pr-9 text-sm text-landing-obsidian placeholder:text-landing-muted/70 transition-colors hover:border-landing-brass ${focusRing}`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xoá từ khoá"
              className={cn(iconButton, 'absolute right-0.5 top-1/2 h-9 w-9 -translate-y-1/2 text-landing-muted hover:text-landing-oxblood')}
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      {/* Session list area */}
      <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto py-4">
        {isLoading ? (
          <div className="space-y-2 px-4" aria-busy="true">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-landing-taupe/35 motion-safe:animate-pulse" />
            ))}
          </div>
        ) : groupedSessions.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <MessageSquare className="mx-auto mb-3 h-7 w-7 text-landing-taupe" strokeWidth={1.5} />
            <p className="text-sm font-medium text-landing-obsidian">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có đoạn chat nào'}
            </p>
            <p className="mt-1 text-xs text-landing-muted">
              Bắt đầu trò chuyện để lưu lại lịch sử
            </p>
          </div>
        ) : (
          groupedSessions.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">
                {group.label}
              </p>

              <ul>
                {group.items.map((sess) => {
                  const isActive = sess.id === currentSessionId;
                  const isEditing = editingId === sess.id;
                  const isConfirming = confirmDeleteId === sess.id;

                  return (
                    <li
                      key={sess.id}
                      className={cn(
                        'group/item relative flex items-center transition-colors',
                        isActive
                          ? 'bg-landing-paper before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:bg-landing-oxblood'
                          : 'hover:bg-landing-paper/60',
                      )}
                    >
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveRename(sess.id, e)}
                          className="flex w-full items-center gap-1.5 px-3 py-1.5"
                        >
                          <input
                            type="text"
                            value={editTitle}
                            autoFocus
                            aria-label="Tên đoạn chat"
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleSaveRename(sess.id)}
                            className={`h-9 flex-1 rounded-[2px] border border-landing-oxblood bg-landing-paper px-2 text-sm ${focusRing}`}
                          />
                          <button type="submit" aria-label="Lưu tên" className={`text-landing-sage-ink hover:bg-landing-ivory ${iconButton}`}>
                            <Check className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          aria-current={isActive ? 'true' : undefined}
                          disabled={isConfirming}
                          onClick={() => {
                            onSelectSession(sess.id);
                            if (onClose) onClose();
                          }}
                          className={cn(
                            'flex min-h-11 w-full min-w-0 items-center gap-2.5 py-2 pl-4 pr-3 text-left text-sm transition-[padding] group-focus-within/item:pr-20 group-hover/item:pr-20 [@media(hover:none)]:pr-20',
                            focusRing,
                            'focus-visible:-outline-offset-2',
                            isConfirming && 'pr-28',
                            isActive ? 'font-semibold text-landing-obsidian' : 'text-landing-obsidian/80',
                          )}
                        >
                          <MessageSquare
                            className={`h-4 w-4 shrink-0 ${isActive ? 'text-landing-oxblood' : 'text-landing-muted'}`}
                            strokeWidth={1.75}
                          />
                          <span className="block truncate">
                            {sess.title || 'Cuộc trò chuyện mới'}
                          </span>
                        </button>
                      )}

                      {/* Action buttons (Rename / Delete) */}
                      {!isEditing && (
                        <div
                          className={`absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 ${isConfirming
                            ? 'opacity-100'
                            : 'opacity-0 transition-opacity group-focus-within/item:opacity-100 group-hover/item:opacity-100 [@media(hover:none)]:opacity-100'
                            }`}
                        >
                          {isConfirming ? (
                            <div className="flex items-center gap-1 rounded-[2px] border border-destructive/40 bg-landing-paper p-0.5">
                              <span className="px-1.5 text-[11px] font-semibold text-destructive">Xóa?</span>
                              <button
                                type="button"
                                aria-label="Xác nhận xóa"
                                onClick={() => {
                                  onDeleteSession(sess.id);
                                  setConfirmDeleteId(null);
                                }}
                                className={`bg-destructive text-landing-paper hover:opacity-90 ${iconButton}`}
                              >
                                <Check className="h-3.5 w-3.5" strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                aria-label="Huỷ xóa"
                                onClick={() => setConfirmDeleteId(null)}
                                className={`text-landing-muted hover:text-landing-obsidian ${iconButton}`}
                              >
                                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </button>
                            </div>
                          ) : (
                            <>
                              {onRenameSession && (
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(sess, e)}
                                  title="Đổi tên"
                                  aria-label={`Đổi tên ${sess.title || 'cuộc trò chuyện'}`}
                                  className={`text-landing-muted hover:text-landing-oxblood ${iconButton}`}
                                >
                                  <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(sess.id)}
                                title="Xóa đoạn chat"
                                aria-label={`Xóa ${sess.title || 'cuộc trò chuyện'}`}
                                className={`text-landing-muted hover:text-destructive ${iconButton}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Footer Quota */}
      <div className="border-t border-landing-line/70 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">Lượt chat hôm nay</span>
          <span
            className={cn(
              'rounded-[2px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]',
              tier === 'vip'
                ? 'border-landing-brass text-landing-brass-ink'
                : tier === 'member'
                  ? 'border-landing-oxblood/40 text-landing-oxblood'
                  : 'border-landing-line text-landing-muted',
            )}
          >
            {quota?.tier || 'Free'}
          </span>
        </div>

        <p className="mt-2 font-mono text-sm" aria-live="polite">
          {isUnlimited ? (
            <span className="text-landing-sage-ink">Không giới hạn</span>
          ) : (
            <>
              <span className={isNearLimit ? 'text-destructive' : 'text-landing-obsidian'}>{quotaUsed}</span>
              <span className="text-landing-muted"> / {quotaLimit} lượt</span>
            </>
          )}
        </p>

        {!isUnlimited && (
          <div className="mt-2 h-0.5 w-full overflow-hidden bg-landing-line" aria-hidden="true">
            <div
              className={`h-full transition-[width] duration-300 ${isNearLimit ? 'bg-destructive' : quotaPercent > 60 ? 'bg-landing-brass' : 'bg-landing-oxblood'}`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
