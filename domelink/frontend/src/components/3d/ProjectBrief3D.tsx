import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Plane } from '@react-three/drei';
import { useEffect, useRef } from 'react';

export default function ProjectBrief3D({ plotSize = "40x60", style = "modern" }) {
  // Parse plot size (e.g., "40x60")
  const [width, length] = plotSize.split('x').map(Number);
  const boxColor = style === 'modern' ? '#4f8cff' : style === 'minimalist' ? '#e0e0e0' : '#b0a36f';

  return (
    <div style={{ width: '100%', height: 400 }}>
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={0.7} castShadow />
        <PerspectiveCamera makeDefault position={[0, 40, 80]} fov={45} />
        <OrbitControls enablePan enableZoom enableRotate />
        {/* Ground */}
        <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <meshStandardMaterial color="#e5e5e5" />
        </Plane>
        {/* Building massing */}
        <Box
          args={[width || 40, 10, length || 60]}
          position={[0, 5, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={boxColor} />
        </Box>
      </Canvas>
    </div>
  );
}
