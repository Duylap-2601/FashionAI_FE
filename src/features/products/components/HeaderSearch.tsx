'use client';

import { MAX_HISTORY_ITEMS, SEARCH_HISTORY_KEY } from '@/features/products/constants/header-search';
import type { HeaderSearchProps } from '@/features/products/types/header-search';
import { Clock, Search, Trash2, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function HeaderSearch({ className = '' }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setHistory(parsed.filter((item): item is string => typeof item === 'string'));
      }
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const persistHistory = (nextHistory: string[]) => {
    setHistory(nextHistory);
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const submitSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const nextHistory = [trimmed, ...history.filter(item => item.toLowerCase() !== trimmed.toLowerCase())]
      .slice(0, MAX_HISTORY_ITEMS);
    persistHistory(nextHistory);
    setQuery('');
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('fashionai:product-search', { detail: trimmed }));
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const clearHistory = () => {
    persistHistory([]);
  };

  const removeHistoryItem = (item: string) => {
    persistHistory(history.filter(entry => entry !== item));
  };

  const searchPanel = (
    <div className="flex h-full flex-col bg-white md:h-auto md:w-[360px] md:rounded-2xl md:border md:border-neutral-200 md:shadow-xl">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
        <div>
          <h2 className="font-bold text-brand-navy">Tìm kiếm</h2>
          <p className="text-[12px] text-neutral-500">Tìm nhanh sản phẩm bạn cần</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="-mr-2 rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-brand-navy"
          aria-label="Đóng tìm kiếm"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(query);
        }}
        className="border-b border-neutral-100 px-5 py-4"
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bạn đang tìm sản phẩm gì?"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-body-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-brand-navy focus:bg-white focus:outline-none"
          />
        </div>
      </form>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-label-sm font-semibold text-neutral-900">Lịch sử tìm kiếm</h3>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-[12px] font-semibold text-[#5D1C34] underline underline-offset-4"
            >
              Xoá tất cả
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="flex flex-col gap-1">
            {history.map(item => (
              <div key={item} className="group flex items-center gap-2 rounded-xl hover:bg-neutral-50">
                <button
                  onClick={() => submitSearch(item)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left text-body-sm text-neutral-700"
                >
                  <Clock className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="truncate">{item}</span>
                </button>
                <button
                  onClick={() => removeHistoryItem(item)}
                  className="mr-2 rounded-full p-2 text-neutral-400 transition-colors hover:bg-white hover:text-semantic-error"
                  aria-label={`Xoá ${item} khỏi lịch sử`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-8 text-center text-body-sm text-neutral-500">
            Chưa có lịch sử tìm kiếm.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Tìm kiếm"
        className={`rounded-full p-2 transition-colors ${isOpen ? 'bg-neutral-100 text-brand-navy' : 'text-neutral-600 hover:bg-neutral-100 hover:text-brand-navy'
          }`}
      >
        <Search className="h-[18px] w-[18px] md:h-5 md:w-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100] flex md:hidden">
            <div
              className="absolute inset-0 bg-black/40 transition-opacity animate-in fade-in"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute inset-y-0 right-0 w-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
              {searchPanel}
            </div>
          </div>
          <div className="absolute right-0 top-full z-50 mt-2 hidden md:block">
            {searchPanel}
          </div>
        </>
      )}
    </div>
  );
}
