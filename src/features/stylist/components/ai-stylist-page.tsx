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
    } catch {
      toast.error('Không thể xóa kết quả. Vui lòng thử lại.');
    }
  };

  const displayResult = selectedResult;
  const showForm = pageState === 'idle' || isEditing;

  return (
    <div className="min-h-screen pb-24 text-landing-obsidian">
      <div className="mx-auto max-w-[1180px] px-4 py-8 md:px-8 md:py-12">

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

        <header className="mb-8 flex flex-col gap-5 border-b border-landing-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-landing-brass-ink">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} /> AI Stylist
            </p>
            <h1 className="mt-3 font-display text-landing-h2 text-landing-obsidian">Phối đồ cùng AI</h1>
            <p className="mt-3 max-w-xl text-landing-body text-landing-muted">Chọn dịp mặc, nhận bộ phối từ sản phẩm của cửa hàng.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              role="status"
              className={`inline-flex h-10 items-center gap-2 rounded-[2px] border px-3 font-mono text-[11px] uppercase tracking-[0.12em] ${hasQuota ? 'border-landing-line text-landing-obsidian/80' : 'border-destructive/40 text-destructive'}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${hasQuota ? 'bg-landing-sage-ink' : 'bg-destructive'}`} />
              {remainingQuota === null
                ? 'Đang tải lượt'
                : remainingQuota === Infinity
                  ? 'Không giới hạn lượt'
                  : `Còn ${remainingQuota}/${quota?.limit} lượt hôm nay`}
            </span>
            {!historyLoading && history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-[2px] border border-landing-obsidian/70 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
              >
                <HistoryIcon className="h-4 w-4" strokeWidth={1.75} /> Lịch sử
                <span className="font-mono tracking-normal text-landing-muted">{meta?.total ?? history.length}</span>
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
          <StylistResultPanel key={displayResult.id} resultRef={resultRef} displayResult={displayResult} catalogProducts={catalogProducts} />
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
