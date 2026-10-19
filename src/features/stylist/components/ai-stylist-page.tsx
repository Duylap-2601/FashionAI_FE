'use client';
import { getErrorStatus } from '@/lib/errors';
import { StylistBriefSummary } from '@/features/stylist/components/stylist-brief-summary';
import { StylistHistoryPanel } from '@/features/stylist/components/stylist-history-panel';
import { StylistInputPanel } from '@/features/stylist/components/stylist-input-panel';
import { StylistResultPanel } from '@/features/stylist/components/stylist-result-panel';
import { StylistResultSkeleton } from '@/features/stylist/components/stylist-result-skeleton';
import type { GenderPref, Status } from '@/features/stylist/types/ai-stylist-page';
import { PRODUCTS } from '@/features/products/constants/products';
import { useProductCatalog } from '@/features/products/hooks/useProducts';
import { ProductPickerModal } from '@/features/stylist/components/ProductPickerModal';
import { QuotaExhaustedModal } from '@/features/stylist/components/QuotaExhaustedModal';
import { useAnalyzeStylist, useDeleteStylistHistory, useStylistHistory } from '@/features/stylist/hooks/useStylist';
import { validateStylistRequest } from '@/features/stylist/services/stylist-utils';
import type { StylistAnalysisRequest, StylistProduct, StylistResult } from '@/features/stylist/types/stylist';
import { useQuota } from '@/features/subscription/hooks/useQuota';
import { trackEvent } from '@/lib/analytics';
import { History as HistoryIcon, Sparkles } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function AIStylistPage() {
  const { analyzeAsync, isAnalyzing, errorMessage, reset: resetAnalyzeError } = useAnalyzeStylist();
  const { quota, refetch: refetchQuota } = useQuota('STYLIST');
  const { products: backendProducts, isLoading: productsLoading } = useProductCatalog();
  const catalogProducts = backendProducts.length > 0 ? backendProducts : PRODUCTS;

  const [page, setPage] = useState(1);
  const { history, meta, isLoading: historyLoading } = useStylistHistory(page, 5);
  const { deleteAsync, isDeleting } = useDeleteStylistHistory();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // Đồng ý dùng ảnh gắn với từng ảnh: đổi hoặc xoá ảnh thì phải tick lại.
  const [imageConsent, setImageConsent] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [occasion, setOccasion] = useState('Đi làm');
  const [stylePreference, setStylePreference] = useState('');
  const [budget, setBudget] = useState('');
  const [genderPreference, setGenderPreference] = useState<GenderPref>('');
  const [selectedProduct, setSelectedProduct] = useState<StylistProduct | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [pageState, setPageState] = useState<Status>('idle');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<StylistResult | null>(null);
  // Đã có kết quả nhưng người dùng mở lại form để sửa yêu cầu.
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File | null) => {
    setImageConsent(false);
    setShowConsentError(false);
    if (!file) {
      setPhotoUrl(null);
      setPhotoFile(null);
      return;
    }
    setPhotoUrl(URL.createObjectURL(file));
    setPhotoFile(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoUrl(null);
    setPhotoFile(null);
    setImageConsent(false);
    setShowConsentError(false);
  };

  const remainingQuota = quota ? (quota.unlimited || quota.limit === null ? Infinity : (quota.limit ?? 0) - quota.used) : null;
  const hasQuota = remainingQuota === null || remainingQuota > 0;

  const handleImageConsentChange = (checked: boolean) => {
    setImageConsent(checked);
    if (checked) setShowConsentError(false);
  };

  const handleAnalyze = async () => {
    if (!hasQuota) {
      setShowQuotaModal(true);
      return;
    }

    const trimmedOccasion = occasion.trim();
    const payload: StylistAnalysisRequest = {
      humanImage: photoFile ?? undefined,
      imageConsent: photoFile ? imageConsent : undefined,
      productId: selectedProduct?.id,
      // Không chọn sản phẩm thì để trống: BE tự phối hoàn toàn từ catalog theo dịp mặc/phong cách.
      occasion: trimmedOccasion || undefined,
      stylePreference: stylePreference.trim() || undefined,
      budget: budget || undefined,
      genderPreference: genderPreference || undefined,
    };
    const validationError = validateStylistRequest(payload);
    if (validationError) {
      if (photoFile && !imageConsent) setShowConsentError(true);
      toast.error(validationError);
      return;
    }

    resetAnalyzeError();
    setSelectedResult(null);
    setIsEditing(false);
    setPageState('processing');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await analyzeAsync(payload);
      setSelectedResult(res);
      setPageState('result');
      refetchQuota();
      trackEvent('stylist_analyze', {});
      toast.success('Đã có bộ phối cho bạn!');
    } catch (error: unknown) {
      setPageState('idle');
      console.error('Stylist analyze error:', error);
      const status = getErrorStatus(error);
      if (status === 429) {
        setShowQuotaModal(true);
      } else {
        toast.error('Không thể phân tích phong cách. Vui lòng thử lại sau.');
      }
    }
  };

  const handleSelectHistoryItem = (item: StylistResult) => {
    setSelectedResult(item);
    setPageState('result');
    setIsEditing(false);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = () => {
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (e: React.MouseEvent, item: StylistResult) => {
    e.stopPropagation();
    try {
      await deleteAsync(item.id);
      toast.success('Đã xóa kết quả tư vấn.');
      if (selectedResult?.id === item.id) {
        setSelectedResult(null);
        setPageState('idle');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error('Không thể xóa kết quả. Vui lòng thử lại.');
    }
  };

  const displayResult = selectedResult;
  const showForm = pageState === 'idle' || isEditing;

  return (
    <div className="min-h-screen bg-brand-cream text-neutral-900 font-sans pb-24">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-6 md:py-10">

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
        />

        <ProductPickerModal
          isOpen={showCatalogModal}
          onClose={() => setShowCatalogModal(false)}
          products={catalogProducts}
          currentProductId={selectedProduct?.id}
          onSelect={(p) => setSelectedProduct({ id: p.id, name: p.name, price: p.numericPrice, garmentUrl: p.image })}
        />

        {showQuotaModal && <QuotaExhaustedModal onClose={() => setShowQuotaModal(false)} />}

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="inline-flex items-center gap-1.5 text-label-sm font-semibold text-brand-navy">
              <Sparkles className="w-3.5 h-3.5" /> AI Stylist
            </p>
            <h1 className="mt-1 text-heading-h1 font-semibold text-neutral-900">Phối đồ cùng AI</h1>
            <p className="mt-1 text-body-md text-neutral-500">Chọn dịp mặc, nhận bộ phối từ sản phẩm của cửa hàng.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full border bg-white text-label-sm font-semibold ${hasQuota ? 'border-neutral-200 text-neutral-600' : 'border-red-200 text-semantic-error'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasQuota ? 'bg-semantic-success' : 'bg-semantic-error'}`} />
              {remainingQuota === null
                ? 'Đang tải lượt…'
                : remainingQuota === Infinity
                  ? 'Không giới hạn lượt'
                  : `Còn ${remainingQuota}/${quota?.limit} lượt hôm nay`}
            </span>
            {!historyLoading && history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="h-9 px-3 rounded-full border border-neutral-200 bg-white text-label-sm font-semibold text-neutral-700 hover:border-brand-navy/40 hover:text-brand-navy flex items-center gap-1.5 cursor-pointer"
              >
                <HistoryIcon className="w-3.5 h-3.5" /> Lịch sử
                <span className="text-neutral-400">{meta?.total ?? history.length}</span>
              </button>
            )}
          </div>
        </header>

        {showForm ? (
          <StylistInputPanel
            photoUrl={photoUrl}
            fileInputRef={fileInputRef}
            handleRemovePhoto={handleRemovePhoto}
            cameraInputRef={cameraInputRef}
            selectedProduct={selectedProduct}
            setShowCatalogModal={setShowCatalogModal}
            productsLoading={productsLoading}
            setOccasion={setOccasion}
            occasion={occasion}
            setStylePreference={setStylePreference}
            stylePreference={stylePreference}
            setBudget={setBudget}
            budget={budget}
            setGenderPreference={setGenderPreference}
            genderPreference={genderPreference}
            pageState={pageState}
            errorMessage={errorMessage}
            handleAnalyze={handleAnalyze}
            photoFile={photoFile}
            imageConsent={imageConsent}
            onImageConsentChange={handleImageConsentChange}
            showConsentError={showConsentError}
            isAnalyzing={isAnalyzing}
            onCancelEdit={isEditing && displayResult ? () => setIsEditing(false) : undefined}
          />
        ) : (
          <StylistBriefSummary
            result={pageState === 'result' ? displayResult : null}
            photoUrl={photoUrl}
            isAnalyzing={pageState === 'processing'}
            onEdit={handleEdit}
          />
        )}

        {pageState === 'processing' && <StylistResultSkeleton />}

        {pageState === 'result' && displayResult && !isEditing && (
          <StylistResultPanel key={displayResult.id} resultRef={resultRef} displayResult={displayResult} />
        )}

        <StylistHistoryPanel
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          meta={meta}
          history={history}
          selectedId={displayResult?.id ?? null}
          handleSelectHistoryItem={handleSelectHistoryItem}
          handleDeleteHistory={handleDeleteHistory}
          isDeleting={isDeleting}
          setPage={setPage}
          page={page}
        />
      </div>
    </div>
  );
}
