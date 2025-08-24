import { useEffect, useRef } from 'react';

export function useClickOutside(callback: (arg?: unknown | null) => void) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    const handleEscapeKey = (event: any) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, {
      signal: controller.signal,
    });
    document.addEventListener('touchstart', handleClickOutside, {
      signal: controller.signal,
    });
    document.addEventListener('keydown', handleEscapeKey, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [callback]);

  return ref;
}
