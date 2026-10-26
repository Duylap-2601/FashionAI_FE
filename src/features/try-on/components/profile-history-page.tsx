'use client';

import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountConfirmDialog,
  AccountStatePanel,
  accountButtonClassName,
  accountFocusRing,
  accountInputClassName,
} from '@/features/profile/components/account-ui';
import { useDeleteTryOnHistory, useTryOnHistory } from '@/features/try-on/hooks/useTryOn';
import { fetchTryOnImage } from '@/features/try-on/services/queries';
import type { TryOnResult } from '@/features/try-on/types/try-on';
import { cn } from '@/lib/utils';
import { Check, Download, ExternalLink, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

type CategoryFilter = 'ALL' | 'UPPER' | 'LOWER' | 'FULL_BODY';

// Giá trị `category` do backend lưu (GarmentCategory).
const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'UPPER', label: 'Áo' },
  { id: 'LOWER', label: 'Quần & váy' },
  { id: 'FULL_BODY', label: 'Đồ liền' },
];

const LAYER_LABELS: Record<string, string> = {
  OUTER: 'Lớp ngoài',
  INNER: 'Lớp trong',
  BASE: 'Áo trong',
  BOTTOM: 'Phần dưới',
};

function categoryLabel(category?: string | null) {
  const value = (category || '').toUpperCase();
  if (value.includes('UPPER')) return 'Áo';
  if (value.includes('LOWER')) return 'Quần & váy';
  if (value.includes('FULL_BODY')) return 'Đồ liền';
  return 'Trang phục';
}

