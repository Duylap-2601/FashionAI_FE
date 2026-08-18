import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

/**
 * Sửa lỗi mojibake: tên tiếng Việt bị encode sai (UTF-8 bytes đọc như Latin-1).
 * Ví dụ: "Tú Anh" → lưu thành "TÃº Anh" hoặc "Tấ° Anh" do double-encoding.
 *
 * Nguyên nhân: backend trả name đúng UTF-8, nhưng đâu đó trong pipeline
 * (NextAuth JWT serialize / cookie / JSON parse) bị interpret như Latin-1.
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
