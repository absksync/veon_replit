import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import useVeonStore from '../store/useVeonStore';

// Emotion color mapping
const emotionColors = {
  joy: '#FFD700',
  happy: '#FFD700',
  love: '#FF69B4',
  surprise: '#FF6347',
  anger: '#FF0000',
  fear: '#8B008B',
  sadness: '#4169E1',
  neutral: '#87CEEB',
  disgust: '#228B22',
};

function GlowingSphere() {
  const meshRef = useRef();
  const glowRef = useRef();
  const { currentEmotion, emotionConfidence } = useVeonStore();

  const color = useMemo(() => {
    return emotionColors[currentEmotion.toLowerCase()] || emotionColors.neutral;
  }, [currentEmotion]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Pulsing animation based on emotion confidence
    const scale = 1 + Math.sin(time * 2) * 0.1 * emotionConfidence;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
    }

    // Rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    }

    // Glow intensity
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
    }
  });

  return (
    <group>
      {/* Main sphere */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5 + emotionConfidence * 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Outer glow */}
      <Sphere ref={glowRef} args={[1.2, 32, 32]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Inner core */}
      <Sphere args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1}
        />
      </Sphere>
    </group>
  );
}

export default function VeonAvatar() {
  const { currentEmotion } = useVeonStore();

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <GlowingSphere />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
        <p className="text-sm font-semibold">
          Feeling: <span className="text-veon-accent">{currentEmotion}</span>
        </p>
      </div>
    </div>
  );
}
