'use client';

import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import {
  Upload, CloudUpload, Info, Sparkles, Download, Bookmark,
  Share2, ArrowRight, X, CheckCircle2, ChevronRight,
  RefreshCw, Image as ImageIcon, Camera as CameraIcon
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader, PageContent } from '@/components/navigation/Layout';
import { PRODUCTS, Product } from '@/lib/data';
import { useTryOn } from '@/hooks/useTryOn';
import { useQuota } from '@/hooks/useQuota';
import { useMeasurements, useUserProfile } from '@/hooks/useMeasurements';
import { useProducts } from '@/hooks/useProducts';
import dynamic from 'next/dynamic';

const MannequinViewer = dynamic(() => import('@/components/mannequin/MannequinViewer'), { ssr: false });

type PageState = 'idle' | 'loading' | 'result' | 'quota-exhausted';
type UploadTab = 'upload' | 'mannequin';

const MOCK_USER_PHOTO = 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=320&h=400&fit=crop&auto=format';

// ─── Before/After Comparison Slider ──────────────────────────────────────────
function ComparisonSlider({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) updatePosition(e.clientX); };
    const onUp = () => { dragging.current = false; };
    const onTouch = (e: TouchEvent) => { if (dragging.current) updatePosition(e.touches[0].clientX); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouch);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onUp);
    };
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden select-none cursor-col-resize shadow-md"
      style={{ height: 420 }}
      onMouseDown={onMouseDown}
      onTouchStart={() => { dragging.current = true; }}
    >
      <img src={after} alt="Try-On result" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={before} alt="Original photo" className="absolute inset-0 h-full object-cover" style={{ width: `${100 / (position / 100)}%`, minWidth: '100%' }} draggable={false} />
      </div>

      <div className="absolute top-0 bottom-0 w-[2px] bg-white shadow-lg pointer-events-none" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto cursor-col-resize"
          onMouseDown={onMouseDown}
          onTouchStart={() => { dragging.current = true; }}
        >
          <div className="flex gap-0.5">
            <div className="w-[3px] h-4 rounded-full bg-neutral-400" />
            <div className="w-[3px] h-4 rounded-full bg-neutral-400" />
          </div>
        </div>
      </div>

      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-[11px] font-medium pointer-events-none">
        Ảnh gốc
      </div>
      <div className="absolute top-3 right-3 px-2.5 py-1 bg-brand-navy/80 backdrop-blur-sm rounded-full text-white text-[11px] font-medium pointer-events-none">
        Kết quả Try-On
      </div>
    </div>
  );
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────
interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  uploadedImage: string | null;
  onCameraSelect: () => void;
}

