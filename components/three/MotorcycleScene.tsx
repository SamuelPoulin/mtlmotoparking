"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls, useCursor, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import type { Group } from "three";

function MotorcycleModel() {
  const { scene } = useGLTF("/motorcycle.glb");
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useCursor(hovered);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4; // rotation speed
    }
  });

  return (
    <group
      ref={groupRef}
      rotation={[0, 90, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Center>
        <primitive object={scene} scale={1} />
      </Center>
    </group>
  );
}

export default function MotorcycleScene() {
  return (
    <Canvas
      gl={{ antialias: true }}
      camera={{ position: [0, 50, 200], fov: 45 }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <MotorcycleModel />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
