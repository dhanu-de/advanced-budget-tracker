import { useState, useEffect } from 'react';

/**
 * useWebGLSupport
 * Detects WebGL availability and device performance tier.
 *
 * Returns:
 *   supported : boolean   — WebGL 1 or 2 available
 *   tier      : 'high' | 'low' | 'none'
 *               'high'  → WebGL2 + hardware acceleration
 *               'low'   → WebGL1 only or software renderer
 *               'none'  → no WebGL
 *
 * Use this to decide whether to render 3D components or fall back to 2D.
 */
export function useWebGLSupport() {
  const [result, setResult] = useState({ supported: false, tier: 'none', checked: false });

  useEffect(() => {
    const canvas = document.createElement('canvas');

    try {
      // Try WebGL2 first (better feature support)
      const gl2 = canvas.getContext('webgl2');
      if (gl2) {
        // Detect software renderer (SwiftShader / Mesa)
        const debugInfo = gl2.getExtension('WEBGL_debug_renderer_info');
        const renderer  = debugInfo
          ? gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase()
          : '';
        const isSoftware = /swiftshader|mesa|llvmpipe|softpipe/.test(renderer);
        setResult({ supported: true, tier: isSoftware ? 'low' : 'high', checked: true });
        gl2.getExtension('WEBGL_lose_context')?.loseContext();
        return;
      }

      // Fall back to WebGL1
      const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl1) {
        setResult({ supported: true, tier: 'low', checked: true });
        gl1.getExtension?.('WEBGL_lose_context')?.loseContext();
        return;
      }
    } catch {
      // WebGL context creation threw — treat as unsupported
    }

    setResult({ supported: false, tier: 'none', checked: true });
  }, []);

  return result;
}

export default useWebGLSupport;
