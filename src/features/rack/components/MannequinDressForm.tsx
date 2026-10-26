'use client';

import { formatRackPrice, getRackProductImage } from '@/features/rack/services/rack-images';
import type { MannequinDressFormProps } from '@/features/rack/types/mannequin-dress-form';
import type { CanvasPlacedItem } from '@/features/rack/types/rack';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Eye,
  EyeOff,
  Minus,
  Move,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const toolButton = cn(
  'inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-[2px] border border-landing-line px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:cursor-not-allowed disabled:opacity-45',
  focusRing,
);

interface DraggableCanvasItemProps {
  item: CanvasPlacedItem;
  isSelected: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (instanceId: string) => void;
  onUpdateTransform: (
    instanceId: string,
    updates: Partial<Pick<CanvasPlacedItem, 'x' | 'y' | 'scale' | 'rotation' | 'zIndex'>>
  ) => void;
  onRemoveItem: (instanceId: string) => void;
}

function DraggableCanvasItem({
  item,
  isSelected,
  containerRef,
  onSelect,
  onUpdateTransform,
  onRemoveItem,
}: DraggableCanvasItemProps) {
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; itemX: number; itemY: number }>({
    startX: 0,
    startY: 0,
    itemX: 0,
    itemY: 0,
  });
  const hasMovedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary mouse button or touch
    if (e.button !== 0) return;
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    onSelect(item.instanceId);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      itemX: item.x,
      itemY: item.y,
    };
    setDragOffset({ x: item.x, y: item.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOffset) return;
    e.stopPropagation();

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      hasMovedRef.current = true;
    }

    let nextX = Math.round(dragStartRef.current.itemX + deltaX);
    let nextY = Math.round(dragStartRef.current.itemY + deltaY);

    // Clamp within the full canvas card so items cannot completely disappear
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      const maxX = halfW - 40;
      const minX = -halfW + 40;
      const maxY = halfH - 40;
      const minY = -halfH + 40;
      nextX = Math.max(minX, Math.min(maxX, nextX));
      nextY = Math.max(minY, Math.min(maxY, nextY));
    }

    setDragOffset({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOffset) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (hasMovedRef.current) {
      onUpdateTransform(item.instanceId, { x: dragOffset.x, y: dragOffset.y });
    }
    setDragOffset(null);
  };

  const currentX = dragOffset ? dragOffset.x : item.x;
  const currentY = dragOffset ? dragOffset.y : item.y;
  const imageUrl = getRackProductImage(item.rackItem.product);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.instanceId);
      }}
      onWheel={(e) => {
        e.stopPropagation();
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        const newScale = Math.min(2.5, Math.max(0.5, Number((item.scale + delta).toFixed(2))));
        onUpdateTransform(item.instanceId, { scale: newScale });
      }}
      style={{
        transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(${item.scale}) rotate(${item.rotation || 0}deg)`,
        zIndex: item.zIndex,
        touchAction: 'none',
        userSelect: 'none',
        willChange: 'transform',
      }}
      className={cn(
        'group absolute left-[calc(50%-150px)] top-[calc(50%-170px)] flex h-[340px] w-[300px] cursor-grab select-none items-center justify-center active:cursor-grabbing',
        isSelected ? 'outline outline-2 outline-offset-4 outline-landing-oxblood' : 'hover:outline hover:outline-1 hover:outline-offset-4 hover:outline-landing-oxblood/40',
      )}
    >
      {/* Ảnh tắt kéo gốc của trình duyệt để không xung đột với pointer capture */}
      <div className="pointer-events-none relative flex h-full w-full select-none items-center justify-center">
        <Image
          src={imageUrl}
          alt={item.rackItem.product.name}
          fill
          unoptimized
          draggable={false}
          className="pointer-events-none select-none object-contain object-center drop-shadow-lg"
        />
      </div>

      {isSelected && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveItem(item.instanceId);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Gỡ ${item.rackItem.product.name} khỏi ma-nơ-canh`}
            className={cn('absolute -right-4 -top-4 z-40 flex h-8 w-8 items-center justify-center bg-destructive text-white transition-colors hover:bg-landing-obsidian', focusRing)}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
          <span className="pointer-events-none absolute -left-4 -top-4 z-40 bg-landing-oxblood px-2 py-1 font-mono text-[10px] text-landing-paper">
            Lớp {item.zIndex}
          </span>
          <span className="pointer-events-none absolute -bottom-4 left-1/2 z-40 -translate-x-1/2 bg-landing-obsidian px-2 py-1 font-mono text-[10px] text-landing-paper">
            {Math.round(item.scale * 100)}%
          </span>
        </>
      )}
    </div>
  );
}

