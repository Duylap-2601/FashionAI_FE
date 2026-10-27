'use client';

import { productToGaItem } from '@/features/analytics/services/ga-items';
import { useCartPanel } from '@/features/cart/hooks/use-cart-panel';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCart } from '@/features/cart/hooks/use-cart';
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
import { getProductImageItems, normalizeColorName, resolveDefaultImageIndex } from '@/features/products/services/products-utils';
import type { ComboType } from '@/features/products/types/product-detail-config';
import type { Product } from '@/features/products/types/products';
import { usePinToRack, useRackItems, useUnpinFromRack } from '@/features/rack/hooks/useRack';
import { ReviewSection } from '@/features/reviews/components/ReviewSection';
import { useReviewStats } from '@/features/reviews/hooks/useReviews';
import { toCommerceParams, trackEvent } from '@/lib/analytics';
import { Shirt, X } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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

function findValidProductColor(product: Product, color?: string | null) {
  const normalized = normalizeColorName(color);
  if (!normalized) return undefined;
  return product.colors?.find(item => normalizeColorName(item.name) === normalized)?.name;
}

function resolveDefaultColor(product: Product, requestedColor?: string | null) {
  return findValidProductColor(product, requestedColor) || product.colors?.[0]?.name || 'Trắng';
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

  // Chỉ tính lượt xem sản phẩm thật từ API, không tính dữ liệu mock khi API lỗi.
  const trackedViewIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!apiProduct || trackedViewIdRef.current === apiProduct.id) return;
    trackedViewIdRef.current = apiProduct.id;
    trackEvent('view_item', toCommerceParams([productToGaItem(apiProduct)]));
  }, [apiProduct]);

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
      // Sản phẩm không khai báo màu: selectedColor chỉ là nhãn hiển thị ("Trắng"), không gửi lên giỏ.
      color: product.colors?.length ? selectedColor : undefined,
      variant: `Màu: ${selectedColor} · Đặt may theo số đo`,
      type: isComboSuit ? selectedType : undefined,
    });

    toast.custom((t) => (
      <div className="flex w-[min(360px,calc(100vw-56px))] items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[13px] font-semibold text-landing-obsidian">Đã thêm {name} vào giỏ</p>
        <button
          type="button"
          onClick={() => { setIsCartOpen(true); toast.dismiss(t); }}
          className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-landing-oxblood underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
        >
          Xem giỏ
        </button>
      </div>
    ), { duration: 2500 });
  };

  const handleAddRelatedToCart = (relatedProduct: Product) => {
    const color = relatedProduct.colors?.[0]?.name;
    addToCart({
      productId: relatedProduct.id,
      name: relatedProduct.name,
      price: relatedProduct.numericPrice,
      quantity: 1,
      image: relatedProduct.image,
      color,
      variant: `Màu: ${color || 'Mặc định'} · May đo`,
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
          <div className="flex w-full max-w-[380px] items-start gap-3 border border-landing-line border-l-2 border-l-landing-oxblood bg-landing-ivory p-4">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-landing-line text-landing-oxblood">
              <Shirt className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-landing-obsidian">Đã ghim vào Giá treo đồ</p>
              <p className="mt-1 truncate text-xs font-medium text-landing-muted">{product.name}</p>
              <p className="mt-0.5 text-[11px] text-landing-muted">Sẵn sàng để phối đồ và thử đồ AI</p>
            </div>
            <div className="flex min-h-[56px] shrink-0 flex-col items-end justify-between gap-3 self-stretch">
              <button
                type="button"
                onClick={() => toast.dismiss(t)}
                aria-label="Đóng thông báo"
                className="flex h-8 w-8 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => { router.push('/rack'); toast.dismiss(t); }}
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-oxblood underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
              >
                Xem giá treo
              </button>
            </div>
          </div>
        ), { duration: 4000 });
      },
      onError: () => toast.error('Không thể ghim vào Giá treo đồ'),
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-landing-paper landing-paper-texture">
      <ProductBreadcrumb product={product} />

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 pb-16 md:grid-cols-[55%_1fr] md:px-8 lg:gap-16 lg:pb-20">
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
