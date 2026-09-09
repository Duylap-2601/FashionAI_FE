export interface AuthInvalidatedEvent {
  redirectTo?: string;
}

export type AuthInvalidatedListener = (event: AuthInvalidatedEvent) => void;