export function MannequinDressForm({
  placedItems,
  selectedId,
  onSelect,
  onUpdateTransform,
  onBringForward,
  onSendBackward,
  onResetItemTransform,
  onRemoveItem,
  onReset,
  onGoToTryOn,
  onDropItem,
}: MannequinDressFormProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [showMannequin, setShowMannequin] = useState<boolean>(true);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const hasAnyItem = placedItems.length > 0;
  const selectedItem = placedItems.find((item) => item.instanceId === selectedId) || null;

  // Calculate total outfit price
  const totalPrice = React.useMemo(() => {
    return placedItems.reduce((sum, item) => sum + (Number(item.rackItem.product.price) || 0), 0);
  }, [placedItems]);

  return (
    <div className="flex select-none flex-col border border-landing-line bg-landing-ivory/50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-landing-line/70 px-4 py-3 sm:px-5">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-[1.375rem] leading-tight text-landing-obsidian">Ma-nơ-canh</h2>
          <span className="font-mono text-xs text-landing-muted">{String(placedItems.length).padStart(2, '0')} món</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMannequin((prev) => !prev)}
            className={toolButton}
          >
            {showMannequin ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />}
            {showMannequin ? 'Ẩn dáng' : 'Hiện dáng'}
          </button>
          {hasAnyItem && (
            <button type="button" onClick={onReset} className={cn(toolButton, 'hover:border-destructive hover:text-destructive')}>
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              Tháo hết
            </button>
          )}
        </div>
      </div>

      {selectedItem && (
        <div className="flex flex-col gap-3 border-b border-landing-line/70 bg-landing-paper px-4 py-3 sm:px-5" aria-label="Chỉnh món đang chọn">
          <div className="flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 text-sm text-landing-obsidian">
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-landing-oxblood" />
              <span className="truncate">{selectedItem.rackItem.product.name}</span>
              <span className="shrink-0 font-mono text-[11px] text-landing-muted">Lớp {selectedItem.zIndex}</span>
            </p>
            <button
              type="button"
              onClick={() => onRemoveItem(selectedItem.instanceId)}
              className={cn('shrink-0 text-xs text-landing-muted transition-colors hover:text-destructive', focusRing)}
            >
              Gỡ món
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-landing-muted">Cỡ</span>
              <div className="flex h-9 items-center border border-landing-line">
                <button
                  type="button"
                  onClick={() => onUpdateTransform(selectedItem.instanceId, { scale: Math.max(0.5, Number((selectedItem.scale - 0.1).toFixed(2))) })}
                  aria-label="Thu nhỏ 10%"
                  className={cn('flex h-full w-8 items-center justify-center text-landing-obsidian/70 hover:text-landing-oxblood', focusRing)}
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <span className="flex h-full min-w-12 items-center justify-center border-x border-landing-line font-mono text-xs text-landing-oxblood">
                  {Math.round(selectedItem.scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateTransform(selectedItem.instanceId, { scale: Math.min(2.5, Number((selectedItem.scale + 0.1).toFixed(2))) })}
                  aria-label="Phóng to 10%"
                  className={cn('flex h-full w-8 items-center justify-center text-landing-obsidian/70 hover:text-landing-oxblood', focusRing)}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={selectedItem.scale}
                onChange={(e) => onUpdateTransform(selectedItem.instanceId, { scale: Number(e.target.value) })}
                aria-label="Cỡ món đang chọn"
                className={cn('w-24 cursor-pointer accent-landing-oxblood sm:w-32', focusRing)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => onBringForward(selectedItem.instanceId)} className={toolButton}>
                <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                Lên trên
              </button>
              <button type="button" onClick={() => onSendBackward(selectedItem.instanceId)} className={toolButton}>
                <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                Xuống dưới
              </button>
              <button type="button" onClick={() => onResetItemTransform(selectedItem.instanceId)} className={toolButton}>
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative px-3 py-3 sm:px-4">
        <div
          ref={stageRef}
          onClick={() => onSelect(null)}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            if (!isDragOver) setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragOver(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            let productId = '';
            try {
              const raw = e.dataTransfer.getData('application/json');
              if (raw) {
                const parsed = JSON.parse(raw);
                productId = parsed.productId || '';
              }
            } catch {}
            if (!productId) {
              productId = e.dataTransfer.getData('text/plain') || '';
            }

            if (productId && stageRef.current && onDropItem) {
              const rect = stageRef.current.getBoundingClientRect();
              const dropX = Math.round(e.clientX - rect.left - rect.width / 2);
              const dropY = Math.round(e.clientY - rect.top - rect.height / 2);
              onDropItem(productId, dropX, dropY);
            }
          }}
          className={cn(
            'relative flex h-[600px] w-full cursor-default items-center justify-center overflow-hidden bg-landing-paper transition-colors sm:h-[660px]',
            isDragOver ? 'border border-dashed border-landing-oxblood bg-landing-oxblood/[0.04]' : 'border border-landing-line/60',
          )}
        >
          {isDragOver && (
            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-landing-paper/60">
              <p className="border border-landing-oxblood bg-landing-paper px-5 py-3 text-sm font-medium text-landing-oxblood">Thả vào đây để mặc thử</p>
            </div>
          )}

          {showMannequin && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="mt-2 h-6 w-6 rounded-t-full bg-landing-obsidian" />
              <div className="h-3 w-8 bg-landing-obsidian/90" />
              <div className="h-6 w-12 bg-landing-obsidian/85" />
              <div className="relative flex h-[370px] w-[340px] items-center justify-center">
                <svg className="h-[350px] w-[240px]" viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 65 0 C 50 0, 20 15, 15 38 C 10 60, 32 85, 48 110 C 58 125, 52 145, 44 175 C 34 210, 22 250, 42 275 C 55 290, 145 290, 158 275 C 178 250, 166 210, 156 175 C 148 145, 142 125, 152 110 C 168 85, 190 60, 185 38 C 180 15, 150 0, 135 0 Z"
                    className="fill-landing-obsidian/90"
                  />
                  <path d="M 100 0 L 100 285" className="stroke-landing-brass/50" strokeWidth="1" strokeDasharray="3 3" />
                  <path d="M 52 125 C 75 135, 125 135, 148 125" className="stroke-landing-brass/50" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>
              <div className="-mt-1 h-14 w-2.5 bg-landing-brass" />
              <div className="h-2 w-6 bg-landing-obsidian" />
              <div className="h-1.5 w-40 bg-landing-obsidian" />
            </div>
          )}

          {!hasAnyItem && !isDragOver && (
            <div className="pointer-events-none absolute inset-x-0 top-6 z-10 flex justify-center px-6">
              <div className="flex max-w-[300px] items-start gap-3 border border-dashed border-landing-brass/50 bg-landing-paper px-4 py-3 text-left">
                <Move className="mt-0.5 h-4 w-4 shrink-0 text-landing-oxblood" strokeWidth={1.75} aria-hidden="true" />
                <p className="text-xs leading-relaxed text-landing-muted">
                  Chạm vào một món trong giá treo, hoặc kéo ảnh vào đây. Kéo món trên ma-nơ-canh để đổi vị trí, lăn chuột để đổi cỡ.
                </p>
              </div>
            </div>
          )}

          {placedItems.map((item) => (
            <DraggableCanvasItem
              key={item.instanceId}
              item={item}
              isSelected={selectedId === item.instanceId}
              containerRef={stageRef}
              onSelect={onSelect}
              onUpdateTransform={onUpdateTransform}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-landing-line/70 px-4 py-4 sm:px-5">
        {hasAnyItem ? (
          <div className="flex flex-col gap-4">
            <ul className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Món đang mặc">
              {placedItems.map((item) => {
                const isSelected = selectedId === item.instanceId;
                return (
                  <li key={item.instanceId} className={cn('flex shrink-0 items-center border text-xs', isSelected ? 'border-landing-oxblood bg-landing-oxblood text-landing-paper' : 'border-landing-line bg-landing-paper text-landing-obsidian')}>
                    <button type="button" onClick={() => onSelect(item.instanceId)} aria-pressed={isSelected} className={cn('max-w-[150px] truncate py-1.5 pl-3 pr-1', focusRing)}>
                      {item.rackItem.product.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.instanceId)}
                      aria-label={`Gỡ ${item.rackItem.product.name}`}
                      className={cn('flex h-8 w-7 items-center justify-center', isSelected ? 'text-landing-paper/80 hover:text-landing-paper' : 'text-landing-muted hover:text-destructive', focusRing)}
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-landing-muted">Tổng giá bộ này</span>
              <span className="font-mono text-lg text-landing-oxblood">{formatRackPrice(totalPrice)}</span>
            </div>
            <button
              type="button"
              onClick={onGoToTryOn}
              className={cn('flex h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-landing-oxblood text-[11.5px] font-semibold uppercase tracking-[0.16em] text-landing-paper transition-colors hover:bg-landing-obsidian', focusRing)}
            >
              Thử bộ này bằng Thử đồ AI
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-landing-muted">Chưa có món nào trên ma-nơ-canh.</p>
        )}
      </div>
    </div>
  );
}
