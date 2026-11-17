import { useSyncExternalStore } from 'react';

// True while the screen matches a CSS media query, e.g. useMediaQuery('(max-width: 41.99rem)').
// Updates when the window is resized or a phone is turned.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

// Phones: below Carbon's md breakpoint (42rem), the same as in mpdsr-responsive.scss.
export const PHONE_QUERY = '(max-width: 41.99rem)';

// Large screens: from Carbon's lg breakpoint (66rem), where the side menu is always shown.
export const LARGE_SCREEN_QUERY = '(min-width: 66rem)';
