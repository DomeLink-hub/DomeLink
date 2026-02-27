import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import gsap from "gsap";

const StudioCore = () => {
  const groupRef = useRef<Group | null>(null);
  const nodes = useMemo(
    () => [
      { position: [0, 0.2, 0], scale: [1.4, 0.3, 1] },
      { position: [0.6, 0.5, 0.4], scale: [0.5, 0.5, 0.5] },
      { position: [-0.7, 0.35, -0.4], scale: [0.45, 0.45, 0.45] },
      { position: [0.2, 0.8, -0.7], scale: [0.35, 0.35, 0.35] },
    ],
    [],
  );

  useEffect(() => {
    if (!groupRef.current) return;
    gsap.to(groupRef.current.rotation, {
      y: Math.PI * 2,
      duration: 24,
      repeat: -1,
      ease: "none",
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const targetX = state.pointer.y * 0.12;
    const targetZ = state.pointer.x * 0.12;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, index) => (
        <mesh key={index} position={node.position as [number, number, number]} scale={node.scale as [number, number, number]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#121214" : "#1c1c1f"} wireframe transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.08, 32]} />
        <meshStandardMaterial color="#0f0f10" />
      </mesh>
    </group>
  );
};

const StudioScene = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0.6, 3.2], fov: 40 }} dpr={[1, 1.6]}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 3, 2]} intensity={0.8} />
        <directionalLight position={[-3, 2, -1]} intensity={0.4} />
        <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.35}>
          <StudioCore />
        </Float>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default StudioScene;
