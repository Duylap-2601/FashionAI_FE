export interface ChatWindowProps {
  initialSessionId?: string | null;
  initialProductId?: string | null;
  initialMessage?: string | null;
  onSessionChange?: (sessionId: string | null) => void;
}
