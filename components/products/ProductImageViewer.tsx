'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Move,
  Check
} from 'lucide-react';

interface ProductImageViewerProps {
  images: string[];
  productName: string;
  brand?: string;
  activeThumb: number;
  onSelectThumb: (index: number) => void;
  fallbackImage?: string;
}

export default function ProductImageViewer({
  images,
  productName,
  brand = 'FASHIONAI COLLECTION',
  activeThumb,
  onSelectThumb,
  fallbackImage = '/images/731163514_999523332788054_1114320478812927640_n.png',
}: ProductImageViewerProps) {
  const safeImages = images && images.length > 0 ? images : [fallbackImage];
  const currentImage = safeImages[activeThumb] || fallbackImage;

  // Hover lens state for main display
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const mainImageRef = useRef<HTMLDivElement>(null);

  // Lightbox Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(activeThumb);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%, 2 = 200%, etc.
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialOffsetX: number; initialOffsetY: number }>({
    startX: 0,
    startY: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
  });

  // Sync modalIndex with activeThumb when modal opens
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

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  // Modal navigation
  const goToPrevImage = useCallback(() => {
    setModalIndex(prev => {
      const nextIdx = (prev - 1 + safeImages.length) % safeImages.length;
      onSelectThumb(nextIdx);
      return nextIdx;
    });
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [safeImages.length, onSelectThumb]);

  const goToNextImage = useCallback(() => {
    setModalIndex(prev => {
      const nextIdx = (prev + 1) % safeImages.length;
      onSelectThumb(nextIdx);
      return nextIdx;
    });
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [safeImages.length, onSelectThumb]);

  const handleSelectModalThumb = useCallback((idx: number) => {
    setModalIndex(idx);
    onSelectThumb(idx);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [onSelectThumb]);

  // Modal zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(3.5, Number((prev + 0.5).toFixed(1))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Handle keyboard shortcuts in modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
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
  }, [isModalOpen, closeModal, goToPrevImage, goToNextImage, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Main hover magnifier handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 50, y: 50 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(3.5, Number((prev + 0.25).toFixed(2))));
    } else {
      setZoomLevel(prev => {
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

  // Drag to pan handlers in modal
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
    
    // Bounds clamping based on zoom level
    const maxOffset = 250 * (zoomLevel - 1);
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.initialOffsetX + dx));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.initialOffsetY + dy));

    setPanOffset({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* MAIN IMAGE CONTAINER WITH HOVER MAGNIFIER */}
      <div 
        ref={mainImageRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={openModal}
        className="relative w-full aspect-[3/4] md:max-w-[560px] bg-neutral-100 rounded-2xl overflow-hidden cursor-zoom-in select-none group shadow-sm border border-neutral-200/60"
      >
        <img 
          src={currentImage} 
          alt={productName} 
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
          style={{
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            transform: isHovered ? 'scale(2.2)' : 'scale(1)',
            transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.35s cubic-bezier(0.2, 0, 0.2, 1)',
          }}
          className="w-full h-full object-cover pointer-events-none" 
        />

        {/* Top-Right: Quick Fullscreen Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openModal();
          }}
          aria-label="Phóng to toàn màn hình"
          className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-brand-navy backdrop-blur-md rounded-full text-label-sm font-semibold shadow-md transition-all opacity-90 group-hover:opacity-100 group-hover:scale-105 cursor-pointer z-10"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#5D1C34]" />
          <span>Phóng to</span>
        </button>

        {/* Bottom Hint Banner */}
        <div className={`absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-[11px] font-medium tracking-wide">
            <ZoomIn className="w-3 h-3 text-amber-300" />
            <span>Rê chuột để soi vải · Click để mở to</span>
          </div>

          <div className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-brand-navy rounded-full text-[11px] font-bold shadow-sm">
            {activeThumb + 1} / {safeImages.length}
          </div>
        </div>

        {/* Active Hover Badge */}
        {isHovered && (
          <div className="absolute bottom-3.5 right-3.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white rounded-full text-[11px] font-medium pointer-events-none transition-all">
            2.2x Lens
          </div>
        )}
      </div>
      
      {/* THUMBNAILS STRIP */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 md:max-w-[560px]">
        {safeImages.map((img, idx) => {
          const isActive = activeThumb === idx;
          return (
            <button 
              key={idx} 
              type="button"
              onClick={() => onSelectThumb(idx)}
              className={`shrink-0 w-[82px] h-[110px] rounded-xl overflow-hidden transition-all duration-200 cursor-pointer relative bg-neutral-100 ${
                isActive 
                  ? 'ring-2 ring-[#5D1C34] ring-offset-2 scale-[1.02] shadow-sm' 
                  : 'opacity-70 hover:opacity-100 border border-neutral-200'
              }`}
            >
              <img 
                src={img} 
                alt={`Ảnh chi tiết ${idx + 1}`} 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                }}
                className="w-full h-full object-cover" 
              />
              {isActive && (
                <div className="absolute inset-0 border-2 border-[#5D1C34] rounded-xl pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* FULL-FEATURED LIGHTBOX MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200"
          onClick={closeModal}
        >
          {/* MODAL HEADER */}
          <div 
            className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-lg shrink-0 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">{brand}</span>
              <h3 className="text-[16px] font-semibold text-white truncate max-w-[280px] sm:max-w-[500px]">
                {productName}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-label-sm font-medium">
                Ảnh {modalIndex + 1} / {safeImages.length}
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN MODAL VIEWPORT */}
          <div 
            className="relative flex-1 flex items-center justify-center overflow-hidden p-4 select-none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleMouseUp}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Image Button */}
            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-110 cursor-pointer backdrop-blur-md"
                title="Ảnh trước (Mũi tên trái)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Image Button */}
            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-110 cursor-pointer backdrop-blur-md"
                title="Ảnh tiếp theo (Mũi tên phải)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Scalable & Draggable Image */}
            <div 
              onDoubleClick={handleDoubleClick}
              className={`max-w-full max-h-full flex items-center justify-center transition-transform ${
                zoomLevel > 1 
                  ? isDragging ? 'cursor-grabbing' : 'cursor-grab' 
                  : 'cursor-zoom-in'
              }`}
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
              }}
            >
              <img 
                src={safeImages[modalIndex]} 
                alt={productName}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                }}
                className="max-h-[75vh] w-auto object-contain rounded-lg pointer-events-none shadow-2xl" 
              />
            </div>

            {/* FLOATING ZOOM CONTROLS TOOLBAR */}
            <div 
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-neutral-900/85 backdrop-blur-md border border-white/15 rounded-full shadow-2xl text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2.5 py-0.5 text-xs font-semibold rounded-md hover:bg-white/20 transition-colors cursor-pointer text-neutral-200"
                title="Nhấn để đưa về 100%"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.5}
                className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Phóng to (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-white/20 mx-1" />

              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-neutral-300 hover:text-white"
                title="Đặt lại (0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {zoomLevel > 1 && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-300/90 pl-1">
                  <Move className="w-3 h-3" />
                  <span>Kéo để soi chi tiết</span>
                </div>
              )}
            </div>
          </div>

          {/* MODAL BOTTOM THUMBNAILS */}
          <div 
            className="px-6 py-4 bg-black/50 border-t border-white/10 backdrop-blur-lg flex items-center justify-center gap-3 overflow-x-auto no-scrollbar shrink-0 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {safeImages.map((img, idx) => {
              const isSelected = modalIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectModalThumb(idx)}
                  className={`relative shrink-0 w-14 h-18 rounded-lg overflow-hidden transition-all duration-150 cursor-pointer ${
                    isSelected 
                      ? 'ring-2 ring-amber-400 scale-105 opacity-100' 
                      : 'opacity-50 hover:opacity-90 border border-white/20'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumb ${idx + 1}`} 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = fallbackImage;
                    }}
                    className="w-full h-full object-cover" 
                  />
                  {isSelected && (
                    <div className="absolute bottom-1 right-1 p-0.5 bg-amber-400 text-black rounded-full">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
