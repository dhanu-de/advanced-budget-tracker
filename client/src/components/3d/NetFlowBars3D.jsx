import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import {
  buildMonthlyTimeline,
  buildWeeklyTimeline,
  filterByRange,
} from '../../services/transactionSelectors';
import CumulativeNetFlowGraph from '../charts/NetFlowGraph';
import Skeleton3D from './Skeleton3D';

const GREEN = '#22d3a0';
const RED   = '#f05b7c';
const GRID  = '#1a2d47';

// ── Single animated bar ───────────────────────────────────────────────────────
function AnimatedBar({ x, targetHeight, color, label, width = 0.28, onHover }) {
  const ref    = useRef();
  const matRef = useRef();
  const h      = useRef(0);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!ref.current) return;
    // Grow-in animation
    h.current = THREE.MathUtils.lerp(h.current, targetHeight, reduced ? 1 : delta * 3);
    ref.current.scale.y = Math.max(h.current / (targetHeight || 0.001), 0.001);
    ref.current.position.y = h.current / 2;
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh
        ref={ref}
        onPointerOver={e => { e.stopPropagation(); onHover(true); }}
        onPointerOut={()  => onHover(false)}
      >
        <boxGeometry args={[width, 1, width * 0.8]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      {/* Axis label */}
      <Text
        position={[0, -0.28, 0]}
        fontSize={0.12}
        color="#3f5977"
        anchorX="center"
        anchorY="top"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>
    </group>
  );
}

// ── Bars scene ────────────────────────────────────────────────────────────────
function BarsScene({ buckets, maxVal }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const spacing = 0.75;
  const totalW  = (buckets.length - 1) * spacing;
  const startX  = -totalW / 2;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 6, 4]}  color="#5b6ff0" intensity={8}  distance={20} />
      <pointLight position={[-4, 2, 3]} color="#9b7bf0" intensity={3}  distance={12} />

      {/* Grid floor */}
      <gridHelper args={[totalW + 2, buckets.length + 1, GRID, GRID]} position={[0, 0, 0]} />

      {buckets.map((b, i) => {
        const incomeH  = maxVal > 0 ? (b.income  / maxVal) * 2.5 : 0.001;
        const expenseH = maxVal > 0 ? (b.expense / maxVal) * 2.5 : 0.001;
        const xCenter  = startX + i * spacing;

        return (
          <group key={b.key}>
            {/* Income bar (offset left) */}
            <AnimatedBar
              x={xCenter - 0.16}
              targetHeight={incomeH}
              color={GREEN}
              label={i % Math.max(1, Math.floor(buckets.length / 6)) === 0 ? b.label : ''}
              width={0.22}
              onHover={(on) => setHoveredIdx(on ? i : null)}
            />
            {/* Expense bar (offset right) */}
            <AnimatedBar
              x={xCenter + 0.16}
              targetHeight={expenseH}
              color={RED}
              label=""
              width={0.22}
              onHover={(on) => setHoveredIdx(on ? i : null)}
            />
          </group>
        );
      })}

      {/* Hover info via Html is expensive; we show tooltip in overlay instead */}
    </>
  );
}

// ── Tooltip overlay ───────────────────────────────────────────────────────────
function HoverTooltip({ bucket }) {
  if (!bucket) return null;
  const net = bucket.income - bucket.expense;
  return (
    <div style={{
      position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
      background: '#0d1526', border: '1px solid #233d5e', borderRadius: 10,
      padding: '8px 14px', zIndex: 5, whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#dce8f5', marginBottom: 4 }}>{bucket.label}</p>
      <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
        <span style={{ color: '#22d3a0' }}>↑ ₹{bucket.income.toLocaleString('en-IN')}</span>
        <span style={{ color: '#f05b7c' }}>↓ ₹{bucket.expense.toLocaleString('en-IN')}</span>
        <span style={{ color: net >= 0 ? '#22d3a0' : '#f05b7c', fontWeight: 700 }}>
          {net >= 0 ? '+' : '−'}₹{Math.abs(net).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}

// ── Range selector ────────────────────────────────────────────────────────────
const RANGES = ['7D', '30D', '90D', '1Y'];
function RangeSelector({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
      {RANGES.map(r => (
        <button
          key={r}
          onClick={() => onChange(r)}
          style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: `1.5px solid ${active === r ? '#5b6ff0' : '#1a2d47'}`,
            background: active === r ? 'rgba(91,111,240,0.15)' : 'transparent',
            color: active === r ? '#5b6ff0' : '#3f5977',
            transition: 'all .15s',
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
const NetFlowBars3D = ({ transactions = [], categories = [] }) => {
  const [range,   setRange]   = useState('30D');
  const [use3D,   setUse3D]   = useState(true);
  const [hovered, setHovered] = useState(null);
  const { supported: webglOk, checked } = useWebGLSupport();
  const reduced = useReducedMotion();

  const buckets = useMemo(() => {
    const filtered = filterByRange(transactions, range);
    if (range === '7D') return buildWeeklyTimeline(filtered, categories, 7);
    if (range === '30D') return buildWeeklyTimeline(filtered, categories, 30);
    return buildMonthlyTimeline(filtered, categories);
  }, [transactions, categories, range]);

  const maxVal = useMemo(() => Math.max(...buckets.map(b => Math.max(b.income, b.expense)), 1), [buckets]);

  if (!checked) return <Skeleton3D height={280} />;

  const show3D = webglOk && use3D && !reduced;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <RangeSelector active={range} onChange={setRange} />
        {webglOk && (
          <button
            onClick={() => setUse3D(p => !p)}
            style={{ fontSize: 11, color: '#3f5977', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
          >
            {use3D ? '2D view' : '3D view'}
          </button>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: GREEN, display: 'inline-block' }} />Income</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: RED, display: 'inline-block' }} />Expenses</span>
      </div>

      {show3D ? (
        <div style={{ position: 'relative', height: 260 }}>
          <HoverTooltip bucket={hovered} />
          {buckets.length > 0 ? (
            <Canvas
              camera={{ position: [0, 3, 5.5], fov: 50 }}
              dpr={[1, 2]}
              frameloop="demand"
              aria-label="3D bar chart showing income and expenses over time"
            >
              <BarsScene buckets={buckets} maxVal={maxVal} />
            </Canvas>
          ) : (
            <p style={{ textAlign: 'center', color: '#3f5977', paddingTop: '5rem', fontSize: 13 }}>
              No data for this range
            </p>
          )}
        </div>
      ) : (
        /* 2D fallback */
        <CumulativeNetFlowGraph transactions={transactions} categories={categories} />
      )}
    </div>
  );
};

export default NetFlowBars3D;
