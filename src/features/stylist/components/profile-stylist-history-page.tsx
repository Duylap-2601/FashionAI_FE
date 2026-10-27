'use client';

import { GA_ITEM_LISTS } from '@/features/analytics/constants/ga-item-lists';
import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountConfirmDialog,
  AccountPagination,
  AccountStatePanel,
  accountButtonClassName,
  accountFocusRing,
  accountInputClassName,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { OutfitSuggestionList } from '@/features/stylist/components/outfit-suggestion-list';
import { OCCASION_LABELS } from '@/features/stylist/constants/profile-stylist-history-page';
import { useDeleteStylistHistory, useStylistHistory } from '@/features/stylist/hooks/useStylist';
import type { StylistResult } from '@/features/stylist/types/stylist';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronDown, Search, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

const PAGE_SIZE = 12;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function scoreTone(score: number) {
  if (score >= 80) return { text: 'text-landing-sage-ink', dot: 'bg-landing-sage' };
  if (score >= 60) return { text: 'text-landing-brass-ink', dot: 'bg-landing-brass' };
  return { text: 'text-destructive', dot: 'bg-destructive' };
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={accountLabelClassName}>{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-landing-obsidian/85">{children}</div>
    </div>
  );
}

function StylistCard({ item, onDelete, isDeleting }: { item: StylistResult; onDelete: () => void; isDeleting: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const detailId = `stylist-${item.id}-detail`;

  const score = item.productCompatibilityScore;
  // Lịch sử cũ chưa có bộ phối từ catalog (`outfits` rỗng): hiện gợi ý dạng chữ như trước.
  const legacyOutfits = item.outfits.length === 0 && Array.isArray(item.outfitCombinations) ? item.outfitCombinations : [];
  const colors = Array.isArray(item.colorSuggestions) ? item.colorSuggestions : [];
  const occasion = (item.occasion && OCCASION_LABELS[item.occasion]) || item.occasion || 'Tư vấn phối đồ';
  const hasDetails = Boolean(item.fitRecommendation || item.stylingTips || colors.length > 0 || item.outfits.length > 0 || legacyOutfits.length > 0 || item.product);

  return (
    <article className="border border-landing-line bg-landing-ivory/50">
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="relative flex h-[72px] w-14 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-landing-paper">
              {item.humanImageUrl && !imgError ? (
                <Image src={item.humanImageUrl} alt="Ảnh đã phân tích" fill sizes="56px" unoptimized className="object-cover" onError={() => setImgError(true)} />
              ) : (
                <User className="h-5 w-5 text-landing-muted" strokeWidth={1.5} aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl leading-tight text-landing-obsidian">{occasion}</p>
              <p className="mt-1 font-mono text-[11px] text-landing-muted">{formatDate(item.createdAt)}</p>
              {score != null ? (
                <p className={cn('mt-1.5 inline-flex items-center gap-1.5 text-xs', scoreTone(score).text)}>
                  <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', scoreTone(score).dot)} />
                  Độ hợp <span className="font-mono">{score}/100</span>
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label="Xoá kết quả tư vấn này"
            className={cn('-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center text-landing-muted transition-colors hover:text-destructive disabled:opacity-50', accountFocusRing)}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {item.warnings && item.warnings.length > 0 ? (
          <div className="border-l-2 border-landing-brass bg-landing-paper px-3 py-2 text-xs leading-relaxed text-landing-obsidian">
            <p className="font-medium">Lưu ý</p>
            {item.warnings.map((warning, idx) => <p key={idx} className="mt-0.5 text-landing-muted">{warning}</p>)}
          </div>
        ) : null}

        {(item.personalColor || item.bodyType || item.skinTone) ? (
          <dl className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            {item.personalColor ? <div><dt className={accountLabelClassName}>Màu hợp bạn</dt><dd className="mt-1.5 text-sm leading-relaxed text-landing-obsidian/85">{item.personalColor}</dd></div> : null}
            {item.bodyType ? <div><dt className={accountLabelClassName}>Dáng người</dt><dd className="mt-1.5 text-sm leading-relaxed text-landing-obsidian/85">{item.bodyType}</dd></div> : null}
            {item.skinTone ? <div><dt className={accountLabelClassName}>Tông da</dt><dd className="mt-1.5 text-sm leading-relaxed text-landing-obsidian/85">{item.skinTone}</dd></div> : null}
          </dl>
        ) : null}

        {item.verdict ? (
          <blockquote className="border-l-2 border-landing-oxblood pl-4 font-display text-lg italic leading-snug text-landing-obsidian line-clamp-3">
            {item.verdict}
          </blockquote>
        ) : null}
      </div>

      {hasDetails ? (
        <>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls={detailId}
            className={cn('flex w-full items-center justify-center gap-1.5 border-t border-landing-line/70 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-muted transition-colors hover:text-landing-oxblood', accountFocusRing)}
          >
            {expanded ? 'Thu gọn' : 'Xem gợi ý phối đồ'}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} strokeWidth={1.75} aria-hidden="true" />
          </button>

          {expanded ? (
            <div id={detailId} className="flex flex-col gap-6 border-t border-landing-line/70 p-5">
              {item.fitRecommendation ? <DetailBlock label="Kiểu dáng hợp">{item.fitRecommendation}</DetailBlock> : null}
              {item.stylingTips ? <DetailBlock label="Mẹo phối">{item.stylingTips}</DetailBlock> : null}
              {colors.length > 0 ? (
                <DetailBlock label="Màu gợi ý">
                  <ul className="flex flex-wrap gap-1.5">
                    {colors.map((color, i) => (
                      <li key={i} className="flex h-8 items-center gap-2 border border-landing-line bg-landing-paper px-2.5 text-xs">
                        {typeof color !== 'string' && color.hex ? (
                          <span aria-hidden="true" className="h-3 w-3 rounded-full border border-landing-obsidian/15" style={{ backgroundColor: color.hex }} />
                        ) : null}
                        {typeof color === 'string' ? color : color.name}
                      </li>
                    ))}
                  </ul>
                </DetailBlock>
              ) : null}
              {item.outfits.length > 0 || legacyOutfits.length > 0 ? (
                <DetailBlock label="Bộ phối gợi ý">
                  {item.outfits.length > 0 ? (
                    <OutfitSuggestionList viewKey={item.id} list={GA_ITEM_LISTS.aiStylist} outfits={item.outfits} />
                  ) : (
                    <ul className="space-y-2">
                      {legacyOutfits.map((outfit, i) => (
                        <li key={i} className="border border-landing-line bg-landing-paper px-3 py-2.5">
                          {typeof outfit === 'string' ? outfit : (
                            <>
                              <p className="font-medium text-landing-obsidian">{outfit.name}</p>
                              <p className="mt-1 text-xs text-landing-muted">{(outfit.items || []).map((part) => `${part.type}: ${part.name}`).join(' · ')}</p>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </DetailBlock>
              ) : null}
              {item.product ? (
                <Link
                  href={`/products/${item.product.id}`}
                  className={cn('group flex items-center justify-between gap-3 border-t border-landing-line/70 pt-4', accountFocusRing)}
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-landing-muted">Sản phẩm được phân tích</span>
                    <span className="product-name-line mt-0.5 block truncate text-landing-obsidian group-hover:text-landing-oxblood">{item.product.name}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-landing-oxblood" strokeWidth={1.75} aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

export default function StylistHistoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { history, meta, isLoading, isError, refetch } = useStylistHistory(page, PAGE_SIZE);
  const { deleteHistoryItem, isDeleting } = useDeleteStylistHistory();

  const query = search.trim().toLowerCase();
  const filtered = history.filter((item) => (
    !query ||
    item.personalColor?.toLowerCase().includes(query) ||
    item.bodyType?.toLowerCase().includes(query) ||
    item.occasion?.toLowerCase().includes(query) ||
    item.verdict?.toLowerCase().includes(query)
  ));

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteHistoryItem(pendingDelete, {
      onSuccess: () => {
        toast.success('Đã xoá kết quả tư vấn');
        setPendingDelete(null);
      },
      onError: () => toast.error('Không xoá được. Vui lòng thử lại.'),
    });
  };

  return (
    <AccountShell
      title="Lịch sử AI Stylist"
      description="Các lần tư vấn phối đồ bạn đã nhận, kèm bộ phối từ sản phẩm trong cửa hàng."
      actions={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto">
          <div className="relative w-full sm:w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              aria-label="Tìm trong lịch sử tư vấn"
              placeholder="Tìm theo màu, dáng, dịp…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(accountInputClassName, 'pl-9 [&::-webkit-search-cancel-button]:appearance-none')}
            />
          </div>
          <Link href="/ai-stylist" className={accountButtonClassName('primary')}>
            Tư vấn mới
          </Link>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          {[0, 1].map((key) => <div key={key} className="h-48 animate-pulse bg-landing-taupe/30" />)}
        </div>
      ) : isError ? (
        <AccountStatePanel
          tone="error"
          title="Không tải được lịch sử"
          description="Kiểm tra kết nối rồi thử lại."
          action={<button type="button" onClick={() => refetch()} className={accountButtonClassName('outline')}>Thử lại</button>}
        />
      ) : filtered.length === 0 ? (
        <AccountStatePanel
          title={query ? 'Không có kết quả khớp' : 'Chưa có lần tư vấn nào'}
          description={query ? 'Thử từ khóa khác.' : 'AI Stylist xem ảnh và mô tả của bạn rồi gợi ý bộ phối từ sản phẩm trong cửa hàng.'}
          action={query ? undefined : <Link href="/ai-stylist" className={accountButtonClassName('primary')}>Nhờ AI Stylist</Link>}
        />
      ) : (
        <>
          <p className="mb-4 text-xs text-landing-muted">
            <span className="font-mono text-landing-obsidian">{meta?.total ?? filtered.length}</span> lần tư vấn
          </p>
          <div className="grid gap-5 xl:grid-cols-2">
            {filtered.map((item) => (
              <StylistCard key={item.id} item={item} onDelete={() => setPendingDelete(item.id)} isDeleting={isDeleting && pendingDelete === item.id} />
            ))}
          </div>
          {!query && meta ? <AccountPagination page={page} totalPages={meta.totalPages} onPageChange={setPage} /> : null}
        </>
      )}

      <AccountConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title="Xoá kết quả tư vấn?"
        description="Kết quả và các bộ phối gợi ý sẽ bị xoá khỏi lịch sử."
        confirmLabel="Xoá"
        isPending={isDeleting}
        onConfirm={confirmDelete}
      />
    </AccountShell>
  );
}
