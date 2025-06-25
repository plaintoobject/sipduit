import { useEffect, useRef } from 'react';

export function useClickOutside(callback) {
  const ref = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    const handleEscapeKey = (event) => {
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
