import { create } from 'zustand';
import { AppNotification } from '@/types/notification';

interface NotificationStore {
  unreadCount: number;
  recentNotifications: AppNotification[];
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: (delta?: number) => void;
  decrementUnread: (delta?: number) => void;
  addNotification: (notification: AppNotification) => void;
  setRecentNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  unreadCount: 0,
  recentNotifications: [],
  isPanelOpen: false,
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  incrementUnread: (delta = 1) => set((state) => ({ unreadCount: state.unreadCount + delta })),
  decrementUnread: (delta = 1) => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - delta) })),
  addNotification: (notification) => {
    const prev = get().recentNotifications;
    // Check duplicate by id
    const exists = prev.some((n) => n.id === notification.id);
    if (exists) return;

    set((state) => ({
      recentNotifications: [notification, ...prev].slice(0, 20),
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    }));
  },
  setRecentNotifications: (notifications) => set({ recentNotifications: notifications }),
  markAsRead: (id) => {
    const list = get().recentNotifications;
    const target = list.find((n) => n.id === id);
    if (!target || target.isRead) return;

    set((state) => ({
      recentNotifications: state.recentNotifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      recentNotifications: state.recentNotifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
