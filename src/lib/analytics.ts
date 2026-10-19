import { sendGAEvent } from '@next/third-parties/google';

// Next chỉ inline biến NEXT_PUBLIC_* khi viết nguyên văn process.env.<TÊN>.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
// Bật để in mọi lệnh gửi GA4 ra console và đẩy hit vào DebugView của GA4.
export const GA_DEBUG = process.env.NEXT_PUBLIC_GA_DEBUG === 'true';

export const ANALYTICS_CONSENT_STORAGE_KEY = 'fashionai_analytics_consent';
export const OPEN_COOKIE_SETTINGS_EVENT = 'fashionai:open-cookie-settings';

// Khớp validate của BE (CheckoutDto): gửi sai định dạng sẽ làm checkout lỗi 400.
const GA_CLIENT_ID_PATTERN = /^\d{1,20}\.\d{1,20}$/;
const GA_SESSION_ID_PATTERN = /^\d{1,20}$/;
// gtag.js bị chặn (adblock) thì callback của `get` không bao giờ chạy.
const GTAG_GET_TIMEOUT_MS = 1000;

export type AnalyticsConsent = 'granted' | 'denied';
export type AnalyticsAuthMethod = 'email' | 'google';

/** Danh sách sản phẩm (GA4 item list) nơi người dùng thấy sản phẩm, vd. gợi ý của AI. */
export interface GaItemList {
  item_list_id: string;
  item_list_name: string;
}

/** List + vị trí của sản phẩm trong list, gắn vào item để GA4 quy đơn hàng về list đó. */
export type GaItemListContext = GaItemList & { index?: number };

export interface GaItem extends Partial<GaItemListContext> {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
}

export interface CommerceParams {
  currency: 'VND';
  value: number;
  items: GaItem[];
}

export interface ItemListParams extends GaItemList {
  items: GaItem[];
}

/**
 * Tên event và tham số gửi lên GA4. Tên event là hợp đồng với tab Phân tích của BE
 * (modules/analytics/constants), đổi tên phải đổi cả hai bên.
 */
export interface AnalyticsEvents {
  view_item: CommerceParams;
  view_item_list: ItemListParams;
  select_item: ItemListParams;
  add_to_cart: CommerceParams;
  remove_from_cart: CommerceParams;
  view_cart: CommerceParams;
  begin_checkout: CommerceParams & { coupon?: string };
  add_shipping_info: CommerceParams & { coupon?: string; shipping_tier: string };
  add_payment_info: CommerceParams & { coupon?: string; payment_type: string };
  add_to_wishlist: { items: Pick<GaItem, 'item_id'>[] };
  search: { search_term: string };
  login: { method: AnalyticsAuthMethod };
  sign_up: { method: AnalyticsAuthMethod };
  try_on_generate: { garment_count: number };
  live_try_on_start: Record<string, never>;
  stylist_analyze: Record<string, never>;
  chat_message_send: { has_product: boolean };
}

function isAnalyticsActive() {
  return Boolean(GA_MEASUREMENT_ID) && typeof window !== 'undefined';
}

export function logAnalyticsDebug(...args: unknown[]) {
  if (GA_DEBUG) console.info('[GA4]', ...args);
}

function gtag(...args: unknown[]) {
  if (!isAnalyticsActive()) return;
  logAnalyticsDebug(...args);
  sendGAEvent(...(args as object[]));
}

export function trackEvent<K extends keyof AnalyticsEvents>(name: K, params: AnalyticsEvents[K]) {
  gtag('event', name, params);
}

export function toCommerceParams(items: GaItem[]): CommerceParams {
  return {
    currency: 'VND',
    value: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    items,
  };
}

/** Gắn hoặc gỡ user_id cho các hit tiếp theo; null khi đăng xuất. */
export function identifyAnalyticsUser(user: { id: string; tier: string } | null) {
  gtag('set', { user_id: user?.id ?? null });
  gtag('set', 'user_properties', { user_tier: user?.tier ?? 'GUEST' });
}

/** Tắt hẳn mọi hit GA4 (dùng cho tài khoản admin để không lẫn vào số liệu khách). */
export function setAnalyticsDisabled(disabled: boolean) {
  if (!isAnalyticsActive()) return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = disabled;
  logAnalyticsDebug(disabled ? 'ĐANG TẮT gửi dữ liệu (tài khoản ADMIN hoặc trang /admin)' : 'Đang gửi dữ liệu');
}

export function readAnalyticsConsent(): AnalyticsConsent | null {
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function saveAnalyticsConsent(consent: AnalyticsConsent) {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    // Trình duyệt chặn storage: vẫn cập nhật consent cho phiên hiện tại.
  }
  gtag('consent', 'update', { analytics_storage: consent });
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}

function gtagGet(field: 'client_id' | 'session_id'): Promise<string | undefined> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), GTAG_GET_TIMEOUT_MS);
    gtag('get', GA_MEASUREMENT_ID, field, (value: unknown) => {
      clearTimeout(timer);
      resolve(value === undefined || value === null ? undefined : String(value));
    });
  });
}

/**
 * Định danh GA4 của trình duyệt, gửi kèm checkout để BE gắn event purchase vào đúng
 * phiên. Rỗng khi người dùng chưa đồng ý cookie phân tích.
 */
export async function getAnalyticsIds(): Promise<{ gaClientId?: string; gaSessionId?: string }> {
  if (!isAnalyticsActive() || readAnalyticsConsent() !== 'granted') return {};

  const [gaClientId, gaSessionId] = await Promise.all([gtagGet('client_id'), gtagGet('session_id')]);
  if (!gaClientId || !GA_CLIENT_ID_PATTERN.test(gaClientId)) return {};
  return gaSessionId && GA_SESSION_ID_PATTERN.test(gaSessionId) ? { gaClientId, gaSessionId } : { gaClientId };
}

/**
 * Script chạy trước khi gtag.js tải: đặt Consent Mode v2 mặc định (từ chối cho tới khi
 * người dùng đồng ý) và tắt GA4 khi vào thẳng trang /admin.
 */
export function buildGaBootstrapScript(measurementId: string) {
  const disableKey = JSON.stringify(`ga-disable-${measurementId}`);
  const storageKey = JSON.stringify(ANALYTICS_CONSENT_STORAGE_KEY);
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){window.dataLayer.push(arguments);}',
    `var c=null;try{c=window.localStorage.getItem(${storageKey});}catch(e){}`,
    "gtag('consent','default',{analytics_storage:c==='granted'?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});",
    "gtag('set','user_properties',{platform:window.Capacitor?'capacitor':'web'});",
    `window[${disableKey}]=window.location.pathname.indexOf('/admin')===0;`,
  ].join('');
}
