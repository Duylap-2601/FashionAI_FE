'use client';

import { fetchTryOnImage } from '@/features/try-on/services/queries';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { useProductCatalog } from '@/features/products/hooks/useProducts';
import { resolveProductColor, toBackendCategory } from '@/features/products/services/products-utils';
import type { Product } from '@/features/products/types/products';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import { QuotaExhaustedModal } from '@/features/stylist/components/QuotaExhaustedModal';
import { SubscriptionRequiredModal } from '@/features/subscription/components/SubscriptionRequiredModal';
import { useLiveTryOnQuota, useQuota } from '@/features/subscription/hooks/useQuota';
import { CatalogModal } from '@/features/try-on/components/CatalogModal';
import { SubscriptionNotice, TryOnHeader } from '@/features/try-on/components/TryOnHeader';
import { tryOnLabelClassName } from '@/features/try-on/components/garment-slot';
import { TryOnWorkspace } from '@/features/try-on/components/TryOnWorkspace';
import { LiveTryOnWorkspace } from '@/features/try-on/components/live-try-on-workspace';
import { useTryOn } from '@/features/try-on/hooks/useTryOn';
import type { GarmentSlotInput } from '@/features/try-on/types/try-on';
import type { CatalogSlot, GarmentMode, PageState, TryOnErrorBody } from '@/features/try-on/types/try-on-types';
import { trackEvent } from '@/lib/analytics';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const VALID_IMAGE_TYPES = new Set(['image/png', 'image/jpeg']);

