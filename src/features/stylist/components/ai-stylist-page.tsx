'use client';
import { getErrorStatus } from '@/lib/errors';
import { toColorList, toOutfitList } from '@/features/stylist/services/result-lists';


import { StylistHistoryPanel } from '@/features/stylist/components/stylist-history-panel';
import { StylistInputPanel } from '@/features/stylist/components/stylist-input-panel';
import { StylistResultPanel } from '@/features/stylist/components/stylist-result-panel';
import type { GenderPref, Status } from '@/features/stylist/types/ai-stylist-page';
import { PRODUCTS } from '@/features/products/constants/products';
import { useProducts } from '@/features/products/hooks/useProducts';
import { ProductPickerModal } from '@/features/stylist/components/ProductPickerModal';
import { QuotaExhaustedModal } from '@/features/stylist/components/QuotaExhaustedModal';
import { useAnalyzeStylist, useDeleteStylistHistory, useStylistHistory } from '@/features/stylist/hooks/useStylist';
import type { StylistProduct, StylistResult } from '@/features/stylist/types/stylist';
import { useQuota } from '@/features/subscription/hooks/useQuota';
import {
  Briefcase,
  LayoutGrid,
  ScanFace,
  Shirt,
  Sparkles,
  Watch
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function AIStylistPage() {
  const { analyzeAsync, isAnalyzing, errorMessage, reset: resetAnalyzeError } = useAnalyzeStylist();
  const { quota, refetch: refetchQuota } = useQuota('STYLIST');
  const { products: backendProducts, isLoading: productsLoading } = useProducts();
  const catalogProducts = backendProducts.length > 0 ? backendProducts : PRODUCTS;

  const [page, setPage] = useState(1);
  const { history, meta, isLoading: historyLoading } = useStylistHistory(page, 5);
  const { deleteAsync, isDeleting } = useDeleteStylistHistory();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File | null) => {
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
    setPageState('idle');
    setSelectedResult(null);
  };

  const remainingQuota = quota ? (quota.unlimited || quota.limit === null ? Infinity : (quota.limit ?? 0) - quota.used) : null;
  const hasQuota = remainingQuota === null || remainingQuota > 0;

  const handleAnalyze = async () => {
    if (!hasQuota) {
      setShowQuotaModal(true);
      return;
    }
    if (!photoFile) {
      toast.error('Vui lòng tải lên ảnh của bạn trước.');
      return;
    }
    if (!selectedProduct && !occasion) {
      toast.error('Vui lòng chọn sản phẩm hoặc dịp mặc.');
      return;
    }

    resetAnalyzeError();
    setSelectedResult(null);
    setPageState('processing');

    try {
      const res = await analyzeAsync({
        humanImage: photoFile,
        productId: selectedProduct?.id,
        garmentDescription: selectedProduct
          ? undefined
          : `Trang phục cho dịp: ${occasion}`,
        occasion,
        stylePreference: stylePreference || undefined,
        budget: budget || undefined,
        genderPreference: genderPreference || undefined,
      });
      setSelectedResult(res);
      setPageState('result');
      refetchQuota();
      toast.success('Phân tích phong cách hoàn tất!');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
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
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleDeleteHistory = async (e: React.MouseEvent, item: StylistResult) => {
    e.stopPropagation();
    try {
      await deleteAsync(item.id);
      toast.success('Đã xóa kết quả tư vấn.');
      if (selectedResult?.id === item.id) {
        setSelectedResult(null);
        setPageState('idle');
      }
    } catch (err) {
      toast.error('Không thể xóa kết quả. Vui lòng thử lại.');
    }
  };

  const displayResult = selectedResult;

  const score = displayResult?.productCompatibilityScore;

  const getOutfitIcon = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'shirt':
      case 'top':
      case 'áo':
      case 'blazer':
      case 'vest':
        return <Shirt className="w-4 h-4 text-brand-navy" />;
      case 'pants':
      case 'trouser':
      case 'quần':
      case 'skirt':
      case 'váy':
        return <LayoutGrid className="w-4 h-4 text-brand-navy" />;
      case 'shoes':
      case 'giày':
        return <Briefcase className="w-4 h-4 text-brand-navy" />;
      default:
        return <Watch className="w-4 h-4 text-brand-navy" />;
    }
  };

  const scoreColor = score === null || score === undefined ? 'bg-neutral-200' : score >= 80 ? 'bg-semantic-success' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const scoreLabel = score === null || score === undefined ? 'Chưa đủ dữ liệu' : score >= 80 ? 'Rất phù hợp' : score >= 60 ? 'Tương đối phù hợp' : 'Ít phù hợp';

  return (
    <div className="min-h-screen bg-brand-cream text-neutral-900 font-sans pb-24">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-8 md:py-12">

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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-navy/10 mb-4">
            <Sparkles className="w-6 h-6 text-brand-navy animate-pulse" />
          </div>
          <h1 className="text-heading-h2 font-semibold text-neutral-900 mb-2">AI Stylist</h1>
          <p className="text-body-md text-neutral-600 mb-4">
            Tư vấn màu sắc cá nhân, vóc dáng, size phù hợp và outfit công sở
          </p>
          <div className={`inline-flex items-center gap-2 bg-white border px-4 py-1.5 rounded-full text-label-sm font-semibold shadow-sm ${hasQuota ? 'border-neutral-200 text-neutral-700' : 'border-red-200 text-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${hasQuota ? 'bg-amber-500 animate-ping' : 'bg-red-500'}`} />
            {remainingQuota === null
              ? 'Đang tải quota...'
              : remainingQuota === Infinity
                ? 'Gói VIP: không giới hạn lượt'
                : `Còn ${remainingQuota} / ${quota?.limit} lượt tư vấn hôm nay`}
          </div>
        </div>

        {/* INPUT SECTION */}
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
          isAnalyzing={isAnalyzing}
        />

        {/* PROCESSING LOADER */}
        {pageState === 'processing' && (
          <div className="bg-brand-navy/5 border border-brand-navy/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-[fadeInUp_0.3s_ease-out]">
            <ScanFace className="w-12 h-12 text-brand-navy mb-4 animate-bounce" />
            <h3 className="text-body-lg font-bold text-brand-navy mb-2">
              Gemini Vision đang quét vóc dáng, sắc tố da và số đo...
            </h3>
            <p className="text-body-sm text-brand-navy/70">Quá trình phân tích chuyên sâu mất khoảng 3-5 giây</p>
          </div>
        )}

        {/* RESULT SECTION */}
        {pageState === 'result' && displayResult && (
          <StylistResultPanel
            resultRef={resultRef}
            displayResult={displayResult}
            toColorList={toColorList}
            score={score}
            scoreColor={scoreColor}
            scoreLabel={scoreLabel}
            occasion={occasion}
            toOutfitList={toOutfitList}
            getOutfitIcon={getOutfitIcon}
          />
        )}

        {/* BOTTOM: History */}
        {!historyLoading && history.length > 0 && (
          <StylistHistoryPanel
            setHistoryOpen={setHistoryOpen}
            historyOpen={historyOpen}
            meta={meta}
            history={history}
            handleSelectHistoryItem={handleSelectHistoryItem}
            handleDeleteHistory={handleDeleteHistory}
            isDeleting={isDeleting}
            setPage={setPage}
            page={page}
          />
        )}
      </div>
    </div>
  );
}
