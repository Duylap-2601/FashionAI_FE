export interface AuthInvalidatedEvent {
  redirectTo?: string;
}

type AuthInvalidatedListener = (event: AuthInvalidatedEvent) => void;

const listeners = new Set<AuthInvalidatedListener>();

export function subscribeAuthInvalidated(listener: AuthInvalidatedListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitAuthInvalidated(event: AuthInvalidatedEvent = {}) {
  listeners.forEach((listener) => listener(event));
}
