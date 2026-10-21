import React, { useRef, useMemo, useState, lazy, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import { getSavingsRate } from '../../services/transactionSelectors';
import Skeleton3D from './Skeleton3D';

// ── Colour mapping by savings rate ────────────────────────────────────────────
function orbColor(rate) {
  if (rate >= 0.4) return new THREE.Color('#22d3a0');  // green
  if (rate >= 0.1) return new THREE.Color('#f0a533');  // amber
  return new THREE.Color('#f05b7c');                    // red
}

// ── Animated orb mesh ─────────────────────────────────────────────────────────
function OrbMesh({ savingsRate }) {
  const ref      = useRef();
  const reduced  = useReducedMotion();
  const targetColor = useMemo(() => orbColor(savingsRate), [savingsRate]);
  const color    = useRef(targetColor.clone());

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    // Lerp colour
    color.current.lerp(targetColor, delta * 1.5);
    ref.current.material.emissive.copy(color.current);
    ref.current.material.color.copy(color.current);

    if (!reduced) {
      // Gentle pulse
      const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.03;
      ref.current.scale.setScalar(s);
      // Slow rotation
      ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial
        color={targetColor}
        emissive={targetColor}
        emissiveIntensity={0.45}
        roughness={0.15}
        metalness={0.3}
        transparent
        opacity={0.88}
      />
    </mesh>
  );
}

// ── Glow ring around orb ──────────────────────────────────────────────────────
function GlowRing({ savingsRate }) {
  const col = useMemo(() => orbColor(savingsRate), [savingsRate]);
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.35, 0.04, 16, 80]} />
      <meshBasicMaterial color={col} transparent opacity={0.5} />
    </mesh>
  );
}

// ── Count-up number display (plain JS, no three.js) ───────────────────────────
function useCountUp(target, duration = 800) {
  const [display, setDisplay] = useState(0);
  const startRef   = useRef(null);
  const startValRef = useRef(0);

  React.useEffect(() => {
    startValRef.current = display;
    startRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startValRef.current + (target - startValRef.current) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}

// ── 2D SVG fallback ───────────────────────────────────────────────────────────
function OrbFallback({ savingsRate, totals }) {
  const hex  = savingsRate >= 0.4 ? '#22d3a0' : savingsRate >= 0.1 ? '#f0a533' : '#f05b7c';
  const pct  = Math.round(savingsRate * 100);
  const r = 44, stroke = 6;
  const circ = 2 * Math.PI * r;
  const dash = (circ * pct) / 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="120" height="120" viewBox="0 0 100 100" aria-label={`Savings rate ${pct}%`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a2d47" strokeWidth={stroke} />
        <circle cx="50" cy="50" r={r} fill="none" stroke={hex} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)" />
        <text x="50" y="55" textAnchor="middle" fill={hex} fontSize="18" fontWeight="800">{pct}%</text>
      </svg>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
const NetWorthOrb = ({ totals = {} }) => {
  const [hovered, setHovered] = useState(false);
  const { supported: webglOk, checked } = useWebGLSupport();
  const reduced = useReducedMotion();

  const savingsRate  = getSavingsRate(totals);
  const balance      = useCountUp(totals.balance ?? 0, reduced ? 0 : 900);
  const income       = totals.income  ?? 0;
  const expense      = totals.expense ?? 0;
  const col          = savingsRate >= 0.4 ? '#22d3a0' : savingsRate >= 0.1 ? '#f0a533' : '#f05b7c';

  const fmt = n => `₹${Math.abs(Number(n)).toLocaleString('en-IN')}`;

  if (!checked) return <Skeleton3D height={180} />;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── 3D Canvas / SVG fallback ─────────────────────────────────────── */}
      {webglOk ? (
        <div style={{ width: 180, height: 180, position: 'relative' }}>
          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 40 }}
            dpr={[1, 2]}
            frameloop={reduced ? 'never' : 'always'}
            style={{ borderRadius: '50%' }}
            aria-hidden="true"
          >
            <ambientLight intensity={0.4} />
            <pointLight position={[3, 3, 3]}   color={col} intensity={8} distance={10} />
            <pointLight position={[-3, -2, 2]} color="#9b7bf0" intensity={3} distance={8} />
            <OrbMesh  savingsRate={savingsRate} />
            <GlowRing savingsRate={savingsRate} />
          </Canvas>
        </div>
      ) : (
        <OrbFallback savingsRate={savingsRate} totals={totals} />
      )}

      {/* ── Balance number ───────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#3f5977', marginBottom: 4 }}>
          Net Balance
        </p>
        <p style={{ fontSize: 28, fontWeight: 900, color: col, lineHeight: 1, transition: 'color 0.6s' }}>
          {totals.balance < 0 ? '−' : ''}{fmt(balance)}
        </p>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#3f5977', marginTop: 4 }}>
          {Math.round(savingsRate * 100)}% savings rate
        </p>
      </div>

      {/* ── Hover tooltip ────────────────────────────────────────────────── */}
      {hovered && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            background: '#0d1526',
            border: '1px solid #233d5e',
            borderRadius: 12,
            padding: '10px 16px',
            zIndex: 10,
            minWidth: 180,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#7a98b8' }}>Income</span>
              <span style={{ color: '#22d3a0', fontWeight: 700 }}>{fmt(income)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#7a98b8' }}>Expenses</span>
              <span style={{ color: '#f05b7c', fontWeight: 700 }}>{fmt(expense)}</span>
            </div>
            <div style={{ borderTop: '1px solid #1a2d47', paddingTop: 5, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#7a98b8' }}>Net</span>
              <span style={{ color: col, fontWeight: 800 }}>{totals.balance < 0 ? '−' : '+'}{fmt(totals.balance ?? 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetWorthOrb;
