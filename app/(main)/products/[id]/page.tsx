'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronRight, Star, Minus, Plus, ShoppingBag, Sparkles, AlertCircle, X, Ruler, MessageSquare } from 'lucide-react';
import { useApp } from '@/components/navigation/Layout';
import { useCart } from '@/store/cartStore';
import { toast } from 'sonner';
import { PRODUCTS } from '@/lib/data';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useMeasurementsCompleteness } from '@/hooks/useMeasurementsCompleteness';
import { useRackItems, usePinToRack, useUnpinFromRack } from '@/hooks/useRack';
import ProductImageViewer from '@/components/products/ProductImageViewer';
import { HangerIcon } from '@/components/ui/HangerIcon';
import { useReviewStats } from '@/hooks/useReviews';
import { StarRating } from '@/components/reviews/StarRating';
import { ReviewSection } from '@/components/reviews/ReviewSection';

export default function ProductDetail() {
  const { setIsCartOpen } = useApp();
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { product: apiProduct, isLoading: isProductLoading } = useProduct(id);
  const { products: allApiProducts } = useProducts();
  const { measurements } = useMeasurements();
  const { getCategoryCompleteness } = useMeasurementsCompleteness();
  const { isPinned, getItemByProductId } = useRackItems();
  const { pinProduct, isPinning } = usePinToRack();
  const { unpinProduct, isUnpinning } = useUnpinFromRack();

  // Find product by id (from route). Only match mock PRODUCTS if id actually matches!
  const mockProduct = PRODUCTS.find(p => p.id === id || p.id === `p${id}`);
  const product = apiProduct || mockProduct;

  const allAvailableProducts = allApiProducts.length > 0 ? allApiProducts : PRODUCTS;
  const relatedProducts = allAvailableProducts.filter(p => p.id !== product?.id).slice(0, 4);
  const { stats: reviewStats } = useReviewStats(product?.id);

  const isComboSuit = Boolean(
    product?.id === 'p2' || 
    product?.id === 'p4' || 
    product?.name?.toLowerCase().includes('combo suit') || 
    product?.name?.toLowerCase().includes('suit')
  );
  const [selectedType, setSelectedType] = useState<'combo' | 'blazer' | 'retail'>('combo');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || 'Trắng');
  const [activeThumb, setActiveThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Mô tả sản phẩm');

  const catCompleteness = product ? getCategoryCompleteness(product.category) : null;
  const isMeasurementComplete = catCompleteness ? catCompleteness.complete : true;

  // Reset values when switching products
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || 'Trắng');
      setActiveThumb(0);
      setSelectedType('combo');
      setQuantity(1);
    }
  }, [product]);

  if (isProductLoading && !product) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 py-6">
          <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse" />
        </div>
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 pb-16 grid grid-cols-1 md:grid-cols-[55%_1fr] gap-12">
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="w-full aspect-[3/4] md:max-w-[560px] bg-neutral-100 rounded-2xl" />
            <div className="flex gap-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-[82px] h-[110px] bg-neutral-100 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-5 animate-pulse">
            <div className="h-3 w-32 bg-neutral-100 rounded" />
            <div className="h-9 w-3/4 bg-neutral-100 rounded-lg" />
            <div className="h-7 w-36 bg-neutral-100 rounded-md" />
            <div className="w-full h-px bg-neutral-100 my-4" />
            <div className="h-14 w-full bg-neutral-100 rounded-xl" />
            <div className="h-14 w-full bg-neutral-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-[22px] font-bold text-brand-navy mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-neutral-500 mb-6 text-body-md max-w-[420px]">
          Sản phẩm bạn đang tìm kiếm có thể đã ngừng kinh doanh hoặc đường dẫn không tồn tại.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 bg-[#5D1C34] text-white font-semibold rounded-xl hover:bg-[#4A1629] transition-all shadow-md cursor-pointer"
        >
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const thumbs = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleSelectThumb = (idx: number) => {
    setActiveThumb(idx);
    if (isComboSuit) {
      const normalizedIdx = idx % thumbs.length;
      if (normalizedIdx === 0) {
        setSelectedType('combo');
      } else if (normalizedIdx === 1) {
        setSelectedType('blazer');
      } else if (normalizedIdx === 2) {
        setSelectedType('retail');
      }
    }
  };

  const handleSelectType = (type: 'combo' | 'blazer' | 'retail') => {
    setSelectedType(type);
    if (type === 'combo') setActiveThumb(0);
    else if (type === 'blazer') setActiveThumb(1);
    else if (type === 'retail') setActiveThumb(2);
  };

  const COMBO_OPTIONS: { value: 'combo' | 'blazer' | 'retail'; label: string; price: number }[] = [
    { value: 'combo', label: 'Combo Suit nguyên bộ', price: 1290000 },
    { value: 'blazer', label: 'Bán lẻ Áo Blazer', price: 750000 },
    { value: 'retail', label: 'Sơ mi / Váy / Quần tây', price: 550000 },
  ];

  const handleAddToCart = () => {
    let price = product.numericPrice;
    let name = product.name;
    
    if (isComboSuit) {
      const opt = COMBO_OPTIONS.find(o => o.value === selectedType);
      if (opt) {
        price = opt.price;
        name = `${product.name} (${opt.label})`;
      }
    }

    addToCart({
      productId: product.id,
      name,
      price,
      quantity,
      image: thumbs[activeThumb] || product.image,
      color: selectedColor,
      variant: `Màu: ${selectedColor} · Đặt may theo số đo`,
      type: isComboSuit ? selectedType : undefined
    });

    toast.custom((t) => (
      <div className="bg-[#FDFBF7] border-l-4 border-[#5D1C34] border-y border-r border-[#E5DFD5] p-4 rounded-xl shadow-lg flex items-start gap-3.5 max-w-[380px] w-full relative">
        <div className="p-2 bg-[#5D1C34]/10 text-[#5D1C34] rounded-lg shrink-0 mt-0.5">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-[14px] font-bold text-brand-navy leading-snug">Đã thêm vào giỏ hàng!</h4>
          <p className="text-[12px] text-neutral-700 font-semibold mt-1 truncate">{name}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Màu: {selectedColor} · Đặt may theo số đo | SL: {quantity}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
          <button 
            type="button"
            onClick={() => toast.dismiss(t)} 
            className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => { setIsCartOpen(true); toast.dismiss(t); }} 
            className="text-[12px] font-bold text-[#5D1C34] hover:underline underline-offset-2 transition-all mt-auto"
          >
            Xem giỏ hàng
          </button>
        </div>
      </div>
    ), {
      duration: 4000
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* BREADCRUMB */}
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 py-6">
        <nav className="flex items-center gap-2 text-label-sm font-medium text-neutral-500">
          <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-brand-navy transition-colors">Sản phẩm</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-brand-navy transition-colors cursor-pointer">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-navy font-semibold truncate max-w-[200px] md:max-w-none">{product.name}</span>
        </nav>
      </div>

      {/* MAIN SECTION */}
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 pb-16 grid grid-cols-1 md:grid-cols-[55%_1fr] gap-12">
        
        {/* LEFT - Image Gallery with Interactive Zoom Lens & Modal */}
        <ProductImageViewer
          images={thumbs}
          productName={product.name}
          brand={product.brand}
          activeThumb={activeThumb}
          onSelectThumb={handleSelectThumb}
        />

        {/* RIGHT - Product Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="text-[11px] font-bold text-[#8B8880] uppercase tracking-widest mb-3">
              {product.brand || 'FASHIONAI COLLECTION'}
            </div>
            <div className="inline-block px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[12px] font-medium mb-4">
              {product.category}
            </div>
            <h1 className="text-[32px] font-bold text-brand-navy leading-tight tracking-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 cursor-pointer group text-left"
                title="Cuộn xuống xem đánh giá chi tiết"
              >
                <StarRating value={reviewStats?.avgRating || 0} size="sm" readOnly />
                <span className="font-semibold text-brand-navy text-body-sm group-hover:underline">
                  {reviewStats?.avgRating ? Number(reviewStats.avgRating).toFixed(1) : '5.0'}
                </span>
                <span className="text-body-sm text-neutral-500 group-hover:text-brand-navy transition-colors underline decoration-neutral-300 underline-offset-4">
                  ({reviewStats?.reviewCount || 0} đánh giá)
                </span>
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-[22px] font-bold text-brand-navy">
              {isComboSuit 
                ? (selectedType === 'combo' ? '1.290.000đ' : selectedType === 'blazer' ? '750.000đ' : '550.000đ')
                : product.price
              }
            </span>
            {isComboSuit ? (
              <>
                <span className="text-[16px] text-[#8B8880] line-through mb-1">
                  {selectedType === 'combo' ? '1.650.000đ' : selectedType === 'blazer' ? '950.000đ' : '690.000đ'}
                </span>
                <span className="px-2.5 py-1 bg-semantic-error/10 text-semantic-error rounded-full text-label-sm font-bold tracking-wider mb-1">
                  {selectedType === 'combo' ? '-22%' : selectedType === 'blazer' ? '-21%' : '-20%'}
                </span>
              </>
            ) : (
              product.id === 'p3' && (
                <>
                  <span className="text-[16px] text-[#8B8880] line-through mb-1">690.000đ</span>
                  <span className="px-2.5 py-1 bg-semantic-error/10 text-semantic-error rounded-full text-label-sm font-bold tracking-wider mb-1">
                    -20%
                  </span>
                </>
              )
            )}
          </div>

          <div className="w-full h-px bg-neutral-200 mb-6"></div>

          {/* Type Selector (Combo Suit only) */}
          {isComboSuit && (
            <div className="mb-6">
              <div className="text-body-sm font-semibold text-brand-navy mb-3">Phân loại sản phẩm:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {COMBO_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectType(opt.value)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedType === opt.value
                        ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy'
                        : 'border-neutral-200 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <div className="text-body-sm font-bold text-brand-navy">{opt.label}</div>
                    <div className="text-[13px] text-neutral-500 mt-1 font-medium">
                      {opt.price.toLocaleString('vi-VN')}đ
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          <div className="mb-6">
            <div className="text-body-sm font-medium text-brand-navy mb-3">Màu sắc: <span className="font-normal text-neutral-600">{selectedColor}</span></div>
            <div className="flex gap-3">
              {product.colors?.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setSelectedColor(col.name)}
                  className={`w-8 h-8 rounded-full border transition-all cursor-pointer ${
                    selectedColor === col.name 
                      ? 'ring-2 ring-brand-navy ring-offset-2 scale-105' 
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              )) || (
                <>
                  <button className="w-8 h-8 rounded-full bg-white border-2 border-brand-navy ring-2 ring-white ring-offset-1 shadow-sm"></button>
                  <button className="w-8 h-8 rounded-full bg-[#111111] border border-neutral-200 hover:border-neutral-400 transition-colors"></button>
                </>
              )}
            </div>
          </div>

          {/* Made-to-Measure (May đo theo số đo cá nhân) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-body-sm font-bold text-brand-navy flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-[#5D1C34]" /> Hình thức: <span className="text-[#5D1C34]">May đo theo số đo cơ thể (Made-to-measure)</span>
              </div>
              <Link
                href="/profile/measurements"
                className="text-[12px] font-bold text-[#5D1C34] hover:underline flex items-center gap-1"
              >
                Cập nhật số đo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {isMeasurementComplete ? (
              <div className="p-4 bg-[#FDFBF7] border border-[#E5DFD5] rounded-xl animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] font-bold text-green-700 flex items-center gap-1.5">
                    <span>✓</span> Số đo của bạn đã sẵn sàng cho may đo
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium">Tự động áp dụng khi đặt hàng</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] font-medium text-neutral-600 bg-white p-2.5 rounded-lg border border-[#EFE9E1]">
                  <div>Ngực: <strong className="text-brand-navy">{measurements?.chest || '—'}cm</strong></div>
                  <div>Eo: <strong className="text-brand-navy">{measurements?.waist || '—'}cm</strong></div>
                  <div>Hông: <strong className="text-brand-navy">{measurements?.hip || '—'}cm</strong></div>
                  <div>Vai: <strong className="text-brand-navy">{measurements?.shoulder || '—'}cm</strong></div>
                  <div>Cao: <strong className="text-brand-navy">{measurements?.height || '—'}cm</strong></div>
                  <div>Nặng: <strong className="text-brand-navy">{measurements?.weight || '—'}kg</strong></div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-amber-800">
                      Cần bổ sung số đo trước khi đặt may
                    </p>
                    <p className="text-[12px] text-amber-700 mt-1">
                      Còn thiếu: <strong className="font-semibold">{catCompleteness?.missing?.map(m => m.label).join(', ') || 'số đo bắt buộc'}</strong>.
                    </p>
                    <Link
                      href="/profile/measurements"
                      className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-amber-700 text-white rounded-lg text-[12px] font-bold hover:bg-amber-800 transition-colors shadow-2xs"
                    >
                      <Ruler className="w-3.5 h-3.5" /> Bổ sung số đo ngay
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-semantic-success"></div>
            <span className="text-body-sm text-semantic-success font-medium">✓ Nhận may theo số đo riêng (3-5 ngày làm việc)</span>
          </div>

          {/* Quantity */}
          <div className="flex items-center mb-8">
            <div className="flex items-center border border-neutral-200 rounded-xl h-[44px] overflow-hidden bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-brand-navy transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-12 h-full flex items-center justify-center text-body-sm font-medium text-brand-navy border-x border-neutral-200">
                {quantity}
              </div>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-11 h-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-brand-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button 
              onClick={handleAddToCart}
              className="w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl hover:bg-brand-navy/90 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" /> Thêm vào giỏ hàng
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href={`/try-on?productId=${product.id}`} className="h-[48px] bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white text-body-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Thử đồ ảo ngay
              </Link>
              <Link
                href={`/chat?productId=${product.id}&message=${encodeURIComponent('Tư vấn giúp tôi về kích thước và cách phối đồ với sản phẩm ' + product.name)}`}
                className="h-[48px] bg-white border border-brand-navy/30 text-brand-navy hover:bg-brand-navy/5 text-body-sm font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-brand-gold fill-brand-gold" /> Tư vấn với AI
              </Link>
            </div>

            {/* Pin to Virtual Clothes Rack */}
            {(() => {
              const pinned = isPinned(product.id);
              const rackItem = getItemByProductId(product.id);

              const handleTogglePin = () => {
                if (!session?.user) {
                  toast.error('Vui lòng đăng nhập để lưu sản phẩm vào Giá treo đồ');
                  router.push(`/login?callbackUrl=/products/${product.id}`);
                  return;
                }

                if (pinned && rackItem) {
                  unpinProduct(rackItem.id, {
                    onSuccess: () => {
                      toast.info(`Đã bỏ ${product.name} khỏi Giá treo đồ`);
                    },
                    onError: () => {
                      toast.error('Không thể xóa khỏi Giá treo đồ');
                    },
                  });
                } else {
                  pinProduct(product.id, {
                    onSuccess: () => {
                      toast.custom((t) => (
                        <div className="bg-[#FDFBF7] border-l-4 border-[#5D1C34] border-y border-r border-[#E5DFD5] p-4 rounded-xl shadow-lg flex items-start gap-3.5 max-w-[380px] w-full relative">
                          <div className="p-2 bg-[#5D1C34]/10 text-[#5D1C34] rounded-lg shrink-0 mt-0.5">
                            <HangerIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="text-[14px] font-bold text-brand-navy leading-snug">Đã ghim vào Giá treo đồ!</h4>
                            <p className="text-[12px] text-neutral-700 font-semibold mt-1 truncate">{product.name}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">Sẵn sàng để phối đồ và thử đồ ảo</p>
                          </div>
                          <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
                            <button 
                              type="button"
                              onClick={() => toast.dismiss(t)} 
                              className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => { router.push('/rack'); toast.dismiss(t); }} 
                              className="text-[12px] font-bold text-[#5D1C34] hover:underline underline-offset-2 transition-all mt-auto"
                            >
                              Xem giá treo
                            </button>
                          </div>
                        </div>
                      ), {
                        duration: 4000
                      });
                    },
                    onError: () => {
                      toast.error('Không thể ghim vào Giá treo đồ');
                    },
                  });
                }
              };

              return (
                <button
                  type="button"
                  onClick={handleTogglePin}
                  disabled={isPinning || isUnpinning}
                  className={`w-full h-[48px] border rounded-xl font-semibold text-body-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pinned
                      ? 'border-[#5D1C34] bg-[#5D1C34]/10 text-[#5D1C34] hover:bg-[#5D1C34]/15'
                      : 'border-dashed border-[#5D1C34]/40 text-[#5D1C34] hover:bg-[#5D1C34]/5'
                  }`}
                >
                  <HangerIcon className="w-4 h-4" />
                  {pinned ? '✓ Đã ghim trên Giá treo — Bấm để bỏ ghim' : 'Ghim vào Giá treo đồ (Phối đồ)'}
                </button>
              );
            })()}
          </div>

          {/* Measurements reminder */}
          <Link href="/profile/measurements" className="flex items-center justify-between p-4 bg-[#EEF0FD] border border-[#AFA9EC] rounded-xl text-[#3C3489] hover:bg-[#E0E4FC] transition-colors group cursor-pointer">
            <div className="flex items-center gap-2 text-body-sm font-medium">
              <span className="text-[16px]">💡</span> Xem và chỉnh sửa số đo cá nhân trong Profile
            </div>
            <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>

        </div>
      </div>

      {/* TABS SECTION */}
      <div className="border-t border-neutral-200">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8">
          <div className="flex items-center gap-8 border-b border-neutral-200 overflow-x-auto no-scrollbar">
            {['Mô tả sản phẩm', 'Quy trình may đo'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-label-sm font-semibold whitespace-nowrap transition-colors border-b-2 relative cursor-pointer ${
                  activeTab === tab 
                    ? 'text-brand-navy border-brand-navy' 
                    : 'text-neutral-500 border-transparent hover:text-neutral-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-12 min-h-[300px]">
            {activeTab === 'Mô tả sản phẩm' && (() => {
              const catUpper = (product.category || '').toUpperCase();
              const isLower = catUpper.includes('LOWER') || catUpper.includes('QUAN') || catUpper.includes('VAY') || product.category === 'Quần & Váy';
              const isFull = isComboSuit || catUpper.includes('FULL') || catUpper.includes('SUIT') || product.category === 'Suit đầy đủ';
              const isUpper = !isLower && !isFull;

              const colorList = Array.isArray(product.colors) && product.colors.length > 0
                ? product.colors.map(c => c.name).filter(Boolean).join(', ')
                : 'Đa dạng màu sắc';

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-300">
                  {/* Left Column: Product Description & Specs */}
                  <div>
                    <h3 className="text-[20px] font-bold text-brand-navy mb-4">Chi tiết sản phẩm</h3>
                    
                    {/* Dynamic Description from Backend if available */}
                    {product.description ? (
                      <div className="mb-6 p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-body-md text-neutral-700 leading-relaxed whitespace-pre-line">
                        {product.description}
                      </div>
                    ) : (
                      <p className="text-body-md text-neutral-600 mb-6 leading-relaxed">
                        Sản phẩm <strong className="text-brand-navy font-semibold">{product.name}</strong> được tuyển chọn chất liệu cao cấp và ứng dụng công nghệ may đo cá nhân hóa (Made-to-Measure), mang đến sự vừa vặn hoàn hảo theo đúng số đo cơ thể của bạn.
                      </p>
                    )}

                    <ul className="space-y-3 text-body-md text-neutral-600">
                      <li className="flex gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span>
                        <span>
                          <strong className="text-neutral-800 font-semibold">Chất liệu:</strong>{' '}
                          {product.material || (
                            isFull
                              ? 'Premium Wool pha cao cấp, đứng form, chống nhăn tự nhiên'
                              : isLower
                              ? 'Kaki / Tuyết mưa cao cấp co giãn nhẹ, giữ phom dáng chuẩn'
                              : '100% Cotton Oxford / Poplin cao cấp, thoáng khí và êm ái'
                          )}
                        </span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span>
                        <span>
                          <strong className="text-neutral-800 font-semibold">Quy cách may:</strong> May đo theo số đo cá nhân (Made-to-Measure)
                        </span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span>
                        <span>
                          <strong className="text-neutral-800 font-semibold">Màu sắc:</strong> {colorList}
                        </span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span>
                        <span>
                          <strong className="text-neutral-800 font-semibold">Xuất xứ:</strong> Thiết kế và may đo tại Việt Nam
                        </span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span>
                        <span>
                          <strong className="text-neutral-800 font-semibold">Bảo quản:</strong> Giặt máy chế độ nhẹ hoặc giặt khô, không dùng chất tẩy mạnh
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Right Column: Styling Tips & AI Assistant Prompt */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-[20px] font-bold text-brand-navy mb-4">Gợi ý phối đồ (Styling Tips)</h3>
                      <p className="text-body-md text-neutral-600 mb-5 leading-relaxed">
                        {isFull ? (
                          <>Set trang phục <strong className="text-brand-navy">{product.name}</strong> mang phong cách sang trọng, lịch lãm, dễ dàng điều chỉnh theo nhiều mức độ trang trọng:</>
                        ) : isLower ? (
                          <>Thiết kế <strong className="text-brand-navy">{product.name}</strong> tôn dáng, linh hoạt và là điểm nhấn quan trọng cho tổng thể trang phục:</>
                        ) : (
                          <>Mẫu <strong className="text-brand-navy">{product.name}</strong> là item cốt lõi trong tủ đồ, cho phép bạn biến hóa đa dạng nhiều phong cách:</>
                        )}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                          <h4 className="font-semibold text-brand-navy mb-1.5 text-label-sm">
                            {isFull ? 'Sự kiện / Hội nghị' : isLower ? 'Phong cách Công sở' : 'Professional (Công sở)'}
                          </h4>
                          <p className="text-[13px] text-neutral-600 leading-relaxed">
                            {isFull
                              ? 'Kết hợp cùng áo sơ mi trắng tinh tế, cà vạt lụa và giày Oxford/Derby.'
                              : isLower
                              ? 'Phối cùng áo sơ mi trắng, sơ vin gọn gàng và khoác thêm Blazer.'
                              : 'Kết hợp cùng quần tây Navy hoặc Xám đậm, khoác thêm Blazer nếu cần.'}
                          </p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                          <h4 className="font-semibold text-brand-navy mb-1.5 text-label-sm">
                            {isFull ? 'Doanh nhân hiện đại' : isLower ? 'Năng động dạo phố' : 'Smart Casual (Hàng ngày)'}
                          </h4>
                          <p className="text-[13px] text-neutral-600 leading-relaxed">
                            {isFull
                              ? 'Mặc bên trong áo thun/áo len mỏng cao cấp kèm giày Loafer thanh lịch.'
                              : isLower
                              ? 'Mặc cùng áo thun Polo basic, áo dệt kim và giày Loafer hoặc Sneaker.'
                              : 'Mặc cùng quần Chino Khaki hoặc Jeans tối màu, xắn tay áo nhẹ nhàng.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Stylist Callout */}
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-brand-navy/5 to-brand-gold/10 border border-brand-gold/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-navy text-brand-gold flex items-center justify-center shrink-0 shadow-xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-body-sm font-bold text-brand-navy">Tư vấn phối đồ theo dáng người</div>
                          <div className="text-label-xs text-neutral-500">Hỏi AI Stylist cách mix & match sản phẩm này</div>
                        </div>
                      </div>
                      <Link
                        href={`/chat?productId=${product.id}&message=${encodeURIComponent('Gợi ý cho tôi cách phối đồ đẹp và chuẩn dáng nhất với ' + product.name)}`}
                        className="px-3.5 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-lg text-[12px] font-bold shrink-0 transition-colors"
                      >
                        Hỏi AI Stylist
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {activeTab === 'Quy trình may đo' && (
              <div className="max-w-[800px] animate-in fade-in duration-300">
                <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 mb-6 space-y-4">
                  <h4 className="text-[16px] font-bold text-brand-navy">Quy trình đặt may đo theo số đo riêng (Made-to-Measure)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-body-sm text-neutral-600">
                    <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-2xs">
                      <div className="text-brand-gold font-bold text-[18px] mb-1">01</div>
                      <div className="font-semibold text-brand-navy mb-1">Cung cấp số đo</div>
                      <p className="text-[12px] text-neutral-500">Nhập số đo cơ thể trong trang Profile hoặc khi thực hiện đặt hàng.</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-2xs">
                      <div className="text-brand-gold font-bold text-[18px] mb-1">02</div>
                      <div className="font-semibold text-brand-navy mb-1">Thợ may cắt rập</div>
                      <p className="text-[12px] text-neutral-500">Đội ngũ nghệ nhân may đo sẽ tinh chỉnh rập cá nhân hóa cho từng khách hàng.</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-2xs">
                      <div className="text-brand-gold font-bold text-[18px] mb-1">03</div>
                      <div className="font-semibold text-brand-navy mb-1">Giao hàng hoàn hảo</div>
                      <p className="text-[12px] text-neutral-500">Trang phục vừa vặn chuẩn chỉnh được hoàn thiện và giao trong 3-5 ngày.</p>
                    </div>
                  </div>
                </div>
                <p className="text-body-sm text-neutral-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-brand-navy" /> FashionAI cam kết hỗ trợ chỉnh sửa miễn phí nếu số đo thành phẩm có sai lệch vượt quá dung sai chuẩn.
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* REVIEW SECTION */}
      <ReviewSection
        productId={product.id}
        productName={product.name}
        productImage={thumbs[0]}
      />

      {/* RELATED PRODUCTS */}
      <div className="bg-[#EFE9E1] py-[64px]">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-[28px] font-bold text-brand-navy tracking-tight">Có thể bạn sẽ thích</h2>
            <Link href="/products" className="text-body-sm font-medium text-brand-navy hover:underline underline-offset-4 mb-1">
              Xem tất cả &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(rel => (
              <Link href={`/products/${rel.id}`} key={rel.id} className="group flex flex-col bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                  <img 
                    src={rel.image} 
                    alt={rel.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({
                        productId: rel.id,
                        name: rel.name,
                        price: rel.numericPrice,
                        quantity: 1,
                        image: rel.image,
                        color: rel.colors?.[0]?.name || 'Mặc định',
                        variant: `Màu: ${rel.colors?.[0]?.name || 'Mặc định'} · May đo`
                      });
                      toast.success(`Đã thêm ${rel.name} vào giỏ!`);
                    }}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-brand-navy shadow-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all cursor-pointer hover:bg-brand-navy hover:text-white"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{rel.brand}</div>
                  <h4 className="text-body-sm font-medium text-brand-navy line-clamp-2">{rel.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-body-sm font-bold text-brand-navy">{rel.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
