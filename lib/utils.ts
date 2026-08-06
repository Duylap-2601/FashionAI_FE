import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export function formatUserName(name: string): string {
  if (!name) return '';
  return name
    .replace(/Lâºp/gi, 'Lập')
    .replace(/âº/g, 'ậ')
    .replace(/áº­/g, 'ậ')
    .replace(/áº¡/g, 'ạ')
    .replace(/áº£/g, 'ả')
    .replace(/áº¥/g, 'ấ')
    .replace(/áº§/g, 'ầ')
    .replace(/áº©/g, 'ẩ')
    .replace(/áº«/g, 'ẫ')
    .replace(/áº¯/g, 'ắ')
    .replace(/áº±/g, 'ằ')
    .replace(/áº³/g, 'ẳ')
    .replace(/áºµ/g, 'ẵ')
    .replace(/áº·/g, 'ặ')
    .replace(/áº¹/g, 'ẹ')
    .replace(/áº»/g, 'ẻ')
    .replace(/áº½/g, 'ẽ')
    .replace(/áº¿/g, 'ế')
    .replace(/á» /g, 'ề')
    .replace(/á»ƒ/g, 'ể')
    .replace(/á»…/g, 'ễ')
    .replace(/á»‡/g, 'ệ')
    .replace(/á»‰/g, 'ỉ')
    .replace(/á»‹/g, 'ị')
    .replace(/á» /g, 'ọ')
    .replace(/á» /g, 'ỏ')
    .replace(/á»‘/g, 'ố')
    .replace(/á»“/g, 'ồ')
    .replace(/á»•/g, 'ổ')
    .replace(/á»—/g, 'ỗ')
    .replace(/á»™/g, 'ộ')
    .replace(/á»›/g, 'ớ')
    .replace(/á» /g, 'ờ')
    .replace(/á»Ÿ/g, 'ở')
    .replace(/á»¡/g, 'ỡ')
    .replace(/á»£/g, 'ợ')
    .replace(/á»¥/g, 'ụ')
    .replace(/á»§/g, 'ủ')
    .replace(/á»©/g, 'ứ')
    .replace(/á»«/g, 'ừ')
    .replace(/á»/g, 'ử')
    .replace(/á»¯/g, 'ữ')
    .replace(/á»±/g, 'ự')
    .replace(/á»³/g, 'ỳ')
    .replace(/á»µ/g, 'ỵ')
    .replace(/á»·/g, 'ỷ')
    .replace(/á»¹/g, 'ỹ');
}
