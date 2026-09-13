import { http } from '@/lib/http';

export interface CalculateShippingFeeRequest {
  toDistrictId: number;
  toWardCode: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  insuranceValue?: number;
}

export interface ShippingFeeQuote {
  provider: 'GHN';
  totalFee: number;
  serviceFee?: number;
  insuranceFee?: number;
  expectedDeliveryTime?: string;
}

export async function calculateShippingFee(payload: CalculateShippingFeeRequest) {
  return http.post<ShippingFeeQuote, CalculateShippingFeeRequest>('/shipping/calculate-fee', payload);
}
