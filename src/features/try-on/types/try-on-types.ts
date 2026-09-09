export type PageState = 'idle' | 'loading' | 'result' | 'quota-exhausted';

export type ProductPickerCategory = 'ALL' | 'UPPER' | 'LOWER' | 'FULL_BODY';

export type GarmentMode = 'single' | 'combo';

export type CatalogSlot = 'single' | 'upper' | 'lower';

export interface TryOnErrorBody {
  code?: string;
  message?: string | string[];
  details?: {
    reason?: string;
    resetAt?: string;
    requested?: number;
    remaining?: number;
  };
  resetAt?: string;
  requested?: number;
  remaining?: number;
  missing?: { label?: string }[];
}
