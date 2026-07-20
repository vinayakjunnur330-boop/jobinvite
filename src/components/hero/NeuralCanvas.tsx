import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function BrainMesh() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * 0.12 + pointer.y * 0.35;
    ref.current.rotation.y = t * 0.18 + pointer.x * 0.5;
  });
  return (
    <mesh ref={ref} scale={1.55}>
      <icosahedronGeometry args={[1, 64]} />
      <MeshDistortMaterial
        color="#8b5cf6"
        emissive="#3b1f9e"
        emissiveIntensity={0.9}
        roughness={0.15}
        metalness={0.85}
        distort={0.55}
        speed={1.6}
      />
    </mesh>
  );
}

function ParticleField({ count = 1400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.4 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.04 + pointer.x * 0.2;
    ref.current.rotation.x = pointer.y * 0.15;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#22d3ee"
        size={0.018}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function PinkOrbit({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4.4 + Math.random() * 1.6;
      const a = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.8;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, [count]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = -clock.getElapsedTime() * 0.09;
  });
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#ec4899"
        size={0.028}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function NeuralCanvas() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 6.5], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 5]} intensity={2.4} color="#a78bfa" />
      <pointLight position={[-6, -3, -4]} intensity={2.2} color="#22d3ee" />
      <pointLight position={[0, -5, 3]} intensity={1.4} color="#ec4899" />
      <BrainMesh />
      <ParticleField />
      <PinkOrbit />
    </Canvas>
  );
}
