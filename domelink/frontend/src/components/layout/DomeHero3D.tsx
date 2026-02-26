import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { Environment, OrbitControls, SoftShadows } from '@react-three/drei';
import { useMediaQuery } from 'react-responsive';
import { motion } from 'framer-motion';

function FloatingShapes() {
  // Memoize geometry/material for perf
  const shapes = useMemo(() => [
    { position: [0, 0, 0] as [number, number, number], color: '#fff', type: 'box', scale: [1.2, 1.2, 1.2] as [number, number, number], rotation: [0.2, 0.4, 0] as [number, number, number] },
    { position: [-2, 1.2, -1] as [number, number, number], color: '#e0e0e0', type: 'sphere', scale: [0.8, 0.8, 0.8] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    { position: [2, -1, 1] as [number, number, number], color: '#bdbdbd', type: 'cylinder', scale: [0.7, 1.1, 0.7] as [number, number, number], rotation: [0.1, 0.2, 0.3] as [number, number, number] },
  ], []);
  return (
    <group>
      {shapes.map((s, i) => {
        if (s.type === 'box')
          return <mesh key={i} position={s.position as [number, number, number]} scale={s.scale as [number, number, number]} rotation={s.rotation as [number, number, number]} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={s.color} roughness={0.3} metalness={0.2} />
          </mesh>;
        if (s.type === 'sphere')
          return <mesh key={i} position={s.position as [number, number, number]} scale={s.scale as [number, number, number]} rotation={s.rotation as [number, number, number]} castShadow receiveShadow>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial color={s.color} roughness={0.2} metalness={0.3} />
          </mesh>;
        if (s.type === 'cylinder')
          return <mesh key={i} position={s.position as [number, number, number]} scale={s.scale as [number, number, number]} rotation={s.rotation as [number, number, number]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.5, 1.2, 32]} />
            <meshStandardMaterial color={s.color} roughness={0.25} metalness={0.25} />
          </mesh>;
        return null;
      })}
    </group>
  );
}

import { memo } from 'react';

const DomeHero3D = memo(function DomeHero3D() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      aria-hidden
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        frameloop={isMobile ? 'demand' : 'always'}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[5, 10, 7]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />
          <SoftShadows size={20} samples={16} focus={0.95} />
          <FloatingShapes />
          <Environment preset="city" background={false} />
        </Suspense>
        {!isMobile && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />} 
      </Canvas>
    </motion.div>
  );
});
export default DomeHero3D;