function getGarmentsLabel(item: TryOnResult) {
  if (Array.isArray(item.garments) && item.garments.length > 0) {
    return item.garments
      .map((garment) => (garment.layerRole && LAYER_LABELS[garment.layerRole.toUpperCase()]) || categoryLabel(garment.category))
      .join(' + ');
  }
  return categoryLabel(item.category);
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TryOnHistoryPage() {
  const { history, isLoading, isError, refetch } = useTryOnHistory();
  const { deleteHistoryItem, deleteBulkItems, isDeleting, isBulkDeleting } = useDeleteTryOnHistory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const query = searchTerm.trim().toLowerCase();
  const filteredHistory = history.filter((item) => {
    const productName = item.product?.name || '';
    const matchesSearch = !query || productName.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'ALL' || (item.category || '').toUpperCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const isFiltered = query.length > 0 || selectedCategory !== 'ALL';
  const allVisibleSelected = filteredHistory.length > 0 && filteredHistory.every((item) => selectedItems.has(item.id));

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedItems(allVisibleSelected ? new Set() : new Set(filteredHistory.map((item) => item.id)));
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const ids = pendingDelete;
    const onSuccess = () => {
      toast.success(ids.length > 1 ? `Đã xoá ${ids.length} kết quả` : 'Đã xoá kết quả');
      setSelectedItems((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setPendingDelete(null);
    };
    const onError = () => toast.error('Không xoá được. Vui lòng thử lại.');
    if (ids.length === 1) deleteHistoryItem(ids[0], { onSuccess, onError });
    else deleteBulkItems(ids, { onSuccess, onError });
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetchTryOnImage(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'try-on-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Lỗi CORS thì mở ảnh ở tab mới để người dùng tự lưu.
      window.open(url, '_blank');
    }
  };

  const iconButton = cn(
    'flex h-9 w-9 items-center justify-center border border-landing-line text-landing-obsidian/80 transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:opacity-50',
    accountFocusRing,
  );

  return (
    <AccountShell
      title="Lịch sử thử đồ"
      description="Ảnh kết quả từ Thử đồ AI bằng ảnh. Ảnh chụp trong phiên thử trực tiếp không được lưu ở đây."
      actions={
        <div className="relative w-full md:w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" strokeWidth={1.75} aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm theo tên sản phẩm"
            placeholder="Tìm theo tên sản phẩm…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(accountInputClassName, 'pl-9 [&::-webkit-search-cancel-button]:appearance-none')}
          />
        </div>
      }
    >
      <div role="group" aria-label="Lọc theo loại" className="no-scrollbar mb-6 flex gap-6 overflow-x-auto border-b border-landing-line">
        {CATEGORY_TABS.map((tab) => {
          const selected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                'relative h-11 shrink-0 whitespace-nowrap text-sm transition-colors',
                selected ? 'font-medium text-landing-oxblood after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-landing-oxblood' : 'text-landing-obsidian/70 hover:text-landing-oxblood',
                accountFocusRing,
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {selectedItems.size > 0 ? (
        <div className="sticky top-[73px] z-20 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-landing-line bg-landing-paper px-4 py-3 md:mx-0 md:border-x" role="status">
          <p className="text-sm text-landing-obsidian">
            Đã chọn <span className="font-mono">{selectedItems.size}</span> kết quả
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedItems(new Set())} className={accountButtonClassName('outline', 'sm')}>
              Bỏ chọn
            </button>
            <button type="button" onClick={() => setPendingDelete(Array.from(selectedItems))} disabled={isBulkDeleting} className={accountButtonClassName('danger', 'sm')}>
              Xoá đã chọn
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((key) => <div key={key} className="aspect-[3/4] animate-pulse bg-landing-taupe/30" />)}
        </div>
      ) : isError ? (
        <AccountStatePanel
          tone="error"
          title="Không tải được lịch sử"
          description="Kiểm tra kết nối rồi thử lại."
          action={<button type="button" onClick={() => refetch()} className={accountButtonClassName('outline')}>Thử lại</button>}
        />
      ) : filteredHistory.length === 0 ? (
        <AccountStatePanel
          title={isFiltered ? 'Không có kết quả khớp' : 'Chưa có lịch sử thử đồ'}
          description={isFiltered ? 'Đổi từ khóa hoặc loại trang phục.' : 'Kết quả Thử đồ AI bằng ảnh sẽ được lưu ở đây.'}
          action={
            isFiltered ? (
              <button type="button" onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); }} className={accountButtonClassName('outline')}>
                Xem tất cả
              </button>
            ) : (
              <Link href="/try-on" className={accountButtonClassName('primary')}>
                Mở phòng thử
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs text-landing-muted">
              <span className="font-mono text-landing-obsidian">{filteredHistory.length}</span> kết quả
            </p>
            <button type="button" onClick={toggleSelectAll} className={cn('text-xs text-landing-obsidian underline-offset-4 hover:text-landing-oxblood hover:underline', accountFocusRing)}>
              {allVisibleSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
            {filteredHistory.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const productName = item.product?.name || 'Trang phục đã thử';
              return (
                <li key={item.id} className="min-w-0">
                  <div className={cn('relative aspect-[3/4] overflow-hidden border bg-landing-ivory', isSelected ? 'border-landing-oxblood' : 'border-landing-line')}>
                    <Image src={item.resultUrl} alt={`Kết quả thử ${productName}`} fill sizes="(max-width: 768px) 50vw, 300px" unoptimized className="object-cover" />
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={`Chọn kết quả ${productName}`}
                      onClick={() => toggleSelect(item.id)}
                      className={cn(
                        'absolute left-2 top-2 flex h-7 w-7 items-center justify-center border transition-colors',
                        isSelected ? 'border-landing-oxblood bg-landing-oxblood text-landing-paper' : 'border-landing-line bg-landing-paper/90 text-transparent hover:text-landing-muted',
                        accountFocusRing,
                      )}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                  <p className="mt-3 flex items-baseline justify-between gap-3">
                    <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-brass-ink">{getGarmentsLabel(item)}</span>
                    <span className="shrink-0 font-mono text-[11px] text-landing-muted">{formatDate(item.createdAt)}</span>
                  </p>
                  <p className="product-name-line mt-1 line-clamp-1 text-landing-obsidian">{productName}</p>
                  <div className="mt-3 flex gap-2">
                    <a href={item.resultUrl} target="_blank" rel="noopener noreferrer" aria-label={`Mở ảnh kết quả ${productName}`} className={iconButton}>
                      <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                    </a>
                    <button type="button" onClick={() => handleDownload(item.resultUrl, `${productName.replace(/\s+/g, '-')}-tryon.png`)} aria-label={`Tải ảnh ${productName}`} className={iconButton}>
                      <Download className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button type="button" onClick={() => setPendingDelete([item.id])} disabled={isDeleting} aria-label={`Xoá kết quả ${productName}`} className={cn(iconButton, 'hover:border-destructive hover:text-destructive')}>
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <AccountConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title={pendingDelete && pendingDelete.length > 1 ? `Xoá ${pendingDelete.length} kết quả?` : 'Xoá kết quả này?'}
        description="Ảnh kết quả sẽ bị xoá khỏi lịch sử và không khôi phục được."
        confirmLabel="Xoá"
        isPending={isDeleting || isBulkDeleting}
        onConfirm={confirmDelete}
      />
    </AccountShell>
  );
}
