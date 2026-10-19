'use client';

import { useEffect, useRef } from 'react';

/**
 * Ref luôn giữ giá trị của lần render gần nhất. Dùng cho callback cần đọc giá trị mới mà vẫn
 * giữ identity ổn định, để effect phụ thuộc vào nó không chạy lại sau mỗi render.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