function UploadZone({ onFileSelect, uploadedImage, onCameraSelect }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  if (uploadedImage) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-brand-navy/20" style={{ width: '100%', height: 400 }}>
        <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
        <button
          onClick={() => onFileSelect(null)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <X className="w-4 h-4 text-neutral-600" />
        </button>
        <div className="absolute bottom-3 inset-x-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0" />
            <span className="text-body-sm text-neutral-700 truncate">Ảnh đã tải lên</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
      onDragLeave={() => setDraggingOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all relative ${
        draggingOver
          ? 'border-brand-navy bg-brand-navy/5 scale-[1.01]'
          : 'border-neutral-300 bg-neutral-50 hover:border-brand-navy/50 hover:bg-brand-navy/[0.02]'
      }`}
      style={{ width: '100%', height: 400 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); }}
      />
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <div className="w-[60px] h-[60px] rounded-2xl bg-brand-navy/8 flex items-center justify-center cursor-pointer" onClick={() => inputRef.current?.click()}>
          <CloudUpload className="w-[32px] h-[32px] text-brand-navy" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-body-md text-neutral-700 font-medium cursor-pointer" onClick={() => inputRef.current?.click()}>Kéo thả ảnh vào đây</p>
          <p className="text-body-sm text-neutral-500">hoặc <span className="text-brand-navy font-semibold underline cursor-pointer" onClick={() => inputRef.current?.click()}>chọn từ máy tính</span></p>
        </div>
        
        <div className="w-full flex items-center justify-center gap-2 my-2">
          <div className="h-px bg-neutral-200 flex-1" />
          <span className="text-label-sm text-neutral-400">hoặc</span>
          <div className="h-px bg-neutral-200 flex-1" />
        </div>

        <button 
          onClick={onCameraSelect}
          type="button"
          className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl text-label-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <CameraIcon className="w-4 h-4 text-brand-navy" />
          Chụp ảnh selfie
        </button>

        <p className="text-label-sm text-neutral-400 mt-2">PNG, JPG tối đa 10MB</p>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onReplace }: { product: Product; onReplace: () => void }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200 shadow-sm">
      <img
        src={product.image}
        alt={product.name}
        className="w-[80px] h-[80px] rounded-lg object-cover shrink-0 border border-neutral-100 bg-neutral-100"
      />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className="text-label-sm text-neutral-500">{product.brand}</p>
        <p className="text-body-sm font-medium text-neutral-900 leading-snug line-clamp-2">{product.name}</p>
        <p className="text-body-sm font-semibold text-brand-navy mt-0.5">{product.price}</p>
      </div>
      <button
        onClick={onReplace}
        type="button"
        className="shrink-0 text-label-sm font-semibold text-[#5D1C34] hover:text-[#5D1C34]/80 transition-colors flex items-center gap-1 whitespace-nowrap bg-transparent border-0 cursor-pointer"
      >
        Thay đổi <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Catalog Selector Modal ──────────────────────────────────────────────────
interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  products: Product[];
  currentProductId?: string;
}

function CatalogModal({ isOpen, onClose, onSelectProduct, products, currentProductId }: CatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[540px] w-full flex flex-col max-h-[80vh] overflow-hidden relative border border-neutral-200 animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-brand-navy">Chọn trang phục thử đồ</h2>
            <p className="text-[12px] text-neutral-500 mt-0.5">Chọn sản phẩm bất kỳ từ catalog cửa hàng</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-neutral-100 bg-neutral-50">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 rounded-xl border border-neutral-200 bg-white text-body-sm focus:outline-none focus:border-brand-navy transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 no-scrollbar">
          {filteredProducts.map((p) => {
            const isSelected = p.id === currentProductId;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy'
                    : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-14 h-18 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-100"
                />
                <div className="flex-col flex justify-between min-w-0 py-0.5">
                  <div>
                    <h4 className="text-[12px] font-bold text-brand-navy line-clamp-1 leading-snug">{p.name}</h4>
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5 block">{p.brand}</span>
                  </div>
                  <span className="text-[12px] font-bold text-brand-navy">{p.price}</span>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-2 py-10 text-center text-neutral-500 text-body-sm">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quota Badge ──────────────────────────────────────────────────────────────
function QuotaBadge({ count, limit }: { count: number; limit: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-semibold ${
      count > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-600 border border-red-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
      {count > 0 ? `Còn ${count} / ${limit} lượt hôm nay` : 'Hết lượt hôm nay'}
    </span>
  );
}

// ─── Loading Overlay ──────────────────────────────────────────────────────────
function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-navy/75 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-2xl shadow-xl max-w-[340px] w-full mx-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-navy border-r-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-brand-gold animate-pulse" />
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 text-center">
          <p className="text-body-md font-semibold text-neutral-900">Đang xử lý ảnh... {progress}%</p>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-navy rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-body-sm text-neutral-500">AI đang ghép trang phục vào ảnh của bạn</p>
        </div>
      </div>
    </div>
  );
}

// ─── Quota Exhausted Modal ────────────────────────────────────────────────────
function QuotaExhaustedModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-[400px] w-full p-8 flex flex-col items-center gap-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-amber-500" />
        </div>

        <div className="text-center flex flex-col gap-2">
          <h2 className="text-heading-h3 font-bold text-neutral-900">Hết lượt hôm nay</h2>
          <p className="text-body-sm text-neutral-500 leading-relaxed">
            Nâng cấp lên <strong className="text-brand-navy">Member</strong> (sau khi đặt hàng thành công) để nhận{' '}
            <strong className="text-brand-navy">10 lượt/ngày</strong> cùng nhiều tính năng độc quyền khác.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Link href="/products" className="w-full h-12 bg-brand-navy text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-navy/90 transition-colors">
            <Sparkles className="w-4 h-4 text-brand-gold animate-bounce" />
            Mua sắm ngay
          </Link>
          <button
            onClick={onClose}
            className="w-full h-12 border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
          >
            Đóng
          </button>
        </div>

        <p className="text-label-sm text-neutral-400 text-center">
          Lượt dùng được reset lúc 00:00 mỗi ngày
        </p>
      </div>
    </div>
  );
}

function dataUrlToFile(dataUrl: string, filename: string) {
  const [meta, content] = dataUrl.split(',');
  const mime = meta.match(/data:(.*?);base64/)?.[1] || 'image/png';
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

function VirtualTryOnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const { tryOnAsync, isSubmitting } = useTryOn();
  const { quota, refetch: refetchQuota } = useQuota();
  const { measurements } = useMeasurements();
  const { profile } = useUserProfile();
  const { products: backendProducts } = useProducts();
  const catalogProducts = backendProducts.length > 0 ? backendProducts : PRODUCTS;

  const [pageState, setPageState] = useState<PageState>('idle');
  const [activeTab, setActiveTab] = useState<UploadTab>('upload');
  
  // Photo states
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [resultPhotoUrl, setResultPhotoUrl] = useState<string | null>(null);

  // Mannequin states
  const [captureFn, setCaptureFn] = useState<(() => string) | null>(null);
  const [generatedMannequinSnapshot, setGeneratedMannequinSnapshot] = useState<string | null>(null);
  const [mannequinParams, setMannequinParams] = useState({
    height: 165,
    weight: 55,
    shoulder: 38,
    chest: 85,
    waist: 65,
    hip: 90,
    gender: 'female' as 'male' | 'female',
  });

  // Prefill measurements — chỉ chạy một lần khi data load xong lần đầu
  const prefillDone = React.useRef(false);
  useEffect(() => {
    if (prefillDone.current) return;
    const hasData =
      measurements?.height ||
      measurements?.weight ||
      measurements?.shoulder ||
      measurements?.chest ||
      measurements?.waist ||
      measurements?.hip ||
      profile?.gender;
    if (hasData) {
      prefillDone.current = true;
      setMannequinParams(prev => ({
        height: measurements?.height || prev.height,
        weight: measurements?.weight || prev.weight,
        shoulder: measurements?.shoulder || prev.shoulder,
        chest: measurements?.chest || prev.chest,
        waist: measurements?.waist || prev.waist,
        hip: measurements?.hip || prev.hip,
        gender: (profile?.gender === 'male' || profile?.gender === 'female') ? profile.gender : prev.gender,
      }));
    }
  }, [measurements, profile]);

  // Load product from searchParams or fallback to first product
  const initialProduct = catalogProducts.find(p => p.id === productId) || catalogProducts[0];
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [hasProduct, setHasProduct] = useState(true);
  
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [progress, setProgress] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync selected product when query parameter changes
  // Không đưa selectedProduct vào deps để tránh infinite loop
  useEffect(() => {
    if (productId) {
      const match = catalogProducts.find(p => p.id === productId);
      if (match) {
        setSelectedProduct(match);
        setHasProduct(true);
      }
    } else if (catalogProducts.length > 0) {
      setSelectedProduct(prev => prev ?? catalogProducts[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, catalogProducts]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setUserPhotoUrl(null);
      setUserPhotoBase64(null);
      setUserPhotoFile(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setUserPhotoUrl(url);
    setUserPhotoFile(file);

    try {
      const base64 = await convertFileToBase64(file);
      setUserPhotoBase64(base64);
    } catch (e) {
      console.error('Base64 conversion error:', e);
    }
  };

  const handleCameraTrigger = () => {
    cameraInputRef.current?.click();
  };

  const handleUseMockPhoto = () => {
    setUserPhotoUrl(MOCK_USER_PHOTO);
    setUserPhotoBase64(null);
    setUserPhotoFile(null);
  };

  const handleGenerate = async () => {
    // Check local quota before executing
    if (quota && quota.limit !== null && (quota.limit - quota.used) <= 0) {
      setShowQuotaModal(true);
      return;
    }
    
    let currentHumanImage: File | null = null;
    if (activeTab === 'upload') {
      if (!userPhotoFile) return;
      currentHumanImage = userPhotoFile;
    } else {
      if (!captureFn) return;
      const snapshot = captureFn();
      setGeneratedMannequinSnapshot(snapshot);
      currentHumanImage = dataUrlToFile(snapshot, 'mannequin-snapshot.png');
    }

    if (!currentHumanImage || !selectedProduct.id) return;

    setPageState('loading');
    setProgress(0);

    // Simulate progress
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressTimer);
          return 95;
        }
        return prev + 1;
      });
    }, 150);

    try {
      const payload = {
        productId: selectedProduct.id,
        humanImage: currentHumanImage,
      };

      const result = await tryOnAsync(payload);
      
      clearInterval(progressTimer);
      setProgress(100);
      setResultPhotoUrl(result.resultUrl);
      
      setTimeout(() => {
        setPageState('result');
        refetchQuota();
      }, 300);

    } catch (error) {
      clearInterval(progressTimer);
      setPageState('idle');
      console.error('Try-On error:', error);
      alert('Đã xảy ra lỗi khi tạo kết quả thử đồ. Vui lòng kiểm tra lại ảnh chụp người thật đứng thẳng.');
    }
  };

  const handleDownload = async () => {
    if (!resultPhotoUrl) return;
    try {
      const response = await fetch(resultPhotoUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${selectedProduct.name.replace(/\s+/g, '-')}-tryon.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(resultPhotoUrl, '_blank');
    }
  };

  const canGenerate = (activeTab === 'upload' ? (userPhotoBase64 !== null) : (captureFn !== null)) && hasProduct && !isSubmitting;
  const remainingQuota = quota ? (quota.limit === null ? Infinity : quota.limit - quota.used) : 3;
  const limitQuota = quota?.limit ?? Infinity;

  return (
    <>
      {pageState === 'loading' && <LoadingOverlay progress={progress} />}

      <CatalogModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        products={catalogProducts}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setHasProduct(true);
          router.replace(`/try-on?productId=${p.id}`);
        }}
        currentProductId={selectedProduct.id}
      />

      {showQuotaModal && <QuotaExhaustedModal onClose={() => setShowQuotaModal(false)} />}

      {/* Hidden camera input for mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
      />

      <div className="bg-white border-b border-neutral-200 w-full">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-heading-h1 font-bold text-brand-navy">Virtual Try-On</h1>
              <p className="text-body-sm text-neutral-500 mt-1">Thử trang phục công sở ảo bằng công nghệ AI</p>
            </div>
            <QuotaBadge count={remainingQuota} limit={limitQuota} />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* LEFT: User Photo */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-heading-h3 font-semibold text-neutral-900">Ảnh của bạn</h2>
              <p className="text-body-sm text-neutral-500 mt-0.5">Upload ảnh toàn thân rõ mặt</p>
            </div>

            <div className="flex p-1 bg-neutral-100 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg text-label-sm font-medium transition-all border-0 ${
                  activeTab === 'upload'
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 bg-transparent'
                }`}
              >
                Upload ảnh
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mannequin')}
                className={`px-4 py-2 rounded-lg text-label-sm font-medium transition-all border-0 ${
                  activeTab === 'mannequin'
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 bg-transparent'
                }`}
              >
                Dùng mannequin 3D
              </button>
            </div>

            {activeTab === 'upload' ? (
              <UploadZone 
                onFileSelect={handleFileSelect} 
                uploadedImage={userPhotoUrl} 
                onCameraSelect={handleCameraTrigger}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {/* Canvas Container */}
                <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900" style={{ height: 400 }}>
                  <MannequinViewer
                    height={mannequinParams.height}
                    weight={mannequinParams.weight}
                    shoulder={mannequinParams.shoulder}
                    chest={mannequinParams.chest}
                    waist={mannequinParams.waist}
                    hip={mannequinParams.hip}
                    gender={mannequinParams.gender}
                    onCaptureReady={setCaptureFn}
                  />
                </div>

                {/* Sliders Grid */}
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <span className="text-body-sm font-semibold text-neutral-800">Tùy chỉnh số đo Mannequin</span>
                    <div className="flex bg-neutral-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setMannequinParams(p => ({ ...p, gender: 'female' }))}
                        className={`px-3 py-1 rounded-md text-label-xs font-semibold transition-all border-0 ${
                          mannequinParams.gender === 'female'
                            ? 'bg-white text-brand-navy shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700 bg-transparent'
                        }`}
                      >
                        Nữ
                      </button>
                      <button
                        type="button"
                        onClick={() => setMannequinParams(p => ({ ...p, gender: 'male' }))}
                        className={`px-3 py-1 rounded-md text-label-xs font-semibold transition-all border-0 ${
                          mannequinParams.gender === 'male'
                            ? 'bg-white text-brand-navy shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700 bg-transparent'
                        }`}
                      >
                        Nam
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Height */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-neutral-500 font-medium">Chiều cao</span>
                        <span className="text-brand-navy font-bold">{mannequinParams.height} cm</span>
                      </div>
                      <input
                        type="range"
                        min={130}
                        max={220}
                        value={mannequinParams.height}
                        onChange={(e) => setMannequinParams(p => ({ ...p, height: parseInt(e.target.value) }))}
                        className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Weight */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-neutral-500 font-medium">Cân nặng</span>
                        <span className="text-brand-navy font-bold">{mannequinParams.weight} kg</span>
                      </div>
                      <input
                        type="range"
                        min={35}
                        max={150}
                        value={mannequinParams.weight}
                        onChange={(e) => setMannequinParams(p => ({ ...p, weight: parseInt(e.target.value) }))}
                        className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Shoulder */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-neutral-500 font-medium">Vai</span>
                        <span className="text-brand-navy font-bold">{mannequinParams.shoulder} cm</span>
                      </div>
                      <input
                        type="range"
                        min={30}
                        max={70}
                        value={mannequinParams.shoulder}
                        onChange={(e) => setMannequinParams(p => ({ ...p, shoulder: parseInt(e.target.value) }))}
                        className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Chest */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-neutral-500 font-medium">Vòng ngực</span>
                        <span className="text-brand-navy font-bold">{mannequinParams.chest} cm</span>
                      </div>
                      <input
                        type="range"
                        min={60}
                        max={140}
                        value={mannequinParams.chest}
                        onChange={(e) => setMannequinParams(p => ({ ...p, chest: parseInt(e.target.value) }))}
                        className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Waist */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-neutral-500 font-medium">Vòng eo</span>
                        <span className="text-brand-navy font-bold">{mannequinParams.waist} cm</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={130}
                        value={mannequinParams.waist}
                        onChange={(e) => setMannequinParams(p => ({ ...p, waist: parseInt(e.target.value) }))}
                        className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Hip */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-neutral-500 font-medium">Vòng mông</span>
                        <span className="text-brand-navy font-bold">{mannequinParams.hip} cm</span>
                      </div>
                      <input
                        type="range"
                        min={60}
                        max={145}
                        value={mannequinParams.hip}
                        onChange={(e) => setMannequinParams(p => ({ ...p, hip: parseInt(e.target.value) }))}
                        className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {measurements && (
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-100 mt-2">
                      <Link
                        href="/profile/measurements"
                        className="text-label-xs font-semibold text-neutral-500 hover:text-brand-navy underline"
                      >
                        Xem chi tiết số đo
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMannequinParams({
                            height: measurements.height || 165,
                            weight: measurements.weight || 55,
                            shoulder: measurements.shoulder || 38,
                            chest: measurements.chest || 85,
                            waist: measurements.waist || 65,
                            hip: measurements.hip || 90,
                            gender: (profile?.gender === 'male' || profile?.gender === 'female') ? profile.gender : 'female',
                          });
                        }}
                        className="text-label-xs font-semibold text-brand-navy hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Số đo cá nhân
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'upload' && !userPhotoUrl && (
              <button
                onClick={handleUseMockPhoto}
                type="button"
                className="text-label-sm text-brand-gold hover:text-brand-gold/80 font-semibold underline underline-offset-2 text-left bg-transparent border-0 cursor-pointer"
              >
                Dùng ảnh mẫu để xem thử →
              </button>
            )}

            <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
              <Info className="w-4 h-4 text-semantic-info shrink-0 mt-0.5" />
              <p className="text-body-sm text-blue-700">
                Chụp ảnh toàn thân, đứng thẳng trước gương hoặc camera sau điện thoại, nền sáng, trang phục ôm sát để có kết quả tốt nhất.
              </p>
            </div>
          </div>

          {/* RIGHT: Product Garment */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-heading-h3 font-semibold text-neutral-900">Trang phục</h2>
              <p className="text-body-sm text-neutral-500 mt-0.5">Chọn sản phẩm từ bộ sưu tập công sở</p>
            </div>

            <div className="h-[42px] flex items-center">
              {hasProduct && (
                <span className="text-label-sm text-neutral-400 font-medium">Sản phẩm đã chọn</span>
              )}
            </div>

            {hasProduct ? (
              <div className="flex flex-col gap-4">
                <ProductCard product={selectedProduct} onReplace={() => setShowCatalogModal(true)} />

                <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center relative" style={{ height: 312 }}>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-full object-contain p-4"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 cursor-pointer hover:border-brand-navy/50 hover:bg-brand-navy/[0.02] transition-all"
                  style={{ height: 400 }}
                  onClick={() => setShowCatalogModal(true)}
                >
                  <div className="flex flex-col items-center gap-3 text-center px-6">
                    <div className="w-[60px] h-[60px] rounded-2xl bg-neutral-200 flex items-center justify-center">
                      <Upload className="w-[28px] h-[28px] text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-body-md font-medium text-neutral-600">Chọn trang phục</p>
                      <p className="text-body-sm text-neutral-400 mt-1">Chọn từ catalog cửa hàng</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowCatalogModal(true)}
                      className="px-5 py-2.5 bg-brand-navy text-white rounded-xl text-label-sm font-semibold hover:bg-brand-navy/90 transition-colors border-0"
                    >
                      Xem catalog
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Area */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            type="button"
            className={`w-full max-w-[640px] h-[56px] rounded-xl flex items-center justify-center gap-3 font-semibold transition-all border-0 ${
              canGenerate
                ? 'bg-brand-navy text-white hover:bg-brand-navy/90 shadow-md hover:shadow-lg cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${canGenerate ? 'text-brand-gold' : 'text-neutral-400'}`} />
            {isSubmitting ? 'Đang tạo thử đồ...' : 'Tạo kết quả Try-On'}
          </button>
          <p className="text-body-sm text-neutral-500 text-center">
            ~20 giây xử lý · Lưu kết quả tự động vào lịch sử
          </p>
        </div>

        {/* Result Area */}
        {pageState === 'result' && resultPhotoUrl && (
          <div className="mt-10 flex flex-col gap-6 animate-[fadeInUp_0.4s_ease-out_forwards]">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-label-sm text-neutral-400 font-medium px-2">Kết quả</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            <div className="max-w-[640px] w-full mx-auto flex flex-col gap-4">
              <ComparisonSlider 
                before={activeTab === 'upload' ? (userPhotoUrl || MOCK_USER_PHOTO) : (generatedMannequinSnapshot || MOCK_USER_PHOTO)} 
                after={resultPhotoUrl} 
              />

              <div className="flex items-center gap-3 flex-wrap">
                <button 
                  onClick={handleDownload}
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 border border-neutral-300 rounded-xl text-label-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer bg-white"
                >
                  <Download className="w-4 h-4 text-brand-navy" />
                  Tải về
                </button>
                <Link 
                  href="/profile/history"
                  className="flex items-center gap-2 px-5 py-2.5 text-label-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors bg-white border border-neutral-200"
                >
                  <Bookmark className="w-4 h-4 text-brand-navy" />
                  Xem lịch sử
                </Link>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Kết quả Try-On từ FashionAI',
                        text: `Thử đồ online bộ ${selectedProduct.name} tại FashionAI!`,
                        url: resultPhotoUrl,
                      });
                    } else {
                      navigator.clipboard.writeText(resultPhotoUrl);
                      alert('Đã sao chép link ảnh vào clipboard!');
                    }
                  }}
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 text-label-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer bg-white border border-neutral-200"
                >
                  <Share2 className="w-4 h-4 text-brand-navy" />
                  Chia sẻ
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => { 
                    setPageState('idle'); 
                    setUserPhotoUrl(null); 
                    setUserPhotoBase64(null); 
                    setUserPhotoFile(null);
                    setGeneratedMannequinSnapshot(null);
                    setHasProduct(true); 
                  }}
                  type="button"
                  className="flex items-center gap-1.5 text-label-sm font-semibold text-brand-navy hover:text-brand-navy/70 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  Thử bộ khác <ArrowRight className="w-4 h-4 animate-bounce" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0" />
                <p className="text-body-sm text-green-700">Kết quả đã được lưu vào lịch sử Try-On của bạn</p>
              </div>
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </>
  );
}

export default function VirtualTryOn() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-40 bg-brand-cream min-h-screen">
        <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VirtualTryOnContent />
    </Suspense>
  );
}
