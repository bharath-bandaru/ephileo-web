'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Rocket() {
  const groupRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Gentle floating motion
      groupRef.current.position.y = -25 + Math.sin(time * 0.5) * 0.5;
      groupRef.current.rotation.z = Math.sin(time * 0.3) * 0.05;
    }

    if (flameRef.current) {
      // Flame flickering
      const scale = 1 + Math.sin(time * 15) * 0.1 + Math.sin(time * 23) * 0.05;
      flameRef.current.scale.y = scale;
    }
  });

  return (
    <group ref={groupRef} position={[-25, -25, -40]} rotation={[0.1, 0.3, 0.15]}>
      {/* === ROCKET BODY === */}
      {/* Main body - wireframe cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 2.5, 16]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.6} />
      </mesh>

      {/* Inner core glow */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 2.4, 16]} />
        <meshBasicMaterial color="#1e40af" transparent opacity={0.3} />
      </mesh>

      {/* === NOSE CONE === */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[0.4, 1, 16]} />
        <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.7} />
      </mesh>

      {/* Nose cone inner */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[0.35, 0.95, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
      </mesh>

      {/* Nose tip glow */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#22d3ee" />
      </mesh>

      {/* === FINS === */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI * 2) / 4;
        return (
          <group key={`fin-${i}`} rotation={[0, angle, 0]}>
            <mesh position={[0.5, -1, 0]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.5, 0.8, 0.05]} />
              <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.6} />
            </mesh>
            {/* Fin edge glow */}
            <mesh position={[0.7, -1.2, 0]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshBasicMaterial color="#22d3ee" />
            </mesh>
          </group>
        );
      })}

      {/* === ENGINE SECTION === */}
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 0.3, 16]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.5} />
      </mesh>

      {/* Engine nozzle */}
      <mesh position={[0, -1.7, 0]}>
        <coneGeometry args={[0.4, 0.5, 16, 1, true]} />
        <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* === EXHAUST FLAME === */}
      <group ref={flameRef} position={[0, -2.2, 0]}>
        {/* Outer flame */}
        <mesh>
          <coneGeometry args={[0.35, 1.2, 12]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Middle flame */}
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.25, 0.9, 12]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.4} />
        </mesh>

        {/* Inner flame core */}
        <mesh position={[0, 0.2, 0]}>
          <coneGeometry args={[0.15, 0.6, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* === DETAIL RINGS === */}
      {[-0.5, 0.3, 1].map((y, i) => (
        <mesh key={`ring-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42 + i * 0.02, 0.02, 8, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* === WINDOW/PORTHOLE === */}
      <mesh position={[0, 0.5, 0.42]}>
        <circleGeometry args={[0.15, 16]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.5, 0.43]}>
        <ringGeometry args={[0.12, 0.16, 16]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
      </mesh>

      {/* === HOLOGRAPHIC GLOW === */}
      <mesh scale={1.3}>
        <cylinderGeometry args={[0.5, 0.6, 3, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Ambient point light for glow effect */}
      <pointLight position={[0, 0, 0]} color="#3b82f6" intensity={0.5} distance={5} />
    </group>
  );
}
