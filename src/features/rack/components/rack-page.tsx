'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toBackendCategory } from '@/features/products/services/products-utils';
import { AccountConfirmDialog } from '@/features/profile/components/account-ui';
import { MannequinDressForm } from '@/features/rack/components/MannequinDressForm';
import { useClearRack, useRackItems, useUnpinFromRack } from '@/features/rack/hooks/useRack';
import { formatRackPrice, getRackProductImage, RACK_IMAGE_FALLBACK } from '@/features/rack/services/rack-images';
import type { CanvasPlacedItem, RackItem } from '@/features/rack/types/rack';
import type { TabType } from '@/features/rack/types/rack-page';
import { cn } from '@/lib/utils';
import { Check, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const labelClass = 'text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink';
const primaryButton = cn(
  'inline-flex h-11 items-center justify-center gap-2 rounded-[2px] bg-landing-oxblood px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-paper transition-colors hover:bg-landing-obsidian',
  focusRing,
);

const CATEGORY_LABELS: Record<Exclude<TabType, 'ALL'>, string> = {
  UPPER: 'Áo',
  LOWER: 'Quần & váy',
  FULL_BODY: 'Đồ liền',
};

const TABS: { key: TabType; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'UPPER', label: CATEGORY_LABELS.UPPER },
  { key: 'LOWER', label: CATEGORY_LABELS.LOWER },
  { key: 'FULL_BODY', label: CATEGORY_LABELS.FULL_BODY },
];

