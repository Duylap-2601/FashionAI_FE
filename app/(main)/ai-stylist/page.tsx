'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  X,
  Shirt,
  Briefcase,
  Watch,
  ChevronDown,
  ChevronUp,
  History as HistoryIcon,
  CheckCircle2,
  ScanFace,
  Sun,
  LayoutGrid,
  Camera as CameraIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Wallet,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  useAnalyzeStylist,
  useStylistHistory,
  useDeleteStylistHistory,
  StylistResult,
  StylistProduct,
} from '@/hooks/useStylist';
import { useQuota } from '@/hooks/useQuota';
import { useProducts } from '@/hooks/useProducts';
import { ProductPickerModal } from '@/components/stylist/ProductPickerModal';
import { QuotaExhaustedModal } from '@/components/stylist/QuotaExhaustedModal';
import { PRODUCTS } from '@/lib/data';

type Status = 'idle' | 'processing' | 'result';
type GenderPref = 'male' | 'female' | 'other' | '';

const OCCASIONS = ['Đi làm', 'Phỏng vấn', 'Họp quan trọng', 'Sự kiện', 'Dạ tiệc'];
const STYLE_PREFERENCES = ['Lịch lãm', 'Tối giản', 'Năng động', 'Thanh lịch', 'Smart casual'];
const BUDGETS = ['Dưới 500k', '500k - 1 triệu', '1 - 2 triệu', 'Trên 2 triệu'];

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
    } catch (error: any) {
      setPageState('idle');
      console.error('Stylist analyze error:', error);
      const status = error?.response?.status;
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

  const toColorList = (val: any): any[] => (Array.isArray(val) ? val : []);
  const toOutfitList = (val: any): any[] => (Array.isArray(val) ? val : []);
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
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 mb-8 transition-all">
          <h2 className="text-heading-h3 font-semibold text-brand-navy mb-6">
            1. Ảnh của bạn
          </h2>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Upload Area */}
            <div className="w-full md:w-[200px] shrink-0 flex flex-col items-center">
              <div
                className={`relative w-[200px] h-[260px] rounded-xl overflow-hidden transition-all flex flex-col items-center justify-center text-center group border-2 ${
                  photoUrl
                    ? 'border-transparent'
                    : 'border-dashed border-brand-navy/40 bg-neutral-50 hover:bg-neutral-100/50 cursor-pointer'
                }`}
                onClick={() => { if (!photoUrl) fileInputRef.current?.click(); }}
              >
                {photoUrl ? (
                  <>
                    <img src={photoUrl} alt="Ảnh đã tải lên" className="w-full h-full object-cover" />
                    <button
                      onClick={handleRemovePhoto}
                      type="button"
                      className="absolute top-2 right-2 w-8 h-8 bg-neutral-900/50 hover:bg-neutral-900/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[11px] px-2 py-1 rounded">
                      Đã chọn ảnh
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex flex-col items-center justify-center h-full w-full">
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        type="button"
                        className="flex flex-col items-center p-2 rounded-xl hover:bg-brand-navy/5 transition-colors border-0 bg-transparent w-full cursor-pointer"
                      >
                        <UploadCloud className="w-7 h-7 text-brand-navy mb-2 opacity-80" />
                        <span className="text-label-sm font-semibold text-brand-navy">Tải ảnh lên</span>
                      </button>

                      <div className="h-px bg-neutral-200 w-3/4 mx-auto" />

                      <button
                        onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                        type="button"
                        className="flex flex-col items-center p-2 rounded-xl hover:bg-brand-navy/5 transition-colors border-0 bg-transparent w-full cursor-pointer"
                      >
                        <CameraIcon className="w-7 h-7 text-brand-navy mb-2 opacity-80" />
                        <span className="text-label-sm font-semibold text-brand-navy">Chụp ảnh selfie</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Context fields */}
            <div className="flex-1 w-full flex flex-col gap-6">
              {/* Product selection */}
              <div>
                <label className="text-label-md font-semibold text-neutral-900 mb-3 block">
                  Sản phẩm cần tư vấn <span className="text-neutral-400 font-normal">(tùy chọn)</span>
                </label>
                {selectedProduct ? (
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    {selectedProduct.garmentUrl && (
                      <img
                        src={selectedProduct.garmentUrl}
                        alt={selectedProduct.name}
                        className="w-14 h-16 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-semibold text-neutral-900 truncate">
                        {selectedProduct.name}
                      </p>
                      {typeof selectedProduct.price === 'number' && selectedProduct.price > 0 && (
                        <p className="text-label-sm font-semibold text-brand-navy mt-0.5">
                          {selectedProduct.price.toLocaleString('vi-VN')} đ
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowCatalogModal(true)}
                      type="button"
                      className="text-label-sm font-bold text-brand-navy hover:underline border-0 bg-transparent cursor-pointer whitespace-nowrap"
                    >
                      Đổi sản phẩm
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setShowCatalogModal(true)}
                      type="button"
                      className="flex-1 h-11 px-4 rounded-xl border border-brand-navy/40 text-brand-navy font-semibold text-label-sm hover:bg-brand-navy hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4" />
                      {productsLoading ? 'Đang tải catalog...' : 'Chọn từ catalog'}
                    </button>
                    <button
                      onClick={() => setShowCatalogModal(true)}
                      type="button"
                      className="sm:w-auto px-4 h-11 rounded-xl border border-neutral-200 text-neutral-600 font-semibold text-label-sm hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Xem tất cả
                    </button>
                  </div>
                )}
              </div>

              {/* Occasion */}
              <div>
                <label className="text-label-md font-semibold text-neutral-900 mb-3 block">
                  Dịp mặc
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccasion(occ)}
                      className={`px-4 py-2 rounded-full text-label-md font-medium transition-colors border cursor-pointer ${
                        occasion === occ
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style + budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-md font-semibold text-neutral-900 mb-2 block">
                    Phong cách yêu thích
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_PREFERENCES.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setStylePreference(stylePreference === style ? '' : style)}
                        className={`px-3 py-1.5 rounded-full text-label-sm font-medium transition-colors border cursor-pointer ${
                          stylePreference === style
                            ? 'bg-brand-navy/10 text-brand-navy border-brand-navy/40'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-label-md font-semibold text-neutral-900 mb-2 block">
                    <Wallet className="w-4 h-4 inline mr-1 text-brand-navy" /> Ngân sách
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudget(budget === b ? '' : b)}
                        className={`px-3 py-1.5 rounded-full text-label-sm font-medium transition-colors border cursor-pointer ${
                          budget === b
                            ? 'bg-brand-navy/10 text-brand-navy border-brand-navy/40'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gender preference */}
              <div>
                <label className="text-label-md font-semibold text-neutral-900 mb-2 block">
                  Giới tính tư vấn <span className="text-neutral-400 font-normal">(tùy chọn)</span>
                </label>
                <div className="flex gap-2">
                  {([
                    ['male', 'Nam'],
                    ['female', 'Nữ'],
                    ['other', 'Khác'],
                  ] as [GenderPref, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGenderPreference(genderPreference === value ? '' : value)}
                      className={`px-4 py-2 rounded-xl text-label-sm font-medium transition-colors border cursor-pointer ${
                        genderPreference === value
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error banner */}
              {pageState === 'idle' && errorMessage && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-body-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* Analyze */}
              <button
                onClick={handleAnalyze}
                disabled={!photoFile || isAnalyzing}
                type="button"
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-label-md font-bold text-white transition-all border-0 ${
                  !photoFile
                    ? 'bg-neutral-300 cursor-not-allowed'
                    : isAnalyzing
                      ? 'bg-brand-navy/80 cursor-wait'
                      : 'bg-brand-navy hover:bg-brand-navy/90 shadow-md cursor-pointer'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang phân tích dáng người & màu da...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-brand-gold animate-bounce" /> Phân tích phong cách bằng AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

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
          <div ref={resultRef} className="space-y-8 scroll-mt-6 animate-[fadeInUp_0.5s_ease-out]">

            {displayResult.product && (
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-neutral-200 flex items-center gap-4">
                {displayResult.product.garmentUrl && (
                  <img
                    src={displayResult.product.garmentUrl}
                    alt={displayResult.product.name}
                    className="w-16 h-20 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-100"
                  />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-1">
                    Sản phẩm được tư vấn
                  </div>
                  <h3 className="text-body-lg font-bold text-neutral-900 truncate">
                    {displayResult.product.name}
                  </h3>
                  {typeof displayResult.product.price === 'number' && displayResult.product.price > 0 && (
                    <p className="text-label-sm font-semibold text-brand-navy mt-0.5">
                      {displayResult.product.price.toLocaleString('vi-VN')} đ
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Section 1: Analysis */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
              <h2 className="text-heading-h3 font-bold text-brand-navy mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-semantic-success" /> Phân tích sắc màu & dáng người
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Personal Color */}
                <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col justify-center">
                  <div className="text-[11px] font-bold tracking-wider uppercase text-amber-700 mb-1">Personal Color</div>
                  <h3 className="text-heading-h3 font-bold text-amber-900 mb-3 flex items-center gap-1">
                    <Sun className="w-5 h-5" /> {displayResult.personalColor || 'Chưa xác định'}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {toColorList(displayResult.colorSuggestions).slice(0, 6).map((c: any, i: number) => {
                      const label = typeof c === 'string' ? c : c?.name || c?.color || '';
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-amber-200 text-[10.5px] font-semibold text-amber-800"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Body Type */}
                <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-center">
                  <div className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 mb-1">Dáng người</div>
                  <h3 className="text-heading-h3 font-bold text-neutral-900 mb-2">{displayResult.bodyType}</h3>
                  <p className="text-[12.5px] text-neutral-600 leading-relaxed">
                    Khớp dáng người theo tỷ lệ vai, ngực, eo, hông để gợi ý phom trang phục phù hợp.
                  </p>
                </div>

                {/* Skin Tone */}
                <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-center">
                  <div className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 mb-1">Skin Tone / Undertone</div>
                  <h3 className="text-heading-h3 font-bold text-neutral-900 mb-2">{displayResult.skinTone}</h3>
                  <p className="text-[12.5px] text-neutral-600 leading-relaxed">
                    Đề xuất tông màu áo sơ mi, blazer tôn vinh sắc diện tự nhiên.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Fit Advice & Compatibility */}
            {(displayResult.fitAdvice || displayResult.fitRecommendation || displayResult.recommendedSize || score !== null) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(displayResult.fitAdvice || displayResult.fitRecommendation || displayResult.recommendedSize) && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
                    <div className="flex items-center gap-2 text-label-sm font-bold text-brand-navy mb-3">
                      <Ruler className="w-4 h-4 text-[#5D1C34]" /> Tư vấn may đo & form dáng
                    </div>
                    <p className="text-body-md text-neutral-800 leading-relaxed font-medium">
                      {displayResult.fitAdvice || displayResult.fitRecommendation || `Khuyên dùng form: ${displayResult.recommendedSize}`}
                    </p>
                    {displayResult.fitRecommendation && displayResult.fitAdvice && (
                      <p className="text-body-sm text-neutral-500 mt-2 leading-relaxed">
                        {displayResult.fitRecommendation}
                      </p>
                    )}
                  </div>
                )}

                {score !== null && score !== undefined && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-label-sm font-bold text-brand-navy">
                        <Sparkles className="w-4 h-4" /> Độ tương thích sản phẩm
                      </div>
                      <span className="text-heading-h3 font-bold text-neutral-900">{score}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${scoreColor} rounded-full transition-all duration-700`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <p className="text-label-sm font-semibold mt-2 text-neutral-600">{scoreLabel}</p>
                  </div>
                )}
              </div>
            )}

            {/* Section 3: Outfit combinations */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
              <h2 className="text-heading-h3 font-bold text-brand-navy mb-6">
                Đề xuất trang phục ({occasion})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {toOutfitList(displayResult.outfitCombinations).map((outfit: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50 rounded-xl border border-neutral-200 p-5 flex flex-col">
                    <h4 className="text-label-lg font-bold text-brand-navy mb-4 border-b border-neutral-200 pb-3">
                      {typeof outfit === 'string' ? `Bộ phối ${idx + 1}` : outfit.name || `Outfit ${idx + 1}`}
                    </h4>
                    <div className="space-y-3 mb-6">
                      {typeof outfit === 'string' ? (
                        <div className="flex items-start gap-3 text-body-sm text-neutral-700 leading-relaxed">
                          <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm shrink-0">
                            {getOutfitIcon('shirt')}
                          </div>
                          <span>{outfit}</span>
                        </div>
                      ) : (
                        outfit.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 text-body-sm text-neutral-700">
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm shrink-0">
                              {getOutfitIcon(item.type || 'shirt')}
                            </div>
                            <span className="truncate" title={item.name}>{item.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      href={displayResult.product ? `/products/${displayResult.product.id}` : '/products'}
                      className="mt-auto w-full py-2.5 rounded-lg border border-brand-navy text-brand-navy font-semibold text-label-sm hover:bg-brand-navy hover:text-white transition-colors text-center"
                    >
                      Xem sản phẩm
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Verdict */}
            <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-6 md:p-8">
              <h2 className="text-heading-h3 font-bold text-brand-navy mb-4">Lời khuyên & Nhận xét chi tiết</h2>
              <div className="text-body-md text-neutral-800 space-y-4 leading-relaxed font-sans">
                <p className="whitespace-pre-line">{displayResult.verdict}</p>
                <div className="h-px bg-brand-gold/20 my-4" />
                <p className="whitespace-pre-line text-neutral-700 text-body-sm">{displayResult.stylingTips}</p>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM: History */}
        {!historyLoading && history.length > 0 && (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              type="button"
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-colors border-0 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-label-md font-bold text-neutral-900">
                <HistoryIcon className="w-5 h-5 text-neutral-500" /> Lịch sử tư vấn phong cách ({meta?.total ?? history.length})
              </div>
              {historyOpen ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
            </button>

            {historyOpen && (
              <div className="mt-4 bg-white rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100 animate-in slide-in-from-top-2 duration-250">
                {history.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer">
                    <div
                      className="flex items-center gap-4 flex-1 min-w-0"
                      onClick={() => handleSelectHistoryItem(item)}
                    >
                      <div className="w-10 h-10 rounded bg-brand-navy/5 flex items-center justify-center text-brand-navy shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-label-sm font-semibold text-neutral-900 truncate">
                          {item.product?.name || item.occasion || 'Tư vấn outfit'}
                        </div>
                        <div className="text-body-sm text-neutral-500">
                          {fmtDate(item.createdAt)}
                          {item.recommendedSize ? ` • Size ${item.recommendedSize}` : ''}
                          {item.productCompatibilityScore !== null && item.productCompatibilityScore !== undefined
                            ? ` • ${item.productCompatibilityScore}%`
                            : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSelectHistoryItem(item)}
                        type="button"
                        className="text-label-sm font-bold text-brand-navy hover:underline border-0 bg-transparent cursor-pointer"
                      >
                        Xem lại
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistory(e, item)}
                        disabled={isDeleting}
                        type="button"
                        className="p-2 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer"
                        title="Xóa kết quả"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 p-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-label-sm font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Trước
                    </button>
                    <span className="text-label-sm text-neutral-500">
                      Trang {meta.page} / {meta.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                      disabled={page >= meta.totalPages}
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-label-sm font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Sau <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
