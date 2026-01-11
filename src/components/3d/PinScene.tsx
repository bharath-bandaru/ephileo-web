'use client';

import { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Text, Html } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import * as THREE from 'three';
import Building from './Building';
import { projects } from '@/lib/projects';

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

// Ground plane with grid pattern
function Ground() {
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#05080a" />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[50, 50, '#0f3c46', '#0f3c46']}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}

// Decorative smaller buildings in background
function BackgroundBuildings() {
  const buildings = useMemo(() => {
    const list: { pos: [number, number, number]; height: number; color: string }[] = [];
    const colors = ['#0f3c46', '#162029', '#1f2f38', '#3a2a12'];

    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 12;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 0.5 + Math.random() * 2;

      // Only add buildings on the far side of the road (z < -2) and plaza (z > 9.5)
      if (z < -2 || z > 9.5) {
        list.push({
          pos: [x, 0, z],
          height,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    return list;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.pos[0], b.height / 2, b.pos[2]]} castShadow>
          <boxGeometry args={[0.4 + Math.random() * 0.3, b.height, 0.4 + Math.random() * 0.3]} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}
    </group>
  );
}

// Animated clouds
function Clouds() {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    const list: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 8; i++) {
      list.push({
        pos: [
          -15 + Math.random() * 30,
          6 + Math.random() * 3,
          -15 + Math.random() * 30
        ],
        scale: 0.5 + Math.random() * 1
      });
    }
    return list;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 2;
    }
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <group key={i} position={cloud.pos} scale={cloud.scale}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.4, -0.1, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-0.4, -0.1, 0]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Snow particles
function Snow() {
  const count = 500;
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const swayOffsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velocities[i] = 0.02 + Math.random() * 0.03;
      swayOffsets[i] = Math.random() * Math.PI * 2;
    }

    return { positions, velocities, swayOffsets };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Fall down
      positions[i3 + 1] -= particles.velocities[i];

      // Sway side to side
      positions[i3] += Math.sin(state.clock.elapsedTime + particles.swayOffsets[i]) * 0.01;
      positions[i3 + 2] += Math.cos(state.clock.elapsedTime * 0.5 + particles.swayOffsets[i]) * 0.01;

      // Reset when below ground
      if (positions[i3 + 1] < 0) {
        positions[i3 + 1] = 20;
        positions[i3] = (Math.random() - 0.5) * 40;
        positions[i3 + 2] = (Math.random() - 0.5) * 40;
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));
    return geo;
  }, [particles.positions]);

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Realistic fire with billboarded sprites
function Fire({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const count = 40;
  const particlesRef = useRef<THREE.Group>(null);

  const particleData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        position[0] + (Math.random() - 0.5) * 0.15,
        position[1],
        position[2] + (Math.random() - 0.5) * 0.15
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.015,
        0.02 + Math.random() * 0.025,
        (Math.random() - 0.5) * 0.015
      ),
      life: Math.random(),
      maxLife: 0.5 + Math.random() * 0.3,
      size: 0.08 + Math.random() * 0.12,
      spinSpeed: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * Math.PI * 2,
    }));
  }, [position]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    particlesRef.current.children.forEach((child, i) => {
      const sprite = child as THREE.Sprite;
      const data = particleData[i];

      // Update position
      data.position.add(data.velocity.clone().multiplyScalar(delta * 60));

      // Add wind turbulence
      const turbulence = Math.sin(state.clock.elapsedTime * 3 + i) * 0.01;
      data.position.x += turbulence * delta * 60;
      data.position.z += Math.cos(state.clock.elapsedTime * 2 + i) * 0.008 * delta * 60;

      // Slow down as particle rises
      data.velocity.y *= 0.98;

      // Update life
      data.life += delta * 1.5;

      // Rotation
      data.rotation += data.spinSpeed * delta;

      const lifeRatio = data.life / data.maxLife;

      if (data.life >= data.maxLife) {
        // Reset particle
        data.position.set(
          position[0] + (Math.random() - 0.5) * 0.15,
          position[1],
          position[2] + (Math.random() - 0.5) * 0.15
        );
        data.velocity.set(
          (Math.random() - 0.5) * 0.015,
          0.02 + Math.random() * 0.025,
          (Math.random() - 0.5) * 0.015
        );
        data.life = 0;
        data.rotation = Math.random() * Math.PI * 2;
      }

      // Update sprite
      sprite.position.copy(data.position);
      sprite.rotation.z = data.rotation;

      // Color transition: dark red -> bright orange -> yellow -> transparent
      const material = sprite.material as THREE.SpriteMaterial;
      if (lifeRatio < 0.2) {
        // Base of fire - bright orange/yellow
        material.color.setRGB(1, 0.8, 0.2);
        material.opacity = 0.9;
      } else if (lifeRatio < 0.5) {
        // Middle - orange
        material.color.setRGB(1, 0.5, 0.1);
        material.opacity = 0.8;
      } else if (lifeRatio < 0.8) {
        // Upper - red/orange
        material.color.setRGB(1, 0.3, 0.05);
        material.opacity = 0.6 * (1 - (lifeRatio - 0.5) / 0.3);
      } else {
        // Top - dark red, fading out
        material.color.setRGB(0.8, 0.2, 0.1);
        material.opacity = 0.4 * (1 - (lifeRatio - 0.8) / 0.2);
      }

      // Scale grows then shrinks
      const scale = data.size * (1 + Math.sin(lifeRatio * Math.PI) * 0.5);
      sprite.scale.set(scale, scale, 1);
    });
  });

  return (
    <group ref={particlesRef} scale={scale}>
      {particleData.map((_, i) => (
        <sprite key={i}>
          <spriteMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}

// Detailed person figure
function Person({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Legs */}
      <mesh position={[0.02, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.3, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[-0.02, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.3, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.07, 0.2, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Arms */}
      <mesh position={[0.1, 0.38, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[-0.1, 0.38, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Hands */}
      <mesh position={[0.13, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#ffd0b0" roughness={0.9} />
      </mesh>
      <mesh position={[-0.13, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#ffd0b0" roughness={0.9} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 8]} />
        <meshStandardMaterial color="#ffd0b0" roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffd0b0" roughness={0.9} />
      </mesh>
      {/* Hat/beanie */}
      <mesh position={[0, 0.63, 0]} castShadow>
        <sphereGeometry args={[0.085, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} />
      </mesh>
    </group>
  );
}

// Small dog companion with animation
function Dog({ position }: { position: [number, number, number] }) {
  const tailRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Tail wagging
    if (tailRef.current) {
      const wagSpeed = 4;
      const wagAmount = 0.4;
      tailRef.current.rotation.z = Math.PI / 4 + Math.sin(state.clock.elapsedTime * wagSpeed) * wagAmount;
    }

    // Subtle head bobbing
    if (headRef.current) {
      const bobSpeed = 2;
      const bobAmount = 0.01;
      headRef.current.position.y = Math.sin(state.clock.elapsedTime * bobSpeed) * bobAmount;
    }

    // Very subtle body breathing
    if (bodyRef.current) {
      const breathSpeed = 1.5;
      const breathAmount = 0.005;
      const scale = 1 + Math.sin(state.clock.elapsedTime * breathSpeed) * breathAmount;
      bodyRef.current.scale.set(scale, 1, scale);
    }
  });

  return (
    <group position={position}>
      {/* Body with breathing animation */}
      <group ref={bodyRef}>
        <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.15, 12]} />
          <meshStandardMaterial color="#8b6f47" roughness={0.9} />
        </mesh>
      </group>

      {/* Head with bobbing animation */}
      <group ref={headRef}>
        <mesh position={[0.08, 0.12, 0]} castShadow>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#8b6f47" roughness={0.9} />
        </mesh>
        {/* Snout */}
        <mesh position={[0.11, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#6b5437" roughness={0.8} />
        </mesh>
        {/* Nose */}
        <mesh position={[0.125, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.09, 0.13, -0.025]} castShadow>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.09, 0.13, 0.025]} castShadow>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Ears */}
        <mesh position={[0.08, 0.15, -0.03]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#7b5f37" roughness={0.9} />
        </mesh>
        <mesh position={[0.08, 0.15, 0.03]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#7b5f37" roughness={0.9} />
        </mesh>
      </group>

      {/* Tail with wagging animation */}
      <mesh ref={tailRef} position={[-0.08, 0.12, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.08, 8]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.9} />
      </mesh>

      {/* Legs */}
      <mesh position={[0.04, 0.04, -0.03]} castShadow>
        <cylinderGeometry args={[0.015, 0.018, 0.08, 8]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.9} />
      </mesh>
      <mesh position={[0.04, 0.04, 0.03]} castShadow>
        <cylinderGeometry args={[0.015, 0.018, 0.08, 8]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.9} />
      </mesh>
      <mesh position={[-0.04, 0.04, -0.03]} castShadow>
        <cylinderGeometry args={[0.015, 0.018, 0.08, 8]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.9} />
      </mesh>
      <mesh position={[-0.04, 0.04, 0.03]} castShadow>
        <cylinderGeometry args={[0.015, 0.018, 0.08, 8]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.9} />
      </mesh>
      {/* Paws */}
      <mesh position={[0.04, 0.005, -0.03]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#6b5437" roughness={0.8} />
      </mesh>
      <mesh position={[0.04, 0.005, 0.03]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#6b5437" roughness={0.8} />
      </mesh>
      <mesh position={[-0.04, 0.005, -0.03]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#6b5437" roughness={0.8} />
      </mesh>
      <mesh position={[-0.04, 0.005, 0.03]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#6b5437" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Telephone Booth
function TelephoneBooth({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const [hovered, setHovered] = useState(false);
  const frameColor = hovered ? '#d10000' : '#b00000';
  const glow = hovered ? 0.45 : 0.18;

  const handleClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const glassMat = useMemo(
    () => ({
      color: '#99d6ff',
      transparent: true,
      opacity: 0.25,
      metalness: 0.6,
      roughness: 0.05,
    }),
    []
  );

  const pillarPositions: [number, number, number][] = [
    [0.18, 0.7, 0.18],
    [-0.18, 0.7, 0.18],
    [0.18, 0.7, -0.18],
    [-0.18, 0.7, -0.18],
  ];

  const doorPanePositions = useMemo(
    () => Array.from({ length: 8 }, (_, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      return [
        -0.07 + col * 0.14,
        0.05 - row * 0.17,
        0.011,
      ] as [number, number, number];
    }),
    []
  );

  const sidePanePositions = useMemo(
    () => [
      { pos: [0.175, 0.72, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number] },
      { pos: [-0.175, 0.72, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number] },
      { pos: [0, 0.72, -0.175] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
    ],
    []
  );

  return (
    <group position={position} rotation={rotation}>
      {/* Tooltip */}
      <group position={[0, 1.85, 0]}>
        <Tooltip visible={hovered}>Contact</Tooltip>
      </group>

      {/* Plinth */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.08, 0.44]} />
        <meshStandardMaterial color="#121212" roughness={0.85} metalness={0.35} />
      </mesh>

      {/* Invisible collider for hover/click */}
      <mesh
        position={[0, 0.75, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[0.46, 1.5, 0.46]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Corner pillars */}
      {pillarPositions.map((p, i) => (
        <mesh key={`pillar-${i}`} position={p} castShadow receiveShadow>
          <boxGeometry args={[0.06, 1.4, 0.06]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={0.35}
            metalness={0.6}
            emissive={hovered ? '#5c0000' : '#000000'}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </mesh>
      ))}

      {/* Upper fascia with glow */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <boxGeometry args={[0.44, 0.12, 0.44]} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, 1.38, 0]} castShadow>
        <sphereGeometry args={[0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.55} />
      </mesh>

      {/* Top header plates and text on all four sides */}
      {[
        { pos: [0, 1.36, 0.23], rot: [0, 0, 0] }, // front
        { pos: [0, 1.36, -0.23], rot: [0, Math.PI, 0] }, // back
        { pos: [0.23, 1.36, 0], rot: [0, -Math.PI / 2, 0] }, // right
        { pos: [-0.23, 1.36, 0], rot: [0, Math.PI / 2, 0] }, // left
      ].map((cfg, i) => (
        <group key={`header-${i}`} position={cfg.pos as [number, number, number]} rotation={cfg.rot as [number, number, number]}>
          <Text
            position={[0, -0.035, 0.001]}
            fontSize={0.06}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            material-toneMapped={false}
            outlineWidth={0.01}
            outlineColor="#0d0d0d"
          >
            TELEPHONE
          </Text>
        </group>
      ))}

      {/* TELEPHONE signs */}
      {[0.18, -0.18].map((z, i) => (
        <mesh key={`sign-${i}`} position={[0, 1.28, z]} castShadow>
          <boxGeometry args={[0.3, 0.08, 0.02]} />
          <meshStandardMaterial
            color="#f5f5f5"
            emissive="#f5f5f5"
            emissiveIntensity={glow}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}
      {[0.18, -0.18].map((x, i) => (
        <mesh key={`sign-side-${i}`} position={[x, 1.28, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.3, 0.08, 0.02]} />
          <meshStandardMaterial
            color="#f5f5f5"
            emissive="#f5f5f5"
            emissiveIntensity={glow}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Side and rear glass */}
      {sidePanePositions.map((pane, i) => (
        <group key={`side-pane-${i}`} position={pane.pos} rotation={pane.rot as [number, number, number]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 1.05, 0.015]} />
            <meshStandardMaterial {...glassMat} />
          </mesh>
          {/* Mullions */}
          {[ -0.1, 0, 0.1 ].map((x, ix) => (
            <mesh key={`mullion-x-${i}-${ix}`} position={[x, 0, 0.009]}>
              <boxGeometry args={[0.02, 1.05, 0.006]} />
              <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.6} />
            </mesh>
          ))}
          {[ -0.35, -0.18, 0, 0.18, 0.35 ].map((y, iy) => (
            <mesh key={`mullion-y-${i}-${iy}`} position={[0, y, 0.009]}>
              <boxGeometry args={[0.3, 0.015, 0.006]} />
              <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Door with grid panes */}
      <group position={[0, 0.7, 0.19]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.32, 1.2, 0.02]} />
          <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.55} />
        </mesh>
        <mesh position={[0, 0, -0.001]} castShadow>
          <boxGeometry args={[0.26, 1.04, 0.012]} />
          <meshStandardMaterial {...glassMat} />
        </mesh>
        {doorPanePositions.map((p, i) => (
          <mesh key={`door-pane-${i}`} position={p}>
            <boxGeometry args={[0.12, 0.14, 0.006]} />
            <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.55} />
          </mesh>
        ))}
        <mesh position={[0.11, 0.05, 0.03]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.08, 10]} />
          <meshStandardMaterial color="#f0d35d" roughness={0.25} metalness={0.9} />
        </mesh>
      </group>

      {/* Interior shelf and phone */}
      <group position={[0.05, 0.72, 0]}>
        <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.03, 0.16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.12]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0.1]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[-0.05, 0.05, 0]} castShadow>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0.05, 0.05, 0]} castShadow>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.08, 0.055]} castShadow>
          <boxGeometry args={[0.08, 0.015, 0.01]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.7} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          return (
            <mesh
              key={`key-${i}`}
              position={[-0.04 + col * 0.04, -0.04 - row * 0.03, 0.055]}
              castShadow
            >
              <boxGeometry args={[0.025, 0.025, 0.01]} />
              <meshStandardMaterial color="#4a4a4a" roughness={0.3} metalness={0.5} />
            </mesh>
          );
        })}
        <mesh position={[-0.02, 0.02, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.08, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
      </group>

      {/* Interior light */}
      <pointLight
        position={[0, 1.1, 0]}
        color="#ffeecc"
        intensity={hovered ? 1.2 : 0.6}
        distance={1.6}
      />
    </group>
  );
}

// Street lamps
function StreetLamps() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    update(mql);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const lamps = useMemo(() => {
    const lampArray = [];
    const xShift = isMobile ? -1 : 0;
    // Create 6 lamps on each side of the road (12 total)
    for (let i = 0; i < 6; i++) {
      const x = -20 + (i * 8) + xShift;
      // Left side of road (negative Z)
      lampArray.push({ pos: [x, 0, -1.3] as [number, number, number] });
      // Right side of road (positive Z)
      lampArray.push({ pos: [x, 0, 1.3] as [number, number, number] });
    }
    return lampArray;
  }, [isMobile]);

  return (
    <group>
      {lamps.map((lamp, i) => (
        <group key={i} position={lamp.pos}>
          {/* Pole */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 1.2, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Lamp head */}
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#ffeecc"
              emissive="#ffdd88"
              emissiveIntensity={5}
            />
          </mesh>
          {/* Light - only enable shadows on every 4th lamp to reduce texture units */}
          <pointLight
            position={[0, 1.2, 0]}
            color="#ffeecc"
            intensity={2}
            distance={5}
            castShadow={i % 4 === 0}
          />
        </group>
      ))}
    </group>
  );
}

// Road between buildings
function Road() {
  return (
    <group>
      {/* Main road - extremely long */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[80, 2]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>

      {/* Road center divider lines - running along the length */}
      {Array.from({ length: 20 }, (_, i) => i * 4 - 38).map((x, i) => (
        <mesh key={`divider-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, 0]}>
          <planeGeometry args={[2, 0.15]} />
          <meshStandardMaterial color="#f2b134" emissive="#f2b134" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// Plaza to fill space where the garden was removed
function Plaza({ onFirePitClick }: { onFirePitClick: () => void }) {
  const [deskHover, setDeskHover] = useState(false);
  const [fireHover, setFireHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tileLines = useMemo(() => {
    const lines: number[] = [];
    for (let i = -24; i <= 24; i += 2) lines.push(i);
    return lines;
  }, []);

  const [stoneRotations] = useState(() =>
    Array.from({ length: 12 }, () => [
      Math.random() * 0.3,
      Math.random() * Math.PI,
      Math.random() * 0.3
    ] as [number, number, number])
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    update(mql);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const handleHelpClick = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const deskPosition: [number, number, number] = isMobile ? [4.15, 0.12, -2.55] : [5.88, 0.12, -2.75];
  const person1Offset: [number, number, number] = [0.3, -0.12, 0.35];
  const person2Offset: [number, number, number] = [-0.25, -0.12, -0.4];
  const person1Pos: [number, number, number] = [
    deskPosition[0] + person1Offset[0],
    deskPosition[1] + person1Offset[1],
    deskPosition[2] + person1Offset[2],
  ];
  const person2Pos: [number, number, number] = [
    deskPosition[0] + person2Offset[0],
    deskPosition[1] + person2Offset[1],
    deskPosition[2] + person2Offset[2],
  ];

  return (
    <group position={[0, 0.02, 5.75]}>
      {/* Concrete pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>        
        <planeGeometry args={[50, 7.5]} />
        <meshStandardMaterial color="#1a1f26" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Subtle tile grid */}
      {tileLines.map((x, i) => (
        <mesh key={`tile-x-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.001, 0]}>
          <planeGeometry args={[0.03, 7.5]} />
          <meshStandardMaterial color="#0f3c46" />
        </mesh>
      ))}
      {tileLines.map((z, i) => (
        <mesh key={`tile-z-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, z / 3]}>
          <planeGeometry args={[50, 0.03]} />
          <meshStandardMaterial color="#0f3c46" />
        </mesh>
      ))}

      {/* Central fire pit */}
      <group
        position={[0, 0.15, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onFirePitClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setFireHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setFireHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Tooltip */}
        <group position={[0, 1.2, 0]}>
          <Tooltip visible={fireHover}>Projects</Tooltip>
        </group>

        {/* Stone base */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.65, 0.3, 24]} />
          <meshStandardMaterial
            color={fireHover ? '#13404f' : '#0f3c46'}
            roughness={0.8}
            metalness={0.2}
            emissive={fireHover ? '#0a3445' : '#000000'}
            emissiveIntensity={fireHover ? 0.18 : 0}
          />
        </mesh>

        {/* Decorative stones around the pit */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 0.55;
          return (
            <mesh
              key={`stone-${i}`}
              position={[
                Math.cos(angle) * radius,
                0.05,
                Math.sin(angle) * radius
              ]}
              rotation={stoneRotations[i]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.15, 0.1]} />
              <meshStandardMaterial color="#1f2a32" roughness={0.9} metalness={0.08} />
            </mesh>
          );
        })}

        {/* Logs in the fire */}
        <mesh position={[0.1, 0.18, 0]} rotation={[0, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
        </mesh>
        <mesh position={[-0.08, 0.18, 0.05]} rotation={[0.3, 0.5, 0.3]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.25, 8]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
        </mesh>
        <mesh position={[0.02, 0.16, -0.08]} rotation={[-0.2, -0.3, 0.1]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.28, 8]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.95} />
        </mesh>

        {/* Glowing embers under fire */}
        <mesh position={[0, 0.17, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#f2b134"
            emissive="#c07d12"
            emissiveIntensity={0.7}
            roughness={0.65}
          />
        </mesh>

        {/* Fire effect */}
        <Fire position={[0, 0.2, 0]} scale={fireHover ? 1.25 : 1} />

        {/* Orange glow light */}
        <pointLight
          position={[0, 0.5, 0]}
          color="#ff6600"
          intensity={fireHover ? 1.8 : 1.5}
          distance={4}
          castShadow
        />
        <pointLight
          position={[0, 0.25, 0]}
          color="#ff3300"
          intensity={fireHover ? 1.15 : 1}
          distance={2.5}
        />
      </group>

      {/* People around the fire */}
      <Person position={[1.2, 0, 0]} color="#3a4a7a" />
      <Person position={[-1.2, 0, 0]} color="#5a3a3a" />
      <Person position={[0, 0, 1.2]} color="#4a5a4a" />
      <Person position={[0, 0, -1.2]} color="#6a4a6a" />
      <Person position={[0.85, 0, 0.85]} color="#0f3c46" />
      <Person position={[-0.85, 0, -0.85]} color="#5a4a4a" />

      {/* Help desk beside fire pit */}
      <group position={deskPosition}>
        {/* Tooltip */}
        <group position={[0, 0.85, 0]}>
          <Tooltip visible={deskHover}>About</Tooltip>
        </group>

        {/* Table */}
        <mesh
          position={[0, 0.18, 0]}
          castShadow
          receiveShadow
          onClick={handleHelpClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setDeskHover(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setDeskHover(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <boxGeometry args={[1.1, 0.1, 0.6]} />
          <meshStandardMaterial
            color={deskHover ? '#204f60' : '#163844'}
            roughness={0.4}
            metalness={0.25}
            emissive={deskHover ? '#0b4c6d' : '#000000'}
            emissiveIntensity={deskHover ? 0.4 : 0}
          />
        </mesh>

        {/* Table legs */}
        {[[-0.5, -0.21, -0.25], [0.5, -0.21, -0.25], [-0.5, -0.21, 0.25], [0.5, -0.21, 0.25]].map((p, i) => (
          <mesh key={`leg-${i}`} position={p as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.7, 10]} />
            <meshStandardMaterial color="#0c1c24" roughness={0.6} metalness={0.2} />
          </mesh>
        ))}

        {/* Desk lamp */}
        <group position={[0.35, 0.26, 0.08]}>
          <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.03, 0.18, 10]} />
            <meshStandardMaterial color="#1d1d1d" roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.16, 0.08]} castShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#ffeecc" emissive="#ffdd99" emissiveIntensity={0.8} />
          </mesh>
          <pointLight position={[0, 0.16, 0.08]} color="#ffdba0" intensity={deskHover ? 1.8 : 1.2} distance={2} />
        </group>

        {/* Desk sign */}
        <mesh position={[-0.35, 0.24, 0]} castShadow>
          <boxGeometry args={[0.2, 0.1, 0.02]} />
          <meshStandardMaterial color="#0b4c6d" emissive={deskHover ? '#0b4c6d' : '#052736'} emissiveIntensity={deskHover ? 0.5 : 0.15} />
        </mesh>

        {/* Laptop */}
        <group position={[-0.05, 0.23, -0.05]} rotation={[0, Math.PI / 6, 0]}>
          {/* Laptop base/keyboard */}
          <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, 0.015, 0.13]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
          </mesh>

          {/* Keyboard keys */}
          {Array.from({ length: 24 }, (_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            return (
              <mesh
                key={`key-${i}`}
                position={[-0.07 + col * 0.02, 0.017, -0.05 + row * 0.02]}
                castShadow
              >
                <boxGeometry args={[0.015, 0.002, 0.015]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
              </mesh>
            );
          })}

          {/* Touchpad */}
          <mesh position={[0, 0.017, 0.04]} castShadow>
            <boxGeometry args={[0.07, 0.002, 0.05]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.4} />
          </mesh>

          {/* Laptop screen */}
          <mesh position={[0, 0.06, -0.065]} rotation={[-Math.PI / 2.8, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, 0.11, 0.01]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
          </mesh>

          {/* Screen display (glowing) */}
          <mesh position={[0, 0.06, -0.063]} rotation={[-Math.PI / 2.8, 0, 0]}>
            <boxGeometry args={[0.16, 0.09, 0.005]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={deskHover ? 1.2 : 0.8}
              roughness={0.1}
              metalness={0.05}
            />
          </mesh>

          {/* Screen light */}
          <pointLight
            position={[0, 0.07, -0.05]}
            color="#ffffff"
            intensity={deskHover ? 1.2 : 0.8}
            distance={1}
          />
        </group>
      </group>

      {/* People near help desk */}
      <Person position={person1Pos} color="#355f7a" />
      <Person position={person2Pos} color="#6d4a3a" />

      {/* Dog companion next to one person */}
      <Dog position={[1.45, 0, 0.25]} />

      {/* Telephone booth */}
      <TelephoneBooth position={isMobile ? [1.6, 0, -2.35] : [1, 0, -2.25]} rotation={[0, 0, 0]} />

      {/* Low bollards as edge definition instead of vegetation */}
      {Array.from({ length: 18 }, (_, i) => i - 9).map((i) => (
        <group key={`bollard-${i}`} position={[i * 2.5, 0, 3.6]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 12]} />
            <meshStandardMaterial color="#2b2b33" metalness={0.2} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#b0b0c0" emissive="#55556a" emissiveIntensity={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Buildings({ onBuildingClick }: { onBuildingClick: (id: string) => void }) {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    update(mql);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const buildingConfigsMobile = [
    { position: [-4, 0, -2] as [number, number, number], height: 2.2 },
    { position: [-1.65, 0, -2] as [number, number, number], height: 2.8 },
    { position: [0.5, 0, -2] as [number, number, number], height: 2.4 },
  ];

  const buildingConfigsDesktop = [
    { position: [-2.5, 0, -2] as [number, number, number], height: 2.2 },
    { position: [0, 0, -2] as [number, number, number], height: 2.8 },
    { position: [2.5, 0, -2] as [number, number, number], height: 2.4 },
  ];

  const buildingConfigs = isMobile ? buildingConfigsMobile : buildingConfigsDesktop;

  // Map project indices to building positions
  const positionMap = [1, 2, 0]; // Roamates->middle, Chain->right, Escape->left

  return (
    <>
      {projects.map((project, index) => (
        <Float
          key={project.id}
          speed={1}
          rotationIntensity={0}
          floatIntensity={0.1}
        >
          <Building
            position={buildingConfigs[positionMap[index]].position}
            height={buildingConfigs[positionMap[index]].height}
            logo={project.logo}
            color={project.color}
            onClick={() => onBuildingClick(project.id)}
            isHovered={hoveredBuilding === project.id}
            onHover={(hovered) => setHoveredBuilding(hovered ? project.id : null)}
            name={project.name}
          />
        </Float>
      ))}
    </>
  );
}

function Scene({ onBuildingClick, onFirePitClick }: { onBuildingClick: (id: string) => void; onFirePitClick: () => void }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    update(mql);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const cameraPosition: [number, number, number] = isMobile
    ? [8.620148792505306, 3.7640507683034587, 8.690509571291406]
    : [8.39287207501218, 2.3046168219937093, 9.394064063878695]; //[8, 6, 8];

  return (
    <>
      {/* Sky gradient */}
      <color attach="background" args={['#05080a']} />
      <fog attach="fog" args={['#05080a', 15, 35]} />

      {/* Isometric-style camera angle */}
      <PerspectiveCamera makeDefault position={cameraPosition} fov={40} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      {/* Moonlight from opposite side */}
      <directionalLight
        position={[-10, 10, -10]}
        intensity={0.3}
        color="#6688ff"
      />

      <Suspense fallback={null}>
        <Ground />
        <Road />
        <Plaza onFirePitClick={onFirePitClick} />
        <StreetLamps />
        <BackgroundBuildings />
        {/* Shop building on this side of the road */}
        <group position={[7, 0.5, 7.5]}>
          <mesh position={[0, 0.215, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 0.7, 1]} />
            <meshStandardMaterial color="#162029" roughness={0.8} metalness={0.2} />
          </mesh>
          {/* Roof decoration */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.1, 0.1, 1.1]} />
            <meshStandardMaterial color="#3a2a12" metalness={0.15} roughness={0.85} />
          </mesh>
        </group>
        <Clouds />
        <Snow />
        <Buildings onBuildingClick={onBuildingClick} />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
        maxAzimuthAngle={Math.PI / 3}
        minAzimuthAngle={-Math.PI / 3}
        onChange={(e) => {
          if (e?.target && 'object' in e.target) {
            const controls = e.target as { object: { position: { toArray: () => number[] } } };
            console.log('Camera position:', controls.object.position.toArray());
          }
        }}
      />
    </>
  );
}

interface PinSceneProps {
  scrollProgress: number;
}

export default function PinScene({ scrollProgress }: PinSceneProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBuildingClick = (projectId: string) => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          router.push(`/projects/${projectId}`);
        },
      });
    }
  };

  const handleFirePitClick = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#projects');
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas shadows dpr={[1, 2]}>
        <Scene onBuildingClick={handleBuildingClick} onFirePitClick={handleFirePitClick} />
      </Canvas>
    </div>
  );
}
