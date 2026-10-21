import React from 'react';

/**
 * Skeleton3D
 * Lightweight shimmer placeholder shown while a 3D component is lazy-loading
 * or when WebGL is unavailable. Never imports three.js.
 */
const Skeleton3D = ({ height = 240, borderRadius = 16, style = {} }) => (
  <div
    className="skeleton"
    role="status"
    aria-label="Loading visualization…"
    style={{
      width: '100%',
      height,
      borderRadius,
      ...style,
    }}
  >
    <span className="sr-only">Loading…</span>
  </div>
);

export default Skeleton3D;
