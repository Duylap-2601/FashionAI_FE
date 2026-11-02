import type { CheckoutResponse } from '@/features/payments/types/payments';

/** Nội dung chuyển khoản khách phải ghi để SePay khớp đúng đơn. */
export function getTransferContent(result: CheckoutResponse) {
  return result.extra?.invoiceNumber || `FAI${result.orderCode ?? ''}`;
}

function postForm(action: string, fields: Iterable<[string, string]>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  for (const [key, value] of fields) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

/**
 * Chuyển sang cổng thanh toán. SePay nhận form POST đã ký; cổng khác mở thẳng link.
 * Trả về false khi BE không trả link.
 */
export function openPaymentGateway(result: CheckoutResponse) {
  if (!result.checkoutUrl) return false;

  if (result.provider === 'SEPAY' && result.extra?.formAction && result.extra?.formFields) {
    postForm(
      result.extra.formAction,
      Object.entries(result.extra.formFields).map(([key, value]): [string, string] => [key, String(value)]),
    );
    return true;
  }

  try {
    const parsedUrl = new URL(result.checkoutUrl, window.location.origin);
    if (
      result.provider === 'SEPAY' &&
      (parsedUrl.hostname.includes('sepay.vn') || parsedUrl.pathname.includes('/checkout/init')) &&
      parsedUrl.searchParams.size > 0
    ) {
      postForm(`${parsedUrl.origin}${parsedUrl.pathname}`, parsedUrl.searchParams.entries());
      return true;
    }
  } catch (urlErr) {
    console.warn('Could not parse checkoutUrl as URL object:', urlErr);
  }

  window.location.href = result.checkoutUrl;
  return true;
}
