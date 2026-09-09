'use client';

import { useCartPanel } from '@/features/cart/hooks/use-cart-panel';
import { HangerIcon } from '@/components/ui/HangerIcon';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCart } from '@/features/cart/store/cartStore';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { useMeasurementsCompleteness } from '@/features/measurements/hooks/useMeasurementsCompleteness';
import { ProductBreadcrumb } from '@/features/products/components/detail/ProductBreadcrumb';
import { ProductDetailSkeleton, ProductNotFound } from '@/features/products/components/detail/ProductDetailStates';
import { ProductDetailTabs } from '@/features/products/components/detail/ProductDetailTabs';
import { ProductPurchasePanel } from '@/features/products/components/detail/ProductPurchasePanel';
import { RelatedProducts } from '@/features/products/components/detail/RelatedProducts';
import ProductImageViewer from '@/features/products/components/ProductImageViewer';
import { COMBO_OPTIONS } from '@/features/products/constants/product-detail-config';
import { PRODUCTS } from '@/features/products/constants/products';
import { useProduct, useProducts } from '@/features/products/hooks/useProducts';
import type { ComboType } from '@/features/products/types/product-detail-config';
import type { Product } from '@/features/products/types/products';
import { usePinToRack, useRackItems, useUnpinFromRack } from '@/features/rack/hooks/useRack';
import { ReviewSection } from '@/features/reviews/components/ReviewSection';
import { useReviewStats } from '@/features/reviews/hooks/useReviews';
import { ShoppingBag, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function isComboProduct(product?: Product) {
  return Boolean(
    product?.id === 'p2' ||
    product?.id === 'p4' ||
    product?.name?.toLowerCase().includes('combo suit') ||
    product?.name?.toLowerCase().includes('suit')
  );
}

export default function ProductDetail() {
  const { setIsCartOpen } = useCartPanel();
  const { addToCart } = useCart();
  const user = useAuthStore((state) => state.user);
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

  const mockProduct = PRODUCTS.find(p => p.id === id || p.id === `p${id}`);
  const product = apiProduct || mockProduct;
  const relatedProducts = (allApiProducts.length > 0 ? allApiProducts : PRODUCTS)
    .filter(p => p.id !== product?.id)
    .slice(0, 4);
  const { stats: reviewStats } = useReviewStats(product?.id);

  const isComboSuit = isComboProduct(product);
  const [selectedType, setSelectedType] = useState<ComboType>('combo');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || 'Trắng');
  const [activeThumb, setActiveThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Mô tả sản phẩm');

  const catCompleteness = product ? getCategoryCompleteness(product.category) : null;
  const isMeasurementComplete = catCompleteness ? catCompleteness.complete : true;

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || 'Trắng');
      setActiveThumb(0);
      setSelectedType('combo');
      setQuantity(1);
    }
  }, [product]);

  if (isProductLoading && !product) return <ProductDetailSkeleton />;
  if (!product) return <ProductNotFound />;

  const thumbs = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleSelectThumb = (idx: number) => {
    setActiveThumb(idx);
    if (!isComboSuit) return;

    const normalizedIdx = idx % thumbs.length;
    if (normalizedIdx === 0) setSelectedType('combo');
    else if (normalizedIdx === 1) setSelectedType('blazer');
    else if (normalizedIdx === 2) setSelectedType('retail');
  };

  const handleSelectType = (type: ComboType) => {
    setSelectedType(type);
    if (type === 'combo') setActiveThumb(0);
    else if (type === 'blazer') setActiveThumb(1);
    else if (type === 'retail') setActiveThumb(2);
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
      color: selectedColor,
      variant: `Màu: ${selectedColor} · Đặt may theo số đo`,
      type: isComboSuit ? selectedType : undefined,
    });

    toast.custom((t) => (
      <div className="bg-[#FDFBF7] border-l-4 border-[#5D1C34] border-y border-r border-[#E5DFD5] p-4 rounded-xl shadow-lg flex items-start gap-3.5 max-w-[380px] w-full relative">
        <div className="p-2 bg-[#5D1C34]/10 text-[#5D1C34] rounded-lg shrink-0 mt-0.5"><ShoppingBag className="w-4 h-4" /></div>
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-[14px] font-bold text-brand-navy leading-snug">Đã thêm vào giỏ hàng!</h4>
          <p className="text-[12px] text-neutral-700 font-semibold mt-1 truncate">{name}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Màu: {selectedColor} · Đặt may theo số đo | SL: {quantity}</p>
        </div>
        <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
          <button type="button" onClick={() => toast.dismiss(t)} className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => { setIsCartOpen(true); toast.dismiss(t); }} className="text-[12px] font-bold text-[#5D1C34] hover:underline underline-offset-2 transition-all mt-auto">Xem giỏ hàng</button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  const handleAddRelatedToCart = (relatedProduct: Product) => {
    const color = relatedProduct.colors?.[0]?.name || 'Mặc định';
    addToCart({
      productId: relatedProduct.id,
      name: relatedProduct.name,
      price: relatedProduct.numericPrice,
      quantity: 1,
      image: relatedProduct.image,
      color,
      variant: `Màu: ${color} · May đo`,
    });
    toast.success(`Đã thêm ${relatedProduct.name} vào giỏ!`);
  };

  const handleTogglePin = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm vào Giá treo đồ');
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }

    const rackItem = getItemByProductId(product.id);
    if (rackItem) {
      unpinProduct(rackItem.id, {
        onSuccess: () => toast.info(`Đã bỏ ${product.name} khỏi Giá treo đồ`),
        onError: () => toast.error('Không thể xóa khỏi Giá treo đồ'),
      });
      return;
    }

    pinProduct(product.id, {
      onSuccess: () => {
        toast.custom((t) => (
          <div className="bg-[#FDFBF7] border-l-4 border-[#5D1C34] border-y border-r border-[#E5DFD5] p-4 rounded-xl shadow-lg flex items-start gap-3.5 max-w-[380px] w-full relative">
            <div className="p-2 bg-[#5D1C34]/10 text-[#5D1C34] rounded-lg shrink-0 mt-0.5"><HangerIcon className="w-4 h-4" /></div>
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-[14px] font-bold text-brand-navy leading-snug">Đã ghim vào Giá treo đồ!</h4>
              <p className="text-[12px] text-neutral-700 font-semibold mt-1 truncate">{product.name}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Sẵn sàng để phối đồ và thử đồ ảo</p>
            </div>
            <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[56px]">
              <button type="button" onClick={() => toast.dismiss(t)} className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => { router.push('/rack'); toast.dismiss(t); }} className="text-[12px] font-bold text-[#5D1C34] hover:underline underline-offset-2 transition-all mt-auto">Xem giá treo</button>
            </div>
          </div>
        ), { duration: 4000 });
      },
      onError: () => toast.error('Không thể ghim vào Giá treo đồ'),
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ProductBreadcrumb product={product} />

      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 pb-16 grid grid-cols-1 md:grid-cols-[55%_1fr] gap-12">
        <ProductImageViewer images={thumbs} productName={product.name} brand={product.brand} activeThumb={activeThumb} onSelectThumb={handleSelectThumb} />
        <ProductPurchasePanel
          product={product}
          selectedType={selectedType}
          selectedColor={selectedColor}
          quantity={quantity}
          isComboSuit={isComboSuit}
          isMeasurementComplete={isMeasurementComplete}
          measurements={measurements}
          catCompleteness={catCompleteness}
          reviewStats={reviewStats}
          pinned={isPinned(product.id)}
          isRackMutating={isPinning || isUnpinning}
          onSelectType={handleSelectType}
          onSelectColor={setSelectedColor}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          onTogglePin={handleTogglePin}
        />
      </div>

      <ProductDetailTabs product={product} activeTab={activeTab} isComboSuit={isComboSuit} onTabChange={setActiveTab} />

      <ReviewSection productId={product.id} productName={product.name} productImage={thumbs[0]} />

      <RelatedProducts products={relatedProducts} onAddToCart={handleAddRelatedToCart} />
    </div>
  );
}
