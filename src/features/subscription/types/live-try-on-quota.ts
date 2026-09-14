export interface LiveTryOnQuota {
  enabled: boolean;
  eligible: boolean;
  disabledReason?: string;
  unit: 'seconds';
  limit: number;
  reserved: number;
  allocated: number;
  remaining: number;
  resetAt: string;
  maxDurationSeconds: number;
  activeSession: {
    sessionId: string;
    status: string;
    blockedUntil: string;
  } | null;
}
