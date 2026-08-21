'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, Star, Minus, Plus, ShoppingBag, Sparkles, AlertCircle, X, Ruler } from 'lucide-react';
import { useApp } from '@/components/navigation/Layout';
import { useCart } from '@/store/cartStore';
import { toast } from 'sonner';
import { PRODUCTS } from '@/lib/data';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useMeasurements } from '@/hooks/useMeasurements';

const imgSuit = '/images/726470431_1311184104081177_6052756217829444481_n.png';
const imgBlazer = '/images/731163514_999523332788054_1114320478812927640_n.png';
const imgShirt = '/images/731199294_3955961871204172_1445370375731306017_n.png';

export default function ProductDetail() {
  const { setIsCartOpen } = useApp();
  const { addToCart } = useCart();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { product: apiProduct } = useProduct(id);
  const { products: allApiProducts } = useProducts();
  const { measurements } = useMeasurements();

  // Find product by id (from route). Fallback to p2 (Combo Suit) if not found
  const product = apiProduct ||
                  PRODUCTS.find(p => p.id === id) || 
                  PRODUCTS.find(p => p.id === `p${id}`) || 
                  PRODUCTS.find(p => p.id === 'p2') || 
                  PRODUCTS[1];

  const allAvailableProducts = allApiProducts.length > 0 ? allApiProducts : PRODUCTS;
  const relatedProducts = allAvailableProducts.filter(p => p.id !== product.id).slice(0, 4);

  const isComboSuit = product.id === 'p2' || product.id === 'p4' || product.name.toLowerCase().includes('combo suit') || product.name.toLowerCase().includes('suit');
  const [selectedType, setSelectedType] = useState<'combo' | 'blazer' | 'retail'>('combo');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Trắng');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [activeThumb, setActiveThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Mô tả sản phẩm');
  const [isCustomSize, setIsCustomSize] = useState(false);

  // Reset values when switching products
  useEffect(() => {
    setSelectedColor(product.colors?.[0]?.name || 'Trắng');
    setSelectedSize(product.sizes?.[0] || 'M');
    setActiveThumb(0);
    setSelectedType('combo');
    setQuantity(1);
    setIsCustomSize(false);
  }, [product.id, product.colors, product.sizes]);

  const thumbs = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const sizes = (product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL']).map(sizeLabel => ({
    label: sizeLabel,
    inStock: (product.stock ?? 1) > 0
  }));

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

  const handleCustomSizeToggle = () => {
    const hasVals = Boolean(measurements && (measurements.height || measurements.weight));

    if (!hasVals) {
      toast.error("Chưa có số đo cơ thể!", {
        description: "Vui lòng nhập số đo trong profile của bạn trước khi chọn may đo.",
        action: {
          label: "Nhập số đo",
          onClick: () => router.push("/profile/measurements")
        }
      });
      return;
    }

    setIsCustomSize(!isCustomSize);
  };

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
      size: isCustomSize ? 'May đo (Profile)' : selectedSize,
      color: selectedColor,
      variant: isCustomSize 
        ? `Màu: ${selectedColor} | Size: May đo (Profile)` 
        : `Màu: ${selectedColor} | Size: ${selectedSize}`,
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
            Màu: {selectedColor} | Size: {isCustomSize ? 'May đo (Profile)' : selectedSize} | SL: {quantity}
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
        
        {/* LEFT - Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-[3/4] md:max-w-[560px] bg-neutral-100 rounded-2xl overflow-hidden group cursor-zoom-in">
            <img 
              src={thumbs[activeThumb]} 
              alt="Product Main" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/731163514_999523332788054_1114320478812927640_n.png';
              }}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            {/* Zoom hint */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="px-4 py-2 bg-black/50 backdrop-blur-md text-white rounded-full text-label-sm font-medium">Hover để phóng to</span>
            </div>
            {/* Image counter */}
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-brand-navy rounded-full text-label-sm font-bold shadow-sm">
              {activeThumb + 1} / {thumbs.length}
            </div>
          </div>
          
          {/* Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar md:max-w-[560px]">
            {thumbs.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSelectThumb(idx)}
                className={`shrink-0 w-[80px] h-[107px] rounded-xl overflow-hidden transition-all cursor-pointer ${activeThumb === idx ? 'ring-2 ring-brand-navy ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

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
              <div className="flex items-center gap-1">
                {[1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />)}
                <Star className="w-4 h-4 fill-[#F59E0B]/30 text-[#F59E0B]" />
                <span className="font-semibold text-brand-navy ml-1">4.3</span>
              </div>
              <a href="#reviews" className="text-body-sm text-neutral-500 hover:text-brand-navy underline decoration-neutral-300 underline-offset-4">
                (128 đánh giá)
              </a>
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

          {/* Size Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-body-sm font-medium text-brand-navy">
                Kích thước: <span className="font-normal text-neutral-600">{isCustomSize ? 'May đo (Profile)' : selectedSize}</span>
              </div>
              
              <button
                type="button"
                onClick={handleCustomSizeToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all border cursor-pointer ${
                  isCustomSize
                    ? 'bg-[#5D1C34] text-white border-[#5D1C34] shadow-sm'
                    : 'bg-white text-[#5D1C34] border-[#5D1C34]/20 hover:border-[#5D1C34]'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" /> May theo số đo Profile
              </button>
            </div>

            <div className="flex gap-2">
              {sizes.map((sizeObj) => (
                <button
                  key={sizeObj.label}
                  type="button"
                  disabled={isCustomSize || !sizeObj.inStock}
                  onClick={() => setSelectedSize(sizeObj.label)}
                  className={`w-[44px] h-[44px] rounded-xl border text-body-sm font-medium transition-all cursor-pointer ${
                    isCustomSize
                      ? 'opacity-30 cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-400'
                      : !sizeObj.inStock 
                      ? 'opacity-40 cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-400 line-through' 
                      : selectedSize === sizeObj.label 
                      ? 'border-brand-navy bg-brand-navy text-white shadow-sm' 
                      : 'border-neutral-200 text-brand-navy hover:border-neutral-400 bg-white'
                  }`}
                >
                  {sizeObj.label}
                </button>
              ))}
            </div>

            {isCustomSize && (
              <div className="mt-3 p-3.5 bg-[#FDFBF7] border border-[#E5DFD5] rounded-xl text-neutral-600 animate-in slide-in-from-top-1 duration-200">
                <div className="text-[12px] font-bold text-[#5D1C34] mb-1 flex items-center gap-1">
                  <span>✨</span> Sử dụng số đo từ Profile của bạn:
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-neutral-500">
                  <div>Vai: <strong className="text-brand-navy">{measurements?.shoulder || '—'} cm</strong></div>
                  <div>Ngực: <strong className="text-brand-navy">{measurements?.chest || '—'} cm</strong></div>
                  <div>Eo: <strong className="text-brand-navy">{measurements?.waist || '—'} cm</strong></div>
                  <div>Hông: <strong className="text-brand-navy">{measurements?.hip || '—'} cm</strong></div>
                  <div>Chiều cao: <strong className="text-brand-navy">{measurements?.height || '—'} cm</strong></div>
                  <div>Cân nặng: <strong className="text-brand-navy">{measurements?.weight || '—'} kg</strong></div>
                </div>
                <div className="text-[10px] text-neutral-400 mt-2 italic">
                  * Số đo được tự động áp dụng khi thực hiện may đo bộ trang phục này.
                </div>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-semantic-success"></div>
            <span className="text-body-sm text-semantic-success font-medium">✓ Còn hàng</span>
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
          <div className="flex flex-col gap-4 mb-6">
            <button 
              onClick={handleAddToCart}
              className="w-full h-[52px] bg-brand-navy text-white text-body-md font-bold rounded-xl hover:bg-brand-navy/90 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" /> Thêm vào giỏ hàng
            </button>
            <Link href={`/try-on?productId=${product.id}`} className="w-full h-[52px] bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white text-body-md font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> Thử đồ ảo ngay
            </Link>
          </div>

          {/* Measurements reminder */}
          <Link href="/profile/measurements" className="flex items-center justify-between p-4 bg-[#EEF0FD] border border-[#AFA9EC] rounded-xl text-[#3C3489] hover:bg-[#E0E4FC] transition-colors group cursor-pointer">
            <div className="flex items-center gap-2 text-body-sm font-medium">
              <span className="text-[16px]">💡</span> Thêm số đo để kết quả try-on chính xác hơn
            </div>
            <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>

        </div>
      </div>

      {/* TABS SECTION */}
      <div className="border-t border-neutral-200">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8">
          <div className="flex items-center gap-8 border-b border-neutral-200 overflow-x-auto no-scrollbar">
            {['Mô tả sản phẩm', 'Hướng dẫn chọn size', 'Đánh giá (128)'].map(tab => (
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
            {activeTab === 'Mô tả sản phẩm' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-[20px] font-bold text-brand-navy mb-4">Chi tiết sản phẩm</h3>
                  <ul className="space-y-3 text-body-md text-neutral-600">
                    <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span> Chất liệu: {isComboSuit ? 'Premium Wool pha cao cấp, đứng form, chống nhăn tốt' : '100% Cotton Oxford cao cấp, thoáng mát, ít nhăn'}.</li>
                    <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span> Kiểu dáng: {isComboSuit ? 'Slim fit/Modern fit tôn dáng' : 'Regular fit, phù hợp với vóc dáng người Việt'}.</li>
                    <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span> Cổ áo: {isComboSuit ? 'Lapel cách tân sang trọng' : 'Button-down cổ điển, giữ form cực tốt'}.</li>
                    <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span> Xuất xứ: Thiết kế và sản xuất tại Việt Nam.</li>
                    <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span> Bảo quản: Giặt máy chế độ nhẹ hoặc giặt khô, không dùng chất tẩy mạnh.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-brand-navy mb-4">Styling Tips</h3>
                  <p className="text-body-md text-neutral-600 mb-4 leading-relaxed">
                    Áo sơ mi Oxford trắng là &quot;must-have item&quot; trong tủ đồ của mọi quý ông công sở. 
                    Nhờ chất liệu dày dặn nhưng thoáng mát, bạn có thể dễ dàng phối hợp theo nhiều phong cách:
                  </p>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                      <h4 className="font-semibold text-brand-navy mb-2 text-label-sm">Professional</h4>
                      <p className="text-[13px] text-neutral-600">Kết hợp cùng quần tây Navy hoặc Xám đậm, khoác thêm Blazer nếu cần.</p>
                    </div>
                    <div className="flex-1 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                      <h4 className="font-semibold text-brand-navy mb-2 text-label-sm">Smart Casual</h4>
                      <p className="text-[13px] text-neutral-600">Mặc cùng quần Chino Khaki hoặc quần Jeans tối màu, xắn tay áo nhẹ nhàng.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'Hướng dẫn chọn size' && (
              <div className="max-w-[800px] animate-in fade-in duration-300">
                <div className="overflow-x-auto rounded-xl border border-neutral-200 mb-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-label-sm font-semibold text-brand-navy">
                        <th className="p-4 border-b border-neutral-200">Size</th>
                        <th className="p-4 border-b border-neutral-200">Ngực (cm)</th>
                        <th className="p-4 border-b border-neutral-200">Eo (cm)</th>
                        <th className="p-4 border-b border-neutral-200">Hông (cm)</th>
                        <th className="p-4 border-b border-neutral-200">Dài áo (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm text-neutral-700">
                      {[
                        {s: 'S', c: '86-90', w: '74-78', h: '88-92', l: '70'},
                        {s: 'M', c: '90-94', w: '78-82', h: '92-96', l: '72'},
                        {s: 'L', c: '94-98', w: '82-86', h: '96-100', l: '74'},
                        {s: 'XL', c: '98-102', w: '86-90', h: '100-104', l: '76'},
                        {s: 'XXL', c: '102-106', w: '90-94', h: '104-108', l: '78'}
                      ].map(row => (
                        <tr key={row.s} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                          <td className="p-4 font-semibold text-brand-navy">{row.s}</td>
                          <td className="p-4">{row.c}</td>
                          <td className="p-4">{row.w}</td>
                          <td className="p-4">{row.h}</td>
                          <td className="p-4">{row.l}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-body-sm text-neutral-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Số đo tính bằng cm. Liên hệ nếu cần tư vấn kích thước phù hợp nhất với bạn.
                </p>
              </div>
            )}
            
            {activeTab === 'Đánh giá (128)' && (
              <div id="reviews" className="animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                  {/* Rating Overview */}
                  <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 rounded-2xl border border-neutral-100 min-w-[240px]">
                    <div className="text-[48px] font-bold text-brand-navy leading-none mb-2">4.3</div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4].map(i => <Star key={i} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />)}
                      <Star className="w-5 h-5 fill-[#F59E0B]/30 text-[#F59E0B]" />
                    </div>
                    <div className="text-body-sm text-neutral-500">Dựa trên 128 đánh giá</div>
                  </div>
                  {/* Breakdown bars */}
                  <div className="flex-1 w-full max-w-[400px] flex flex-col gap-2">
                    {[
                      {s: 5, p: 65}, {s: 4, p: 20}, {s: 3, p: 10}, {s: 2, p: 3}, {s: 1, p: 2}
                    ].map(row => (
                      <div key={row.s} className="flex items-center gap-3 text-label-sm font-medium text-neutral-600">
                        <div className="w-3">{row.s}</div>
                        <Star className="w-3.5 h-3.5 fill-neutral-400 text-neutral-400" />
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold rounded-full" style={{width: `${row.p}%`}}></div>
                        </div>
                        <div className="w-8 text-right text-neutral-400">{row.p}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-6 bg-white border border-neutral-200 rounded-2xl flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-body-sm">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <div>
                            <div className="font-semibold text-brand-navy text-body-sm">Người dùng {i}</div>
                            <div className="text-[12px] text-neutral-400">12/05/2026</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= 4 ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#F59E0B]/30 text-[#F59E0B]'}`} />)}
                        </div>
                      </div>
                      <p className="text-body-sm text-neutral-600 leading-relaxed">
                        Chất liệu áo rất mát và giữ form tốt. Tôi đã thử bằng AI Try-On và kết quả ngoài đời thực y hệt như trên ảnh. Rất hài lòng với trải nghiệm mua sắm này!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
                        size: rel.sizes?.[0] || 'M',
                        color: rel.colors?.[0]?.name || 'Mặc định',
                        variant: `Màu: ${rel.colors?.[0]?.name || 'Mặc định'} | Size: ${rel.sizes?.[0] || 'M'}`
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
