import React, { useRef, useCallback } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * TiltCard
 * Wraps any card element with a CSS perspective tilt on hover,
 * plus a moving light-reflection pseudo-highlight.
 * Pure CSS transforms — no three.js required.
 */
const TiltCard = ({ children, style = {}, className = '', maxTilt = 8, glare = true }) => {
  const ref     = useRef();
  const reduced = useReducedMotion();

  const onMove = useCallback((e) => {
    if (!ref.current || reduced) return;
    const rect  = ref.current.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);  // -1 … 1
    const dy    = (e.clientY - cy) / (rect.height / 2);

    const rotY  =  dx * maxTilt;
    const rotX  = -dy * maxTilt;

    ref.current.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.015,1.015,1.015)`;

    if (glare) {
      const highlight = ref.current.querySelector('.tilt-glare');
      if (highlight) {
        const glareX = (dx + 1) / 2 * 100;  // 0–100%
        const glareY = (dy + 1) / 2 * 100;
        highlight.style.background =
          `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.12) 0%, transparent 65%)`;
        highlight.style.opacity = '1';
      }
    }
  }, [maxTilt, glare, reduced]);

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    const highlight = ref.current.querySelector('.tilt-glare');
    if (highlight) highlight.style.opacity = '0';
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.12s ease-out',
        position: 'relative',
        willChange: 'transform',
        ...style,
      }}
    >
      {/* Light-reflection overlay */}
      {glare && (
        <div
          className="tilt-glare"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.2s',
            zIndex: 1,
          }}
        />
      )}
      {children}
    </div>
  );
};

export default TiltCard;
