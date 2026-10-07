export type CouponDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: string | number;
  maxDiscountVnd?: string | number | null;
  minOrderVnd?: string | number | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountVnd?: number | null;
  minOrderVnd?: number | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
}

export interface UpdateCouponPayload {
  code?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  maxDiscountVnd?: number | null;
  minOrderVnd?: number | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
}

export interface AdminCouponsResponse {
  items?: AdminCoupon[];
  data?: AdminCoupon[];
  coupons?: AdminCoupon[];
  total?: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCouponFilters {
  search?: string;
  discountType?: string;
  status?: string;
}
