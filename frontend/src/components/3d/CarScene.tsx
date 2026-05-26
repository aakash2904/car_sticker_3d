'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

function CarModel() {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.008;
  });

  // Materials
  const body    = new THREE.MeshStandardMaterial({ color: '#2563eb', metalness: 0.7, roughness: 0.2 });
  const glass   = new THREE.MeshStandardMaterial({ color: '#1e3a5f', metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.8 });
  const chrome  = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 1.0, roughness: 0.05 });
  const rubber  = new THREE.MeshStandardMaterial({ color: '#1e1e2e', metalness: 0.0, roughness: 0.9 });
  const rim     = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.95, roughness: 0.1 });
  const light_f = new THREE.MeshStandardMaterial({ color: '#fef9c3', emissive: '#fde047', emissiveIntensity: 1.5 });
  const light_r = new THREE.MeshStandardMaterial({ color: '#fecaca', emissive: '#ef4444', emissiveIntensity: 1.2 });
  const dark    = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.4, roughness: 0.6 });

  return (
    <group ref={group}>
      {/* Main body */}
      <mesh material={body} castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[3.8, 0.6, 1.6]} />
      </mesh>
      {/* Cabin */}
      <mesh material={body} castShadow position={[0.1, 0.62, 0]}>
        <boxGeometry args={[2.2, 0.5, 1.48]} />
      </mesh>
      {/* Roof */}
      <mesh material={body} castShadow position={[0.05, 0.92, 0]}>
        <boxGeometry args={[2.0, 0.08, 1.42]} />
      </mesh>
      {/* Windshield */}
      <mesh material={glass} position={[1.18, 0.64, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.05, 0.52, 1.38]} />
      </mesh>
      {/* Rear glass */}
      <mesh material={glass} position={[-1.08, 0.64, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.05, 0.52, 1.38]} />
      </mesh>
      {/* Side windows */}
      <mesh material={glass} position={[0.22, 0.64, 0.76]}>
        <boxGeometry args={[1.6, 0.44, 0.04]} />
      </mesh>
      <mesh material={glass} position={[0.22, 0.64, -0.76]}>
        <boxGeometry args={[1.6, 0.44, 0.04]} />
      </mesh>
      {/* Hood */}
      <mesh material={body} castShadow position={[1.72, 0.44, 0]}>
        <boxGeometry args={[1.16, 0.06, 1.54]} />
      </mesh>
      {/* Front bumper */}
      <mesh material={dark} position={[1.96, -0.04, 0]}>
        <boxGeometry args={[0.08, 0.3, 1.52]} />
      </mesh>
      {/* Rear bumper */}
      <mesh material={dark} position={[-1.96, -0.04, 0]}>
        <boxGeometry args={[0.08, 0.3, 1.52]} />
      </mesh>
      {/* Front headlights */}
      <mesh material={light_f} position={[1.97, 0.14, 0.56]}>
        <boxGeometry args={[0.06, 0.14, 0.36]} />
      </mesh>
      <mesh material={light_f} position={[1.97, 0.14, -0.56]}>
        <boxGeometry args={[0.06, 0.14, 0.36]} />
      </mesh>
      {/* DRL strips */}
      <mesh material={new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#e0f2fe', emissiveIntensity: 2 })} position={[1.98, 0.32, 0]}>
        <boxGeometry args={[0.04, 0.04, 1.2]} />
      </mesh>
      {/* Tail lights */}
      <mesh material={light_r} position={[-1.97, 0.14, 0.56]}>
        <boxGeometry args={[0.06, 0.14, 0.36]} />
      </mesh>
      <mesh material={light_r} position={[-1.97, 0.14, -0.56]}>
        <boxGeometry args={[0.06, 0.14, 0.36]} />
      </mesh>
      {/* Tail strip */}
      <mesh material={new THREE.MeshStandardMaterial({ color: '#fca5a5', emissive: '#ef4444', emissiveIntensity: 1.5 })} position={[-1.98, 0.32, 0]}>
        <boxGeometry args={[0.04, 0.04, 1.2]} />
      </mesh>
      {/* Side skirts */}
      <mesh material={dark} position={[0, -0.18, 0.82]}>
        <boxGeometry args={[3.4, 0.1, 0.06]} />
      </mesh>
      <mesh material={dark} position={[0, -0.18, -0.82]}>
        <boxGeometry args={[3.4, 0.1, 0.06]} />
      </mesh>
      {/* Door lines */}
      <mesh material={chrome} position={[0.18, 0.08, 0.82]}>
        <boxGeometry args={[0.02, 0.06, 0.06]} />
      </mesh>
      <mesh material={chrome} position={[0.18, 0.08, -0.82]}>
        <boxGeometry args={[0.02, 0.06, 0.06]} />
      </mesh>
      {/* Wheels */}
      {([
        [1.1, -0.32, 0.9],
        [1.1, -0.32, -0.9],
        [-1.1, -0.32, 0.9],
        [-1.1, -0.32, -0.9],
      ] as [number, number, number][]).map((pos, i) => (
        <Wheel key={i} position={pos} rubber={rubber} rim={rim} chrome={chrome} />
      ))}
      {/* Underbody */}
      <mesh material={dark} position={[0, -0.26, 0]}>
        <boxGeometry args={[3.6, 0.06, 1.5]} />
      </mesh>
      {/* Light contributions */}
      <pointLight position={[2, 0.2, 0]} color="#fde047" intensity={0.8} distance={2} />
      <pointLight position={[-2, 0.2, 0]} color="#ef4444" intensity={0.6} distance={2} />
    </group>
  );
}

function Wheel({ position, rubber, rim, chrome }: {
  position: [number, number, number];
  rubber: THREE.Material; rim: THREE.Material; chrome: THREE.Material;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.x += 0.04; });
  return (
    <group ref={ref} position={position}>
      <mesh material={rubber} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.11, 16, 40]} />
      </mesh>
      <mesh material={rim} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.05, 20]} />
      </mesh>
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} material={rim} rotation={[Math.PI / 2, (i * Math.PI * 2) / 5, 0]}>
          <boxGeometry args={[0.03, 0.16, 0.04]} />
        </mesh>
      ))}
      <mesh material={chrome} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.07, 12]} />
      </mesh>
    </group>
  );
}

export function CarScene({ className = '', height = '420px' }: { className?: string; height?: string }) {
  return (
    <div className={className} style={{ height }}>
      <Canvas
        camera={{ position: [0, 1.5, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        shadows
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 4]} intensity={1.8} castShadow color="#ffffff" />
        <directionalLight position={[-4, 3, -3]} intensity={0.6} color="#dbeafe" />
        <pointLight position={[0, 4, 0]} intensity={0.4} />
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.4}>
          <CarModel />
        </Float>
        <ContactShadows opacity={0.4} scale={12} blur={2} far={3} position={[0, -0.58, 0]} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
