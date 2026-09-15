export type LiveTryOnStatus = 'idle' | 'requesting-camera' | 'preparing-garment' | 'connecting' | 'awaiting-first-frame' | 'live' | 'pausing' | 'paused' | 'resuming' | 'stopping' | 'ended' | 'error';

export type LiveTryOnServerStatus = 'ACTIVE' | 'PAUSING' | 'PAUSED' | 'RESUMING' | 'ENDING' | 'ENDED' | 'EXPIRED' | 'FAILED';

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
  remainingSeconds: number;
  status: LiveTryOnServerStatus;
  revision: number;
  garment: LiveTryOnGarment;
}

export interface LiveTryOnSessionStatusResponse {
  sessionId: string;
  status: LiveTryOnServerStatus;
  remainingSeconds: number;
  serverNow: string;
  activeStartedAt: string | null;
  blockedUntil: string;
  pauseExpiresAt: string | null;
  revision: number;
  garment: LiveTryOnGarment;
}

export interface LiveTryOnEndResponse {
  sessionId: string;
  status: LiveTryOnServerStatus;
  blockedUntil: string;
  remainingSeconds: number;
  revision: number;
}
