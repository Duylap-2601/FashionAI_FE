'use client';

import { MAX_HISTORY_ITEMS, SEARCH_HISTORY_KEY } from '@/features/products/constants/header-search';
import { useCallback, useEffect, useState } from 'react';

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  const loadHistory = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setHistory(parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0));
      }
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SEARCH_HISTORY_KEY) {
        loadHistory();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadHistory]);

  const addHistory = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      const current: string[] = raw ? JSON.parse(raw) : [];
      const filtered = Array.isArray(current)
        ? current.filter((item) => typeof item === 'string' && item.toLowerCase() !== trimmed.toLowerCase())
        : [];
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const removeHistory = useCallback((term: string) => {
    try {
      const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      const current: string[] = raw ? JSON.parse(raw) : [];
      const updated = Array.isArray(current)
        ? current.filter((item) => item !== term)
        : [];
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch {
      // Ignore
    }
  }, []);

  const clearHistory = useCallback(() => {
    try {
      window.localStorage.removeItem(SEARCH_HISTORY_KEY);
      setHistory([]);
    } catch {
      // Ignore
    }
  }, []);

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  };
}
