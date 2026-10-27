'use client';

import { LANDING_MEDIA } from '@/features/home/constants/landing-media';
import type { ProductImageViewerProps } from '@/features/products/types/product-image-viewer';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Move,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const focusRingPaper = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const focusRingDark = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-brass';
const labelText = 'text-[10px] font-semibold uppercase tracking-[0.18em]';

export default function ProductImageViewer({
  images,
  productName,
  brand = 'StAie. Signature',
  activeThumb,
  onSelectThumb,
  fallbackImage = LANDING_MEDIA.productFallback,
}: ProductImageViewerProps) {
  const safeImages = useMemo(
    () => (images && images.length > 0 ? images : [fallbackImage]),
    [images, fallbackImage],
  );
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const imageAt = useCallback(
    (index: number) => (failedImages[index] ? fallbackImage : safeImages[index] || fallbackImage),
    [failedImages, fallbackImage, safeImages],
  );

  const handleImageError = useCallback((index: number) => {
    setFailedImages((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
  }, []);

  const currentImage = imageAt(activeThumb);

  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const mainImageRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(activeThumb);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialOffsetX: number;
    initialOffsetY: number;
  }>({
    startX: 0,
    startY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
  });

  const openModal = () => {
    setModalIndex(activeThumb);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const goToPrevImage = useCallback(() => {
    const nextIdx = (modalIndex - 1 + safeImages.length) % safeImages.length;
    setModalIndex(nextIdx);
    onSelectThumb(nextIdx);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [modalIndex, onSelectThumb, safeImages.length]);

  const goToNextImage = useCallback(() => {
    const nextIdx = (modalIndex + 1) % safeImages.length;
    setModalIndex(nextIdx);
    onSelectThumb(nextIdx);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [modalIndex, onSelectThumb, safeImages.length]);

  const handleSelectModalThumb = useCallback((idx: number) => {
    setModalIndex(idx);
    onSelectThumb(idx);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [onSelectThumb]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(3.5, Number((prev + 0.5).toFixed(1))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevImage();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, goToPrevImage, goToNextImage, handleZoomIn, handleZoomOut, handleResetZoom]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 50, y: 50 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(3.5, Number((prev + 0.25).toFixed(2))));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(1, Number((prev - 0.25).toFixed(2)));
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleDoubleClick = () => {
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      setZoomLevel(2.2);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialOffsetX: panOffset.x,
      initialOffsetY: panOffset.y,
    };
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const maxOffset = 250 * (zoomLevel - 1);
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.initialOffsetX + dx));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.initialOffsetY + dy));

    setPanOffset({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={mainImageRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="group relative aspect-[3/4] w-full max-w-[560px] overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory select-none"
      >
        <Image
          src={currentImage}
          alt={`${productName} - ảnh ${activeThumb + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          onError={() => handleImageError(activeThumb)}
          style={{
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            transform: isHovered ? 'scale(2.2)' : 'scale(1)',
            transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="object-cover pointer-events-none"
        />

        <button
          type="button"
          onClick={openModal}
          aria-label={`Mở thư viện ảnh ${productName}`}
          className={`absolute inset-0 z-10 cursor-zoom-in ${focusRingPaper}`}
        />

        <button
          type="button"
          onClick={openModal}
          aria-label="Phóng to ảnh"
          className={`absolute right-3 top-3 z-20 inline-flex h-10 items-center gap-2 border border-landing-line bg-landing-paper/95 px-3 text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood ${labelText} ${focusRingPaper}`}
        >
          <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>Phóng to</span>
        </button>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-center justify-between gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className={`inline-flex items-center gap-2 border border-landing-paper/15 bg-landing-obsidian/80 px-3 py-1.5 text-landing-paper ${labelText}`}>
            <ZoomIn className="h-3 w-3 text-landing-brass" strokeWidth={1.75} />
            <span>Rê chuột để soi vải</span>
          </div>

          <div className="border border-landing-line bg-landing-paper/95 px-2.5 py-1 font-mono text-[10px] font-medium text-landing-obsidian">
            {activeThumb + 1} / {safeImages.length}
          </div>
        </div>

        {isHovered && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-3 right-3 z-20 border border-landing-paper/15 bg-landing-obsidian/80 px-2.5 py-1 font-mono text-[10px] text-landing-paper ${labelText}`}
          >
            2.2x
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar md:max-w-[560px]">
        {safeImages.map((img, idx) => {
          const isActive = activeThumb === idx;
          return (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => onSelectThumb(idx)}
              aria-label={`Xem ảnh ${idx + 1} của ${productName}`}
              aria-pressed={isActive}
              className={`relative h-[110px] w-[82px] shrink-0 overflow-hidden rounded-[2px] bg-landing-ivory transition-all duration-200 ${focusRingPaper} ${
                isActive
                  ? 'border-2 border-landing-oxblood'
                  : 'border border-landing-line opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={imageAt(idx)}
                alt={`${productName} - ảnh ${idx + 1}`}
                fill
                sizes="82px"
                onError={() => handleImageError(idx)}
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      <Dialog.Root open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-landing-obsidian/95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <Dialog.Content
            className="fixed inset-0 z-[101] flex flex-col bg-landing-obsidian text-landing-paper focus:outline-none"
            aria-label={`Thư viện ảnh ${productName}`}
          >
            <Dialog.Title className="sr-only">Thư viện ảnh {productName}</Dialog.Title>
            <Dialog.Description className="sr-only">
              Dùng phím mũi tên để chuyển ảnh, phím cộng và trừ để phóng to, phím 0 để đặt lại, Esc để đóng.
            </Dialog.Description>

            <div className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-landing-paper/15 px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <p className={`text-landing-brass ${labelText}`}>{brand || 'StAie. Signature'}</p>
                <p className="mt-1 max-w-[170px] truncate font-display text-base text-landing-paper min-[380px]:max-w-[220px] sm:max-w-[500px] sm:text-lg">
                  {productName}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <span className="border border-landing-paper/15 px-2.5 py-1 font-mono text-[10px] text-landing-paper/70 sm:px-3">
                  Ảnh {modalIndex + 1} / {safeImages.length}
                </span>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Đóng thư viện ảnh"
                  className={`flex h-11 w-11 items-center justify-center border border-landing-paper/15 text-landing-paper transition-colors hover:border-landing-brass hover:text-landing-brass ${focusRingDark}`}
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <div
              className="relative flex flex-1 select-none items-center justify-center overflow-hidden p-4"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleModalMouseMove}
              onMouseUp={handleMouseUp}
            >
              {safeImages.length > 1 && (
                <button
                  type="button"
                  onClick={goToPrevImage}
                  aria-label="Ảnh trước"
                  className={`absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-landing-paper/20 bg-landing-obsidian/80 text-landing-paper transition-colors hover:border-landing-brass hover:text-landing-brass sm:left-6 ${focusRingDark}`}
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
                </button>
              )}

              {safeImages.length > 1 && (
                <button
                  type="button"
                  onClick={goToNextImage}
                  aria-label="Ảnh tiếp theo"
                  className={`absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-landing-paper/20 bg-landing-obsidian/80 text-landing-paper transition-colors hover:border-landing-brass hover:text-landing-brass sm:right-6 ${focusRingDark}`}
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
                </button>
              )}

              <div
                onDoubleClick={handleDoubleClick}
                className={`flex max-h-full max-w-full items-center justify-center transition-transform ${
                  zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
                }`}
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div className="relative h-[75vh] w-[min(90vw,900px)]">
                  <Image
                    src={imageAt(modalIndex)}
                    alt={`${productName} - ảnh ${modalIndex + 1}`}
                    fill
                    sizes="90vw"
                    onError={() => handleImageError(modalIndex)}
                    className="pointer-events-none object-contain"
                  />
                </div>
              </div>

              <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 border border-landing-paper/15 bg-landing-obsidian/90 px-2 py-1.5 text-landing-paper">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  aria-label="Thu nhỏ"
                  className={`flex h-9 w-9 items-center justify-center transition-colors hover:text-landing-brass disabled:cursor-not-allowed disabled:opacity-30 ${focusRingDark}`}
                >
                  <ZoomOut className="h-4 w-4" strokeWidth={1.75} />
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  aria-label="Đặt lại mức phóng to"
                  className={`min-w-[56px] px-2 py-1 font-mono text-[11px] text-landing-paper/80 transition-colors hover:text-landing-brass ${focusRingDark}`}
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3.5}
                  aria-label="Phóng to"
                  className={`flex h-9 w-9 items-center justify-center transition-colors hover:text-landing-brass disabled:cursor-not-allowed disabled:opacity-30 ${focusRingDark}`}
                >
                  <ZoomIn className="h-4 w-4" strokeWidth={1.75} />
                </button>

                <span className="mx-1 h-4 w-px bg-landing-paper/20" aria-hidden="true" />

                <button
                  type="button"
                  onClick={handleResetZoom}
                  aria-label="Đặt lại ảnh"
                  className={`flex h-9 w-9 items-center justify-center text-landing-paper/70 transition-colors hover:text-landing-brass ${focusRingDark}`}
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>

                {zoomLevel > 1 && (
                  <div className="hidden items-center gap-1 pl-1 font-mono text-[10px] text-landing-brass sm:flex" aria-hidden="true">
                    <Move className="h-3 w-3" strokeWidth={1.75} />
                    <span>Kéo để soi</span>
                  </div>
                )}
              </div>
            </div>

            <div className="z-20 flex shrink-0 items-center justify-center gap-2 overflow-x-auto border-t border-landing-paper/15 bg-landing-obsidian/80 px-4 py-3 no-scrollbar sm:px-6">
              {safeImages.map((img, idx) => {
                const isSelected = modalIndex === idx;
                return (
                  <button
                    key={`${img}-modal-${idx}`}
                    type="button"
                    onClick={() => handleSelectModalThumb(idx)}
                    aria-label={`Xem ảnh ${idx + 1}`}
                    aria-pressed={isSelected}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[2px] transition-all duration-150 ${focusRingDark} ${
                      isSelected
                        ? 'border-2 border-landing-oxblood opacity-100'
                        : 'border border-landing-paper/20 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <Image
                      src={imageAt(idx)}
                      alt={`${productName} - ảnh thu nhỏ ${idx + 1}`}
                      fill
                      sizes="56px"
                      onError={() => handleImageError(idx)}
                      className="object-cover"
                    />
                    {isSelected && (
                      <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center bg-landing-oxblood text-landing-paper">
                        <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
