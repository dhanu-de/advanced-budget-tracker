import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import Skeleton3D from './Skeleton3D';

// ── Constants ─────────────────────────────────────────────────────────────────
const VESSEL_H  = 2.2;   // total height of glass cylinder
const VESSEL_R  = 0.55;  // radius
const BOTTOM_Y  = -VESSEL_H / 2 + 0.05;
const TOP_Y     = VESSEL_H / 2 - 0.08;
const LIQUID_COLOR_START = new THREE.Color('#22d3a0');
const LIQUID_COLOR_MID   = new THREE.Color('#f0a533');
const LIQUID_COLOR_DONE  = new THREE.Color('#5b6ff0');

// ── Liquid fill plane ─────────────────────────────────────────────────────────
function LiquidFill({ progress, isAnimating }) {
  const ref     = useRef();
  const matRef  = useRef();
  const current = useRef(progress);
  const reduced = useReducedMotion();

  const color = useMemo(() => {
    if (progress >= 1) return LIQUID_COLOR_DONE;
    if (progress >= 0.6) return LIQUID_COLOR_MID;
    return LIQUID_COLOR_START;
  }, [progress]);

  useFrame((_, delta) => {
    if (!ref.current || !matRef.current) return;
    current.current = THREE.MathUtils.lerp(current.current, progress, reduced ? 1 : delta * 1.8);
    const fillH  = (TOP_Y - BOTTOM_Y) * current.current;
    ref.current.position.y = BOTTOM_Y + fillH / 2;
    ref.current.scale.y    = fillH;
    matRef.current.color.lerp(color, delta * 1.5);
    // Gentle wave on surface
    if (!reduced && isAnimating) {
      const t = performance.now() / 1000;
      ref.current.position.x = Math.sin(t * 3) * 0.02;
    }
  });

  return (
    <mesh ref={ref} position={[0, BOTTOM_Y, 0]}>
      <cylinderGeometry args={[VESSEL_R - 0.06, VESSEL_R - 0.06, 1, 32]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.25}
        roughness={0.2}
        metalness={0.0}
        transparent
        opacity={0.82}
      />
    </mesh>
  );
}

// ── Glass cylinder shell ───────────────────────────────────────────────────────
function GlassShell() {
  return (
    <>
      {/* Outer glass wall */}
      <mesh>
        <cylinderGeometry args={[VESSEL_R, VESSEL_R, VESSEL_H, 32, 1, true]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.08}
          roughness={0.0}
          transmission={0.92}
          ior={1.45}
          chromaticAberration={0.02}
          color="#aaccff"
        />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, BOTTOM_Y - 0.02, 0]}>
        <cylinderGeometry args={[VESSEL_R, VESSEL_R, 0.06, 32]} />
        <meshStandardMaterial color="#1a2d47" roughness={0.3} metalness={0.5} />
      </mesh>
    </>
  );
}

// ── Drop particle ─────────────────────────────────────────────────────────────
function DropParticle({ active, color }) {
  const ref     = useRef();
  const state   = useRef({ y: TOP_Y + 1.5, vy: 0, alive: false });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (active && !reduced) {
      state.current = { y: TOP_Y + 1.5, vy: 0, alive: true };
    }
  }, [active, reduced]);

  useFrame((_, delta) => {
    if (!ref.current || !state.current.alive) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    state.current.vy -= 6 * delta; // gravity
    state.current.y  += state.current.vy * delta;
    ref.current.position.y = state.current.y;
    if (state.current.y < BOTTOM_Y + 0.15) state.current.alive = false;
  });

  return (
    <mesh ref={ref} position={[0, TOP_Y + 1.5, 0]} visible={false}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshStandardMaterial color={color || '#22d3a0'} emissive={color || '#22d3a0'} emissiveIntensity={0.5} />
    </mesh>
  );
}

// ── Confetti burst ────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const ref    = useRef();
  const pieces = useMemo(() => Array.from({ length: 24 }, () => ({
    pos:   [0, 0, 0],
    vel:   [(Math.random() - 0.5) * 4, Math.random() * 4 + 2, (Math.random() - 0.5) * 2],
    color: ['#22d3a0', '#f0a533', '#9b7bf0', '#f05b7c', '#38c4f5'][Math.floor(Math.random() * 5)],
    t:     0,
    alive: false,
  })), []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (active && !reduced) {
      pieces.forEach(p => {
        p.pos   = [0, 0, 0];
        p.vel   = [(Math.random() - 0.5) * 4, Math.random() * 4 + 2, (Math.random() - 0.5) * 2];
        p.t     = 0;
        p.alive = true;
      });
    }
  }, [active, pieces, reduced]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    pieces.forEach((p, i) => {
      if (!p.alive) { dummy.scale.setScalar(0); dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix); return; }
      p.t      += delta;
      p.vel[1] -= 4 * delta;
      p.pos[0] += p.vel[0] * delta;
      p.pos[1] += p.vel[1] * delta;
      p.pos[2] += p.vel[2] * delta;
      if (p.t > 1.8 || p.pos[1] < -2) p.alive = false;
      dummy.position.set(...p.pos);
      dummy.rotation.set(p.t * 3, p.t * 5, 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, 24]}>
      <boxGeometry args={[0.06, 0.06, 0.01]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  );
}

