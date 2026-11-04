'use client';

import { usePaymentStatus } from '@/features/payments/hooks/usePayments';
import { getTransferContent, openPaymentGateway } from '@/features/payments/services/payment-gateway';
import { isPaymentSettled } from '@/features/payments/services/payments-utils';
import type { PaymentDialogProps } from '@/features/payments/types/payment-dialog';
import { AccountDialog, accountButtonClassName, accountFocusRing, accountLabelClassName } from '@/features/profile/components/account-ui';
import { cn, formatPrice } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Copy, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import type React from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';

function OrderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn('text-center text-sm text-landing-muted underline-offset-4 hover:text-landing-oxblood hover:underline', accountFocusRing)}
    >
      {children}
    </Link>
  );
}

function ZaloPayPaymentDialog({ checkoutResult, total, orderHref, onClose, onPaid }: PaymentDialogProps) {
  const router = useRouter();
  const paymentId = checkoutResult.paymentId ?? null;
  const { data: payment, isLoading } = usePaymentStatus(paymentId);
  const qrValue = checkoutResult.qrCode || checkoutResult.checkoutUrl || checkoutResult.payUrl || '';
  const isPaid = isPaymentSettled(payment);
  const isFailed = payment?.status === 'FAILED';
  const isRefundRequired = payment?.status === 'REFUND_REQUIRED';

  useEffect(() => {
    if (!isPaid || !paymentId) return;
    onPaid?.();
    toast.success('Thanh toán ZaloPay thành công');
    router.push(`/payment/result?paymentId=${encodeURIComponent(paymentId)}`);
  }, [isPaid, onPaid, paymentId, router]);

  const openGateway = () => {
    if (!checkoutResult.checkoutUrl) return;
    window.open(checkoutResult.checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AccountDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      eyebrow="Thanh toán"
      title="ZaloPay"
      description="Quét QR hoặc mở ZaloPay. Giữ trang này, đơn tự cập nhật khi thanh toán xong."
      className="sm:max-w-[520px]"
    >
      <div className="flex flex-col gap-5">
        <div className="grid items-center gap-5 sm:grid-cols-[172px_minmax(0,1fr)]">
          <div className="flex items-center justify-center border border-landing-line bg-white p-3">
            {qrValue ? (
              <QRCodeSVG value={qrValue} size={148} level="M" includeMargin />
            ) : (
              <div className="flex h-[148px] w-[148px] items-center justify-center bg-landing-paper text-center text-xs text-landing-muted">
                Không có dữ liệu QR
              </div>
            )}
          </div>
          <dl className="space-y-3">
            <div>
              <dt className={accountLabelClassName}>Mã đơn</dt>
              <dd className="mt-1 font-mono text-lg text-landing-obsidian">ORD-{checkoutResult.orderCode}</dd>
            </div>
            <div>
              <dt className={accountLabelClassName}>Số tiền</dt>
              <dd className="mt-1 font-mono text-xl text-landing-oxblood">{formatPrice(total)}</dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={openGateway}
          disabled={!checkoutResult.checkoutUrl}
          className={cn(accountButtonClassName('primary'), 'w-full')}
        >
          Mở ZaloPay <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </button>

        <div role="status" className="border-t border-landing-line/70 pt-4 text-sm">
          {isPaid ? (
            <p className="flex items-center gap-2 text-landing-sage-ink">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} /> Thanh toán thành công, đang chuyển trang...
            </p>
          ) : isFailed ? (
            <p className="flex items-start gap-2 text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              {payment?.failureReason || 'Thanh toán thất bại hoặc link đã hết hạn. Vui lòng tạo lại thanh toán.'}
            </p>
          ) : isRefundRequired ? (
            <p className="flex items-start gap-2 text-landing-brass-ink">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              Đã nhận tiền nhưng đơn chưa ghi nhận được thanh toán. Khoản tiền sẽ được hoàn lại.
            </p>
          ) : (
            <p className="flex items-center gap-2 text-landing-muted">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              {isLoading ? 'Đang kiểm tra trạng thái thanh toán...' : 'Đang chờ ZaloPay xác nhận thanh toán...'}
            </p>
          )}
        </div>

        {orderHref ? <OrderLink href={orderHref}>Xem chi tiết đơn hàng</OrderLink> : null}
      </div>
    </AccountDialog>
  );
}

function BankTransferPaymentDialog({ checkoutResult, total, orderHref, onClose }: PaymentDialogProps) {
  const transferContent = getTransferContent(checkoutResult);

  const copyTransferContent = async () => {
    try {
      await navigator.clipboard.writeText(transferContent);
      toast.success('Đã sao chép nội dung chuyển khoản');
    } catch {
      toast.error('Không thể sao chép tự động');
    }
  };

  return (
    <AccountDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      eyebrow="Thanh toán"
      title="Chuyển khoản ngân hàng"
      description="Ghi đúng nội dung dưới đây để hệ thống tự xác nhận thanh toán."
    >
      <div className="flex flex-col gap-5">
        <dl className="border border-landing-line bg-landing-ivory/60">
          <div className="border-b border-landing-line/70 px-4 py-3">
            <dt className={accountLabelClassName}>Nội dung chuyển khoản</dt>
            <dd className="mt-2 flex items-center justify-between gap-3">
              <span className="break-all font-mono text-xl text-landing-oxblood">{transferContent}</span>
              <button type="button" onClick={copyTransferContent} className={accountButtonClassName('outline', 'sm')}>
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> Sao chép
              </button>
            </dd>
          </div>
          <div className="px-4 py-3">
            <dt className={accountLabelClassName}>Số tiền</dt>
            <dd className="mt-2 font-mono text-xl text-landing-obsidian">{formatPrice(total)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => {
            if (!openPaymentGateway(checkoutResult)) toast.error('Không nhận được link thanh toán');
          }}
          className={cn(accountButtonClassName('primary'), 'w-full')}
        >
          Mở cổng chuyển khoản <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
        {orderHref ? <OrderLink href={orderHref}>Để thanh toán sau, xem đơn hàng</OrderLink> : null}
      </div>
    </AccountDialog>
  );
}

/** Hộp thoại thanh toán sau khi BE trả link: QR ZaloPay, hoặc nội dung chuyển khoản SePay. */
export function PaymentDialog(props: PaymentDialogProps) {
  return props.checkoutResult.provider === 'ZALOPAY' ? <ZaloPayPaymentDialog {...props} /> : <BankTransferPaymentDialog {...props} />;
}
