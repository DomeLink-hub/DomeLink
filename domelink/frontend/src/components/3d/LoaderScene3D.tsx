import { useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

const DomeMesh = () => {
  const [mesh, setMesh] = useState<Mesh | null>(null);

  useFrame((_state, delta) => {
    if (!mesh) return;
    mesh.rotation.x += delta * 0.25;
    mesh.rotation.y += delta * 0.35;
  });

  return (
    <mesh ref={setMesh}>
      <icosahedronGeometry args={[0.9, 1]} />
      <meshStandardMaterial color="#101011" wireframe transparent opacity={0.9} />
    </mesh>
  );
};

const LoaderScene3D = () => {
  return (
    <div className="h-40 w-40">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 2, 2]} intensity={0.6} />
        <DomeMesh />
      </Canvas>
    </div>
  );
};

export default LoaderScene3D;
