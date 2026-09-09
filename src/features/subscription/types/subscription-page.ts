export interface PlanFeature {
  text: string;
  highlight?: boolean;
}

export interface Plan {
  id: 'FREE' | 'MEMBER' | 'VIP';
  name: string;
  priceText: string;
  numericPrice: number;
  periodText: string;
  badge?: string;
  isPopular?: boolean;
  description: string;
  features: PlanFeature[];
  ctaText: string;
}

export interface SubscriptionErrorBody {
  message?: string | string[];
}
