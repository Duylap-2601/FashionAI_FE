'use client';

import type { Product } from '@/features/products/types/products';
import { useLiveTryOnQuota } from '@/features/subscription/hooks/useQuota';
import { useLiveTryOn } from '@/features/try-on/hooks/use-live-try-on';
import { Camera, CircleStop, Info, Loader2, Radio, Shirt } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface LiveTryOnWorkspaceProps {
  selectedProduct: Product;
  onOpenCatalog: () => void;
  onSwitchToPhoto: () => void;
}

export function LiveTryOnWorkspace({ selectedProduct, onOpenCatalog, onSwitchToPhoto }: LiveTryOnWorkspaceProps) {
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const live = useLiveTryOn();
  const { quota, isLoading: isQuotaLoading, isError: isQuotaError, refetch } = useLiveTryOnQuota();
  const hasBackendProduct = isUuid(selectedProduct.id);
  const hasResumableSession = live.hasResumableSession(selectedProduct.id);
  const [remoteVideoInfo, setRemoteVideoInfo] = useState('no video');

  useEffect(() => {
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = live.cameraStream;
      if (live.cameraStream) void cameraVideoRef.current.play().catch(() => undefined);
    }
  }, [live.cameraStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = live.remoteStream;
      if (live.remoteStream) {
        void remoteVideoRef.current.play().catch(() => undefined);
        if ('requestVideoFrameCallback' in remoteVideoRef.current) {
          remoteVideoRef.current.requestVideoFrameCallback(() => {
            updateVideoInfo(remoteVideoRef.current, setRemoteVideoInfo);
            live.markFirstFrame();
          });
        }
      }
    }
  }, [live.remoteStream, live.markFirstFrame]);

  useEffect(() => {
    if (live.status === 'ended') void refetch();
  }, [live.status, refetch]);

  const canStart = hasBackendProduct && Boolean(selectedProduct?.id) && quota?.enabled && quota.eligible && (!quota.activeSession || hasResumableSession) && live.status !== 'live' && live.status !== 'connecting' && live.status !== 'requesting-camera' && live.status !== 'preparing-garment' && live.status !== 'awaiting-first-frame';
  const disabledText = !hasBackendProduct ? 'Live chỉ dùng sản phẩm từ catalog backend. Mock catalog không được dùng cho Live.' : isQuotaLoading ? 'Đang tải quota Live...' : isQuotaError ? 'Không tải được quota Live. Kiểm tra đăng nhập, BE và migration live.' : quota && !quota.enabled ? 'Live Try-On đang tắt bằng feature flag.' : quota && !quota.eligible ? reasonLabel(quota.disabledReason) : quota?.activeSession ? `Phiên cũ còn khóa đến ${new Date(quota.activeSession.blockedUntil).toLocaleTimeString('vi-VN')}` : null;
  const isBusy = ['requesting-camera', 'preparing-garment', 'connecting', 'awaiting-first-frame', 'stopping'].includes(live.status);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-6 lg:gap-8">
      <div className="rounded-[28px] border border-[#D7CABC] bg-[#171412] p-3 shadow-[0_24px_80px_rgba(35,24,18,0.18)]">
        <div className="grid min-h-[520px] grid-cols-1 gap-3 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-[22px] bg-black">
            <video ref={cameraVideoRef} autoPlay muted playsInline className="h-full min-h-[260px] w-full object-cover" />
            {!live.cameraStream && <VideoPlaceholder icon={<Camera className="h-9 w-9" />} label="Camera preview" />}
            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-[#1A1917]">Preview</div>
          </div>
          <div className="relative overflow-hidden rounded-[22px] bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              muted
              playsInline
              onLoadedData={() => {
                updateVideoInfo(remoteVideoRef.current, setRemoteVideoInfo);
                if ((remoteVideoRef.current?.videoWidth ?? 0) > 0) live.markFirstFrame();
              }}
              onPlaying={() => updateVideoInfo(remoteVideoRef.current, setRemoteVideoInfo)}
              onTimeUpdate={() => updateVideoInfo(remoteVideoRef.current, setRemoteVideoInfo)}
              className="h-full min-h-[260px] w-full object-cover"
            />
            {(!live.remoteStream || live.status === 'awaiting-first-frame') && <VideoPlaceholder icon={<Radio className="h-9 w-9" />} label={live.remoteStream ? 'Đang chờ frame AI đầu tiên' : 'AI live output'} />}
            <div className="absolute left-3 top-3 rounded-full bg-[#5D1C34] px-3 py-1 text-[12px] font-semibold text-white">Decart Lucy</div>
            {live.status === 'live' && <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#5D1C34]">{live.remainingSeconds}s</div>}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5DFD5] bg-white p-4 md:p-5 self-start lg:sticky lg:top-24">
        <div>
          <h2 className="text-[20px] font-semibold text-[#1A1917]">Live Try-On</h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">Đổi sản phẩm trong cùng phiên Live, dùng chung thời gian còn lại. Camera sẽ được gửi đến Decart khi bắt đầu.</p>
        </div>

        <div className="rounded-2xl border border-[#E5DFD5] bg-[#F9F7F5] p-3">
          <div className="flex items-center gap-3">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
              <Image src={selectedProduct.image} alt={selectedProduct.name} fill sizes="64px" unoptimized className="object-contain p-2" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5D1C34]">Garment</p>
              <h3 className="truncate text-body-md font-bold text-brand-navy">{selectedProduct.name}</h3>
              <button type="button" onClick={onOpenCatalog} disabled={isBusy} className="mt-1 text-[13px] font-semibold text-[#5D1C34] hover:underline disabled:opacity-60">Đổi sản phẩm</button>
              {live.status === 'live' && <p className="mt-1 text-[12px] text-neutral-500">Chọn sản phẩm rồi nhấn Áp dụng áo. Thời gian Live tiếp tục chạy khi đổi sản phẩm.</p>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5DFD5] p-3 text-body-sm text-neutral-700">
          <div className="flex items-center justify-between">
            <span>Quota Live</span>
            <span className="font-bold text-[#5D1C34]">{isQuotaLoading ? 'Đang tải...' : quota ? `${quota.remaining}/${quota.limit}s` : 'Không có dữ liệu'}</span>
          </div>
          {disabledText && <p className="mt-2 text-[13px] text-amber-700">{disabledText}</p>}
          {isQuotaError && <button type="button" onClick={() => void refetch()} className="mt-2 text-[13px] font-semibold text-[#5D1C34] underline">Tải lại quota</button>}
          {live.blockedUntil && <p className="mt-2 text-[13px] text-neutral-500">Khóa phiên đến {new Date(live.blockedUntil).toLocaleTimeString('vi-VN')}.</p>}
        </div>

        {live.error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-body-sm text-red-700">{live.error}</div>}
        {live.sdkState && <div className="rounded-xl border border-[#E5DFD5] bg-[#F9F7F5] px-3 py-2 text-body-sm text-neutral-600">Decart state: <span className="font-semibold text-[#5D1C34]">{live.sdkState}</span></div>}
        <div className="rounded-xl border border-[#E5DFD5] bg-[#F9F7F5] px-3 py-2 text-[12px] text-neutral-500">
          <div>Video: {remoteVideoInfo}</div>
          {live.diagnostic && <div>SDK: {live.diagnostic}</div>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {live.status === 'live' ? (
            <button type="button" onClick={() => void live.stop('client_end')} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#5D1C34] px-4 py-3 text-label-sm font-bold text-white hover:bg-[#4A162A]">
              <CircleStop className="h-4 w-4" /> Kết thúc Live
            </button>
          ) : (
            <button type="button" disabled={!canStart} onClick={() => void live.start(selectedProduct.id)} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#5D1C34] px-4 py-3 text-label-sm font-bold text-white hover:bg-[#4A162A] disabled:cursor-not-allowed disabled:opacity-55">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} {hasResumableSession ? 'Tiếp tục Live' : 'Bắt đầu Live'}
            </button>
          )}
          <button type="button" disabled={!live.remoteStream || isBusy} onClick={() => void live.updateGarment(selectedProduct.id)} className="flex items-center justify-center gap-2 rounded-xl border border-[#E5DFD5] px-4 py-2.5 text-label-sm font-semibold text-[#5D1C34] disabled:opacity-50">
            <Shirt className="h-4 w-4" /> Áp dụng áo
          </button>
          <button type="button" onClick={onSwitchToPhoto} className="rounded-xl border border-[#E5DFD5] px-4 py-2.5 text-label-sm font-semibold text-neutral-700 hover:bg-[#F9F7F5]">Thử bằng ảnh</button>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[#E5DFD5] bg-[#F9F7F5] px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#5D1C34]" />
          <p className="text-body-sm text-neutral-700">Live không dùng quota ảnh. Nếu mất response sau khi cấp credential, hệ thống sẽ chờ hết lease thay vì cấp token lần hai.</p>
        </div>
      </div>
    </div>
  );
}

function VideoPlaceholder({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#241B18] to-[#090807] text-white/70">{icon}<span className="text-label-sm font-semibold">{label}</span></div>;
}

function reasonLabel(reason?: string) {
  if (reason === 'free_not_allowed') return 'Live Try-On yêu cầu gói thành viên.';
  if (reason === 'subscription_expired') return 'Gói thành viên đã hết hạn.';
  if (reason === 'not_in_beta') return 'Tài khoản chưa nằm trong allowlist beta Live.';
  return 'Live Try-On hiện chưa khả dụng.';
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function updateVideoInfo(video: HTMLVideoElement | null, setValue: (value: string) => void) {
  if (!video) return;
  const stream = video.srcObject instanceof MediaStream ? video.srcObject : null;
  const tracks = stream?.getVideoTracks() ?? [];
  const trackInfo = tracks.map((track) => `${track.readyState}:${track.muted ? 'muted' : 'unmuted'}`).join(',') || 'none';
  setValue(`ready=${video.readyState} size=${video.videoWidth}x${video.videoHeight} t=${video.currentTime.toFixed(1)} tracks=${tracks.length} [${trackInfo}]`);
}