function validateTryOnFile(file: File): string | null {
  if (!VALID_IMAGE_TYPES.has(file.type)) return 'Vui lòng chọn ảnh PNG hoặc JPEG.';
  if (file.size > MAX_IMAGE_SIZE) return 'Ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.';
  return null;
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
  const initialColor = searchParams.get('color');
  const user = useAuthStore((state) => state.user);

  const { tryOnAsync, isSubmitting } = useTryOn();
  const { quota, refetch: refetchQuota } = useQuota();
  const { profile } = useUserProfile();
  const { products: backendProducts } = useProductCatalog();
  useMeasurements();

  const catalogProducts = backendProducts;
  const initialProduct = catalogProducts.find(p => p.id === productId) || catalogProducts[0] || null;

  const [pageState, setPageState] = useState<PageState>('idle');
  // Thử trực tiếp là mặc định; tự lùi về thử bằng ảnh khi tài khoản/thiết bị không dùng được,
  // trừ khi người dùng đã tự chọn tab.
  const [tryOnMode, setTryOnMode] = useState<'photo' | 'live'>('live');
  const [tryOnModeTouched, setTryOnModeTouched] = useState(false);
  const { quota: liveQuota, isError: liveQuotaError } = useLiveTryOnQuota();
  const [garmentMode, setGarmentMode] = useState<GarmentMode>('single');
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [resultPhotoUrl, setResultPhotoUrl] = useState<string | null>(null);
  const [resultSourcePhotoUrl, setResultSourcePhotoUrl] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct);
  const [selectedColor, setSelectedColor] = useState<string | null>(() => resolveProductColor(initialProduct, initialColor));
  const [outerProduct, setOuterProduct] = useState<Product | null>(null);
  const [upperProduct, setUpperProduct] = useState<Product | null>(catalogProducts.find(p => (p.garmentCategory || toBackendCategory(p.category)) === 'UPPER') || null);
  const [lowerProduct, setLowerProduct] = useState<Product | null>(catalogProducts.find(p => (p.garmentCategory || toBackendCategory(p.category)) === 'LOWER') || null);
  const [outerColor, setOuterColor] = useState<string | null>(null);
  const [upperColor, setUpperColor] = useState<string | null>(() => {
    const p = catalogProducts.find(item => (item.garmentCategory || toBackendCategory(item.category)) === 'UPPER');
    return resolveProductColor(p);
  });
  const [lowerColor, setLowerColor] = useState<string | null>(() => {
    const p = catalogProducts.find(item => (item.garmentCategory || toBackendCategory(item.category)) === 'LOWER');
    return resolveProductColor(p);
  });
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSlot, setCatalogSlot] = useState<CatalogSlot>('single');
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaModalData, setQuotaModalData] = useState<{ resetAt?: string; requested?: number; remaining?: number }>({});
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionReason, setSubscriptionReason] = useState('free_not_allowed');
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

  const clearResult = () => {
    setResultPhotoUrl(null);
    setResultSourcePhotoUrl(null);
    if (pageState === 'result') setPageState('idle');
  };

  useEffect(() => {
    if (rackIds && catalogProducts.length > 0) {
      const ids = rackIds.split(',').filter(Boolean).slice(0, 3);
      if (ids.length === 1) {
        const match = catalogProducts.find(p => p.id === ids[0]);
        if (match) {
          const cat = match.garmentCategory || toBackendCategory(match.category);
          if (cat === 'UPPER') {
            if (match.layerRole === 'OUTER') {
              setOuterProduct(match);
              setOuterColor(resolveProductColor(match));
            } else {
              setUpperProduct(match);
              setUpperColor(resolveProductColor(match));
            }
          }
          if (cat === 'LOWER') {
            setLowerProduct(match);
            setLowerColor(resolveProductColor(match));
          }
          setSelectedProduct(match);
          setSelectedColor(resolveProductColor(match, initialColor));
          setGarmentMode('single');
        }
      } else if (ids.length >= 2) {
        const matched = ids
          .map(id => catalogProducts.find(p => p.id === id))
          .filter((p): p is Product => Boolean(p));

        const first = matched[0];
        if (first) {
          setSelectedProduct(prev => prev ?? first);
          setSelectedColor(prev => prev ?? resolveProductColor(first));
        }

        let newOuter: Product | null = null;
        let newUpper: Product | null = null;
        let newLower: Product | null = null;

        matched.forEach(p => {
          const cat = p.garmentCategory || toBackendCategory(p.category);
          const role = p.layerRole;

          if (role === 'OUTER' || (!role && cat === 'UPPER' && (p.garmentType === 'JACKET' || p.garmentType === 'VEST'))) {
            if (!newOuter) newOuter = p;
            else if (!newUpper) newUpper = p;
          } else if (role === 'BOTTOM' || cat === 'LOWER') {
            if (!newLower) newLower = p;
          } else {
            if (!newUpper) newUpper = p;
            else if (!newOuter) newOuter = p;
          }
        });

        if (newOuter) {
          setOuterProduct(newOuter);
          setOuterColor(resolveProductColor(newOuter));
        }
        if (newUpper) {
          setUpperProduct(newUpper);
          setUpperColor(resolveProductColor(newUpper));
        }
        if (newLower) {
          setLowerProduct(newLower);
          setLowerColor(resolveProductColor(newLower));
        }
        setGarmentMode('combo');
      }
    } else if (productId) {
      const match = catalogProducts.find(p => p.id === productId);
      if (match) {
        setSelectedProduct(match);
        setSelectedColor(resolveProductColor(match, initialColor));
      }
    } else if (catalogProducts.length > 0) {
      setSelectedProduct(prev => {
        if (prev) return prev;
        setSelectedColor(resolveProductColor(catalogProducts[0]));
        return catalogProducts[0];
      });
    }

    if (catalogProducts.length > 0) {
      setUpperProduct(prev => {
        if (prev) return prev;
        const u = catalogProducts.find(p => (p.garmentCategory || toBackendCategory(p.category)) === 'UPPER' && p.layerRole !== 'OUTER') || null;
        if (u) setUpperColor(resolveProductColor(u));
        return u;
      });
      setLowerProduct(prev => {
        if (prev) return prev;
        const l = catalogProducts.find(p => (p.garmentCategory || toBackendCategory(p.category)) === 'LOWER') || null;
        if (l) setLowerColor(resolveProductColor(l));
        return l;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rackIds, productId, catalogProducts]);

  const handleFileSelect = async (file: File | null) => {
    if (pageState === 'loading') return;
    if (!file) {
      setUserPhotoUrl(null);
      setUserPhotoFile(null);
      setInputError(null);
      clearResult();
      return;
    }

    const validationError = validateTryOnFile(file);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    if (userPhotoUrl?.startsWith('blob:')) URL.revokeObjectURL(userPhotoUrl);
    setInputError(null);
    clearResult();
    const objectUrl = URL.createObjectURL(file);
    setUserPhotoUrl(objectUrl);
    setUserPhotoFile(file);
  };

  const handleOpenCatalog = (slot: CatalogSlot) => {
    if (pageState === 'loading') return;
    setCatalogSlot(slot);
    setShowCatalogModal(true);
  };

  const handleSelectProductFromCatalog = (product: Product) => {
    clearResult();
    if (catalogSlot === 'single') {
      setSelectedProduct(product);
      setSelectedColor(resolveProductColor(product));
      router.replace(`/try-on?productId=${product.id}`);
    } else if (catalogSlot === 'outer') {
      setOuterProduct(product);
      setOuterColor(resolveProductColor(product));
    } else if (catalogSlot === 'upper') {
      setUpperProduct(product);
      setUpperColor(resolveProductColor(product));
    } else if (catalogSlot === 'lower') {
      setLowerProduct(product);
      setLowerColor(resolveProductColor(product));
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

    if (!userPhotoFile) {
      setInputError('Hãy tải ảnh cá nhân PNG/JPG dưới 10MB trước khi thử trang phục.');
      return;
    }

    const validationError = validateTryOnFile(userPhotoFile);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    const currentHumanImage = userPhotoFile;
    const currentUserPhotoUrl = userPhotoUrl;
    setInputError(null);
    setResultPhotoUrl(null);
    setResultSourcePhotoUrl(null);
    setPageState('loading');

    try {
      let payload: Parameters<typeof tryOnAsync>[0];
      if (garmentMode === 'combo') {
        const garments: GarmentSlotInput[] = [];
        if (outerProduct) {
          garments.push({
            productId: outerProduct.id,
            garmentCategory: 'UPPER',
            color: outerColor || outerProduct.colors?.[0]?.name || undefined,
            layerRole: outerProduct.layerRole || 'OUTER',
          });
        }
        if (upperProduct) {
          garments.push({
            productId: upperProduct.id,
            garmentCategory: 'UPPER',
            color: upperColor || upperProduct.colors?.[0]?.name || undefined,
            layerRole: upperProduct.layerRole || 'INNER',
          });
        }
        if (lowerProduct) {
          garments.push({
            productId: lowerProduct.id,
            garmentCategory: 'LOWER',
            color: lowerColor || lowerProduct.colors?.[0]?.name || undefined,
            layerRole: lowerProduct.layerRole || 'BOTTOM',
          });
        }

        if (garments.length === 0) {
          setInputError('Vui lòng chọn ít nhất một trang phục để phối.');
          setPageState('idle');
          return;
        }

        // Validate layerRole: cảnh báo nếu có 2 món trùng lớp mặc (ví dụ 2 áo khoác)
        const roles = garments.map(g => g.layerRole).filter(Boolean);
        const hasDuplicateRole = roles.some((role, i) => roles.indexOf(role) !== i);
        if (hasDuplicateRole) {
          toast.warning('Bộ phối đang có 2 món cùng lớp mặc. Kết quả thử đồ có thể không tối ưu.');
        }

        payload = {
          humanImage: currentHumanImage,
          garments,
          productId: upperProduct?.id || outerProduct?.id || lowerProduct?.id,
        };
      } else {
        if (!selectedProduct?.id) return;
        const cat = selectedProduct.garmentCategory || toBackendCategory(selectedProduct.category);
        payload = {
          humanImage: currentHumanImage,
          productId: selectedProduct.id,
          garmentCategory: cat,
          color: selectedColor || undefined,
          layerRole: selectedProduct.layerRole || undefined,
          garments: [{
            productId: selectedProduct.id,
            garmentCategory: cat,
            color: selectedColor || undefined,
            layerRole: selectedProduct.layerRole || undefined,
          }],
        };
      }

      const result = await tryOnAsync(payload);
      trackEvent('try_on_generate', { garment_count: payload.garments?.length || 1 });
      setResultPhotoUrl(result.resultUrl);
      setResultSourcePhotoUrl(currentUserPhotoUrl);
      setPageState('result');
      refetchQuota();
    } catch (error: unknown) {
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

  const handleModeChange = (mode: GarmentMode) => {
    if (pageState === 'loading') return;
    clearResult();
    setGarmentMode(mode);
  };

  const handleTryOnModeChange = (mode: 'photo' | 'live') => {
    if (pageState === 'loading') return;
    clearResult();
    setTryOnModeTouched(true);
    setTryOnMode(mode);
  };

  useEffect(() => {
    if (tryOnModeTouched || tryOnMode !== 'live') return;
    const noCamera = typeof navigator !== 'undefined' && !navigator.mediaDevices?.getUserMedia;
    if (noCamera || liveQuotaError || (liveQuota && (!liveQuota.enabled || !liveQuota.eligible))) {
      setTryOnMode('photo');
    }
  }, [liveQuota, liveQuotaError, tryOnMode, tryOnModeTouched]);

  const handleTryAnother = () => {
    setResultPhotoUrl(null);
    setResultSourcePhotoUrl(null);
    setPageState('idle');
  };

  const handleChangePhoto = () => {
    setResultPhotoUrl(null);
    setResultSourcePhotoUrl(null);
    setPageState('idle');
    setUserPhotoUrl(null);
    setUserPhotoFile(null);
    setInputError(null);
  };

  const handleShare = async () => {
    if (!resultPhotoUrl) return;
    try {
      if (navigator.share) {
      await navigator.share({ title: 'Kết quả thử đồ từ FashionAI', text: `Thử đồ online bộ ${selectedProduct?.name || 'thời trang'} tại FashionAI!`, url: resultPhotoUrl });
        return;
      }
      await navigator.clipboard.writeText(resultPhotoUrl);
      toast.success('Đã sao chép link ảnh vào clipboard.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.info('Đã hủy chia sẻ kết quả.');
        return;
      }
      toast.error('Không thể chia sẻ kết quả. Vui lòng thử lại.');
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

  const hasSelectedGarments = garmentMode === 'combo' ? Boolean(outerProduct || upperProduct || lowerProduct) : Boolean(selectedProduct?.id);
  const canGenerate = userPhotoFile !== null && hasSelectedGarments && !isSubmitting && pageState !== 'loading';

  return (
    <>
      <CatalogModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        products={catalogProducts}
        onSelectProduct={handleSelectProductFromCatalog}
        currentProductId={
          catalogSlot === 'single'
            ? selectedProduct?.id
            : catalogSlot === 'outer'
              ? outerProduct?.id
              : catalogSlot === 'upper'
                ? upperProduct?.id
                : lowerProduct?.id
        }
        initialCategory={
          catalogSlot === 'outer' || catalogSlot === 'upper'
            ? 'UPPER'
            : catalogSlot === 'lower'
              ? 'LOWER'
              : 'ALL'
        }
      />

      {showQuotaModal && <QuotaExhaustedModal
        onClose={() => setShowQuotaModal(false)}
        actionName="Thử đồ AI"
        resetAt={quotaModalData.resetAt}
        requested={quotaModalData.requested}
        remaining={quotaModalData.remaining}
      />}
      {showSubscriptionModal && <SubscriptionRequiredModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        reason={subscriptionReason}
        actionName="Thử đồ AI"
      />}

      <input ref={cameraInputRef} type="file" accept="image/png,image/jpeg" capture="user" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); e.currentTarget.value = ''; }} />

      <div className="landing-paper-texture">
        <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
          <TryOnHeader
            mode={tryOnMode}
            onModeChange={handleTryOnModeChange}
            modeDisabled={pageState === 'loading'}
            quota={quota}
            isBlocked={isBlocked}
          />

          {isBlocked && tryOnMode === 'photo' && <SubscriptionNotice isSubscriptionExpired={isSubscriptionExpired} />}

          {catalogProducts.length === 0 ? (
            <div className="flex flex-col items-center border border-landing-line bg-landing-ivory/60 px-6 py-14 text-center">
              <p className={tryOnLabelClassName}>Phòng thử</p>
              <h2 className="mt-3 font-display text-2xl leading-tight text-landing-obsidian">Chưa có trang phục để thử</h2>
              <p className="mt-2 max-w-sm text-sm text-landing-muted">Phòng thử chỉ dùng sản phẩm đang bán trong cửa hàng. Vui lòng quay lại sau.</p>
            </div>
          ) : tryOnMode === 'live' && selectedProduct ? (
            <LiveTryOnWorkspace
              selectedProduct={selectedProduct}
              outerProduct={outerProduct}
              upperProduct={upperProduct}
              lowerProduct={lowerProduct}
              selectedColor={selectedColor}
              outerColor={outerColor}
              upperColor={upperColor}
              lowerColor={lowerColor}
              onOpenOuterCatalog={() => handleOpenCatalog('outer')}
              onOpenUpperCatalog={() => handleOpenCatalog('upper')}
              onOpenLowerCatalog={() => handleOpenCatalog('lower')}
              onOpenCatalog={() => handleOpenCatalog('single')}
              onSelectColor={setSelectedColor}
              onSelectOuterColor={setOuterColor}
              onSelectUpperColor={setUpperColor}
              onSelectLowerColor={setLowerColor}
              onClearOuter={() => { setOuterProduct(null); setOuterColor(null); }}
              onSwitchToPhoto={() => handleTryOnModeChange('photo')}
              outfitMode={garmentMode === 'combo'}
              onOutfitModeChange={(combo) => handleModeChange(combo ? 'combo' : 'single')}
            />
          ) : selectedProduct ? (
            <TryOnWorkspace
              userPhotoUrl={userPhotoUrl}
              resultPhotoUrl={resultPhotoUrl}
              resultSourcePhotoUrl={resultSourcePhotoUrl}
              isLoading={pageState === 'loading'}
              inputError={inputError}
              garmentMode={garmentMode}
              selectedProduct={selectedProduct}
              selectedColor={selectedColor}
              outerProduct={outerProduct}
              upperProduct={upperProduct}
              lowerProduct={lowerProduct}
              outerColor={outerColor}
              upperColor={upperColor}
              lowerColor={lowerColor}
              canGenerate={canGenerate}
              isSubmitting={isSubmitting || pageState === 'loading'}
              isBlocked={isBlocked}
              quotaCost={quotaCost}
              onFileSelect={handleFileSelect}
              onCameraSelect={() => cameraInputRef.current?.click()}
              onModeChange={handleModeChange}
              onOpenCatalog={handleOpenCatalog}
              onSelectColor={setSelectedColor}
              onSelectOuterColor={setOuterColor}
              onSelectUpperColor={setUpperColor}
              onSelectLowerColor={setLowerColor}
              onClearOuter={() => {
                setOuterProduct(null);
                setOuterColor(null);
                clearResult();
              }}
              onGenerate={handleGenerate}
              onDownload={handleDownload}
              onShare={handleShare}
              onTryAnother={handleTryAnother}
              onChangePhoto={handleChangePhoto}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

export default function VirtualTryOn() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Đang mở phòng thử">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-landing-taupe border-t-landing-oxblood motion-reduce:animate-none" />
        </div>
      }
    >
      <VirtualTryOnContent />
    </Suspense>
  );
}
