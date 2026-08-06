'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

interface MannequinProps {
  height: number;      // 130 - 220 cm
  weight: number;      // 35 - 150 kg
  shoulder: number;    // 30 - 70 cm
  chest: number;       // 60 - 140 cm
  waist: number;       // 50 - 130 cm
  hip: number;         // 60 - 145 cm
  gender?: 'male' | 'female';
}

function MannequinModel({ height, weight, shoulder, chest, waist, hip, gender = 'female' }: MannequinProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Normalization bases (average sizes)
  const baseHeight = 170;
  const baseShoulder = 40;
  const baseChest = 88;
  const baseWaist = 70;
  const baseHip = 94;
  const baseWeight = 60;

  // Scale multipliers
  const scaleY = height / baseHeight;
  const scaleWeight = Math.sqrt(weight / baseWeight);
  const scaleShoulder = (shoulder / baseShoulder) * scaleWeight;
  const scaleChest = (chest / baseChest) * scaleWeight;
  const scaleWaist = (waist / baseWaist) * scaleWeight;
  const scaleHip = (hip / baseHip) * scaleWeight;

  // Premium mannequin material (smooth metallic matte gold/gray)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(gender === 'female' ? '#E9DFD0' : '#C5D3E8'),
    metalness: 0.2,
    roughness: 0.4,
  });

  return (
    <group ref={groupRef} position={[0, -1.8, 0]} scale={[1, scaleY, 1]}>
      {/* Head */}
      <mesh position={[0, 3.2, 0]} material={material}>
        <sphereGeometry args={[0.2, 32, 32]} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 2.9, 0]} material={material}>
        <cylinderGeometry args={[0.07, 0.08, 0.2, 16]} />
      </mesh>

      {/* Shoulder Bar */}
      <mesh position={[0, 2.7, 0]} scale={[scaleShoulder, 1, 1]} material={material}>
        <boxGeometry args={[0.8, 0.08, 0.15]} />
      </mesh>

      {/* Torso - Upper Chest */}
      <mesh position={[0, 2.4, 0]} scale={[scaleChest, 1, scaleChest]} material={material}>
        <cylinderGeometry args={[0.28, 0.24, 0.5, 16]} />
      </mesh>

      {/* Torso - Waist */}
      <mesh position={[0, 1.95, 0]} scale={[scaleWaist, 1, scaleWaist]} material={material}>
        <cylinderGeometry args={[0.24, 0.22, 0.4, 16]} />
      </mesh>

      {/* Torso - Hips */}
      <mesh position={[0, 1.5, 0]} scale={[scaleHip, 1, scaleHip]} material={material}>
        <cylinderGeometry args={[0.22, 0.28, 0.5, 16]} />
      </mesh>

      {/* Left Arm */}
      <group position={[-0.4 * scaleShoulder, 2.7, 0]}>
        <mesh position={[0, -0.4, 0]} material={material}>
          <cylinderGeometry args={[0.06, 0.05, 0.8, 16]} />
        </mesh>
        <mesh position={[0, -0.9, 0]} material={material}>
          <cylinderGeometry args={[0.05, 0.04, 0.7, 16]} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.4 * scaleShoulder, 2.7, 0]}>
        <mesh position={[0, -0.4, 0]} material={material}>
          <cylinderGeometry args={[0.06, 0.05, 0.8, 16]} />
        </mesh>
        <mesh position={[0, -0.9, 0]} material={material}>
          <cylinderGeometry args={[0.05, 0.04, 0.7, 16]} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group position={[-0.15 * scaleHip, 1.25, 0]}>
        <mesh position={[0, -0.5, 0]} material={material}>
          <cylinderGeometry args={[0.09, 0.07, 1.0, 16]} />
        </mesh>
        <mesh position={[0, -1.2, 0]} material={material}>
          <cylinderGeometry args={[0.07, 0.06, 1.0, 16]} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.15 * scaleHip, 1.25, 0]}>
        <mesh position={[0, -0.5, 0]} material={material}>
          <cylinderGeometry args={[0.09, 0.07, 1.0, 16]} />
        </mesh>
        <mesh position={[0, -1.2, 0]} material={material}>
          <cylinderGeometry args={[0.07, 0.06, 1.0, 16]} />
        </mesh>
      </group>
    </group>
  );
}

// Helper component to enable canvas screenshot captures
interface CaptureHandlerProps {
  onCaptureReady: (captureFn: () => string) => void;
}

function CaptureHandler({ onCaptureReady }: CaptureHandlerProps) {
  const { gl, scene, camera } = useThree();

  React.useEffect(() => {
    onCaptureReady(() => {
      // Force render before taking capture to ensure image buffer is populated
      gl.render(scene, camera);
      return gl.domElement.toDataURL('image/png');
    });
  }, [gl, scene, camera, onCaptureReady]);

  return null;
}

interface MannequinViewerProps {
  height: number;
  weight: number;
  shoulder: number;
  chest: number;
  waist: number;
  hip: number;
  gender?: 'male' | 'female';
  onCaptureReady: (captureFn: () => string) => void;
}

export default function MannequinViewer({
  height,
  weight,
  shoulder,
  chest,
  waist,
  hip,
  gender = 'female',
  onCaptureReady
}: MannequinViewerProps) {
  return (
    <div className="w-full h-full relative" style={{ minHeight: 400 }}>
      <Canvas
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        className="w-full h-full bg-neutral-900 rounded-xl overflow-hidden"
      >
        <ambientLight intensity={0.6} />
        
        {/* Soft studio lighting */}
        <directionalLight position={[5, 10, 5]} intensity={1.0} />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />
        <pointLight position={[0, 2, 2]} intensity={0.5} />

        <Center>
          <MannequinModel
            height={height}
            weight={weight}
            shoulder={shoulder}
            chest={chest}
            waist={waist}
            hip={hip}
            gender={gender}
          />
        </Center>

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={10}
          target={[0, 0, 0]}
        />

        <CaptureHandler onCaptureReady={onCaptureReady} />
      </Canvas>
      
      {/* Control Tip Overlays */}
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-[11px] font-medium pointer-events-none">
        🖱️ Chuột trái xoay · Cuộn zoom
      </div>
    </div>
  );
}
