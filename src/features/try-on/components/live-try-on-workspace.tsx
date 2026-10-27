'use client';

import type { Product } from '@/features/products/types/products';
import { useLiveTryOnQuota } from '@/features/subscription/hooks/useQuota';
import {
  GarmentColorPicker,
  GarmentSlot,
  TryOnSegmented,
  tryOnButtonClassName,
  tryOnFocusRing,
  tryOnLabelClassName,
} from '@/features/try-on/components/garment-slot';
import { useAutoCapture, type LiveCapture } from '@/features/try-on/hooks/use-live-auto-capture';
import { useLiveTryOn } from '@/features/try-on/hooks/use-live-try-on';
import type { LiveTryOnSessionItem } from '@/features/try-on/types/live-try-on';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { Aperture, ArrowRight, Camera, CameraOff, ChevronDown, ChevronLeft, ChevronRight, CirclePause, Download, Expand, Image as ImageIcon, Layers, Loader2, Play, RefreshCw, Shirt, Square, Timer, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

// Nút nổi trên khung camera tối.
const stageButton = cn(
  'flex h-10 w-10 items-center justify-center rounded-[2px] border border-landing-paper/20 bg-landing-obsidian/70 text-landing-paper transition-colors hover:bg-landing-obsidian disabled:cursor-not-allowed disabled:opacity-45',
  tryOnFocusRing,
);

const LAYER_ROLE_LABELS: Record<string, string> = {
  OUTER: 'Lớp ngoài',
  INNER: 'Lớp trong',
  BOTTOM: 'Phần dưới',
  FULL_BODY: 'Toàn thân',
};

interface LiveTryOnWorkspaceProps {
  selectedProduct: Product;
  outerProduct?: Product | null;
  upperProduct: Product | null;
  lowerProduct: Product | null;
  selectedColor?: string | null;
  outerColor?: string | null;
  upperColor?: string | null;
  lowerColor?: string | null;
  onOpenOuterCatalog?: () => void;
  onOpenUpperCatalog: () => void;
  onOpenLowerCatalog: () => void;
  onOpenCatalog: () => void;
  onSelectColor: (color: string) => void;
  onSelectOuterColor?: (color: string) => void;
  onSelectUpperColor: (color: string) => void;
  onSelectLowerColor: (color: string) => void;
  onClearOuter?: () => void;
  onSwitchToPhoto: () => void;
  /** Chế độ phối bộ dùng chung với Thử bằng ảnh, để đổi tab không mất bộ đang chọn. */
  outfitMode: boolean;
  onOutfitModeChange: (combo: boolean) => void;
}

export function LiveTryOnWorkspace({
  selectedProduct,
  outerProduct,
  upperProduct,
  lowerProduct,
  selectedColor,
  outerColor,
  upperColor,
  lowerColor,
  onOpenOuterCatalog,
  onOpenUpperCatalog,
  onOpenLowerCatalog,
  onOpenCatalog,
  onSelectColor,
  onSelectOuterColor,
  onSelectUpperColor,
  onSelectLowerColor,
  onClearOuter,
  onSwitchToPhoto,
  outfitMode,
  onOutfitModeChange,
}: LiveTryOnWorkspaceProps) {
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const live = useLiveTryOn();
  const autoCapture = useAutoCapture(remoteVideoRef, live.status === 'live', live.sessionId);
  const [viewingCapture, setViewingCapture] = useState<LiveCapture | null>(null);
  const { cameraStream, remoteStream, markFirstFrame } = live;
  const { quota, isLoading, isError, refetch } = useLiveTryOnQuota();
  const activeSession = live.status === 'ended' ? null : quota?.activeSession;
  const isBusy = ['requesting-camera', 'preparing-garment', 'connecting', 'awaiting-first-frame', 'pausing', 'resuming', 'stopping'].includes(live.status);
  const isLive = live.status === 'live';
  const isPaused = live.status === 'paused' || (!isLive && !isBusy && activeSession?.status === 'PAUSED');
  const resumeId = isPaused ? live.sessionId ?? activeSession?.sessionId : undefined;
  const currentSessionId = live.sessionId ?? activeSession?.sessionId;
  const hasSession = Boolean(currentSessionId);
  const otherSessionRunning = Boolean(activeSession && activeSession.status !== 'PAUSED' && !live.sessionId);
  const selectionLocked = isBusy || isLive || otherSessionRunning;
  const selectedCount = outfitMode
    ? [outerProduct, upperProduct, lowerProduct].filter(Boolean).length
    : 1;
  const comboValid = Boolean(
    (upperProduct && isUuid(upperProduct.id)) ||
    (lowerProduct && isUuid(lowerProduct.id)) ||
    (outerProduct && isUuid(outerProduct.id))
  );
  const productsReady = outfitMode ? comboValid : Boolean(selectedProduct && isUuid(selectedProduct.id));
  const seconds = live.sessionId ? live.remainingSeconds : activeSession?.remainingSeconds ?? Math.min(quota?.remaining ?? 0, quota?.maxDurationSeconds ?? 0);
  const lowTime = hasSession && seconds > 0 && seconds <= 10;
  const canStart = productsReady && (!hasSession || isPaused) && !isBusy && !isLive && !otherSessionRunning && !isLoading && !isError && Boolean(quota?.enabled && quota.eligible) && seconds > 0;
  const statusLabel = isPaused ? 'Đã tạm dừng' : isLive ? 'Đang thử trực tiếp' : busyLabel(live.status) ?? (live.status === 'ended' ? 'Phiên đã kết thúc' : 'Sẵn sàng thử đồ');
  const unavailable = isLoading ? 'Đang kiểm tra thời gian thử đồ…' : isError ? 'Chưa tải được thời gian sử dụng. Vui lòng thử lại.' : quota && !quota.enabled ? 'Thử đồ trực tiếp hiện đang tạm nghỉ. Bạn vẫn có thể thử bằng ảnh.' : quota && !quota.eligible ? reasonLabel(quota.disabledReason) : otherSessionRunning ? 'Bạn có phiên đang mở ở nơi khác. Kết thúc phiên đó để bắt đầu tại đây.' : !productsReady ? (outfitMode ? 'Chọn ít nhất một món để bắt đầu phối bộ.' : 'Chọn một sản phẩm để bắt đầu thử đồ.') : !hasSession && seconds <= 0 && quota ? 'Bạn đã dùng hết thời gian thử trực tiếp hôm nay.' : null;

  useEffect(() => {
    const video = cameraVideoRef.current;
    if (!video) return;
    video.srcObject = cameraStream;
    if (cameraStream) void video.play().catch(() => undefined);
  }, [cameraStream]);

  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video) return;
    video.srcObject = remoteStream;
    let frameId: number | undefined;
    if (remoteStream) {
      void video.play().catch(() => undefined);
      if ('requestVideoFrameCallback' in video) frameId = video.requestVideoFrameCallback(markFirstFrame);
    }
    return () => { if (frameId !== undefined) video.cancelVideoFrameCallback(frameId); };
  }, [remoteStream, markFirstFrame]);

  useEffect(() => {
    if (['live', 'paused', 'ended'].includes(live.status)) void refetch();
  }, [live.status, refetch]);

  // Một phiên thử trực tiếp tính một lần; tiếp tục sau khi tạm dừng không tính thêm.
  const previousLiveStatusRef = useRef(live.status);
  useEffect(() => {
    const previous = previousLiveStatusRef.current;
    previousLiveStatusRef.current = live.status;
    if (live.status === 'live' && previous !== 'live' && previous !== 'paused') trackEvent('live_try_on_start', {});
  }, [live.status]);

  const start = () => {
    if (!canStart) return;
    if (resumeId) {
      const switchedProduct = !outfitMode && selectedProduct && activeSession?.productId && selectedProduct.id !== activeSession.productId
        ? selectedProduct.id
        : undefined;
      const switchedColor = switchedProduct ? (selectedColor || undefined) : undefined;
      void live.start(switchedProduct ?? [], resumeId, undefined, switchedColor);
      return;
    }
    const items: LiveTryOnSessionItem[] = [];
    if (outfitMode) {
      if (outerProduct && isUuid(outerProduct.id)) items.push({ productId: outerProduct.id, ...(outerColor ? { color: outerColor } : {}) });
      if (upperProduct && isUuid(upperProduct.id)) items.push({ productId: upperProduct.id, ...(upperColor ? { color: upperColor } : {}) });
      if (lowerProduct && isUuid(lowerProduct.id)) items.push({ productId: lowerProduct.id, ...(lowerColor ? { color: lowerColor } : {}) });
    } else {
      if (selectedProduct && isUuid(selectedProduct.id)) items.push({ productId: selectedProduct.id, ...(selectedColor ? { color: selectedColor } : {}) });
    }
    if (items.length > 0) {
      void live.start(items);
    }
  };

  return (
    <section aria-label="Phòng thử đồ trực tiếp" className="pb-44 md:pb-36 lg:pb-0">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <div className="min-w-0">
          <div className="relative isolate overflow-hidden bg-landing-obsidian">
            <div className={cn('relative lg:h-[640px]', isPaused ? 'h-[min(36svh,320px)] min-h-[260px]' : 'h-[min(58svh,560px)] min-h-[300px]')}>
              <video ref={remoteVideoRef} autoPlay muted playsInline aria-label="Kết quả thử đồ trực tiếp" onLoadedData={() => { if ((remoteVideoRef.current?.videoWidth ?? 0) > 0) markFirstFrame(); }} className="h-full w-full object-contain" />
              {(!remoteStream || live.status === 'awaiting-first-frame') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                  <div className="absolute inset-x-[18%] inset-y-[10%] rounded-t-[45%] border border-landing-brass/25" aria-hidden="true" />
                  <div className="relative mb-5 flex h-14 w-14 items-center justify-center border border-landing-paper/20 text-landing-brass" aria-hidden="true">
                    {isBusy ? <Loader2 size={24} strokeWidth={1.5} className="animate-spin motion-reduce:animate-none" /> : isPaused ? <CirclePause size={26} strokeWidth={1.3} /> : <Shirt size={26} strokeWidth={1.3} />}
                  </div>
                  <p className="relative font-display text-[28px] leading-tight text-landing-paper">{isPaused ? 'Đang tạm dừng' : isBusy ? 'Đang chuẩn bị' : 'Sẵn sàng thử đồ'}</p>
                  <p className="relative mt-3 max-w-[280px] text-sm leading-relaxed text-landing-paper/65">{isPaused ? 'Đổi trang phục ở bên cạnh rồi tiếp tục phiên đang có.' : isBusy ? 'Giữ camera ổn định. Hình của bạn sẽ hiện ở đây.' : 'Chọn trang phục, bật camera và xem ngay trên chính bạn.'}</p>
                </div>
              )}
              <div className="absolute left-4 top-4 flex items-center gap-2 bg-landing-obsidian/80 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-landing-paper" role="status">
                <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', isLive ? 'bg-landing-sage' : isPaused ? 'bg-landing-brass' : 'bg-landing-paper/50')} />{statusLabel}
              </div>
              {live.appliedGarment?.items && live.appliedGarment.items.length > 0 && (isLive || isPaused) && (
                <div className="absolute left-4 top-14 flex items-center gap-1.5 bg-landing-obsidian/80 p-1 text-landing-paper">
                  {live.appliedGarment.items.map((item) => (
                    <div key={item.productId} title={`${item.name} (${LAYER_ROLE_LABELS[item.layerRole] || item.layerRole})`} className="relative h-7 w-6 overflow-hidden border border-landing-paper/20 bg-landing-paper/10">
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt={item.name} fill sizes="24px" unoptimized className="object-cover" />
                      )}
                    </div>
                  ))}
                  <span className="pl-1 pr-2 text-[10px] text-landing-paper/80">
                    {live.appliedGarment.items.length} món
                  </span>
                </div>
              )}
              {isLive && (
                <div className="absolute right-4 top-4 flex items-center gap-1.5">
                  {autoCapture.isAutoCapturing && (
                    <span className="flex items-center gap-1.5 bg-landing-obsidian/80 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-landing-paper">
                      <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-landing-oxblood opacity-75 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-landing-oxblood" />
                      </span>
                      Tự chụp
                    </span>
                  )}
                  <button type="button" onClick={autoCapture.captureNow} aria-label="Chụp ngay" title="Chụp ngay" className={stageButton}>
                    <Aperture size={17} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => autoCapture.setAutoCapture(!autoCapture.isAutoCapturing)}
                    aria-label={autoCapture.isAutoCapturing ? 'Tắt tự chụp' : 'Bật tự chụp'}
                    aria-pressed={autoCapture.isAutoCapturing}
                    title={autoCapture.isAutoCapturing ? 'Tắt tự chụp' : 'Bật tự chụp'}
                    className={cn(stageButton, autoCapture.isAutoCapturing && 'border-landing-oxblood bg-landing-oxblood hover:bg-landing-oxblood/85')}
                  >
                    {autoCapture.isAutoCapturing ? <Camera size={16} strokeWidth={1.75} /> : <CameraOff size={16} strokeWidth={1.75} />}
                  </button>
                </div>
              )}
              {autoCapture.captures.length > 0 && (isLive || isPaused) && (
                <div className="absolute bottom-14 left-4 right-28 sm:right-36">
                  <div className="no-scrollbar flex items-end gap-2 overflow-x-auto bg-landing-obsidian/80 p-2">
                    {autoCapture.captures.map((cap, idx) => (
                      <button
                        key={cap.id}
                        type="button"
                        onClick={() => setViewingCapture(cap)}
                        aria-label={`Xem ảnh chụp ${idx + 1}, lúc ${new Date(cap.capturedAt).toLocaleTimeString('vi-VN')}`}
                        className={cn('relative shrink-0 overflow-hidden border border-landing-paper/20 transition-colors hover:border-landing-paper/60', tryOnFocusRing)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh chụp là data URL tạo trong trình duyệt */}
                        <img src={cap.dataUrl} alt="" className="h-14 w-11 object-cover sm:h-16 sm:w-12" />
                        <span className="absolute inset-x-0 bottom-0 bg-landing-obsidian/70 py-0.5 text-center font-mono text-[8px] text-landing-paper">
                          {new Date(cap.capturedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-landing-paper/60">{autoCapture.captures.length} ảnh đã chụp</span>
                    <button type="button" onClick={autoCapture.clearCaptures} className={cn('text-[10px] text-landing-paper/60 hover:text-landing-paper', tryOnFocusRing)}>
                      Xoá tất cả
                    </button>
                  </div>
                </div>
              )}
              <div className={cn('absolute bottom-4 right-4 w-[88px] overflow-hidden border border-landing-paper/30 bg-landing-obsidian sm:w-[112px]', !cameraStream && 'hidden')}>
                <video ref={cameraVideoRef} autoPlay muted playsInline aria-label="Camera gốc của bạn" className="aspect-[3/4] w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-landing-obsidian/70 py-1 text-center text-[10px] text-landing-paper">Camera của bạn</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-landing-paper/10 px-4 py-3 text-xs text-landing-paper/70">
              <Expand size={14} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
              {outfitMode ? 'Lùi lại để thấy trọn áo và quần trong khung hình.' : 'Đứng nơi đủ sáng, giữ trang phục trong khung hình.'}
            </div>
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-landing-muted">
            <Camera size={13} strokeWidth={1.75} aria-hidden="true" />Camera chỉ được gửi để xử lý khi bạn bắt đầu hoặc tiếp tục thử.
          </p>
        </div>

        <div className="min-w-0 space-y-6 lg:sticky lg:top-[97px]">
          <div>
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-[1.375rem] leading-tight text-landing-obsidian">Trang phục</h2>
              <span className="font-mono text-xs text-landing-muted">{String(selectedCount).padStart(2, '0')} món</span>
            </div>
            <TryOnSegmented
              ariaLabel="Số món thử"
              value={outfitMode ? 'combo' : 'single'}
              onChange={(value) => onOutfitModeChange(value === 'combo')}
              disabled={selectionLocked}
              options={[
                { value: 'single', label: 'Một món' },
                { value: 'combo', label: 'Phối bộ', icon: <Layers size={14} strokeWidth={1.75} aria-hidden="true" /> },
              ]}
            />
            <div className={cn('mt-5', outfitMode && 'divide-y divide-landing-line/70 border-y border-landing-line/70')}>
              {outfitMode ? (
                <>
                  <div className="py-4">
                    <GarmentSlot label="Lớp ngoài" hint="Tùy chọn" product={outerProduct || null} color={outerColor} emptyLabel="Áo khoác hoặc blazer" onSelect={onOpenOuterCatalog || (() => {})} onClear={outerProduct && onClearOuter ? onClearOuter : undefined} disabled={selectionLocked} />
                    <GarmentColorPicker product={outerProduct || null} selectedColor={outerColor} onSelectColor={onSelectOuterColor} disabled={isBusy || isLive || otherSessionRunning} label="Màu lớp ngoài" lockedHint="Tạm dừng để đổi màu." />
                  </div>
                  <div className="py-4">
                    <GarmentSlot label="Lớp trong" product={upperProduct} color={upperColor} emptyLabel="Sơ mi hoặc áo trong" onSelect={onOpenUpperCatalog} disabled={selectionLocked} />
                    <GarmentColorPicker product={upperProduct} selectedColor={upperColor} onSelectColor={onSelectUpperColor} disabled={isBusy || isLive || otherSessionRunning} label="Màu lớp trong" lockedHint="Tạm dừng để đổi màu." />
                  </div>
                  <div className="py-4">
                    <GarmentSlot label="Phần dưới" product={lowerProduct} color={lowerColor} emptyLabel="Quần hoặc chân váy" onSelect={onOpenLowerCatalog} disabled={selectionLocked} />
                    <GarmentColorPicker product={lowerProduct} selectedColor={lowerColor} onSelectColor={onSelectLowerColor} disabled={isBusy || isLive || otherSessionRunning} label="Màu phần dưới" lockedHint="Tạm dừng để đổi màu." />
                  </div>
                </>
              ) : (
                <>
                  <GarmentSlot label="Trang phục" product={selectedProduct} color={selectedColor} emptyLabel="Chưa chọn trang phục" onSelect={onOpenCatalog} disabled={selectionLocked} />
                  <GarmentColorPicker product={selectedProduct} selectedColor={selectedColor} onSelectColor={onSelectColor} disabled={isBusy || isLive || otherSessionRunning} label="Màu" lockedHint="Tạm dừng để đổi màu." />
                </>
              )}
            </div>
            <p className={cn('mt-4 flex items-start gap-2 text-xs leading-5', isPaused ? 'text-landing-oxblood' : 'text-landing-muted')}>
              {isPaused ? <RefreshCw size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden="true" /> : <CirclePause size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden="true" />}
              {isPaused ? 'Chọn lại món bạn thích. Nhấn Tiếp tục để mặc trang phục mới.' : isLive ? 'Muốn đổi đồ? Nhấn Tạm dừng trước khi chọn món mới.' : 'Thử cả bộ vẫn dùng chung thời gian của một phiên.'}
            </p>
            {live.appliedGarment?.items && live.appliedGarment.items.length > 0 && (
              <div className="mt-5 border-t border-landing-line pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className={tryOnLabelClassName}>Đang mặc trên camera</span>
                  <span className="font-mono text-xs text-landing-oxblood">{live.appliedGarment.items.length} món</span>
                </div>
                <ul className="space-y-2">
                  {live.appliedGarment.items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-[2px] bg-landing-ivory">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="40px" unoptimized className="object-contain p-1 mix-blend-multiply" />
                        ) : (
                          <Shirt size={16} strokeWidth={1.5} className="m-auto mt-4 text-landing-muted" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-brass-ink">
                          {LAYER_ROLE_LABELS[item.layerRole] || item.layerRole}
                          {item.isPrimary ? <span className="ml-2 text-landing-oxblood">Chính</span> : null}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-landing-obsidian">{item.name}</p>
                        {item.color ? <p className="text-xs text-landing-muted">Màu {item.color}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="fixed inset-x-0 bottom-[64px] z-40 border-t border-landing-line bg-landing-paper px-4 py-3 md:bottom-4 md:left-auto md:right-6 md:w-[400px] md:border lg:static lg:w-auto lg:px-5 lg:py-5" aria-label="Điều khiển phiên thử trực tiếp">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={cn('flex h-10 w-10 items-center justify-center border', lowTime ? 'border-destructive/40 text-destructive' : 'border-landing-line text-landing-brass-ink')} aria-hidden="true">
                  <Timer size={18} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-[11px] text-landing-muted">{hasSession ? 'Thời gian phiên còn lại' : 'Thời gian cho phiên mới'}</p>
                  <p className={cn('font-mono text-[28px] leading-8 tabular-nums', lowTime ? 'text-destructive' : 'text-landing-obsidian')} role="timer" aria-label={`${hasSession ? 'Phiên còn' : 'Phiên mới'} ${formatTime(seconds)}`}>
                    {isLoading && !hasSession ? '--:--' : formatTime(seconds)}
                  </p>
                </div>
              </div>
              <span className={cn('max-w-[130px] text-right text-[11px]', isPaused ? 'text-landing-brass-ink' : lowTime ? 'text-destructive' : 'text-landing-muted')} role="status">
                {isBusy ? busyLabel(live.status) : isPaused ? 'Đã tạm dừng' : lowTime ? 'Sắp hết thời gian' : isLive ? 'Đang tính thời gian' : 'Sẵn sàng khi bạn muốn'}
              </span>
            </div>
            <div className={cn('grid gap-2', hasSession ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-1')}>
              <button type="button" disabled={isLive ? false : !canStart} onClick={isLive ? () => void live.pause('client_pause') : start} className={cn(tryOnButtonClassName('primary', 'lg'), 'w-full')}>
                {isBusy ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : isLive ? <CirclePause size={17} strokeWidth={1.75} aria-hidden="true" /> : <Play size={15} fill="currentColor" aria-hidden="true" />}
                {isBusy ? 'Vui lòng chờ' : isLive ? 'Tạm dừng' : isPaused ? 'Tiếp tục thử' : 'Bắt đầu thử đồ'}
              </button>
              {hasSession && (
                <button type="button" disabled={isBusy} onClick={() => void live.stop('client_end', currentSessionId)} className={tryOnButtonClassName('outline', 'lg')}>
                  <Square size={13} strokeWidth={1.75} aria-hidden="true" />Kết thúc
                </button>
              )}
            </div>
          </div>

          {(live.error || unavailable) && (
            <div role={live.error ? 'alert' : 'status'} className={cn('border-l-2 bg-landing-ivory px-4 py-3 text-sm leading-6', live.error ? 'border-destructive text-destructive' : 'border-landing-brass text-landing-obsidian')}>
              {live.error || unavailable}
              {isError && (
                <button type="button" onClick={() => void refetch()} className={cn('ml-2 inline-flex min-h-9 items-center gap-1 font-medium text-landing-oxblood underline underline-offset-4', tryOnFocusRing)}>
                  <RefreshCw size={13} strokeWidth={1.75} aria-hidden="true" />Thử lại
                </button>
              )}
            </div>
          )}

          <details className="group border-y border-landing-line">
            <summary className={cn('flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-xs text-landing-muted [&::-webkit-details-marker]:hidden', tryOnFocusRing)}>
              <span>Thời gian thử trực tiếp hôm nay</span>
              <span className="flex items-center gap-2 text-landing-obsidian">
                {isLoading ? 'Đang tải…' : quota ? <><span className="font-mono">{formatTime(quota.remaining)}</span> còn dùng được</> : 'Chưa có dữ liệu'}
                <ChevronDown size={14} strokeWidth={1.75} className="transition-transform group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>
            {quota && (
              <dl className="space-y-2 border-t border-landing-line/70 py-3 text-xs text-landing-muted">
                <div className="flex justify-between"><dt>Tổng thời gian mỗi ngày</dt><dd className="font-mono text-landing-obsidian">{formatTime(quota.limit)}</dd></div>
                <div className="flex justify-between"><dt>Đã sử dụng</dt><dd className="font-mono text-landing-obsidian">{formatTime(quota.allocated)}</dd></div>
                <div className="flex justify-between"><dt>Dành cho phiên đang mở</dt><dd className="font-mono text-landing-obsidian">{formatTime(quota.reserved)}</dd></div>
                <p className="pt-1 leading-5">Thời gian còn lại của phiên hiển thị ở bộ đếm. Thử trực tiếp không trừ lượt thử bằng ảnh.</p>
              </dl>
            )}
          </details>
          <button type="button" disabled={hasSession || isBusy} onClick={onSwitchToPhoto} className={cn(tryOnButtonClassName('quiet', 'sm'), 'w-full')}>
            <ImageIcon size={14} strokeWidth={1.75} aria-hidden="true" />Thử bằng ảnh<ArrowRight size={13} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>
      <CaptureViewer
        capture={viewingCapture}
        captures={autoCapture.captures}
        onClose={() => setViewingCapture(null)}
        onNavigate={setViewingCapture}
        onDownload={autoCapture.downloadCapture}
        onRemove={(c) => { autoCapture.removeCapture(c.id); setViewingCapture(null); }}
      />
    </section>
  );
}

function formatTime(seconds: number) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;
}

function busyLabel(status: string) {
  const labels: Record<string, string> = { 'requesting-camera': 'Đang mở camera', 'preparing-garment': 'Đang chuẩn bị trang phục', connecting: 'Đang kết nối', 'awaiting-first-frame': 'Đang tạo hình ảnh', pausing: 'Đang tạm dừng', resuming: 'Đang tiếp tục', stopping: 'Đang kết thúc' };
  return labels[status];
}

function reasonLabel(reason?: string) {
  if (reason === 'free_not_allowed') return 'Nâng cấp gói thành viên để thử đồ trực tiếp.';
  if (reason === 'subscription_expired') return 'Gói thành viên đã hết hạn. Gia hạn để tiếp tục thử đồ.';
  return 'Thử đồ trực tiếp chưa khả dụng với tài khoản của bạn.';
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/** Xem lại ảnh tự chụp: Radix Dialog (giữ focus, Esc để đóng), mũi tên trái phải để chuyển ảnh. */
function CaptureViewer({
  capture,
  captures,
  onClose,
  onNavigate,
  onDownload,
  onRemove,
}: {
  capture: LiveCapture | null;
  captures: LiveCapture[];
  onClose: () => void;
  onNavigate: (c: LiveCapture) => void;
  onDownload: (c: LiveCapture) => void;
  onRemove: (c: LiveCapture) => void;
}) {
  const idx = capture ? captures.findIndex((c) => c.id === capture.id) : -1;
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < captures.length - 1;

  useEffect(() => {
    if (!capture) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(captures[idx - 1]);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(captures[idx + 1]);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [capture, onNavigate, captures, idx, hasPrev, hasNext]);

  return (
    <Dialog.Root open={capture !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-landing-obsidian/90 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-0 z-[101] flex flex-col items-center justify-center p-4 text-landing-paper focus:outline-none">
          {capture ? (
            <>
              <div className="mb-3 flex w-full max-w-[min(90vw,560px)] items-center justify-between gap-4">
                <Dialog.Title className="font-mono text-xs text-landing-paper/80">
                  {idx + 1} / {captures.length} · {new Date(capture.capturedAt).toLocaleTimeString('vi-VN')}
                </Dialog.Title>
                <Dialog.Description className="sr-only">Ảnh chụp từ phiên thử trực tiếp</Dialog.Description>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onDownload(capture)} aria-label="Tải ảnh này" className={stageButton}>
                    <Download size={16} strokeWidth={1.75} />
                  </button>
                  <button type="button" onClick={() => onRemove(capture)} aria-label="Xoá ảnh này" className={cn(stageButton, 'hover:bg-destructive')}>
                    <Trash2 size={16} strokeWidth={1.75} />
                  </button>
                  <Dialog.Close aria-label="Đóng" className={stageButton}>
                    <X size={18} strokeWidth={1.75} />
                  </Dialog.Close>
                </div>
              </div>
              <div className="relative overflow-hidden border border-landing-paper/15">
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh chụp là data URL tạo trong trình duyệt */}
                <img src={capture.dataUrl} alt={`Ảnh chụp thử đồ ${idx + 1}`} className="max-h-[72svh] max-w-[90vw] object-contain" />
              </div>
              <div className="mt-3 flex max-w-[90vw] items-center gap-3">
                <button type="button" disabled={!hasPrev} onClick={() => hasPrev && onNavigate(captures[idx - 1])} aria-label="Ảnh trước" className={stageButton}>
                  <ChevronLeft size={18} strokeWidth={1.75} />
                </button>
                <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-1">
                  {captures.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onNavigate(c)}
                      aria-label={`Ảnh ${i + 1}`}
                      aria-current={c.id === capture.id ? 'true' : undefined}
                      className={cn('shrink-0 overflow-hidden border-2 transition-opacity', c.id === capture.id ? 'border-landing-oxblood' : 'border-landing-paper/20 opacity-60 hover:opacity-100', tryOnFocusRing)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh chụp là data URL tạo trong trình duyệt */}
                      <img src={c.dataUrl} alt="" className="h-10 w-8 object-cover" />
                    </button>
                  ))}
                </div>
                <button type="button" disabled={!hasNext} onClick={() => hasNext && onNavigate(captures[idx + 1])} aria-label="Ảnh tiếp" className={stageButton}>
                  <ChevronRight size={18} strokeWidth={1.75} />
                </button>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
