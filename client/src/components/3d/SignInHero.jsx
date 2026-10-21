import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, MeshTransmissionMaterial, Float, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// ── Accent colour (matches --c-accent) ────────────────────────────────────────
const ACCENT = new THREE.Color('#5b6ff0');
const COIN_COLOR = new THREE.Color('#f0a533');

// ── Glass card ────────────────────────────────────────────────────────────────
function GlassCard({ mouse }) {
  const ref = useRef();
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    // Subtle tilt following pointer — lerp for smoothness
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      (mouse.current[0] / window.innerWidth  - 0.5) *  0.3,
      delta * 4
    );
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      (mouse.current[1] / window.innerHeight - 0.5) * -0.2,
      delta * 4
    );
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* Outer glow ring */}
      <mesh>
        <torusGeometry args={[1.65, 0.04, 16, 80]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.35} />
      </mesh>

      {/* Main glass card */}
      <RoundedBox args={[2.8, 1.75, 0.08]} radius={0.12} smoothness={4}>
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.2}
          roughness={0}
          transmission={0.92}
          ior={1.5}
          chromaticAberration={0.04}
          color="#8899ff"
          anisotropicBlur={0.1}
        />
      </RoundedBox>

      {/* Card stripe */}
      <mesh position={[0, 0.38, 0.05]}>
        <planeGeometry args={[2.5, 0.28]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.55} />
      </mesh>

      {/* Card dots (chip simulation) */}
      {[[-0.9, -0.28], [-0.9, 0]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.05]}>
          <boxGeometry args={[0.22, 0.16, 0.01]} />
          <meshBasicMaterial color="#f0a533" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ── Orbiting coins ────────────────────────────────────────────────────────────
function Coin({ angle, radius, speed, yOff }) {
  const ref = useRef();
  const reduced = useReducedMotion();

  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    const t = clock.getElapsedTime() * speed + angle;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t * 0.4) * 0.3 + yOff;
    ref.current.position.z = Math.sin(t) * radius * 0.6;
    ref.current.rotation.y = t * 2;
  });

  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.14, 0.14, 0.04, 24]} />
      <meshStandardMaterial
        color={COIN_COLOR}
        metalness={0.9}
        roughness={0.15}
        emissive={COIN_COLOR}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// ── Floating particles ────────────────────────────────────────────────────────
function Particles({ count = 40 }) {
  const reduced = useReducedMotion();
  const dummy   = useMemo(() => new THREE.Object3D(), []);
  const ref     = useRef();

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4,
      ],
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
    })), [count]
  );

  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0],
        p.position[1] + Math.sin(t * p.speed + p.offset) * 0.15,
        p.position[2]
      );
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshBasicMaterial color={ACCENT} transparent opacity={0.6} />
    </instancedMesh>
  );
}

// ── Scene root ────────────────────────────────────────────────────────────────
function Scene({ mouse }) {
  const coins = useMemo(() => [
    { angle: 0,              radius: 2.2, speed: 0.4,  yOff:  0.3 },
    { angle: Math.PI * 0.6,  radius: 2.0, speed: 0.35, yOff: -0.2 },
    { angle: Math.PI * 1.2,  radius: 2.4, speed: 0.45, yOff:  0.1 },
    { angle: Math.PI * 1.7,  radius: 1.9, speed: 0.38, yOff: -0.4 },
  ], []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 4, 3]}   color="#5b6ff0" intensity={6} distance={12} />
      <pointLight position={[-4, -2, 2]} color="#9b7bf0" intensity={4} distance={10} />
      <pointLight position={[0, 0, 5]}   color="#38c4f5" intensity={2} distance={8}  />

      {/* Glass card */}
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.3}>
        <GlassCard mouse={mouse} />
      </Float>

      {/* Orbiting coins */}
      {coins.map((c, i) => <Coin key={i} {...c} />)}

      {/* Background particles */}
      <Particles count={35} />
    </>
  );
}

// ── Exported component ────────────────────────────────────────────────────────
const SignInHero = () => {
  const mouse = useRef([window.innerWidth / 2, window.innerHeight / 2]);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = [e.clientX, e.clientY];
    };
    // Gyroscope for mobile
    const onOrientation = (e) => {
      if (e.gamma == null) return;
      mouse.current = [
        window.innerWidth  / 2 + e.gamma * 6,
        window.innerHeight / 2 + (e.beta - 45) * 4,
      ];
    };

    window.addEventListener('mousemove',    onMove);
    window.addEventListener('deviceorientation', onOrientation);

    // Pause/resume when tab hidden (performance)
    return () => {
      window.removeEventListener('mousemove',    onMove);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      frameloop="always"
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <Scene mouse={mouse} />
    </Canvas>
  );
};

export default SignInHero;
