'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Menu,
  Sparkles,
  RotateCcw,
  Trash2,
  ChevronDown,
  ArrowDown,
  Info,
  Package,
} from 'lucide-react';
import { Drawer } from 'vaul';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SessionSidebar } from './SessionSidebar';
import { ChatEmptyState } from './ChatEmptyState';
import { useUserProfile, useMeasurements } from '@/hooks/useMeasurements';
import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatWindowProps {
  initialSessionId?: string | null;
  initialProductId?: string | null;
  initialMessage?: string | null;
  onSessionChange?: (sessionId: string | null) => void;
}

export function ChatWindow({
  initialSessionId,
  initialProductId,
  initialMessage,
  onSessionChange,
}: ChatWindowProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasAutoSentInitial, setHasAutoSentInitial] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { profile } = useUserProfile();
  const { measurements } = useMeasurements();

  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    isLoadingSession,
    isLoadingSessions,
    error,
    quota,
    activeProduct,
    setActiveProduct,
    sendMessage,
    stopStreaming,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    clearCurrentChat,
  } = useChat({
    initialSessionId,
    initialProductId,
    onSessionCreated: (newSess) => {
      if (onSessionChange) onSessionChange(newSess.id);
    },
  });

  // Notify parent when session changes
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      switchSession(sessionId);
      if (onSessionChange) onSessionChange(sessionId);
    },
    [switchSession, onSessionChange]
  );

  const handleNewChat = useCallback(() => {
    createSession();
    if (onSessionChange) onSessionChange(null);
  }, [createSession, onSessionChange]);

  // Handle auto-sending initialMessage from deep-link (?message=...&productId=...)
  useEffect(() => {
    if (initialMessage && !hasAutoSentInitial && !isStreaming) {
      setHasAutoSentInitial(true);
      sendMessage(initialMessage, { productId: initialProductId || undefined });
    }
  }, [initialMessage, hasAutoSentInitial, isStreaming, sendMessage, initialProductId]);

  // Auto-scroll to bottom on new messages or streaming tokens if already at bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
  }, []);

  useEffect(() => {
    if (isAtBottom || isStreaming) {
      scrollToBottom(!isStreaming);
    }
  }, [messages, isStreaming, isAtBottom, scrollToBottom]);

  // Scroll listener to detect if user has scrolled away from bottom
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceToBottom < 80);
  };

  // Find active session title
  const activeSession = sessions.find((s) => s.id === currentSessionId);
  const sessionTitle = activeSession?.title || 'Trợ lý thời trang StAle.';

  return (
    <div className="flex h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] w-full overflow-hidden bg-[#FBF9F6]">
      
      {/* Desktop Sidebar (Left Panel) */}
      <div className="hidden md:block w-[280px] lg:w-[320px] h-full shrink-0">
        <SessionSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={deleteSession}
          onRenameSession={renameSession}
          quota={quota}
          isLoading={isLoadingSessions}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <Drawer.Root
        open={isMobileSidebarOpen}
        onOpenChange={setIsMobileSidebarOpen}
        direction="left"
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 md:hidden" />
          <Drawer.Content className="bg-white flex flex-col rounded-r-2xl h-full w-[290px] fixed bottom-0 left-0 z-50 outline-none md:hidden">
            <SessionSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onDeleteSession={deleteSession}
              onRenameSession={renameSession}
              quota={quota}
              onClose={() => setIsMobileSidebarOpen(false)}
              isLoading={isLoadingSessions}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Main Chat Conversation Area (Right Panel) */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#EFE9E1]/40 relative">
        
        {/* Top Chat Header */}
        <header className="h-[56px] px-4 md:px-6 flex items-center justify-between border-b border-neutral-200/80 bg-white/90 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 md:hidden text-neutral-600 hover:text-brand-navy rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Avatar & Title */}
            <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 text-brand-gold" />
            </div>

            <div className="flex flex-col min-w-0">
              <h1 className="text-body-md font-bold text-neutral-900 truncate leading-tight">
                {sessionTitle}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>StAle. AI Assistant</span>
                {activeProduct && (
                  <span className="hidden sm:inline-block text-[#5D1C34] font-semibold truncate max-w-[150px]">
                    · {activeProduct.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearCurrentChat}
                title="Làm mới cuộc trò chuyện"
                className="p-2 text-neutral-500 hover:text-brand-navy hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {currentSessionId && (
              <button
                type="button"
                onClick={() => deleteSession(currentSessionId)}
                title="Xóa đoạn chat này"
                className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Messages Stream */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar"
        >
          {isLoadingSession ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
              <div className="w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
              <span className="text-body-sm font-medium">Đang tải cuộc trò chuyện...</span>
            </div>
          ) : messages.length === 0 ? (
            <ChatEmptyState
              onSelectPrompt={(text) => sendMessage(text, { productId: activeProduct?.id })}
              userMeasurements={measurements}
              userName={profile?.name}
            />
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onRetry={(failedMsg) => {
                  sendMessage(failedMsg.content, {
                    sessionId: failedMsg.sessionId,
                    productId: failedMsg.productId,
                  });
                }}
              />
            ))
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Floating Scroll To Bottom Button */}
        {!isAtBottom && messages.length > 0 && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-24 right-6 p-2.5 bg-white border border-neutral-200 text-neutral-700 hover:text-brand-navy rounded-full shadow-lg transition-all animate-in fade-in zoom-in hover:scale-105 active:scale-95 cursor-pointer z-20"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Input Area */}
        <div className="p-3 md:p-4 bg-transparent shrink-0 max-w-4xl w-full mx-auto">
          <ChatInput
            onSend={(text) => sendMessage(text, { productId: activeProduct?.id })}
            isStreaming={isStreaming}
            onStop={stopStreaming}
            attachedProduct={activeProduct}
            onRemoveProduct={() => setActiveProduct(null)}
            placeholder="Hỏi về chọn size, phối đồ, kiểu dáng..."
          />
        </div>
      </div>
    </div>
  );
}
