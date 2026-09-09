export interface ReviewUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface ReviewProduct {
  id: string;
  name: string;
  garmentUrl?: string | null;
  image?: string | null;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number; // 1-5
  comment?: string | null;
  images?: string[] | null;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
  product?: ReviewProduct;
  replies?: ReviewReply[];
}

export interface ReviewReplyUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role?: 'ADMIN' | 'USER' | string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: ReviewReplyUser;
}

export interface CreateReplyInput {
  reviewId: string;
  comment: string;
  productId?: string;
}

export interface UpdateReplyInput {
  id: string;
  comment: string;
  reviewId?: string;
  productId?: string;
}

export interface DeleteReplyInput {
  id: string;
  reviewId?: string;
  productId?: string;
}

export interface ReviewDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface ReviewStats {
  avgRating: number;
  reviewCount: number;
  distribution: ReviewDistribution;
}

export interface ReviewsMeta extends ReviewStats {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewsResponse {
  data: Review[];
  meta: ReviewsMeta;
}

export interface CreateReviewInput {
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewInput {
  id: string;
  productId?: string;
  comment?: string;
  images?: string[];
}
