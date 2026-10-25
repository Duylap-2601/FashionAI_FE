'use client';

import type { Product } from '@/features/products/types/products';
import { getValidProductColors, normalizeProductColorName, resolveProductImageForColor } from '@/features/products/services/products-utils';
import { useLiveTryOnQuota } from '@/features/subscription/hooks/useQuota';
import { useLiveTryOn } from '@/features/try-on/hooks/use-live-try-on';
import type { LiveTryOnSessionItem } from '@/features/try-on/types/live-try-on';
import { trackEvent } from '@/lib/analytics';
import { ArrowRight, Camera, Check, ChevronDown, CirclePause, Expand, Image as ImageIcon, Layers, Loader2, Play, Plus, RefreshCw, Shirt, Square, Timer } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

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

const buttonFocus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D1C34] focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-45';

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
    <section aria-label="Phòng thử đồ trực tiếp" className="pb-40 md:pb-32 lg:pb-0">
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#865C68]">Phòng thử trực tiếp</p>
          <h2 className="font-serif text-[30px] leading-[1.1] tracking-tight text-[#302323] sm:text-[40px]">Phòng thử của bạn</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#81716D]">Một góc nhìn mới, một bộ đồ thật hợp.</p>
        </div>
        <span className="hidden shrink-0 items-center gap-2 rounded-full border border-[#E7DDD6] px-3 py-2 text-[12px] text-[#715B55] sm:inline-flex">Thử đồ trực tiếp</span>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:gap-7">
        <div className="min-w-0">
          <div className="relative isolate overflow-hidden rounded-[26px] bg-[#272422] shadow-[0_12px_40px_-16px_rgba(48,35,35,0.4)]">
            <div className={`relative lg:h-[640px] ${isPaused ? 'h-[min(36svh,320px)] min-h-[260px]' : 'h-[min(58svh,560px)] min-h-[300px]'}`}>
              <video ref={remoteVideoRef} autoPlay muted playsInline aria-label="Kết quả thử đồ trực tiếp" onLoadedData={() => { if ((remoteVideoRef.current?.videoWidth ?? 0) > 0) markFirstFrame(); }} className="h-full w-full object-contain" />
              {(!remoteStream || live.status === 'awaiting-first-frame') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_35%,#514640_0%,#272422_70%)] px-8 text-center">
                  <div className="absolute inset-x-[18%] inset-y-[10%] rounded-t-[45%] rounded-b-[26px] border border-white/10" aria-hidden="true" />
                  <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[#EBDACD]">
                    {isBusy ? <Loader2 size={25} className="animate-spin motion-reduce:animate-none" /> : isPaused ? <CirclePause size={28} strokeWidth={1.3} /> : <Shirt size={28} strokeWidth={1.3} />}
                  </div>
                  <p className="relative font-serif text-[28px] text-[#FFF7EF]">{isPaused ? 'Nghỉ một chút nhé' : isBusy ? 'Đang chuẩn bị cho bạn' : 'Sẵn sàng cho diện mạo mới?'}</p>
                  <p className="relative mt-3 max-w-[260px] text-[13px] leading-6 text-[#D0C0B6]">{isPaused ? 'Bạn có thể đổi trang phục bên dưới, rồi tiếp tục phiên đang có.' : isBusy ? 'Giữ camera ổn định. Hình ảnh của bạn sẽ xuất hiện tại đây.' : 'Chọn trang phục, bật camera và xem ngay trên chính bạn.'}</p>
                </div>
              )}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-[#211B1B]/75 px-3 py-2 text-[11px] font-medium text-white backdrop-blur-md" role="status">
                <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-[#B8D9B0]' : isPaused ? 'bg-[#EBC790]' : 'bg-white/50'}`} />{statusLabel}
              </div>
              {live.appliedGarment?.items && live.appliedGarment.items.length > 0 && (isLive || isPaused) && (
                <div className="absolute left-4 top-14 flex items-center gap-1.5 rounded-full bg-[#211B1B]/75 p-1 text-[11px] text-white backdrop-blur-md">
                  {live.appliedGarment.items.map((item) => (
                    <div key={item.productId} title={`${item.name} (${LAYER_ROLE_LABELS[item.layerRole] || item.layerRole})`} className="relative h-6 w-6 overflow-hidden rounded-full border border-white/20 bg-white/10">
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt={item.name} fill sizes="24px" unoptimized className="object-cover" />
                      )}
                    </div>
                  ))}
                  <span className="pr-2 pl-1 text-[10px] font-medium text-neutral-200">
                    {live.appliedGarment.items.length} món
                  </span>
                </div>
              )}
              <div className={`absolute bottom-4 right-4 w-[88px] overflow-hidden rounded-2xl border border-white/30 bg-[#332E2B] shadow-lg sm:w-[112px] ${cameraStream ? '' : 'hidden'}`}>
                <video ref={cameraVideoRef} autoPlay muted playsInline aria-label="Camera gốc của bạn" className="aspect-[3/4] w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] text-white">Camera của bạn</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-[12px] text-[#DFD2C8]"><Expand size={15} className="shrink-0" />{outfitMode ? 'Lùi lại để thấy trọn áo và quần trong khung hình.' : 'Đứng nơi đủ sáng, giữ trang phục trong khung hình.'}</div>
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#887873]"><Camera size={13} />Camera chỉ được gửi để xử lý khi bạn bắt đầu hoặc tiếp tục thử.</p>
        </div>

        <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-[24px] border border-[#E9E0D9] bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[16px] font-semibold text-[#302323]">Bạn muốn mặc gì?</h3>
              <span className="text-[11px] text-[#8D7871]">{outfitMode ? `${String(selectedCount).padStart(2, '0')} món đồ` : '01 món đồ'}</span>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[#F4F0EC] p-1" role="group" aria-label="Chế độ trang phục">
              {[{ label: 'Một món', combo: false }, { label: 'Phối bộ', combo: true }].map(({ label, combo }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={outfitMode === combo}
                  disabled={selectionLocked}
                  onClick={() => onOutfitModeChange(combo)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold transition-colors ${buttonFocus} ${outfitMode === combo ? 'bg-white text-[#5D1C34] shadow-sm' : 'text-[#8A7871] hover:text-[#5D1C34]'}`}
                >
                  {combo && <Layers size={14} />}
                  {outfitMode === combo && !combo && <Check size={14} />}
                  {label}
                </button>
              ))}
            </div>
            <div className={outfitMode ? 'space-y-3' : ''}>
              {outfitMode ? (
                <>
                  <div className="space-y-1.5">
                    <GarmentCard
                      label="Áo khoác"
                      title="Món 1: Áo khoác / Blazer"
                      subLabel="Lớp ngoài - Tùy chọn"
                      product={outerProduct || null}
                      onSelect={onOpenOuterCatalog || (() => {})}
                      onClear={outerProduct && onClearOuter ? onClearOuter : undefined}
                      disabled={selectionLocked}
                      color={outerColor}
                      horizontal
                    />
                    <ColorSelector
                      product={outerProduct || null}
                      selectedColor={outerColor}
                      onSelectColor={onSelectOuterColor || (() => {})}
                      disabled={isBusy || isLive || otherSessionRunning}
                      label="Màu áo khoác"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <GarmentCard
                      label="Áo"
                      title="Món 2: Áo trong / Sơ mi / Áo thun"
                      subLabel="Lớp trong"
                      product={upperProduct}
                      onSelect={onOpenUpperCatalog}
                      disabled={selectionLocked}
                      color={upperColor}
                      horizontal
                    />
                    <ColorSelector
                      product={upperProduct}
                      selectedColor={upperColor}
                      onSelectColor={onSelectUpperColor}
                      disabled={isBusy || isLive || otherSessionRunning}
                      label="Màu áo trong"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <GarmentCard
                      label="Quần"
                      title="Món 3: Quần / Chân váy"
                      subLabel="Lớp dưới"
                      product={lowerProduct}
                      onSelect={onOpenLowerCatalog}
                      disabled={selectionLocked}
                      color={lowerColor}
                      horizontal
                    />
                    <ColorSelector
                      product={lowerProduct}
                      selectedColor={lowerColor}
                      onSelectColor={onSelectLowerColor}
                      disabled={isBusy || isLive || otherSessionRunning}
                      label="Màu quần / váy"
                    />
                  </div>
                </>
              ) : (
                <>
                  <GarmentCard
                    label="Trang phục"
                    product={selectedProduct}
                    onSelect={onOpenCatalog}
                    disabled={selectionLocked}
                    horizontal
                    color={selectedColor}
                  />
                  <ColorSelector
                    product={selectedProduct}
                    selectedColor={selectedColor}
                    onSelectColor={onSelectColor}
                    disabled={isBusy || isLive || otherSessionRunning}
                    label="Màu trang phục"
                  />
                </>
              )}
            </div>
            <p className={`mt-4 flex items-start gap-2 text-[12px] leading-5 ${isPaused ? 'text-[#5D1C34]' : 'text-[#8A7871]'}`}>
              {isPaused ? <RefreshCw size={14} className="mt-0.5 shrink-0" /> : <CirclePause size={14} className="mt-0.5 shrink-0" />}
              {isPaused ? 'Chọn lại món bạn thích. Nhấn Tiếp tục để mặc trang phục mới.' : isLive ? 'Muốn đổi đồ? Nhấn Tạm dừng trước khi chọn món mới.' : 'Thử cả bộ vẫn dùng chung thời gian của một phiên.'}
            </p>
            {live.appliedGarment?.items && live.appliedGarment.items.length > 0 && (
              <div className="mt-4 border-t border-[#E9E0D9] pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#865C68]">
                    Đang hiển thị trên camera
                  </span>
                  <span className="rounded-full bg-[#5D1C34]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5D1C34]">
                    {live.appliedGarment.items.length} món
                  </span>
                </div>
                <div className="space-y-2">
                  {live.appliedGarment.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-2.5 rounded-xl border border-[#ECE3DB] bg-[#FAF7F4] p-2">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-white">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="40px" unoptimized className="object-contain p-1 mix-blend-multiply" />
                        ) : (
                          <Shirt size={16} className="m-auto text-[#AC9185]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#F0E6DE] px-1.5 py-0.5 text-[9px] font-semibold text-[#6E4B41]">
                            {LAYER_ROLE_LABELS[item.layerRole] || item.layerRole}
                          </span>
                          {item.isPrimary && (
                            <span className="rounded bg-[#5D1C34] px-1.5 py-0.5 text-[9px] font-medium text-white">
                              Chính
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[12px] font-medium text-[#302323]">{item.name}</p>
                        {item.color && (
                          <p className="text-[10px] text-[#8D7871]">Màu: {item.color}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="fixed inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom))] z-40 rounded-[22px] border border-[#E2D4CA] bg-[#FFFDF9]/95 p-3 shadow-[0_4px_32px_rgba(48,35,35,0.16)] backdrop-blur-xl md:bottom-4 md:left-auto md:right-6 md:w-[400px] lg:static lg:w-auto lg:p-5 lg:shadow-none" aria-label="Điều khiển phiên thử trực tiếp">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${lowTime ? 'bg-[#FBE4DC] text-[#A13E29]' : 'bg-[#F0E6E0] text-[#79544C]'}`}><Timer size={19} strokeWidth={1.6} /></div>
                <div><p className="text-[11px] font-medium text-[#84716B]">{hasSession ? 'Thời gian phiên còn lại' : 'Thời gian cho phiên mới'}</p><p className={`font-mono text-[30px] font-medium leading-9 tracking-tight tabular-nums ${lowTime ? 'text-[#A13E29]' : 'text-[#472C31]'}`} role="timer" aria-label={`${hasSession ? 'Phiên còn' : 'Phiên mới'} ${formatTime(seconds)}`}>{isLoading && !hasSession ? '--:--' : formatTime(seconds)}</p></div>
              </div>
              <span className={`max-w-[120px] text-right text-[11px] font-medium ${isPaused ? 'text-[#976C29]' : lowTime ? 'text-[#A13E29]' : 'text-[#8A7871]'}`} role="status">{isBusy ? busyLabel(live.status) : isPaused ? 'Đã tạm dừng' : lowTime ? 'Sắp hết thời gian' : isLive ? 'Đang tính thời gian' : 'Sẵn sàng khi bạn muốn'}</span>
            </div>
            <div className={`grid gap-2 ${hasSession ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-1'}`}>
              <button type="button" disabled={isLive ? false : !canStart} onClick={isLive ? () => void live.pause('client_pause') : start} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#5D1C34] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#481428] ${buttonFocus}`}>
                {isBusy ? <Loader2 size={18} className="animate-spin motion-reduce:animate-none" /> : isLive ? <CirclePause size={19} /> : <Play size={17} fill="currentColor" />}
                {isBusy ? 'Vui lòng chờ…' : isLive ? 'Tạm dừng' : isPaused ? 'Tiếp tục thử' : 'Bắt đầu thử đồ'}
              </button>
              {hasSession && <button type="button" disabled={isBusy} onClick={() => void live.stop('client_end', currentSessionId)} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#DACCC3] px-3 text-[13px] font-semibold text-[#65504A] hover:bg-[#F0E6E0] ${buttonFocus}`}><Square size={14} />Kết thúc</button>}
            </div>
          </div>

          {(live.error || unavailable) && <div role={live.error ? 'alert' : 'status'} className={`rounded-2xl border px-4 py-3 text-[13px] leading-6 ${live.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-[#E9DED1] bg-[#FBF6ED] text-[#7D6140]'}`}>{live.error || unavailable}{isError && <button type="button" onClick={() => void refetch()} className={`ml-2 inline-flex min-h-11 items-center gap-1 font-semibold underline ${buttonFocus}`}><RefreshCw size={13} />Thử lại</button>}</div>}

          <details className="group rounded-2xl border border-[#E9E0D9] bg-[#F8F5F1] px-4">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-[12px] text-[#7C6760] [&::-webkit-details-marker]:hidden"><span>Thời gian thử trực tiếp hôm nay</span><span className="flex items-center gap-2 font-semibold text-[#4E3833]">{isLoading ? 'Đang tải…' : quota ? `${formatTime(quota.remaining)} có thể dùng` : 'Chưa có dữ liệu'}<ChevronDown size={14} className="transition-transform group-open:rotate-180" /></span></summary>
            {quota && <div className="space-y-2 border-t border-[#E9E0D9] py-3 text-[12px] text-[#87716A]"><div className="flex justify-between"><span>Tổng thời gian mỗi ngày</span><span>{formatTime(quota.limit)}</span></div><div className="flex justify-between"><span>Đã sử dụng</span><span>{formatTime(quota.allocated)}</span></div><div className="flex justify-between"><span>Dành cho phiên đang mở</span><span>{formatTime(quota.reserved)}</span></div><p className="pt-1 leading-5">Thời gian còn lại của phiên hiển thị ở bộ đếm. Thử trực tiếp không trừ lượt thử bằng ảnh.</p></div>}
          </details>
          <button type="button" disabled={hasSession || isBusy} onClick={onSwitchToPhoto} className={`flex min-h-11 w-full items-center justify-center gap-2 text-[12px] text-[#8A7871] hover:text-[#5D1C34] ${buttonFocus}`}><ImageIcon size={15} />Thử bằng ảnh<ArrowRight size={14} /></button>
        </div>
      </div>
    </section>
  );
}

function GarmentCard({
  label,
  title,
  subLabel,
  product,
  onSelect,
  onClear,
  disabled,
  horizontal = false,
  color,
}: {
  label: string;
  title?: string;
  subLabel?: string;
  product: Product | null;
  onSelect: () => void;
  onClear?: () => void;
  disabled: boolean;
  horizontal?: boolean;
  color?: string | null;
}) {
  const resolvedImage = product ? resolveProductImageForColor(product, color) : null;
  const displayImage = resolvedImage?.url || product?.image;
  const displayTitle = title || label;

  return (
    <div className={`group w-full min-w-0 overflow-hidden rounded-2xl border border-[#E8DED6] bg-[#FCFAF7] transition-colors hover:border-[#B49789] ${horizontal ? 'p-3' : 'p-2.5'}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#5D1C34] truncate">
            {displayTitle}
            {subLabel && <span className="ml-1.5 font-normal text-[10px] text-[#987C70]">({subLabel})</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {product && onClear && (
            <button
              type="button"
              disabled={disabled}
              onClick={onClear}
              className={`text-[11px] font-semibold text-neutral-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-0 ${buttonFocus}`}
            >
              Bỏ chọn
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={onSelect}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold text-[#5D1C34] hover:underline cursor-pointer bg-transparent border-0 ${buttonFocus}`}
          >
            {product ? 'Đổi món' : '+ Chọn ngay'}
            <ArrowRight size={11} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        aria-label={`${product ? 'Đổi' : 'Chọn'} ${label.toLowerCase()}${product ? `: ${product.name}` : ''}`}
        className={`w-full text-left bg-transparent border-0 cursor-pointer p-0 ${buttonFocus} ${horizontal ? 'flex items-center gap-3.5' : 'flex items-center gap-3'}`}
      >
        <div className={`relative flex items-center justify-center rounded-xl bg-[#F1EBE5] shrink-0 ${horizontal ? 'h-20 w-18' : 'h-18 w-16'}`}>
          {product && displayImage ? (
            <Image src={displayImage} alt={product.name} fill sizes="80px" unoptimized className="object-contain p-1.5 mix-blend-multiply" />
          ) : (
            <Plus size={22} strokeWidth={1.2} className="text-[#AC9185]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#43312C]">
            {product?.name ?? `Chưa chọn ${label.toLowerCase()}`}
          </p>
          {product?.price && (
            <p className="mt-0.5 text-[12px] text-neutral-500 font-medium">
              {product.price}
            </p>
          )}
          {!product && (
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#6C3045]">
              Nhấn để chọn món
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

function ColorSelector({ product, selectedColor, onSelectColor, disabled, label }: { product: Product | null; selectedColor?: string | null; onSelectColor: (color: string) => void; disabled: boolean; label: string }) {
  const colors = getValidProductColors(product);
  if (!product || colors.length < 2) return null;
  const currentColor = normalizeProductColorName(selectedColor) || normalizeProductColorName(colors[0]?.name);

  return (
    <div className="mt-4 min-w-0 rounded-2xl border border-[#E9E0D9] bg-[#FCFAF7] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#987C70]">{label}</p>
        <span className="truncate text-[12px] font-semibold text-[#5D1C34]">{selectedColor || colors[0]?.name}</span>
      </div>
      <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1" role="radiogroup" aria-label={label}>
        {colors.map(color => {
          const selected = normalizeProductColorName(color.name) === currentColor;
          return (
            <button
              key={color.name}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onSelectColor(color.name)}
              className={`flex min-h-10 max-w-full items-center gap-2 rounded-full border bg-white px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${buttonFocus} ${selected ? 'border-[#5D1C34] text-[#5D1C34] ring-1 ring-[#5D1C34]' : 'border-[#E2D4CA] text-[#65504A] hover:border-[#B49789]'}`}
              title={color.name}
            >
              <span className="h-5 w-5 shrink-0 rounded-full border border-black/15 ring-1 ring-white" style={{ backgroundColor: color.hex }} />
              <span className="truncate">{color.name}</span>
              {selected && <Check size={13} className="shrink-0" />}
            </button>
          );
        })}
      </div>
      {disabled && <p className="mt-2 text-[11px] leading-4 text-[#8A7871]">Tạm dừng để đổi màu trang phục.</p>}
    </div>
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
