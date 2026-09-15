'use client';

import type { Product } from '@/features/products/types/products';
import { useLiveTryOnQuota } from '@/features/subscription/hooks/useQuota';
import { useLiveTryOn } from '@/features/try-on/hooks/use-live-try-on';
import { ArrowRight, Camera, Check, ChevronDown, CirclePause, Expand, Image as ImageIcon, Loader2, Play, Plus, RefreshCw, Shirt, Sparkles, Square, Timer } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface LiveTryOnWorkspaceProps {
  selectedProduct: Product;
  upperProduct: Product | null;
  lowerProduct: Product | null;
  onOpenUpperCatalog: () => void;
  onOpenLowerCatalog: () => void;
  onOpenCatalog: () => void;
  onSwitchToPhoto: () => void;
}

const buttonFocus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D1C34] focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-45';

export function LiveTryOnWorkspace({ selectedProduct, upperProduct, lowerProduct, onOpenUpperCatalog, onOpenLowerCatalog, onOpenCatalog, onSwitchToPhoto }: LiveTryOnWorkspaceProps) {
  const [outfitMode, setOutfitMode] = useState(false);
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
  const primaryProduct = outfitMode ? upperProduct : selectedProduct;
  const productsReady = Boolean(primaryProduct && isUuid(primaryProduct.id) && (!outfitMode || (lowerProduct && isUuid(lowerProduct.id))));
  const seconds = live.sessionId ? live.remainingSeconds : activeSession?.remainingSeconds ?? Math.min(quota?.remaining ?? 0, quota?.maxDurationSeconds ?? 0);
  const lowTime = hasSession && seconds > 0 && seconds <= 10;
  const canStart = productsReady && (!hasSession || isPaused) && !isBusy && !isLive && !otherSessionRunning && !isLoading && !isError && Boolean(quota?.enabled && quota.eligible) && seconds > 0;
  const statusLabel = isPaused ? 'Đã tạm dừng' : isLive ? 'Đang thử trực tiếp' : busyLabel(live.status) ?? (live.status === 'ended' ? 'Phiên đã kết thúc' : 'Sẵn sàng thử đồ');
  const unavailable = isLoading ? 'Đang kiểm tra thời gian thử đồ…' : isError ? 'Chưa tải được thời gian sử dụng. Vui lòng thử lại.' : quota && !quota.enabled ? 'Thử đồ trực tiếp hiện đang tạm nghỉ. Bạn vẫn có thể thử bằng ảnh.' : quota && !quota.eligible ? reasonLabel(quota.disabledReason) : otherSessionRunning ? 'Bạn có phiên đang mở ở nơi khác. Kết thúc phiên đó để bắt đầu tại đây.' : !productsReady ? (outfitMode ? 'Chọn đủ áo và quần để bắt đầu.' : 'Chọn một sản phẩm để bắt đầu thử đồ.') : !hasSession && seconds <= 0 && quota ? 'Bạn đã dùng hết thời gian Live hôm nay.' : null;

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

  const start = () => {
    if (primaryProduct && canStart) void live.start(primaryProduct.id, resumeId, outfitMode ? lowerProduct?.id : undefined);
  };

  return (
    <section aria-label="Phòng thử đồ trực tiếp" className="pb-40 md:pb-32 lg:pb-0">
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#865C68]">LIVE FITTING ROOM</p>
          <h2 className="font-serif text-[30px] leading-[1.1] tracking-tight text-[#302323] sm:text-[40px]">Phòng thử của bạn</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#81716D]">Một góc nhìn mới, một bộ đồ thật hợp.</p>
        </div>
        <span className="hidden shrink-0 items-center gap-2 rounded-full border border-[#E7DDD6] px-3 py-2 text-[12px] text-[#715B55] sm:inline-flex"><Sparkles size={14} /> Thử đồ trực tiếp</span>
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
              <div className={`absolute bottom-4 right-4 w-[88px] overflow-hidden rounded-2xl border border-white/30 bg-[#332E2B] shadow-lg sm:w-[112px] ${cameraStream ? '' : 'hidden'}`}>
                <video ref={cameraVideoRef} autoPlay muted playsInline aria-label="Camera gốc của bạn" className="aspect-[3/4] w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] text-white">Camera của bạn</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-[12px] text-[#DFD2C8]"><Expand size={15} className="shrink-0" />{outfitMode ? 'Lùi lại để thấy trọn áo và quần trong khung hình.' : 'Đứng nơi đủ sáng, giữ trang phục trong khung hình.'}</div>
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#887873]"><Camera size={13} />Camera chỉ được gửi để xử lý khi bắt đầu hoặc tiếp tục Live.</p>
        </div>

        <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-[24px] border border-[#E9E0D9] bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[16px] font-semibold text-[#302323]">Bạn muốn mặc gì?</h3>
              <span className="text-[11px] text-[#8D7871]">{outfitMode ? '02 món đồ' : '01 món đồ'}</span>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[#F4F0EC] p-1" role="group" aria-label="Chế độ trang phục">
              {[{ label: 'Một món', combo: false }, { label: 'Áo + quần', combo: true }].map(({ label, combo }) => (
                <button key={label} type="button" aria-pressed={outfitMode === combo} disabled={selectionLocked} onClick={() => setOutfitMode(combo)} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold transition-colors ${buttonFocus} ${outfitMode === combo ? 'bg-white text-[#5D1C34] shadow-sm' : 'text-[#8A7871] hover:text-[#5D1C34]'}`}>{outfitMode === combo && <Check size={14} />}{label}</button>
              ))}
            </div>
            <div className={outfitMode ? 'grid grid-cols-1 min-[380px]:grid-cols-2 gap-3' : ''}>
              {outfitMode ? <><GarmentCard label="Áo" product={upperProduct} onSelect={onOpenUpperCatalog} disabled={selectionLocked} /><GarmentCard label="Quần" product={lowerProduct} onSelect={onOpenLowerCatalog} disabled={selectionLocked} /></> : <GarmentCard label="Trang phục" product={selectedProduct} onSelect={onOpenCatalog} disabled={selectionLocked} horizontal />}
            </div>
            <p className={`mt-4 flex items-start gap-2 text-[12px] leading-5 ${isPaused ? 'text-[#5D1C34]' : 'text-[#8A7871]'}`}>
              {isPaused ? <RefreshCw size={14} className="mt-0.5 shrink-0" /> : <CirclePause size={14} className="mt-0.5 shrink-0" />}
              {isPaused ? 'Chọn lại món bạn thích. Nhấn Tiếp tục để mặc trang phục mới.' : isLive ? 'Muốn đổi đồ? Nhấn Tạm dừng trước khi chọn món mới.' : 'Thử cả bộ vẫn dùng chung thời gian của một phiên.'}
            </p>
          </div>

          <div className="fixed inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom))] z-40 rounded-[22px] border border-[#E2D4CA] bg-[#FFFDF9]/95 p-3 shadow-[0_4px_32px_rgba(48,35,35,0.16)] backdrop-blur-xl md:bottom-4 md:left-auto md:right-6 md:w-[400px] lg:static lg:w-auto lg:p-5 lg:shadow-none" aria-label="Điều khiển phiên Live">
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
                {isBusy ? 'Vui lòng chờ…' : isLive ? 'Tạm dừng' : isPaused ? 'Tiếp tục Live' : 'Bắt đầu thử đồ'}
              </button>
              {hasSession && <button type="button" disabled={isBusy} onClick={() => void live.stop('client_end', currentSessionId)} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#DACCC3] px-3 text-[13px] font-semibold text-[#65504A] hover:bg-[#F0E6E0] ${buttonFocus}`}><Square size={14} />Kết thúc</button>}
            </div>
          </div>

          {(live.error || unavailable) && <div role={live.error ? 'alert' : 'status'} className={`rounded-2xl border px-4 py-3 text-[13px] leading-6 ${live.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-[#E9DED1] bg-[#FBF6ED] text-[#7D6140]'}`}>{live.error || unavailable}{isError && <button type="button" onClick={() => void refetch()} className={`ml-2 inline-flex min-h-11 items-center gap-1 font-semibold underline ${buttonFocus}`}><RefreshCw size={13} />Thử lại</button>}</div>}

          <details className="group rounded-2xl border border-[#E9E0D9] bg-[#F8F5F1] px-4">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-[12px] text-[#7C6760] [&::-webkit-details-marker]:hidden"><span>Thời gian Live hôm nay</span><span className="flex items-center gap-2 font-semibold text-[#4E3833]">{isLoading ? 'Đang tải…' : quota ? `${formatTime(quota.remaining)} có thể dùng` : 'Chưa có dữ liệu'}<ChevronDown size={14} className="transition-transform group-open:rotate-180" /></span></summary>
            {quota && <div className="space-y-2 border-t border-[#E9E0D9] py-3 text-[12px] text-[#87716A]"><div className="flex justify-between"><span>Tổng thời gian mỗi ngày</span><span>{formatTime(quota.limit)}</span></div><div className="flex justify-between"><span>Đã sử dụng</span><span>{formatTime(quota.allocated)}</span></div><div className="flex justify-between"><span>Dành cho phiên đang mở</span><span>{formatTime(quota.reserved)}</span></div><p className="pt-1 leading-5">Thời gian còn lại của phiên hiển thị ở bộ đếm. Live không sử dụng lượt thử bằng ảnh.</p></div>}
          </details>
          <button type="button" disabled={hasSession || isBusy} onClick={onSwitchToPhoto} className={`flex min-h-11 w-full items-center justify-center gap-2 text-[12px] text-[#8A7871] hover:text-[#5D1C34] ${buttonFocus}`}><ImageIcon size={15} />Thử bằng ảnh<ArrowRight size={14} /></button>
        </div>
      </div>
    </section>
  );
}

function GarmentCard({ label, product, onSelect, disabled, horizontal = false }: { label: string; product: Product | null; onSelect: () => void; disabled: boolean; horizontal?: boolean }) {
  return (
    <button type="button" onClick={onSelect} disabled={disabled} aria-label={`${product ? 'Đổi' : 'Chọn'} ${label.toLowerCase()}${product ? `: ${product.name}` : ''}`} className={`group w-full min-w-0 overflow-hidden rounded-2xl border border-[#E8DED6] bg-[#FCFAF7] text-left transition-colors hover:border-[#B49789] ${buttonFocus} ${horizontal ? 'flex items-center gap-4 p-3' : 'p-2.5 max-[379px]:flex max-[379px]:items-center max-[379px]:gap-3'}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-[#F1EBE5] ${horizontal ? 'h-28 w-24 shrink-0' : 'mb-3 aspect-[4/3] w-full max-[379px]:mb-0 max-[379px]:h-24 max-[379px]:w-20 max-[379px]:shrink-0'}`}>
        {product ? <Image src={product.image} alt={product.name} fill sizes={horizontal ? '96px' : '(max-width: 640px) 40vw, 180px'} unoptimized className="object-contain p-2 mix-blend-multiply" /> : <Plus size={24} strokeWidth={1.2} className="text-[#AC9185]" />}
      </div>
      <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#987C70]">{label}</p><p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-5 text-[#43312C]">{product?.name ?? `Chọn ${label.toLowerCase()} của bạn`}</p><span className="mt-2 inline-flex min-h-6 items-center gap-1 text-[11px] font-medium text-[#6C3045]">{product ? 'Đổi món' : 'Chọn ngay'}<ArrowRight size={12} /></span></div>
    </button>
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
