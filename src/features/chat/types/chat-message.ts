import { ChatMessage as ChatMessageType } from '@/features/chat/types/chat';

export interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: (message: ChatMessageType) => void;
}
