'use client';

import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import {
  Upload, CloudUpload, Info, Sparkles, Download, Bookmark,
  Share2, ArrowRight, X, CheckCircle2, ChevronRight,
  RefreshCw, Image as ImageIcon, Camera as CameraIcon,
  Crown, Lock, Layers
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PageHeader, PageContent } from '@/components/navigation/Layout';
import { PRODUCTS, Product } from '@/lib/data';
import { useTryOn, GarmentSlotInput } from '@/hooks/useTryOn';
import { useQuota } from '@/hooks/useQuota';
import { useMeasurements, useUserProfile } from '@/hooks/useMeasurements';
import { useProducts, toBackendCategory } from '@/hooks/useProducts';
import { SubscriptionRequiredModal } from '@/components/subscription/SubscriptionRequiredModal';
import { QuotaExhaustedModal } from '@/components/stylist/QuotaExhaustedModal';
import { toast } from 'sonner';

type PageState = 'idle' | 'loading' | 'result' | 'quota-exhausted';

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
  initialCategory?: 'ALL' | 'UPPER' | 'LOWER' | 'FULL_BODY';
}

function CatalogModal({
  isOpen,
  onClose,
  onSelectProduct,
  products,
  currentProductId,
  initialCategory = 'ALL',
}: CatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<'ALL' | 'UPPER' | 'LOWER' | 'FULL_BODY'>(initialCategory);

  useEffect(() => {
    if (isOpen) {
      setSelectedCat(initialCategory);
    }
  }, [isOpen, initialCategory]);
  
  if (!isOpen) return null;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedCat === 'ALL') return true;
    const cat = p.garmentCategory || toBackendCategory(p.category);
    return cat === selectedCat;
  });

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

        <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 rounded-xl border border-neutral-200 bg-white text-body-sm focus:outline-none focus:border-brand-navy transition-all"
          />

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'UPPER', label: 'Áo / Blazer' },
              { id: 'LOWER', label: 'Quần / Váy' },
              { id: 'FULL_BODY', label: 'Bộ liền' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id as any)}
                className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                  selectedCat === cat.id
                    ? 'bg-brand-navy text-white shadow-2xs'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
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
function LoadingOverlay({ progress, isCombo }: { progress: number; isCombo?: boolean }) {
  const stepText = isCombo
    ? progress <= 50
      ? 'Bước 1/2: Đang ghép áo...'
      : 'Bước 2/2: Đang ghép quần/váy hoàn thiện...'
    : 'AI đang ghép trang phục vào ảnh của bạn';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-navy/75 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-2xl shadow-xl max-w-[360px] w-full mx-4">
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
          <p className="text-body-sm text-neutral-500 font-medium">{stepText}</p>
        </div>
      </div>
    </div>
  );
}

function VirtualTryOnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const rackIds = searchParams.get('rackIds');
  const { data: session } = useSession();

  const { tryOnAsync, isSubmitting } = useTryOn();
  const { quota, refetch: refetchQuota } = useQuota();
  const { measurements } = useMeasurements();
  const { profile } = useUserProfile();
  const { products: backendProducts } = useProducts();
  const catalogProducts = backendProducts.length > 0 ? backendProducts : PRODUCTS;

  const [pageState, setPageState] = useState<PageState>('idle');
  const [garmentMode, setGarmentMode] = useState<'single' | 'combo'>('single');

  // Photo states
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [resultPhotoUrl, setResultPhotoUrl] = useState<string | null>(null);

  // Load products
  const initialProduct = catalogProducts.find(p => p.id === productId) || catalogProducts[0];
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [upperProduct, setUpperProduct] = useState<Product | null>(
    catalogProducts.find(p => (p.garmentCategory || toBackendCategory(p.category)) === 'UPPER') || catalogProducts[0] || null
  );
  const [lowerProduct, setLowerProduct] = useState<Product | null>(
    catalogProducts.find(p => (p.garmentCategory || toBackendCategory(p.category)) === 'LOWER') || catalogProducts[1] || null
  );
  const [hasProduct, setHasProduct] = useState(true);
  
  // Modals & slots
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSlot, setCatalogSlot] = useState<'single' | 'upper' | 'lower'>('single');
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaModalData, setQuotaModalData] = useState<{ resetAt?: string; requested?: number; remaining?: number }>({});
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionReason, setSubscriptionReason] = useState<string>('free_not_allowed');
  const [progress, setProgress] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement>(null);

  // User tier & expiration status
  const rawTier = (profile as any)?.tier || session?.user?.tier || 'FREE';
  const userTier = rawTier.toUpperCase();
  const rawExpiresAt = (profile as any)?.tierExpiresAt || (session?.user as any)?.tierExpiresAt;
  const isSubscriptionExpired = React.useMemo(() => {
    if (!rawExpiresAt || userTier === 'FREE') return false;
    try {
      return new Date(rawExpiresAt).getTime() < Date.now();
    } catch {
      return false;
    }
  }, [rawExpiresAt, userTier]);
  const isBlocked = userTier === 'FREE' || isSubscriptionExpired;

  // Quota counts
  const quotaCost = garmentMode === 'combo' ? 2 : 1;
  const remainingQuota = quota ? (quota.limit === null ? Infinity : Math.max(0, quota.limit - quota.used)) : (isBlocked ? 0 : 5);
  const limitQuota = quota?.limit ?? (userTier === 'VIP' ? 10 : userTier === 'MEMBER' ? 5 : 0);

  // Sync selected products when rackIds or productId query parameter changes
  useEffect(() => {
    if (rackIds && catalogProducts.length > 0) {
      const ids = rackIds.split(',').filter(Boolean).slice(0, 2);
      if (ids.length === 1) {
        const match = catalogProducts.find(p => p.id === ids[0]);
        if (match) {
          const cat = match.garmentCategory || toBackendCategory(match.category);
          if (cat === 'UPPER') setUpperProduct(match);
          if (cat === 'LOWER') setLowerProduct(match);
          setSelectedProduct(match);
          setGarmentMode('single');
          setHasProduct(true);
        }
      } else if (ids.length >= 2) {
        const p0 = catalogProducts.find(p => p.id === ids[0]);
        const p1 = catalogProducts.find(p => p.id === ids[1]);
        if (p0 && p1) {
          const cat0 = p0.garmentCategory || toBackendCategory(p0.category);
          const cat1 = p1.garmentCategory || toBackendCategory(p1.category);
          
          if (cat0 === 'UPPER' && cat1 === 'LOWER') {
            setUpperProduct(p0);
            setLowerProduct(p1);
          } else if (cat0 === 'LOWER' && cat1 === 'UPPER') {
            setUpperProduct(p1);
            setLowerProduct(p0);
          } else {
            setUpperProduct(p0);
            setLowerProduct(p1);
          }
          setGarmentMode('combo');
          setHasProduct(true);
        } else if (p0 || p1) {
          const single = p0 || p1;
          if (single) {
            setSelectedProduct(single);
            setGarmentMode('single');
            setHasProduct(true);
          }
        }
      }
    } else if (productId) {
      const match = catalogProducts.find(p => p.id === productId);
      if (match) {
        setSelectedProduct(match);
        setHasProduct(true);
      }
    } else if (catalogProducts.length > 0) {
      setSelectedProduct(prev => prev ?? catalogProducts[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rackIds, productId, catalogProducts]);

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

  const handleOpenCatalog = (slot: 'single' | 'upper' | 'lower') => {
    setCatalogSlot(slot);
    setShowCatalogModal(true);
  };

  const handleSelectProductFromCatalog = (product: Product) => {
    if (catalogSlot === 'single') {
      setSelectedProduct(product);
      setHasProduct(true);
      router.replace(`/try-on?productId=${product.id}`);
    } else if (catalogSlot === 'upper') {
      setUpperProduct(product);
    } else if (catalogSlot === 'lower') {
      setLowerProduct(product);
    }
  };

  const handleGenerate = async () => {
    // Check subscription status
    if (isBlocked) {
      setSubscriptionReason(isSubscriptionExpired ? 'subscription_expired' : 'free_not_allowed');
      setShowSubscriptionModal(true);
      return;
    }

    // Check local quota before executing
    if (quota && quota.limit !== null && (quota.limit - quota.used) < quotaCost) {
      setQuotaModalData({
        resetAt: quota.resetAt,
        requested: quotaCost,
        remaining: Math.max(0, quota.limit - quota.used),
      });
      setShowQuotaModal(true);
      return;
    }
    
    if (!userPhotoFile) return;
    const currentHumanImage: File = userPhotoFile;

    if (!currentHumanImage) return;

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
      let payload: any;
      if (garmentMode === 'combo') {
        const garments: GarmentSlotInput[] = [];
        if (upperProduct) garments.push({ productId: upperProduct.id, garmentCategory: 'UPPER' });
        if (lowerProduct) garments.push({ productId: lowerProduct.id, garmentCategory: 'LOWER' });
        
        payload = {
          humanImage: currentHumanImage,
          garments,
          productId: upperProduct?.id || lowerProduct?.id,
        };
      } else {
        if (!selectedProduct?.id) return;
        const cat = selectedProduct.garmentCategory || toBackendCategory(selectedProduct.category);

        payload = {
          humanImage: currentHumanImage,
          productId: selectedProduct.id,
          garmentCategory: cat,
          garments: [{ productId: selectedProduct.id, garmentCategory: cat }],
        };
      }

      const result = await tryOnAsync(payload);
      
      clearInterval(progressTimer);
      setProgress(100);
      setResultPhotoUrl(result.resultUrl);
      
      setTimeout(() => {
        setPageState('result');
        refetchQuota();
      }, 300);

    } catch (error: any) {
      clearInterval(progressTimer);
      setPageState('idle');
      console.error('Try-On error:', error);

      const status = error?.response?.status;
      const data = error?.response?.data;

      // 1. SUBSCRIPTION_REQUIRED (402)
      if (status === 402 || data?.code === 'SUBSCRIPTION_REQUIRED') {
        setSubscriptionReason(data?.details?.reason || 'free_not_allowed');
        setShowSubscriptionModal(true);
        return;
      }

      // 2. DUPLICATE_REQUEST (429) -> Do NOT show quota modal
      if (data?.code === 'DUPLICATE_REQUEST') {
        toast.info('Yêu cầu thử đồ đang được xử lý, vui lòng chờ trong giây lát.');
        return;
      }

      // 3. QUOTA_EXCEEDED (429)
      if (status === 429 || data?.code === 'QUOTA_EXCEEDED') {
        const details = data?.details || {};
        setQuotaModalData({
          resetAt: details?.resetAt || data?.resetAt,
          requested: details?.requested || data?.requested || quotaCost,
          remaining: details?.remaining ?? data?.remaining ?? 0,
        });
        setShowQuotaModal(true);
        return;
      }

      // 4. IMAGE_QUALITY_REJECTED (422)
      if (status === 422 || data?.code === 'IMAGE_QUALITY_REJECTED') {
        toast.error(
          data?.message || 'Ảnh chụp không đạt tiêu chuẩn (mờ, tối hoặc không thấy toàn thân). Vui lòng chọn ảnh chụp rõ nét hơn.'
        );
        return;
      }

      // 5. MEASUREMENTS_INCOMPLETE (400)
      if (data?.code === 'MEASUREMENTS_INCOMPLETE') {
        const missingLabels = data?.missing?.map((m: any) => m.label).join(', ') || 'số đo bắt buộc';
        toast.error(`Cần bổ sung số đo trước khi thử đồ: ${missingLabels}`);
        return;
      }

      // 6. Generic validation message or server error
      const msg = data?.message || error?.message || 'Đã xảy ra lỗi khi tạo kết quả thử đồ. Vui lòng thử lại.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
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
      const prodName = garmentMode === 'combo' ? 'combo-outfit' : (selectedProduct?.name || 'fashionai');
      link.download = `${prodName.replace(/\s+/g, '-')}-tryon.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(resultPhotoUrl, '_blank');
    }
  };

  const hasSelectedGarments = garmentMode === 'combo' ? Boolean(upperProduct || lowerProduct) : Boolean(selectedProduct?.id);
  const canGenerate = (userPhotoBase64 !== null) && hasSelectedGarments && !isSubmitting;

  return (
    <>
      {pageState === 'loading' && <LoadingOverlay progress={progress} isCombo={garmentMode === 'combo'} />}

      <CatalogModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        products={catalogProducts}
        onSelectProduct={handleSelectProductFromCatalog}
        currentProductId={
          catalogSlot === 'single'
            ? selectedProduct?.id
            : catalogSlot === 'upper'
            ? upperProduct?.id
            : lowerProduct?.id
        }
        initialCategory={
          catalogSlot === 'upper'
            ? 'UPPER'
            : catalogSlot === 'lower'
            ? 'LOWER'
            : 'ALL'
        }
      />

      {showQuotaModal && (
        <QuotaExhaustedModal
          onClose={() => setShowQuotaModal(false)}
          actionName="Thử đồ AI (Try-On)"
          resetAt={quotaModalData.resetAt}
          requested={quotaModalData.requested}
          remaining={quotaModalData.remaining}
        />
      )}

      {showSubscriptionModal && (
        <SubscriptionRequiredModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          reason={subscriptionReason}
          actionName="Thử đồ AI (Virtual Try-On)"
        />
      )}

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
            <div className="flex items-center gap-3">
              <QuotaBadge count={remainingQuota} limit={limitQuota} />
              {isBlocked && (
                <Link
                  href="/subscription"
                  className="px-3.5 py-1.5 bg-[#5D1C34] text-white rounded-full text-label-sm font-bold hover:bg-[#5D1C34]/90 transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5" /> Nâng cấp
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Persistent Subscription Notice if Free / Expired */}
        {isBlocked && (
          <div className="p-4 md:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-body-md font-bold text-amber-950">
                  {isSubscriptionExpired ? 'Gói cước của bạn đã hết hạn' : 'Tính năng Thử đồ AI yêu cầu gói trả tiền (MEMBER hoặc VIP)'}
                </h3>
                <p className="text-body-sm text-amber-800 mt-0.5 leading-relaxed">
                  {isSubscriptionExpired
                    ? 'Vui lòng gia hạn gói để tiếp tục trải nghiệm tính năng thử đồ 3D / AI cá nhân hóa.'
                    : 'Tài khoản FREE hiện không hỗ trợ tính năng Try-On. Hãy nâng cấp ngay để nhận 5 – 10 lượt thử trang phục mỗi ngày!'}
                </p>
              </div>
            </div>
            <Link
              href="/subscription"
              className="px-5 py-2.5 bg-[#5D1C34] text-white rounded-xl text-body-sm font-bold shrink-0 hover:bg-[#5D1C34]/90 transition-colors shadow-sm"
            >
              {isSubscriptionExpired ? 'Gia hạn gói' : 'Xem các gói Member'} &rarr;
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* LEFT: User Photo */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-heading-h3 font-semibold text-neutral-900">Ảnh của bạn</h2>
              <p className="text-body-sm text-neutral-500 mt-0.5">Upload ảnh toàn thân rõ mặt</p>
            </div>

            <UploadZone
              onFileSelect={handleFileSelect}
              uploadedImage={userPhotoUrl}
              onCameraSelect={handleCameraTrigger}
            />

            {!userPhotoUrl && (
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

          {/* RIGHT: Product Garment Selection */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-heading-h3 font-semibold text-neutral-900">Trang phục thử đồ</h2>
              <p className="text-body-sm text-neutral-500 mt-0.5">Chọn 1 món đơn hoặc phối combo 2 món (Áo + Quần/Váy)</p>
            </div>

            {/* Mode Switcher: Single vs Combo */}
            <div className="flex p-1 bg-neutral-100 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setGarmentMode('single')}
                className={`px-4 py-2 rounded-lg text-label-sm font-medium transition-all border-0 ${
                  garmentMode === 'single'
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 bg-transparent'
                }`}
              >
                1 Món đơn (1 quota)
              </button>
              <button
                type="button"
                onClick={() => setGarmentMode('combo')}
                className={`px-4 py-2 rounded-lg text-label-sm font-medium transition-all border-0 flex items-center gap-1.5 ${
                  garmentMode === 'combo'
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 bg-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Combo 2 món (2 quota)
              </button>
            </div>

            {garmentMode === 'single' ? (
              <div className="flex flex-col gap-4">
                <ProductCard product={selectedProduct} onReplace={() => handleOpenCatalog('single')} />

                <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center relative" style={{ height: 312 }}>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-full object-contain p-4"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Upper Garment Slot */}
                <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-brand-navy uppercase tracking-wider">
                      Món 1: Áo / Blazer (Upper)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenCatalog('upper')}
                      className="text-[12px] font-bold text-[#5D1C34] hover:underline"
                    >
                      {upperProduct ? 'Đổi áo khác' : '+ Chọn áo'}
                    </button>
                  </div>
                  {upperProduct ? (
                    <div className="flex items-center gap-3">
                      <img src={upperProduct.image} alt={upperProduct.name} className="w-14 h-18 object-cover rounded-lg bg-neutral-100 border border-neutral-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-body-sm font-bold text-brand-navy truncate">{upperProduct.name}</h4>
                        <p className="text-[12px] text-neutral-500">{upperProduct.price}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-body-sm text-neutral-400 italic py-2">Chưa chọn áo</p>
                  )}
                </div>

                {/* Lower Garment Slot */}
                <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-brand-navy uppercase tracking-wider">
                      Món 2: Quần / Chân váy (Lower)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenCatalog('lower')}
                      className="text-[12px] font-bold text-[#5D1C34] hover:underline"
                    >
                      {lowerProduct ? 'Đổi quần/váy' : '+ Chọn quần/váy'}
                    </button>
                  </div>
                  {lowerProduct ? (
                    <div className="flex items-center gap-3">
                      <img src={lowerProduct.image} alt={lowerProduct.name} className="w-14 h-18 object-cover rounded-lg bg-neutral-100 border border-neutral-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-body-sm font-bold text-brand-navy truncate">{lowerProduct.name}</h4>
                        <p className="text-[12px] text-neutral-500">{lowerProduct.price}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-body-sm text-neutral-400 italic py-2">Chưa chọn quần hoặc váy</p>
                  )}
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[12px] text-neutral-600 flex items-center justify-between">
                  <span>⚡ Thử Combo 2 món sẽ trừ:</span>
                  <span className="font-bold text-brand-navy">2 lượt quota</span>
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
            {isSubmitting
              ? 'Đang tạo thử đồ...'
              : isBlocked
              ? 'Nâng cấp gói để Thử đồ AI'
              : `Tạo kết quả Try-On (${quotaCost} lượt quota)`}
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
                before={userPhotoUrl || MOCK_USER_PHOTO}
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
