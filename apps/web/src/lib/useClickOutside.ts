import { useEffect } from 'react';

export function useClickOutside(handler: () => void, elementRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!elementRef.current || elementRef.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, elementRef]);
}
