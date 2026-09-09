import { ChatProductContext } from '@/features/chat/types/chat';

export interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  attachedProduct?: ChatProductContext | null;
  onRemoveProduct?: () => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
}
