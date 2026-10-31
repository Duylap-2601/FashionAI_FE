export interface AdminSaleCampaign {
  id: string;
  name: string;
  discountPercent: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSaleCampaignProduct {
  id: string;
  name: string;
  price: string | number;
  status: string;
  garmentUrl?: string | null;
  images?: Array<{ id?: string; imageUrl?: string; isMain?: boolean }>;
}

export interface AdminSaleCampaignDetail extends AdminSaleCampaign {
  products: AdminSaleCampaignProduct[];
  productIds: string[];
}

export interface CreateSaleCampaignPayload {
  name: string;
  discountPercent: number;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  productIds: string[];
}

export type UpdateSaleCampaignPayload = Partial<CreateSaleCampaignPayload>;

export interface AdminSaleCampaignFilters {
  search: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
}
