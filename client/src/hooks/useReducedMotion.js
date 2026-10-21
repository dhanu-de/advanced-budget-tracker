import { useState, useEffect } from 'react';

/**
 * useReducedMotion
 * Returns true if the user has requested reduced motion via OS/browser settings.
 * All animations and 3D motion should be disabled or simplified when this is true.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    // Modern browsers
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler); // Safari < 14
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  return reduced;
}

export default useReducedMotion;
