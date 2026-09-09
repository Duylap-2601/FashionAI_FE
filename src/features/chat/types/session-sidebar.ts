import { ChatSession } from '@/features/chat/types/chat';
import type { UserQuota } from '@/features/subscription/types/quota';

export interface SessionSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  quota?: UserQuota;
  onClose?: () => void;
  isLoading?: boolean;
}
