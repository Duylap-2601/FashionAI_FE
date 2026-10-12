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
import { useProduct, useProductCatalog } from '@/features/products/hooks/useProducts';
import type { ComboType } from '@/features/products/types/product-detail-config';
import type { Product } from '@/features/products/types/products';
import { usePinToRack, useRackItems, useUnpinFromRack } from '@/features/rack/hooks/useRack';
import { ReviewSection } from '@/features/reviews/components/ReviewSection';
import { useReviewStats } from '@/features/reviews/hooks/useReviews';
import { X } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ProductImageItem = { url: string; colorName?: string | null; isMain?: boolean };

type ProductSelection = {
  productId: string;
  selectedColor: string;
  activeThumb: number;
};

function isComboProduct(product?: Product) {
  return Boolean(
    product?.id === 'p2' ||
    product?.id === 'p4' ||
    product?.name?.toLowerCase().includes('combo suit') ||
    product?.name?.toLowerCase().includes('suit')
  );
}

function normalizeColorName(color?: string | null) {
  return color?.trim().toLowerCase() || '';
}

function getProductImageItems(product: Product): ProductImageItem[] {
  if (product.imageItems && product.imageItems.length > 0) return product.imageItems;
  if (product.gallery && product.gallery.length > 0) {
    return product.gallery.map((url, index) => ({ url, colorName: null, isMain: index === 0 }));
  }
  return [{ url: product.image, colorName: null, isMain: true }];
}

function findValidProductColor(product: Product, color?: string | null) {
  const normalized = normalizeColorName(color);
  if (!normalized) return undefined;
  return product.colors?.find(item => normalizeColorName(item.name) === normalized)?.name;
}

function resolveDefaultColor(product: Product, requestedColor?: string | null) {
  return findValidProductColor(product, requestedColor) || product.colors?.[0]?.name || 'Trắng';
}

function resolveDefaultImageIndex(product: Product, selectedColor: string) {
  const imageItems = getProductImageItems(product);
  const selectedColorName = normalizeColorName(selectedColor);
  const matchingColorIndex = imageItems.findIndex(
    item => normalizeColorName(item.colorName) === selectedColorName
  );
  if (matchingColorIndex !== -1) return matchingColorIndex;

  const genericIndex = imageItems.findIndex(item => item.colorName == null);
  if (genericIndex !== -1) return genericIndex;

  const mainIndex = imageItems.findIndex(item => item.isMain);
  if (mainIndex !== -1) return mainIndex;

  return 0;
}

function resolveInitialProductSelection(product: Product, requestedColor?: string | null): ProductSelection {
  const selectedColor = resolveDefaultColor(product, requestedColor);
  return {
    productId: product.id,
    selectedColor,
    activeThumb: resolveDefaultImageIndex(product, selectedColor),
  };
}

export default function ProductDetail() {
  const { setIsCartOpen } = useCartPanel();
  const { addToCart } = useCart();
  const user = useAuthStore((state) => state.user);
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedColor = searchParams.get('color');
  const { product: apiProduct, isLoading: isProductLoading } = useProduct(id);
  const { products: allApiProducts } = useProductCatalog();
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
  const [selection, setSelection] = useState<ProductSelection | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Mô tả sản phẩm');

  const catCompleteness = product ? getCategoryCompleteness(product.category) : null;
  const isMeasurementComplete = catCompleteness ? catCompleteness.complete : true;

  useEffect(() => {
    if (product) {
      setSelection(resolveInitialProductSelection(product, requestedColor));
      setSelectedType('combo');
      setQuantity(1);
    }
  }, [product, requestedColor]);

  if (isProductLoading && !product) return <ProductDetailSkeleton />;
  if (!product) return <ProductNotFound />;

  const imageItems = getProductImageItems(product);
  const thumbs = imageItems.map(item => item.url);
  const initialSelection = resolveInitialProductSelection(product, requestedColor);
  const currentSelection = selection?.productId === product.id ? selection : initialSelection;
  const selectedColor = currentSelection.selectedColor;
  const activeThumb = currentSelection.activeThumb < thumbs.length ? currentSelection.activeThumb : initialSelection.activeThumb;

  const handleSelectThumb = (idx: number) => {
    const normalizedIdx = idx % thumbs.length;
    const imageColor = imageItems[normalizedIdx]?.colorName;
    const matchedColor = findValidProductColor(product, imageColor);
    setSelection(prev => ({
      productId: product.id,
      selectedColor: matchedColor || (prev?.productId === product.id ? prev.selectedColor : selectedColor),
      activeThumb: idx,
    }));
    if (!isComboSuit) return;

    if (normalizedIdx === 0) setSelectedType('combo');
    else if (normalizedIdx === 1) setSelectedType('blazer');
    else if (normalizedIdx === 2) setSelectedType('retail');
  };

  const handleSelectType = (type: ComboType) => {
    setSelectedType(type);
    const preferredThumb = type === 'combo' ? 0 : type === 'blazer' ? 1 : 2;
    const nextThumb = Math.min(preferredThumb, thumbs.length - 1);
    setSelection(prev => ({
      productId: product.id,
      selectedColor: prev?.productId === product.id ? prev.selectedColor : selectedColor,
      activeThumb: nextThumb,
    }));
  };

  const handleSelectColor = (colorName: string) => {
    setSelection({
      productId: product.id,
      selectedColor: colorName,
      activeThumb: resolveDefaultImageIndex(product, colorName),
    });
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
      <div className="flex w-[min(360px,calc(100vw-56px))] items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[13px] font-semibold text-brand-navy">Đã thêm {name} vào giỏ</p>
        <button type="button" onClick={() => { setIsCartOpen(true); toast.dismiss(t); }} className="shrink-0 text-[12px] font-bold text-[#5D1C34] hover:underline">Xem giỏ</button>
      </div>
    ), { duration: 2500 });
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
    toast.success(`Đã thêm ${relatedProduct.name} vào giỏ`, { duration: 2500 });
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
          onSelectColor={handleSelectColor}
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
