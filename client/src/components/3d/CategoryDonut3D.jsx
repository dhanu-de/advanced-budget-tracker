import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import Skeleton3D from './Skeleton3D';

// ── Build arc shape for one donut segment ─────────────────────────────────────
function buildArcShape(innerR, outerR, startAngle, endAngle, segments = 48) {
  const shape = new THREE.Shape();
  const sweep = endAngle - startAngle;

  // Outer arc
  for (let i = 0; i <= segments; i++) {
    const a = startAngle + (sweep * i) / segments;
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  // Inner arc (reversed)
  for (let i = segments; i >= 0; i--) {
    const a = startAngle + (sweep * i) / segments;
    shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
  }
  shape.closePath();
  return shape;
}

// ── Single segment mesh ───────────────────────────────────────────────────────
function Segment({ shape, depth, color, isHovered, onClick, onHover, position }) {
  const ref     = useRef();
  const reduced = useReducedMotion();

  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    g.computeVertexNormals();
    return g;
  }, [shape, depth]);

  // Hover: lift on Y
  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    const targetY = isHovered ? 0.25 : 0;
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, delta * 8);
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: isHovered ? 0.45 : 0.12,
    metalness: 0.1,
    roughness: 0.5,
    transparent: true,
    opacity: isHovered ? 1 : 0.9,
  }), [color, isHovered]);

  return (
    <mesh
      ref={ref}
      geometry={geo}
      material={mat}
      position={[position[0], 0, position[2]]}
      onClick={onClick}
      onPointerOver={onHover}
      onPointerOut={() => onHover(null)}
      dispose={null}
    />
  );
}

// ── Drag rotation controller ──────────────────────────────────────────────────
function DragGroup({ children }) {
  const groupRef = useRef();
  const drag     = useRef({ active: false, lastX: 0, vel: 0 });
  const reduced  = useReducedMotion();

  useFrame((_, delta) => {
    if (!groupRef.current || reduced) return;
    if (!drag.current.active) {
      // Apply inertia
      drag.current.vel *= 0.92;
      groupRef.current.rotation.z += drag.current.vel * delta;
    }
  });

  const onPointerDown = useCallback((e) => {
    drag.current.active = true;
    drag.current.lastX  = e.clientX;
    e.target.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!drag.current.active || !groupRef.current) return;
    const dx = e.clientX - drag.current.lastX;
    drag.current.vel = dx * 0.01;
    groupRef.current.rotation.z += dx * 0.008;
    drag.current.lastX = e.clientX;
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current.active = false;
  }, []);

  return (
    <group
      ref={groupRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
    </group>
  );
}

// ── Donut scene ───────────────────────────────────────────────────────────────
function DonutScene({ segments, total, hoveredIndex, setHoveredIndex, onFilter }) {
  let angleOffset = -Math.PI / 2;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 4, 4]}  color="#5b6ff0" intensity={6} distance={12} />
      <pointLight position={[-3, -2, 3]} color="#ffffff" intensity={3} distance={10} />

      <DragGroup>
        {segments.map((seg, i) => {
          const sweep      = (seg.value / total) * Math.PI * 2;
          const midAngle   = angleOffset + sweep / 2;
          const shape      = buildArcShape(0.9, 1.7, angleOffset, angleOffset + sweep);
          const cx         = Math.cos(midAngle) * 1.3;
          const cz         = Math.sin(midAngle) * 1.3;
          angleOffset     += sweep;

          return (
            <Segment
              key={seg.name}
              shape={shape}
              depth={0.35}
              color={seg.color}
              isHovered={hoveredIndex === i}
              position={[cx * 0, 0, cz * 0]}   // segments are all at center; we lift on Y
              onClick={() => onFilter(seg.name)}
              onHover={(e) => setHoveredIndex(e ? i : null)}
            />
          );
        })}
      </DragGroup>

      {/* Centre label */}
      <Text
        position={[0, 0.08, 0.5]}
        fontSize={0.22}
        color="#7a98b8"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        Expenses
      </Text>
    </>
  );
}

