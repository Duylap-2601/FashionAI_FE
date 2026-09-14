export type LiveTryOnStatus = 'idle' | 'requesting-camera' | 'preparing-garment' | 'connecting' | 'awaiting-first-frame' | 'live' | 'stopping' | 'ended' | 'error';

export interface LiveTryOnGarment {
  productId: string;
  imageUrl: string;
  prompt: string;
  category: 'UPPER' | 'LOWER' | 'FULL_BODY';
}

export interface LiveTryOnSessionResponse {
  sessionId: string;
  transport: 'direct';
  connection: {
    clientToken: string;
    tokenExpiresAt: string;
  };
  serverNow: string;
  blockedUntil: string;
  model: string;
  maxDurationSeconds: number;
  garment: LiveTryOnGarment;
}

export interface LiveTryOnEndResponse {
  sessionId: string;
  status: string;
  blockedUntil: string;
}
