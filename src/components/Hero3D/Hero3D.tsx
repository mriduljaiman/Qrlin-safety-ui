import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import QRTagMesh from './QRTagMesh';
import styles from './Hero3D.module.css';

const TAG_COLORS = ['#667eea', '#764ba2', '#0ea5e9', '#f97316', '#16a34a'];

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a5b4fc" transparent opacity={0.5} />
    </points>
  );
}

function CameraRig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const TAG_POSITIONS: [number, number, number][] = [
  [-2.2, 0.6, 0],
  [2.1, -0.4, -1],
  [0.2, 1.3, -1.5],
  [-1.3, -1.2, -0.8],
  [2.4, 1.1, -2],
];

const Hero3D: React.FC = () => {
  return (
    <div className={styles.canvasWrapper}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <pointLight position={[-4, -2, 2]} intensity={0.4} color="#764ba2" />
        <Suspense fallback={null}>
          {TAG_POSITIONS.map((pos, i) => (
            <QRTagMesh
              key={i}
              position={pos}
              scale={1.1 - i * 0.08}
              color={TAG_COLORS[i % TAG_COLORS.length]}
              speed={0.6 + i * 0.15}
              rotationSpeed={0.25 + i * 0.05}
            />
          ))}
          <ParticleField />
        </Suspense>
        <CameraRig />
      </Canvas>
    </div>
  );
};

export default Hero3D;
