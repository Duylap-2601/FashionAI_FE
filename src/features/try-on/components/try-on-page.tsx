'use client';

import { fetchTryOnImage } from '@/features/try-on/services/queries';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { PRODUCTS } from '@/features/products/constants/products';
import { useProducts } from '@/features/products/hooks/useProducts';
import { toBackendCategory } from '@/features/products/services/products-utils';
import type { Product } from '@/features/products/types/products';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import { QuotaExhaustedModal } from '@/features/stylist/components/QuotaExhaustedModal';
import { SubscriptionRequiredModal } from '@/features/subscription/components/SubscriptionRequiredModal';
import { useQuota } from '@/features/subscription/hooks/useQuota';
import { CatalogModal } from '@/features/try-on/components/CatalogModal';
import { GenerateButton } from '@/features/try-on/components/GenerateButton';
import { LoadingOverlay } from '@/features/try-on/components/LoadingOverlay';
import { SubscriptionNotice, TryOnHeader } from '@/features/try-on/components/TryOnHeader';
import { TryOnResult } from '@/features/try-on/components/TryOnResult';
import { TryOnWorkspace } from '@/features/try-on/components/TryOnWorkspace';
import { MOCK_USER_PHOTO } from '@/features/try-on/constants/try-on-types';
import { useTryOn } from '@/features/try-on/hooks/useTryOn';
import type { GarmentSlotInput } from '@/features/try-on/types/try-on';
import type { CatalogSlot, GarmentMode, PageState, TryOnErrorBody } from '@/features/try-on/types/try-on-types';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function readTryOnError(error: unknown): { status?: number; data?: TryOnErrorBody; message?: string } {
  if (!(error instanceof Error) || !('response' in error)) {
    return { message: error instanceof Error ? error.message : undefined };
  }

  const response = error.response as { status?: number; data?: unknown };
  return {
    status: response.status,
    data: normalizeTryOnErrorBody(response.data),
    message: error.message,
  };
}

function normalizeTryOnErrorBody(value: unknown): TryOnErrorBody | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const details = record.details && typeof record.details === 'object' ? record.details as Record<string, unknown> : undefined;
  const missing = Array.isArray(record.missing)
    ? record.missing
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item) => ({ label: typeof item.label === 'string' ? item.label : undefined }))
    : undefined;

  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    message: typeof record.message === 'string' || Array.isArray(record.message) ? record.message as string | string[] : undefined,
    details: details
      ? {
        reason: typeof details.reason === 'string' ? details.reason : undefined,
        resetAt: typeof details.resetAt === 'string' ? details.resetAt : undefined,
        requested: typeof details.requested === 'number' ? details.requested : undefined,
        remaining: typeof details.remaining === 'number' ? details.remaining : undefined,
      }
      : undefined,
    resetAt: typeof record.resetAt === 'string' ? record.resetAt : undefined,
    requested: typeof record.requested === 'number' ? record.requested : undefined,
    remaining: typeof record.remaining === 'number' ? record.remaining : undefined,
    missing,
  };
}

function VirtualTryOnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const rackIds = searchParams.get('rackIds');
  const user = useAuthStore((state) => state.user);

  const { tryOnAsync, isSubmitting } = useTryOn();
  const { quota, refetch: refetchQuota } = useQuota();
  const { profile } = useUserProfile();
  const { products: backendProducts } = useProducts();
  useMeasurements();

  const catalogProducts = backendProducts.length > 0 ? backendProducts : PRODUCTS;
  const initialProduct = catalogProducts.find(p => p.id === productId) || catalogProducts[0];

  const [pageState, setPageState] = useState<PageState>('idle');
  const [garmentMode, setGarmentMode] = useState<GarmentMode>('single');
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [resultPhotoUrl, setResultPhotoUrl] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [upperProduct, setUpperProduct] = useState<Product | null>(catalogProducts.find(p => (p.garmentCategory || toBackendCategory(p.category)) === 'UPPER') || catalogProducts[0] || null);
  const [lowerProduct, setLowerProduct] = useState<Product | null>(catalogProducts.find(p => (p.garmentCategory || toBackendCategory(p.category)) === 'LOWER') || catalogProducts[1] || null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSlot, setCatalogSlot] = useState<CatalogSlot>('single');
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaModalData, setQuotaModalData] = useState<{ resetAt?: string; requested?: number; remaining?: number }>({});
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionReason, setSubscriptionReason] = useState('free_not_allowed');
  const [progress, setProgress] = useState(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const rawTier = profile?.tier || user?.tier || 'FREE';
  const userTier = rawTier.toUpperCase();
  const rawExpiresAt = profile?.tierExpiresAt || user?.tierExpiresAt;
  const isSubscriptionExpired = useMemo(() => {
    if (!rawExpiresAt || userTier === 'FREE') return false;
    try {
      return new Date(rawExpiresAt).getTime() < Date.now();
    } catch {
      return false;
    }
  }, [rawExpiresAt, userTier]);
  const isBlocked = userTier === 'FREE' || isSubscriptionExpired;
  const quotaCost = garmentMode === 'combo' ? 2 : 1;
  const remainingQuota = quota ? (quota.limit === null ? Infinity : Math.max(0, quota.limit - quota.used)) : (isBlocked ? 0 : 5);
  const limitQuota = quota?.limit ?? (userTier === 'VIP' ? 10 : userTier === 'MEMBER' ? 5 : 0);

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
        } else if (p0 || p1) {
          setSelectedProduct((p0 || p1)!);
          setGarmentMode('single');
        }
      }
    } else if (productId) {
      const match = catalogProducts.find(p => p.id === productId);
      if (match) setSelectedProduct(match);
    } else if (catalogProducts.length > 0) {
      setSelectedProduct(prev => prev ?? catalogProducts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rackIds, productId, catalogProducts]);

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setUserPhotoUrl(null);
      setUserPhotoBase64(null);
      setUserPhotoFile(null);
      return;
    }

    setUserPhotoUrl(URL.createObjectURL(file));
    setUserPhotoFile(file);

    try {
      setUserPhotoBase64(await convertFileToBase64(file));
    } catch (error) {
      console.error('Base64 conversion error:', error);
    }
  };

  const handleOpenCatalog = (slot: CatalogSlot) => {
    setCatalogSlot(slot);
    setShowCatalogModal(true);
  };

  const handleSelectProductFromCatalog = (product: Product) => {
    if (catalogSlot === 'single') {
      setSelectedProduct(product);
      router.replace(`/try-on?productId=${product.id}`);
    } else if (catalogSlot === 'upper') {
      setUpperProduct(product);
    } else if (catalogSlot === 'lower') {
      setLowerProduct(product);
    }
  };

  const handleGenerate = async () => {
    if (isBlocked) {
      setSubscriptionReason(isSubscriptionExpired ? 'subscription_expired' : 'free_not_allowed');
      setShowSubscriptionModal(true);
      return;
    }

    if (quota && quota.limit !== null && (quota.limit - quota.used) < quotaCost) {
      setQuotaModalData({ resetAt: quota.resetAt, requested: quotaCost, remaining: Math.max(0, quota.limit - quota.used) });
      setShowQuotaModal(true);
      return;
    }

    if (!userPhotoFile) return;
    const currentHumanImage = userPhotoFile;
    setPageState('loading');
    setProgress(0);

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
      let payload: Parameters<typeof tryOnAsync>[0];
      if (garmentMode === 'combo') {
        const garments: GarmentSlotInput[] = [];
        if (upperProduct) garments.push({ productId: upperProduct.id, garmentCategory: 'UPPER' });
        if (lowerProduct) garments.push({ productId: lowerProduct.id, garmentCategory: 'LOWER' });
        payload = { humanImage: currentHumanImage, garments, productId: upperProduct?.id || lowerProduct?.id };
      } else {
        if (!selectedProduct?.id) return;
        const cat = selectedProduct.garmentCategory || toBackendCategory(selectedProduct.category);
        payload = { humanImage: currentHumanImage, productId: selectedProduct.id, garmentCategory: cat, garments: [{ productId: selectedProduct.id, garmentCategory: cat }] };
      }

      const result = await tryOnAsync(payload);
      clearInterval(progressTimer);
      setProgress(100);
      setResultPhotoUrl(result.resultUrl);
      setTimeout(() => {
        setPageState('result');
        refetchQuota();
      }, 300);
    } catch (error: unknown) {
      clearInterval(progressTimer);
      setPageState('idle');
      console.error('Try-On error:', error);

      const { status, data, message } = readTryOnError(error);
      if (status === 402 || data?.code === 'SUBSCRIPTION_REQUIRED') {
        setSubscriptionReason(data?.details?.reason || 'free_not_allowed');
        setShowSubscriptionModal(true);
        return;
      }
      if (data?.code === 'DUPLICATE_REQUEST') {
        toast.info('Yêu cầu thử đồ đang được xử lý, vui lòng chờ trong giây lát.');
        return;
      }
      if (status === 429 || data?.code === 'QUOTA_EXCEEDED') {
        const details = data?.details || {};
        setQuotaModalData({ resetAt: details?.resetAt || data?.resetAt, requested: details?.requested || data?.requested || quotaCost, remaining: details?.remaining ?? data?.remaining ?? 0 });
        setShowQuotaModal(true);
        return;
      }
      if (status === 422 || data?.code === 'IMAGE_QUALITY_REJECTED') {
        toast.error(data?.message || 'Ảnh chụp không đạt tiêu chuẩn (mờ, tối hoặc không thấy toàn thân). Vui lòng chọn ảnh chụp rõ nét hơn.');
        return;
      }
      if (data?.code === 'MEASUREMENTS_INCOMPLETE') {
        const missingLabels = data.missing?.map((m) => m.label).filter(Boolean).join(', ') || 'số đo bắt buộc';
        toast.error(`Cần bổ sung số đo trước khi thử đồ: ${missingLabels}`);
        return;
      }

      const msg = data?.message || message || 'Đã xảy ra lỗi khi tạo kết quả thử đồ. Vui lòng thử lại.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleDownload = async () => {
    if (!resultPhotoUrl) return;
    try {
      const response = await fetchTryOnImage(resultPhotoUrl);
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
    } catch {
      window.open(resultPhotoUrl, '_blank');
    }
  };

  const hasSelectedGarments = garmentMode === 'combo' ? Boolean(upperProduct || lowerProduct) : Boolean(selectedProduct?.id);
  const canGenerate = userPhotoBase64 !== null && hasSelectedGarments && !isSubmitting;

  return (
    <>
      {pageState === 'loading' && <LoadingOverlay progress={progress} isCombo={garmentMode === 'combo'} />}

      <CatalogModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        products={catalogProducts}
        onSelectProduct={handleSelectProductFromCatalog}
        currentProductId={catalogSlot === 'single' ? selectedProduct?.id : catalogSlot === 'upper' ? upperProduct?.id : lowerProduct?.id}
        initialCategory={catalogSlot === 'upper' ? 'UPPER' : catalogSlot === 'lower' ? 'LOWER' : 'ALL'}
      />

      {showQuotaModal && <QuotaExhaustedModal
        onClose={() => setShowQuotaModal(false)}
        actionName="Thử đồ AI (Try-On)"
        resetAt={quotaModalData.resetAt}
        requested={quotaModalData.requested}
        remaining={quotaModalData.remaining}
      />}
      {showSubscriptionModal && <SubscriptionRequiredModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        reason={subscriptionReason}
        actionName="Thử đồ AI (Virtual Try-On)"
      />}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }} />

      <TryOnHeader remainingQuota={remainingQuota} limitQuota={limitQuota} isBlocked={isBlocked} />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10">
        {isBlocked && <SubscriptionNotice isSubscriptionExpired={isSubscriptionExpired} />}

        <TryOnWorkspace
          userPhotoUrl={userPhotoUrl}
          garmentMode={garmentMode}
          selectedProduct={selectedProduct}
          upperProduct={upperProduct}
          lowerProduct={lowerProduct}
          onFileSelect={handleFileSelect}
          onCameraSelect={() => cameraInputRef.current?.click()}
          onUseMockPhoto={() => {
            setUserPhotoUrl(MOCK_USER_PHOTO);
            setUserPhotoBase64(null);
            setUserPhotoFile(null);
          }}
          onModeChange={setGarmentMode}
          onOpenCatalog={handleOpenCatalog}
        />

        <GenerateButton canGenerate={canGenerate} isSubmitting={isSubmitting} isBlocked={isBlocked} quotaCost={quotaCost} onGenerate={handleGenerate} />

        {pageState === 'result' && resultPhotoUrl && (
          <TryOnResult
            userPhotoUrl={userPhotoUrl}
            resultPhotoUrl={resultPhotoUrl}
            shareProductName={selectedProduct.name}
            onDownload={handleDownload}
            onReset={() => {
              setPageState('idle');
              setUserPhotoUrl(null);
              setUserPhotoBase64(null);
              setUserPhotoFile(null);
            }}
          />
        )}

        <div className="h-8" />
      </div>
    </>
  );
}

export default function VirtualTryOn() {
  return (
    <Suspense
      fallback={<div className="flex justify-center items-center py-40 bg-brand-cream min-h-screen"><div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" /></div>}
    >
      <VirtualTryOnContent />
    </Suspense>
  );
}
