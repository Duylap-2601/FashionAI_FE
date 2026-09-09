import type { ProductDetailTabsProps } from '@/features/products/types/product-detail-tabs';
import { AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function ProductDetailTabs({ product, activeTab, isComboSuit, onTabChange }: ProductDetailTabsProps) {
  const catUpper = (product.category || '').toUpperCase();
  const isLower = catUpper.includes('LOWER') || catUpper.includes('QUAN') || catUpper.includes('VAY') || product.category === 'Quần & Váy';
  const isFull = isComboSuit || catUpper.includes('FULL') || catUpper.includes('SUIT') || product.category === 'Suit đầy đủ';
  const colorList = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors.map(c => c.name).filter(Boolean).join(', ')
    : 'Đa dạng màu sắc';

  return (
    <div className="border-t border-neutral-200">
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8">
        <div className="flex items-center gap-8 border-b border-neutral-200 overflow-x-auto no-scrollbar">
          {['Mô tả sản phẩm', 'Quy trình may đo'].map(tab => (
            <button key={tab} onClick={() => onTabChange(tab)} className={`py-4 text-label-sm font-semibold whitespace-nowrap transition-colors border-b-2 relative cursor-pointer ${activeTab === tab ? 'text-brand-navy border-brand-navy' : 'text-neutral-500 border-transparent hover:text-neutral-800'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="py-12 min-h-[300px]">
          {activeTab === 'Mô tả sản phẩm' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-300">
              <div>
                <h3 className="text-[20px] font-bold text-brand-navy mb-4">Chi tiết sản phẩm</h3>
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
                  <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span><span><strong className="text-neutral-800 font-semibold">Chất liệu:</strong> {product.material || (isFull ? 'Premium Wool pha cao cấp, đứng form, chống nhăn tự nhiên' : isLower ? 'Kaki / Tuyết mưa cao cấp co giãn nhẹ, giữ phom dáng chuẩn' : '100% Cotton Oxford / Poplin cao cấp, thoáng khí và êm ái')}</span></li>
                  <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span><span><strong className="text-neutral-800 font-semibold">Quy cách may:</strong> May đo theo số đo cá nhân (Made-to-Measure)</span></li>
                  <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span><span><strong className="text-neutral-800 font-semibold">Màu sắc:</strong> {colorList}</span></li>
                  <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span><span><strong className="text-neutral-800 font-semibold">Xuất xứ:</strong> Thiết kế và may đo tại Việt Nam</span></li>
                  <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-navy shrink-0 mt-2"></span><span><strong className="text-neutral-800 font-semibold">Bảo quản:</strong> Giặt máy chế độ nhẹ hoặc giặt khô, không dùng chất tẩy mạnh</span></li>
                </ul>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-[20px] font-bold text-brand-navy mb-4">Gợi ý phối đồ (Styling Tips)</h3>
                  <p className="text-body-md text-neutral-600 mb-5 leading-relaxed">
                    {isFull ? <>Set trang phục <strong className="text-brand-navy">{product.name}</strong> mang phong cách sang trọng, lịch lãm, dễ dàng điều chỉnh theo nhiều mức độ trang trọng:</> : isLower ? <>Thiết kế <strong className="text-brand-navy">{product.name}</strong> tôn dáng, linh hoạt và là điểm nhấn quan trọng cho tổng thể trang phục:</> : <>Mẫu <strong className="text-brand-navy">{product.name}</strong> là item cốt lõi trong tủ đồ, cho phép bạn biến hóa đa dạng nhiều phong cách:</>}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                      <h4 className="font-semibold text-brand-navy mb-1.5 text-label-sm">{isFull ? 'Sự kiện / Hội nghị' : isLower ? 'Phong cách Công sở' : 'Professional (Công sở)'}</h4>
                      <p className="text-[13px] text-neutral-600 leading-relaxed">{isFull ? 'Kết hợp cùng áo sơ mi trắng tinh tế, cà vạt lụa và giày Oxford/Derby.' : isLower ? 'Phối cùng áo sơ mi trắng, sơ vin gọn gàng và khoác thêm Blazer.' : 'Kết hợp cùng quần tây Navy hoặc Xám đậm, khoác thêm Blazer nếu cần.'}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                      <h4 className="font-semibold text-brand-navy mb-1.5 text-label-sm">{isFull ? 'Doanh nhân hiện đại' : isLower ? 'Năng động dạo phố' : 'Smart Casual (Hàng ngày)'}</h4>
                      <p className="text-[13px] text-neutral-600 leading-relaxed">{isFull ? 'Mặc bên trong áo thun/áo len mỏng cao cấp kèm giày Loafer thanh lịch.' : isLower ? 'Mặc cùng áo thun Polo basic, áo dệt kim và giày Loafer hoặc Sneaker.' : 'Mặc cùng quần Chino Khaki hoặc Jeans tối màu, xắn tay áo nhẹ nhàng.'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-brand-navy/5 to-brand-gold/10 border border-brand-gold/20 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-navy text-brand-gold flex items-center justify-center shrink-0 shadow-xs"><Sparkles className="w-4 h-4" /></div>
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
          )}

          {activeTab === 'Quy trình may đo' && (
            <div className="max-w-[800px] animate-in fade-in duration-300">
              <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 mb-6 space-y-4">
                <h4 className="text-[16px] font-bold text-brand-navy">Quy trình đặt may đo theo số đo riêng (Made-to-Measure)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-body-sm text-neutral-600">
                  {[
                    ['01', 'Cung cấp số đo', 'Nhập số đo cơ thể trong trang Profile hoặc khi thực hiện đặt hàng.'],
                    ['02', 'Thợ may cắt rập', 'Đội ngũ nghệ nhân may đo sẽ tinh chỉnh rập cá nhân hóa cho từng khách hàng.'],
                    ['03', 'Giao hàng hoàn hảo', 'Trang phục vừa vặn chuẩn chỉnh được hoàn thiện và giao trong 3-5 ngày.'],
                  ].map(([step, title, desc]) => (
                    <div key={step} className="p-4 bg-white rounded-xl border border-neutral-100 shadow-2xs">
                      <div className="text-brand-gold font-bold text-[18px] mb-1">{step}</div>
                      <div className="font-semibold text-brand-navy mb-1">{title}</div>
                      <p className="text-[12px] text-neutral-500">{desc}</p>
                    </div>
                  ))}
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
  );
}
