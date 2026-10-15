// Khớp response của GET /admin/analytics/* (BE modules/analytics/types).

export type AnalyticsRange = '7d' | '28d' | '90d';

export type AnalyticsFunnelEvent = 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase';

export type AnalyticsFeatureEvent =
  | 'try_on_generate'
  | 'live_try_on_start'
  | 'stylist_analyze'
  | 'chat_message_send'
  | 'add_to_wishlist'
  | 'search';

export interface AnalyticsKpis {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  engagementRate: number;
  averageSessionDuration: number;
  screenPageViews: number;
  purchases: number;
}

export interface AnalyticsTrendPoint {
  date: string;
  activeUsers: number;
  sessions: number;
}

export interface AnalyticsReport {
  configured: true;
  range: AnalyticsRange;
  generatedAt: string;
  kpis: { current: AnalyticsKpis; previous: AnalyticsKpis };
  trend: AnalyticsTrendPoint[];
  funnel: { event: AnalyticsFunnelEvent; users: number; events: number }[];
  channels: { channel: string; sessions: number; activeUsers: number; engagementRate: number }[];
  topPages: { path: string; views: number; activeUsers: number }[];
  topProducts: { name: string; views: number; addedToCart: number; purchased: number }[];
  devices: { device: string; activeUsers: number }[];
  cities: { city: string; activeUsers: number }[];
  features: { event: AnalyticsFeatureEvent; count: number; users: number }[];
}

export interface AnalyticsRealtime {
  configured: true;
  activeUsers: number;
  generatedAt: string;
}

export interface AnalyticsNotConfigured {
  configured: false;
}

export type AnalyticsReportResult = AnalyticsReport | AnalyticsNotConfigured;
export type AnalyticsRealtimeResult = AnalyticsRealtime | AnalyticsNotConfigured;