// ── Tooltip overlay ───────────────────────────────────────────────────────────
function TooltipOverlay({ seg, total }) {
  if (!seg) return null;
  const pct = ((seg.value / total) * 100).toFixed(1);
  return (
    <div style={{
      position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
      background: '#0d1526', border: '1px solid #233d5e', borderRadius: 10,
      padding: '8px 14px', pointerEvents: 'none', whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#dce8f5' }}>{seg.name}</span>
        <span style={{ fontSize: 13, color: '#7a98b8' }}>₹{seg.value.toLocaleString('en-IN')}</span>
        <span style={{ fontSize: 12, color: '#3f5977' }}>{pct}%</span>
      </div>
    </div>
  );
}

// ── 2D legend list (accessible alternative) ───────────────────────────────────
function Legend({ segments, total, activeFilter, onFilter }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0', overflowY: 'auto', maxHeight: 200 }}>
      {segments.map(seg => {
        const pct = ((seg.value / total) * 100).toFixed(1);
        const active = activeFilter === seg.name;
        return (
          <button
            key={seg.name}
            onClick={() => onFilter(active ? null : seg.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
              background: active ? `${seg.color}18` : 'transparent',
              transition: 'background .15s',
            }}
            aria-pressed={active}
          >
            <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#dce8f5', fontWeight: 600, flex: 1 }}>{seg.name}</span>
            <span style={{ fontSize: 12, color: '#7a98b8' }}>{pct}%</span>
            <span style={{ fontSize: 12, color: '#3f5977' }}>₹{seg.value.toLocaleString('en-IN')}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
const CategoryDonut3D = ({ categoryBreakdown = {}, categories = [], onCategoryFilter }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const { supported: webglOk, checked } = useWebGLSupport();

  const segments = useMemo(() => {
    return Object.entries(categoryBreakdown)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: categories.find(c => c.name === name)?.color || '#374151',
      }))
      .sort((a, b) => b.value - a.value);
  }, [categoryBreakdown, categories]);

  const total = useMemo(() => segments.reduce((s, seg) => s + seg.value, 0), [segments]);

  const handleFilter = useCallback((name) => {
    const next = activeFilter === name ? null : name;
    setActiveFilter(next);
    onCategoryFilter?.(next);
  }, [activeFilter, onCategoryFilter]);

  if (!checked) return <Skeleton3D height={300} />;

  if (segments.length === 0) {
    return <p style={{ textAlign: 'center', color: '#3f5977', padding: '3rem 0', fontSize: 13 }}>No expenses yet</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Active filter banner */}
      {activeFilter && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(91,111,240,0.1)', border: '1px solid rgba(91,111,240,0.3)', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: '#7a98b8' }}>Filtering: <strong style={{ color: '#dce8f5' }}>{activeFilter}</strong></span>
          <button onClick={() => handleFilter(activeFilter)} style={{ fontSize: 11, color: '#5b6ff0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear ×</button>
        </div>
      )}

      {/* 3D canvas or 2D-only legend */}
      {webglOk ? (
        <div style={{ position: 'relative', height: 260 }}>
          <Canvas
            camera={{ position: [0, 2.2, 3.5], fov: 45 }}
            dpr={[1, 2]}
            frameloop="demand"
            aria-label="3D expense category donut chart. Drag to rotate. Click a segment to filter."
          >
            <DonutScene
              segments={segments}
              total={total}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              onFilter={handleFilter}
            />
          </Canvas>
          <TooltipOverlay seg={hoveredIndex !== null ? segments[hoveredIndex] : null} total={total} />
          <p style={{ textAlign: 'center', fontSize: 11, color: '#3f5977', marginTop: 4 }}>
            Drag to rotate · Click to filter
          </p>
        </div>
      ) : null}

      {/* Always-visible accessible legend */}
      <Legend segments={segments} total={total} activeFilter={activeFilter} onFilter={handleFilter} />
    </div>
  );
};

export default CategoryDonut3D;
