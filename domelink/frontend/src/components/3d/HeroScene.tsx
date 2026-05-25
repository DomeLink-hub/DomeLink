import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import type { Group } from "three";

const BuildingMass = () => {
  const groupRef = useRef<Group | null>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const targetX = state.pointer.y * 0.08;
    const targetY = state.pointer.x * 0.18;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.08;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.08;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.25) * 0.015;
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.55, 0.95]} />
        <meshStandardMaterial color="#0f0f10" wireframe transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[1, 0.45, 0.7]} />
        <meshStandardMaterial color="#141416" wireframe transparent opacity={0.86} />
      </mesh>
      <mesh position={[0.48, 0.24, 0.24]}>
        <boxGeometry args={[0.34, 0.34, 0.34]} />
        <meshStandardMaterial color="#171719" wireframe transparent opacity={0.82} />
      </mesh>
      <mesh position={[-0.54, 0.16, -0.2]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#171719" wireframe transparent opacity={0.78} />
      </mesh>
    </group>
  );
};

const HeroScene = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0.25, 4], fov: 34 }} dpr={[1, 1.6]}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 3, 2]} intensity={0.7} />
        <directionalLight position={[-2, 1, -1]} intensity={0.35} />
        <Float speed={0.5} rotationIntensity={0.25} floatIntensity={0.28}>
          <BuildingMass />
        </Float>
        <Environment preset="city" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-transparent" />
    </div>
  );
};

export default HeroScene;
