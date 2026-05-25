import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";

const HomeCore = () => {
  const groupRef = useRef<Group | null>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const targetX = state.pointer.y * 0.1;
    const targetY = state.pointer.x * 0.16;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.02;
    groupRef.current.rotation.y += 0.002;
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.8, 0.6, 1.2]} />
        <meshStandardMaterial color="#151517" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.9]} />
        <meshStandardMaterial color="#1e1e22" roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI * 0.25, 0]}>
        <coneGeometry args={[0.9, 0.55, 4]} />
        <meshStandardMaterial color="#0f0f11" roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[-0.7, 0.2, 0.4]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#202025" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0.7, 0.2, -0.35]}>
        <boxGeometry args={[0.5, 0.35, 0.45]} />
        <meshStandardMaterial color="#202025" roughness={0.45} metalness={0.2} />
      </mesh>
    </group>
  );
};

const HomeHeroModel = ({ className }: { className?: string }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (isMobile) {
    return (
      <div className={className}>
        <div className="h-full w-full rounded-3xl bg-gradient-to-br from-white/80 via-white/40 to-transparent border border-white/20 backdrop-blur-sm" />
      </div>
    );
  }

  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 1.1, 3.6], fov: 36 }} dpr={[1, 1.4]}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 2]} intensity={0.9} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        <spotLight position={[0, 4, 3]} intensity={0.35} angle={0.4} penumbra={0.7} />
        <Float speed={0.7} rotationIntensity={0.2} floatIntensity={0.35}>
          <HomeCore />
        </Float>
        <ContactShadows position={[0, -0.6, 0]} opacity={0.5} scale={6} blur={2.4} far={4} />
      </Canvas>
    </div>
  );
};

export default HomeHeroModel;
