'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';

// Tooltip component
function Tooltip({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  if (!visible) return null;

  return (
    <Html center>
      <div className="px-3 py-1.5 bg-black/90 text-white text-sm rounded-md whitespace-nowrap pointer-events-none backdrop-blur-sm border border-white/10">
        {children}
      </div>
    </Html>
  );
}

interface BuildingProps {
  position: [number, number, number];
  logo: string;
  color: string;
  height?: number;
  onClick: () => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  name: string;
}

export default function Building({
  position,
  logo,
  color,
  height = 2,
  onClick,
  isHovered,
  onHover,
  name
}: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [textureError, setTextureError] = useState(false);

  const texture = useLoader(
    TextureLoader,
    logo,
    undefined,
    () => setTextureError(true)
  );

  // Generate random windows pattern
  const windows = useMemo(() => {
    const windowList: { x: number; y: number; z: number; side: 'front' | 'back' | 'left' | 'right' }[] = [];
    const rows = Math.floor(height * 3); // Fewer rows
    const cols = 3; // Fewer columns

    // Use position as seed for consistent randomization
    const seed = position[0] * 100 + position[2] * 10;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Deterministic "random" based on position
        const pseudoRandom = Math.abs(Math.sin(seed + row * cols + col));
        // Most windows are lit (95%)
        if (pseudoRandom > 0.05) {
          const y = 0.3 + row * 0.3;
          const xOffset = (col - 1) * 0.22;

          // Add windows on different sides
          windowList.push({ x: xOffset, y, z: 0.41, side: 'front' });
          windowList.push({ x: xOffset, y, z: -0.41, side: 'back' });
          windowList.push({ x: 0.41, y, z: xOffset, side: 'right' });
          windowList.push({ x: -0.41, y, z: xOffset, side: 'left' });
        }
      }
    }
    return windowList;
  }, [height, position]);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle bounce on hover
      const targetY = isHovered ? position[1] + 0.15 : position[1];
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.1
      );

      // Slight rotation on hover
      const targetRotation = isHovered ? Math.sin(state.clock.elapsedTime * 2) * 0.05 : 0;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.1
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      {/* Tooltip */}
      <group position={[0, height + 1.2, 0]}>
        <Tooltip visible={isHovered}>{name}</Tooltip>
      </group>

      {/* Building base/foundation */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="#05080a" metalness={0.15} roughness={0.85} flatShading />
      </mesh>

      {/* Main building body */}
      <mesh position={[0, height / 2 + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.1}
          roughness={0.9}
          flatShading
        />
      </mesh>

      {/* Windows */}
      {windows.map((win, i) => (
        <mesh
          key={i}
          position={[win.x, win.y + 0.1, win.z]}
          rotation={[
            0,
            win.side === 'right' ? Math.PI / 2 :
            win.side === 'left' ? -Math.PI / 2 :
            win.side === 'back' ? Math.PI : 0,
            0
          ]}
        >
          <planeGeometry args={[0.14, 0.18]} />
          <meshStandardMaterial
            color="#ffffcc"
            emissive="#ffff88"
            emissiveIntensity={isHovered ? 1.5 : 0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Roof */}
      <mesh position={[0, height + 0.15, 0]} castShadow>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#0f3c46" metalness={0.15} roughness={0.85} flatShading />
      </mesh>

      {/* Billboard/Sign with logo */}
      <group position={[0, height + 0.6, 0]}>
        {/* Sign post */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Sign board */}
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.5, 0.05]} />
          <meshStandardMaterial
            color="#05080a"
            metalness={0.15}
            roughness={0.7}
            flatShading
          />
        </mesh>

        {/* Logo on sign - square aspect ratio to prevent compression */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial
            map={textureError ? undefined : texture}
            color={textureError ? '#ffffff' : '#ffffff'}
            transparent
            toneMapped={false}
          />
        </mesh>

        {/* Sign glow effect - always visible */}
        <pointLight
          position={[0, 0, 0.3]}
          color={color}
          intensity={isHovered ? 2.5 : 1.2}
          distance={2.5}
        />
      </group>

      {/* Ground highlight when hovered */}
      {isHovered && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}