// ── Vessel scene ──────────────────────────────────────────────────────────────
function VesselScene({ progress, isAnimating, achieved }) {
  const liquidColor = achieved ? '#5b6ff0' : progress >= 0.6 ? '#f0a533' : '#22d3a0';
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 3, 3]}   color="#5b6ff0" intensity={5} distance={10} />
      <pointLight position={[-2, -1, 2]} color="#9b7bf0" intensity={2} distance={8}  />
      <GlassShell />
      <LiquidFill progress={progress} isAnimating={isAnimating} />
      <DropParticle active={isAnimating} color={liquidColor} />
      <Confetti    active={achieved && isAnimating} />
    </>
  );
}

// ── 2D progress bar fallback ──────────────────────────────────────────────────
function FlatProgress({ goal }) {
  const pct  = Math.min((Number(goal.saved) / Number(goal.target)) * 100, 100);
  const done = pct >= 100;
  const col  = done ? '#5b6ff0' : pct >= 60 ? '#f0a533' : '#22d3a0';
  return (
    <div style={{ padding: '0.8rem 0' }}>
      <div style={{ height: 8, background: '#111e33', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#7a98b8' }}>
        <span>₹{Number(goal.saved).toLocaleString('en-IN')}</span>
        <span style={{ color: col, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
        <span>₹{Number(goal.target).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
const GoalVessel = ({ goal, onContribute }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { supported: webglOk, checked } = useWebGLSupport();

  const progress = Math.min(Number(goal.saved) / Number(goal.target), 1) || 0;
  const achieved = progress >= 1;

  const daysLeft = useMemo(() => {
    if (!goal.targetDate) return null;
    const diff = new Date(goal.targetDate) - Date.now();
    return Math.max(0, Math.ceil(diff / 864e5));
  }, [goal.targetDate]);

  const handleContribute = async (amount) => {
    setIsAnimating(true);
    await onContribute?.(goal.id, amount);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  if (!checked) return <Skeleton3D height={280} />;

  const col = achieved ? '#5b6ff0' : progress >= 0.6 ? '#f0a533' : '#22d3a0';

  return (
    <div style={{
      background: '#0d1526',
      border: `1px solid ${achieved ? '#5b6ff044' : '#1a2d47'}`,
      borderRadius: 16,
      padding: '1.2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#dce8f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {goal.title}
        </h3>
        <span style={{ fontSize: 13, fontWeight: 700, color: col, background: `${col}18`, padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {Math.round(progress * 100)}%
        </span>
      </div>

      {/* Vessel or flat progress */}
      {webglOk ? (
        <div style={{ height: 180 }}>
          <Canvas
            camera={{ position: [0, 0, 3.8], fov: 42 }}
            dpr={[1, 2]}
            frameloop="always"
            aria-label={`${goal.title} progress vessel — ${Math.round(progress * 100)}% filled`}
          >
            <VesselScene progress={progress} isAnimating={isAnimating} achieved={achieved && isAnimating} />
          </Canvas>
        </div>
      ) : (
        <FlatProgress goal={goal} />
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7a98b8' }}>
        <span>Saved: <strong style={{ color: '#dce8f5' }}>₹{Number(goal.saved).toLocaleString('en-IN')}</strong></span>
        <span>Target: <strong style={{ color: '#dce8f5' }}>₹{Number(goal.target).toLocaleString('en-IN')}</strong></span>
      </div>

      {daysLeft !== null && (
        <p style={{ fontSize: 11, color: daysLeft < 14 ? '#f05b7c' : '#3f5977' }}>
          {achieved ? '🎉 Goal achieved!' : `${daysLeft} days remaining`}
        </p>
      )}

      {/* Contribution input */}
      {!achieved && <ContributeRow onContribute={handleContribute} color={col} />}
      {achieved && <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#5b6ff0' }}>🎉 Goal Achieved!</p>}
    </div>
  );
};

function ContributeRow({ onContribute, color }) {
  const [amount, setAmount] = useState('');
  const [busy,   setBusy]   = useState(false);

  const submit = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    setBusy(true);
    await onContribute(n);
    setAmount('');
    setBusy(false);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        type="number"
        step="0.01"
        min="0"
        placeholder="Add amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        style={{ flex: 1, padding: '8px 12px', borderRadius: 10, fontSize: 13 }}
      />
      <button
        onClick={submit}
        disabled={busy || !amount}
        style={{
          padding: '8px 16px', borderRadius: 10, border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
          background: `linear-gradient(135deg,${color},${color}cc)`,
          color: '#fff', fontSize: 13, fontWeight: 700, opacity: busy ? 0.6 : 1,
          transition: 'opacity .15s',
        }}
      >
        {busy ? '…' : '+ Add'}
      </button>
    </div>
  );
}

export default GoalVessel;
