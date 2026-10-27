import type { ProductDetailTabsProps } from '@/features/products/types/product-detail-tabs';
import { cn } from '@/lib/utils';
import { AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const labelText = 'text-[11px] font-semibold uppercase tracking-[0.14em]';
const TABS = ['Mô tả sản phẩm', 'Quy trình may đo'] as const;

function tabPanelId(label: string) {
  return label === 'Mô tả sản phẩm' ? 'product-detail-description' : 'product-detail-process';
}

function tabButtonId(label: string) {
  return `${tabPanelId(label)}-tab`;
}

export function ProductDetailTabs({ product, activeTab, isComboSuit, onTabChange }: ProductDetailTabsProps) {
  const category = (product.category || '').toUpperCase();
  const isLower = category.includes('LOWER') || category.includes('QUAN') || category.includes('VAY') || product.category === 'Quần & Váy';
  const isFull = isComboSuit || category.includes('FULL') || category.includes('SUIT') || product.category === 'Suit đầy đủ';
  const colorList = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors.map((color) => color.name).filter(Boolean).join(', ') || 'Đang cập nhật'
    : 'Đang cập nhật';
  const material = product.material || 'Đang cập nhật';
  const description = product.description
    || `Sản phẩm ${product.name} được may đo theo số đo cá nhân đã lưu trong hồ sơ, hoàn thiện bởi StAie. và giao đến bạn sau khi kiểm tra form dáng.`;

  return (
    <div className="border-t border-landing-line">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="flex items-center gap-8 overflow-x-auto border-b border-landing-line no-scrollbar" role="tablist" aria-label="Thông tin sản phẩm">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                id={tabButtonId(tab)}
                aria-selected={active}
                aria-controls={tabPanelId(tab)}
                onClick={() => onTabChange(tab)}
                className={cn(
                  'relative cursor-pointer whitespace-nowrap border-b py-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors',
                  active
                    ? 'border-landing-oxblood text-landing-oxblood'
                    : 'border-transparent text-landing-muted hover:text-landing-obsidian',
                  focusRing,
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="min-h-[300px] py-12 md:py-16">
          {activeTab === 'Mô tả sản phẩm' && (
            <div
              role="tabpanel"
              id={tabPanelId('Mô tả sản phẩm')}
              aria-labelledby={tabButtonId('Mô tả sản phẩm')}
              className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16"
            >
              <div>
                <h3 className="mb-4 font-display text-landing-h3 text-landing-obsidian">Chi tiết sản phẩm</h3>
                <p className="border border-landing-line bg-landing-ivory p-4 text-landing-body text-landing-muted whitespace-pre-line">
                  {description}
                </p>

                <dl className="mt-6 border-y border-landing-line">
                  {[
                    ['Chất liệu', material],
                    ['Quy cách may', 'May đo theo số đo cá nhân'],
                    ['Màu sắc', colorList],
                    ['Xuất xứ', 'Thiết kế và may đo tại Việt Nam'],
                    ['Bảo quản', 'Giặt nhẹ hoặc giặt khô, không dùng chất tẩy mạnh'],
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[110px_1fr] gap-3 border-b border-landing-line/70 py-3 last:border-b-0 sm:grid-cols-[130px_1fr]">
                      <dt className={cn('text-landing-brass-ink', labelText)}>{label}</dt>
                      <dd className="text-sm leading-relaxed text-landing-muted">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="flex flex-col">
                <h3 className="mb-4 font-display text-landing-h3 text-landing-obsidian">Gợi ý phối đồ</h3>
                <p className="mb-5 text-landing-body text-landing-muted">
                  {isFull ? (
                    <>Set trang phục <strong className="font-semibold text-landing-obsidian">{product.name}</strong> đủ lịch lãm cho ngày làm việc và linh hoạt khi cần dự sự kiện.</>
                  ) : isLower ? (
                    <>Thiết kế <strong className="font-semibold text-landing-obsidian">{product.name}</strong> tôn dáng và là điểm nhấn cho tổng thể trang phục công sở.</>
                  ) : (
                    <>Mẫu <strong className="font-semibold text-landing-obsidian">{product.name}</strong> là món cốt lõi trong tủ đồ, dễ biến hóa nhiều phong cách.</>
                  )}
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="border border-landing-line bg-landing-ivory p-4">
                    <h4 className={cn('text-landing-brass-ink', labelText)}>
                      {isFull ? 'Sự kiện và hội nghị' : isLower ? 'Phong cách công sở' : 'Công sở'}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-landing-muted">
                      {isFull ? 'Kết hợp sơ mi trắng, cà vạt lụa và giày Oxford hoặc Derby.' : isLower ? 'Phối cùng sơ mi trắng, sơ vin gọn gàng và khoác thêm blazer.' : 'Kết hợp quần tây navy hoặc xám đậm, khoác thêm blazer khi cần.'}
                    </p>
                  </div>
                  <div className="border border-landing-line bg-landing-ivory p-4">
                    <h4 className={cn('text-landing-brass-ink', labelText)}>
                      {isFull ? 'Doanh nhân hiện đại' : isLower ? 'Năng động dạo phố' : 'Smart casual'}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-landing-muted">
                      {isFull ? 'Mặc cùng áo thun hoặc áo len mỏng và giày loafer thanh lịch.' : isLower ? 'Mặc cùng áo polo basic, áo dệt kim và giày loafer hoặc sneaker.' : 'Mặc cùng quần chino kaki hoặc jeans tối màu, xắn tay áo nhẹ nhàng.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 border border-landing-line bg-landing-ivory p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-landing-obsidian">Tư vấn phối đồ theo dáng người</p>
                    <p className="mt-1 text-xs leading-relaxed text-landing-muted">Hỏi AI Stylist cách mix và match sản phẩm này.</p>
                  </div>
                  <Link
                    href={`/chat?productId=${product.id}&message=${encodeURIComponent(`Gợi ý cho tôi cách phối đồ đẹp và chuẩn dáng nhất với ${product.name}`)}`}
                    className={cn(
                      'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[2px] border border-landing-line px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-obsidian',
                      'transition-colors hover:border-landing-oxblood hover:text-landing-oxblood',
                      focusRing,
                    )}
                  >
                    <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    Hỏi AI Stylist
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Quy trình may đo' && (
            <div
              role="tabpanel"
              id={tabPanelId('Quy trình may đo')}
              aria-labelledby={tabButtonId('Quy trình may đo')}
              className="max-w-[800px]"
            >
              <div className="border border-landing-line bg-landing-ivory p-5 md:p-6">
                <h4 className="font-display text-lg text-landing-obsidian">Quy trình may đo theo số đo riêng</h4>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    ['01', 'Cung cấp số đo', 'Nhập số đo cơ thể trong trang hồ sơ hoặc khi đặt hàng.'],
                    ['02', 'Thợ may cắt rập', 'Đội ngũ may đo tinh chỉnh rập cá nhân hóa cho từng khách hàng.'],
                    ['03', 'Hoàn thiện và giao', 'Sản phẩm được kiểm tra form dáng trước khi giao đến bạn.'],
                  ].map(([step, title, desc]) => (
                    <div key={step} className="border-t border-landing-line pt-4">
                      <p className="font-mono text-lg text-landing-oxblood">{step}</p>
                      <p className="mt-1 text-sm font-semibold text-landing-obsidian">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-landing-muted">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-start gap-2 text-sm text-landing-muted">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-landing-brass-ink" strokeWidth={1.75} aria-hidden="true" />
                <p className="leading-relaxed">
                  Sản phẩm được may theo số đo đã lưu. Nếu sản phẩm có lỗi may hoặc sai lệch từ phía StAie., bạn có 7 ngày kể từ khi đơn hoàn tất để gửi yêu cầu đổi trả.{' '}
                  <Link href="/return-policy" className={cn('font-semibold text-landing-oxblood underline underline-offset-4', focusRing)}>
                    Xem chính sách đổi trả
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
