import {
  ChatSession
} from '@/features/chat/types/chat';

export interface UseChatOptions {
  initialSessionId?: string | null;
  initialProductId?: string | null;
  onSessionCreated?: (session: ChatSession) => void;
}
