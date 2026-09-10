import { api } from '@/lib/api';

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
  const res = await api.post('/shipping/calculate-fee', payload);
  return res.data as ShippingFeeQuote;
}
