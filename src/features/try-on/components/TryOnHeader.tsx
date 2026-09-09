import { Crown } from 'lucide-react';
import Link from 'next/link';

export function QuotaBadge({ count, limit }: { count: number; limit: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm font-semibold ${count > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
      {count > 0 ? `Còn ${count} / ${limit} lượt hôm nay` : 'Hết lượt hôm nay'}
    </span>
  );
}

export function TryOnHeader({ remainingQuota, limitQuota, isBlocked }: { remainingQuota: number; limitQuota: number; isBlocked: boolean }) {
  return (
    <div className="bg-white border-b border-neutral-200 w-full">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-heading-h1 font-bold text-brand-navy">Virtual Try-On</h1>
            <p className="text-body-sm text-neutral-500 mt-1">Thử trang phục công sở ảo bằng công nghệ AI</p>
          </div>
          <div className="flex items-center gap-3">
            <QuotaBadge count={remainingQuota} limit={limitQuota} />
            {isBlocked && <Link
              href="/subscription"
              className="px-3.5 py-1.5 bg-[#5D1C34] text-white rounded-full text-label-sm font-bold hover:bg-[#5D1C34]/90 transition-colors shadow-2xs flex items-center gap-1.5"
            ><Crown className="w-3.5 h-3.5" /> Nâng cấp</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionNotice({ isSubscriptionExpired }: { isSubscriptionExpired: boolean }) {
  return (
    <div className="p-4 md:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5"><Crown className="w-5 h-5" /></div>
        <div>
          <h3 className="text-body-md font-bold text-amber-950">{isSubscriptionExpired ? 'Gói cước của bạn đã hết hạn' : 'Tính năng Thử đồ AI yêu cầu gói trả tiền (MEMBER hoặc VIP)'}</h3>
          <p className="text-body-sm text-amber-800 mt-0.5 leading-relaxed">{isSubscriptionExpired ? 'Vui lòng gia hạn gói để tiếp tục trải nghiệm tính năng thử đồ 3D / AI cá nhân hóa.' : 'Tài khoản FREE hiện không hỗ trợ tính năng Try-On. Hãy nâng cấp ngay để nhận 5 – 10 lượt thử trang phục mỗi ngày!'}</p>
        </div>
      </div>
      <Link
        href="/subscription"
        className="px-5 py-2.5 bg-[#5D1C34] text-white rounded-xl text-body-sm font-bold shrink-0 hover:bg-[#5D1C34]/90 transition-colors shadow-sm"
      >
        {isSubscriptionExpired ? 'Gia hạn gói' : 'Xem các gói Member'} &rarr;
      </Link>
    </div>
  );
}