function RackCard({
  item,
  worn,
  isUnpinning,
  onToggle,
  onUnpin,
}: {
  item: RackItem;
  worn: boolean;
  isUnpinning: boolean;
  onToggle: () => void;
  onUnpin: (e: React.MouseEvent) => void;
}) {
  const [imageSrc, setImageSrc] = useState(() => getRackProductImage(item.product));
  const category = toBackendCategory(item.product.category, item.product.garmentType);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ productId: item.productId }));
        e.dataTransfer.setData('text/plain', item.productId);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      className="group relative cursor-grab active:cursor-grabbing"
    >
      <button type="button" onClick={onToggle} aria-pressed={worn} className={cn('flex w-full flex-col text-left', focusRing)}>
        <span className={cn('relative block aspect-[3/4] w-full overflow-hidden rounded-[2px] border bg-landing-ivory transition-colors', worn ? 'border-landing-oxblood' : 'border-landing-line group-hover:border-landing-brass')}>
          <Image
            src={imageSrc}
            alt={item.product.name}
            fill
            sizes="(max-width: 1024px) 45vw, 220px"
            draggable={false}
            onError={() => setImageSrc(RACK_IMAGE_FALLBACK)}
            className="pointer-events-none select-none object-cover"
          />
          <span className={cn('absolute left-2 top-2 flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]', worn ? 'bg-landing-oxblood text-landing-paper' : 'bg-landing-paper/90 text-landing-obsidian/80')}>
            {worn ? <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" /> : null}
            {worn ? 'Đang mặc' : 'Chạm để mặc'}
          </span>
        </span>
        <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">
          {category in CATEGORY_LABELS ? CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] : item.product.brand || 'StAie.'}
        </span>
        <span className="product-name-line mt-1 line-clamp-1 text-landing-obsidian group-hover:text-landing-oxblood">{item.product.name}</span>
        <span className="mt-1 font-mono text-xs text-landing-oxblood">{formatRackPrice(item.product.price)}</span>
      </button>
      <button
        type="button"
        onClick={onUnpin}
        disabled={isUnpinning}
        aria-label={`Bỏ ${item.product.name} khỏi giá treo`}
        className={cn('absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-landing-paper/90 text-landing-muted transition-colors hover:bg-destructive hover:text-white disabled:opacity-50', focusRing)}
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export default function RackPage() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const { items, isLoading } = useRackItems();
  const { unpinProduct, isUnpinning } = useUnpinFromRack();
  const { clearRack, isClearing } = useClearRack();

  // Freeform Canvas State
  const [placedItems, setPlacedItems] = useState<CanvasPlacedItem[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  // Tab & Search filter for wardrobe
  const [currentTab, setCurrentTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtered wardrobe items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const cat = toBackendCategory(item.product.category, item.product.garmentType);
      if (currentTab !== 'ALL' && cat !== currentTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.product.name?.toLowerCase().includes(q);
        const brandMatch = item.product.brand?.toLowerCase().includes(q);
        return nameMatch || brandMatch;
      }
      return true;
    });
  }, [items, currentTab, searchQuery]);

  // Check if an item is currently placed on mannequin canvas
  const isItemWorn = (productId: string) => {
    return placedItems.some((item) => item.rackItem.productId === productId);
  };

  // Handle clicking an item from wardrobe to wear/remove on mannequin
  const handleItemClick = (item: RackItem) => {
    const existingIndex = placedItems.findIndex((p) => p.rackItem.productId === item.productId);

    if (existingIndex !== -1) {
      // Toggle off: remove from canvas
      const removed = placedItems[existingIndex];
      setPlacedItems((prev) => prev.filter((_, idx) => idx !== existingIndex));
      if (selectedInstanceId === removed.instanceId) {
        setSelectedInstanceId(null);
      }
      toast.info(`Đã gỡ "${item.product.name}" khỏi ma-nơ-canh`);
      return;
    }

    // Add to canvas with smart initial position based on category
    const cat = toBackendCategory(item.product.category, item.product.garmentType);
    const maxZ = placedItems.reduce((max, i) => Math.max(max, i.zIndex), 0);
    const instanceId = `${item.id}-${Date.now()}`;

    let defaultY = 0;
    let defaultScale = 1.15;

    if (cat === 'UPPER') {
      defaultY = -65;
      defaultScale = 1.15;
    } else if (cat === 'LOWER') {
      defaultY = 75;
      defaultScale = 1.15;
    } else if (cat === 'FULL_BODY') {
      defaultY = 10;
      defaultScale = 1.25;
    }

    const newItem: CanvasPlacedItem = {
      instanceId,
      rackItem: item,
      x: 0,
      y: defaultY,
      scale: defaultScale,
      zIndex: maxZ + 1,
      rotation: 0,
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setSelectedInstanceId(instanceId);
    toast.success(`Đã thêm "${item.product.name}" lên ma-nơ-canh`);
  };

  // Handle dropping an item directly from wardrobe onto canvas
  const handleDropItem = (productId: string, dropX: number, dropY: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    const existingIndex = placedItems.findIndex((p) => p.rackItem.productId === productId);
    if (existingIndex !== -1) {
      const target = placedItems[existingIndex];
      handleUpdateTransform(target.instanceId, { x: dropX, y: dropY });
      setSelectedInstanceId(target.instanceId);
      toast.info(`Đã di chuyển "${item.product.name}" đến vị trí mới`);
      return;
    }

    const cat = toBackendCategory(item.product.category, item.product.garmentType);
    const maxZ = placedItems.reduce((max, i) => Math.max(max, i.zIndex), 0);
    const instanceId = `${item.id}-${Date.now()}`;

    let defaultScale = 1.15;
    if (cat === 'FULL_BODY') defaultScale = 1.25;

    const newItem: CanvasPlacedItem = {
      instanceId,
      rackItem: item,
      x: dropX,
      y: dropY,
      scale: defaultScale,
      zIndex: maxZ + 1,
      rotation: 0,
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setSelectedInstanceId(instanceId);
    toast.success(`Đã ướm "${item.product.name}" lên studio`);
  };

  // Update item transform on canvas
  const handleUpdateTransform = (
    instanceId: string,
    updates: Partial<Pick<CanvasPlacedItem, 'x' | 'y' | 'scale' | 'rotation' | 'zIndex'>>
  ) => {
    setPlacedItems((prev) =>
      prev.map((item) => (item.instanceId === instanceId ? { ...item, ...updates } : item))
    );
  };

  // Bring item layer forward
  const handleBringForward = (instanceId: string) => {
    setPlacedItems((prev) => {
      const maxZ = prev.reduce((max, i) => Math.max(max, i.zIndex), 0);
      return prev.map((item) =>
        item.instanceId === instanceId ? { ...item, zIndex: maxZ + 1 } : item
      );
    });
  };

  // Send item layer backward
  const handleSendBackward = (instanceId: string) => {
    setPlacedItems((prev) => {
      const minZ = prev.reduce((min, i) => Math.min(min, i.zIndex), 1);
      return prev.map((item) =>
        item.instanceId === instanceId ? { ...item, zIndex: Math.max(0, minZ - 1) } : item
      );
    });
  };

  // Reset transform to default category placement
  const handleResetItemTransform = (instanceId: string) => {
    setPlacedItems((prev) =>
      prev.map((item) => {
        if (item.instanceId !== instanceId) return item;
        const cat = toBackendCategory(item.rackItem.product.category, item.rackItem.product.garmentType);
        let defaultY = 0;
        let defaultScale = 1.15;
        if (cat === 'UPPER') {
          defaultY = -65;
        } else if (cat === 'LOWER') {
          defaultY = 75;
        } else if (cat === 'FULL_BODY') {
          defaultY = 10;
          defaultScale = 1.25;
        }
        return {
          ...item,
          x: 0,
          y: defaultY,
          scale: defaultScale,
          rotation: 0,
        };
      })
    );
    toast.info('Đã đặt lại vị trí chuẩn cho món đồ');
  };

  // Remove a single item from canvas
  const handleRemoveCanvasItem = (instanceId: string) => {
    setPlacedItems((prev) => prev.filter((item) => item.instanceId !== instanceId));
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
    }
  };

  // Reset entire mannequin outfit
  const handleResetMannequin = () => {
    setPlacedItems([]);
    setSelectedInstanceId(null);
    toast.info('Đã làm mới ma-nơ-canh');
  };

  // Remove a product from rack storage
  const handleUnpin = (e: React.MouseEvent, item: RackItem) => {
    e.stopPropagation();
    unpinProduct(item.id, {
      onSuccess: () => {
        setPlacedItems((prev) => prev.filter((p) => p.rackItem.productId !== item.productId));
        toast.info(`Đã xóa "${item.product.name}" khỏi Tủ đồ`);
      },
      onError: () => {
        toast.error('Không thể xóa món đồ này');
      },
    });
  };

  // Clear all items from rack
  const handleClearAll = () => {
    clearRack(undefined, {
      onSuccess: () => {
        handleResetMannequin();
        setShowClearConfirm(false);
        toast.info('Đã dọn sạch Tủ đồ cá nhân');
      },
      onError: () => {
        toast.error('Không thể dọn sạch tủ đồ');
      },
    });
  };

  // Navigate to try-on studio with selected combination
  const handleGoToTryOn = () => {
    if (placedItems.length === 0) {
      toast.error('Vui lòng gắn ít nhất 1 món đồ lên ma-nơ-canh để thử');
      return;
    }

    // Try-on studio supports up to 3 items (Áo khoác + Áo trong + Quần/Váy, hoặc 1 Full body, hoặc tối đa 3 món)
    let selected = [...placedItems];
    const fullBody = selected.find(
      (i) => toBackendCategory(i.rackItem.product.category, i.rackItem.product.garmentType) === 'FULL_BODY'
    );

    if (fullBody) {
      selected = [fullBody];
    } else if (selected.length > 3) {
      selected = selected.slice(0, 3);
      toast.info('Phòng thử AI hỗ trợ tối đa 3 món, đã chọn 3 trang phục chính');
    }

    const ids = selected.map((i) => i.rackItem.productId).join(',');
    router.push(`/try-on?rackIds=${ids}`);
  };

  // Count items by category for tab badges
  const categoryCounts = useMemo(() => {
    const counts = { ALL: items.length, UPPER: 0, LOWER: 0, FULL_BODY: 0 };
    items.forEach(item => {
      const cat = toBackendCategory(item.product.category, item.product.garmentType);
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });
    return counts;
  }, [items]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AtelierLoader size="md" label="Đang may giá treo" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="landing-paper-texture px-4 py-16">
        <div className="mx-auto flex max-w-[520px] flex-col items-center border border-landing-line bg-landing-ivory/60 px-6 py-14 text-center">
          <p className={labelClass}>Giá treo</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-landing-obsidian">Giá treo đồ của bạn</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-landing-muted">
            Đăng nhập để lưu món yêu thích, phối chúng trên ma-nơ-canh rồi thử cả bộ bằng Thử đồ AI.
          </p>
          <Link href="/login?callbackUrl=/rack" className={cn(primaryButton, 'mt-8')}>
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-paper-texture">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-6 md:px-8 md:pt-10">
        <header className="mb-8 flex flex-col gap-5 border-b border-landing-line pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={labelClass}>Giá treo</p>
            <h1 className="mt-3 font-display text-landing-h2 text-landing-obsidian">Phối trên ma-nơ-canh</h1>
            <p className="mt-3 max-w-xl text-landing-body text-landing-muted">
              Chạm hoặc kéo các món đã lưu lên ma-nơ-canh để thử cách phối, rồi đưa cả bộ vào Thử đồ AI.
            </p>
          </div>
          {items.length > 0 ? (
            <div className="flex items-center gap-5">
              <Link href="/products" className={cn('text-sm text-landing-obsidian underline-offset-4 hover:text-landing-oxblood hover:underline', focusRing)}>
                Thêm món
              </Link>
              <button type="button" onClick={() => setShowClearConfirm(true)} className={cn('text-sm text-landing-muted transition-colors hover:text-destructive', focusRing)}>
                Dọn giá treo
              </button>
            </div>
          ) : null}
        </header>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <AtelierLoader size="sm" label="Đang may giá treo" />
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto flex max-w-[560px] flex-col items-center border border-landing-line bg-landing-ivory/60 px-6 py-14 text-center">
            <p className="font-display text-2xl leading-tight text-landing-obsidian">Giá treo đang trống</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-landing-muted">
              Mở trang một sản phẩm và bấm “Ghim vào Giá treo” để lưu món vào đây.
            </p>
            <Link href="/products" className={cn(primaryButton, 'mt-6')}>
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
            <section aria-label="Món đã lưu" className="min-w-0">
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-[1.375rem] leading-tight text-landing-obsidian">Đã lưu</h2>
                <span className="font-mono text-xs text-landing-muted">{items.length} món</span>
              </div>
              <div role="group" aria-label="Lọc theo loại" className="no-scrollbar mb-4 flex gap-5 overflow-x-auto border-b border-landing-line">
                {TABS.map((tab) => {
                  const selected = currentTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCurrentTab(tab.key)}
                      className={cn(
                        'relative flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap text-sm transition-colors',
                        selected ? 'font-medium text-landing-oxblood after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-landing-oxblood' : 'text-landing-obsidian/70 hover:text-landing-oxblood',
                        focusRing,
                      )}
                    >
                      {tab.label}
                      <span className="font-mono text-[11px] text-landing-muted">{categoryCounts[tab.key]}</span>
                    </button>
                  );
                })}
              </div>
              {items.length > 6 ? (
                <div className="relative mb-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" strokeWidth={1.75} aria-hidden="true" />
                  <input
                    type="search"
                    aria-label="Tìm trong giá treo"
                    placeholder="Tìm theo tên hoặc thương hiệu…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn('h-11 w-full rounded-[2px] border border-landing-line bg-landing-ivory/80 pl-9 pr-3 text-sm placeholder:text-landing-muted/70 transition-colors hover:border-landing-brass [&::-webkit-search-cancel-button]:appearance-none', focusRing)}
                  />
                </div>
              ) : null}
              {filteredItems.length === 0 ? (
                <p className="border border-dashed border-landing-taupe px-6 py-10 text-center text-sm text-landing-muted">Không có món nào khớp.</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {filteredItems.map((item) => (
                    <RackCard
                      key={item.id}
                      item={item}
                      worn={isItemWorn(item.productId)}
                      isUnpinning={isUnpinning}
                      onToggle={() => handleItemClick(item)}
                      onUnpin={(e) => handleUnpin(e, item)}
                    />
                  ))}
                </div>
              )}
            </section>

            <div className="min-w-0 lg:sticky lg:top-[97px]">
              <MannequinDressForm
                placedItems={placedItems}
                selectedId={selectedInstanceId}
                onSelect={setSelectedInstanceId}
                onUpdateTransform={handleUpdateTransform}
                onBringForward={handleBringForward}
                onSendBackward={handleSendBackward}
                onResetItemTransform={handleResetItemTransform}
                onRemoveItem={handleRemoveCanvasItem}
                onReset={handleResetMannequin}
                onGoToTryOn={handleGoToTryOn}
                onDropItem={handleDropItem}
              />
            </div>
          </div>
        )}

        <AccountConfirmDialog
          open={showClearConfirm}
          onOpenChange={setShowClearConfirm}
          title="Dọn sạch giá treo?"
          description={`${items.length} món sẽ bị bỏ khỏi giá treo. Bạn có thể lưu lại từ trang sản phẩm.`}
          confirmLabel="Dọn tất cả"
          isPending={isClearing}
          onConfirm={handleClearAll}
        />
      </div>
    </div>
  );
}
