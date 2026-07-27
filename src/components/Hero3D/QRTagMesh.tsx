import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface QRTagMeshProps {
  position: [number, number, number];
  scale?: number;
  color: string;
  speed?: number;
  rotationSpeed?: number;
}

// Procedurally draws a QR-like pattern onto a canvas and uses it as a texture,
// so the 3D tags look like real QR tags without needing any external image assets.
function generateQrTexture(color: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const cells = 12;
  const cellSize = size / (cells + 4);
  const offset = cellSize * 2;
  ctx.fillStyle = color;

  const rng = (seed: number) => {
    const x = Math.sin(seed * 999) * 10000;
    return x - Math.floor(x);
  };

  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const isFinder =
        (row < 3 && col < 3) || (row < 3 && col >= cells - 3) || (row >= cells - 3 && col < 3);
      const filled = isFinder ? (row === 1 && col === 1 ? false : true) : rng(row * cells + col) > 0.55;
      if (filled) {
        ctx.fillRect(offset + col * cellSize, offset + row * cellSize, cellSize * 0.92, cellSize * 0.92);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const QRTagMesh: React.FC<QRTagMeshProps> = ({ position, scale = 1, color, speed = 1, rotationSpeed = 0.3 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => generateQrTexture(color), [color]);
  const startY = position[1];
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = startY + Math.sin(t * speed + phase) * 0.3;
    meshRef.current.rotation.y = t * rotationSpeed;
    meshRef.current.rotation.x = Math.sin(t * speed * 0.5) * 0.15;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 0.08]} />
      <meshStandardMaterial map={texture} roughness={0.4} metalness={0.1} />
    </mesh>
  );
};

export default QRTagMesh;
