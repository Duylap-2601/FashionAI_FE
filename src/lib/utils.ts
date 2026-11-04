import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

const REFUND_EVIDENCE_KEYS = ['reference', 'note', 'transactionId', 'message', 'receiptUrl', 'imageUrl'];

/**
 * `Order.refundEvidence` là JSON tự do do admin gửi lên (mã giao dịch, ghi chú,
 * URL chứng từ...). Chuẩn hoá về 1 chuỗi để render, tránh render object trực
 * tiếp vào React.
 */
export function formatRefundEvidence(evidence: unknown): string | null {
  if (evidence === null || evidence === undefined) return null;
  if (typeof evidence === 'string') return evidence.trim() || null;
  if (typeof evidence !== 'object') return String(evidence);
  if (Array.isArray(evidence)) {
    const parts = evidence.map(formatRefundEvidence).filter((part): part is string => Boolean(part));
    return parts.length > 0 ? parts.join(' · ') : null;
  }

  const record = evidence as Record<string, unknown>;
  for (const key of REFUND_EVIDENCE_KEYS) {
    const text = formatRefundEvidence(record[key]);
    if (text) return text;
  }

  // receiptImages render as thumbnails, so never print them as text.
  const rest = Object.fromEntries(Object.entries(record).filter(([key]) => key !== 'receiptImages'));
  if (Object.keys(rest).length === 0) return null;
  try {
    return JSON.stringify(rest);
  } catch {
    return null;
  }
}

/**
 * Lấy danh sách URL ảnh chứng từ chuyển khoản admin đã đính kèm khi chốt hoàn tiền.
 */
export function getRefundEvidenceImages(evidence: unknown): string[] {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) return [];
  const value = (evidence as Record<string, unknown>).receiptImages;
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

/**
 * Sửa lỗi mojibake: tên tiếng Việt bị encode sai (UTF-8 bytes đọc như Latin-1).
 * Ví dụ: "Tú Anh" → lưu thành "TÃº Anh" hoặc "Tấ° Anh" do double-encoding.
 *
 * Nguyên nhân: backend trả name đúng UTF-8, nhưng đâu đó trong pipeline
 * auth/cookie/JSON parse bị interpret như Latin-1.
 *
 * Fix đúng: decode lại bytes bằng TextDecoder thay vì regex vá thủ công.
 */
export function formatUserName(name: string): string {
  if (!name) return '';

  try {
    // Kiểm tra có phải mojibake không:
    // Các ký tự Ã (C3), Â (C2) thường xuất hiện khi UTF-8 bị đọc như Latin-1
    const hasMojibake = /[\u00C0-\u00C3\u00C5-\u00CB\u00D0-\u00D3\u00DA-\u00DB\u00E0-\u00EB\u00ED-\u00EF\u00F0-\u00F3\u00F5-\u00FB]/.test(name);

    if (!hasMojibake) {
      return name; // Chuỗi sạch, không cần xử lý
    }

    // Re-encode sang bytes Latin-1 rồi decode lại như UTF-8
    const bytes = new Uint8Array(name.length);
    for (let i = 0; i < name.length; i++) {
      bytes[i] = name.charCodeAt(i) & 0xFF;
    }

    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    // Chỉ dùng kết quả nếu decode thành công (không có replacement char U+FFFD)
    if (decoded && !decoded.includes('\uFFFD')) {
      return decoded;
    }

    return name;
  } catch {
    return name;
  }
}
