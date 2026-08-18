'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, Sparkles, Eye, Camera, RefreshCw, ZoomIn } from 'lucide-react';

interface MannequinProps {
  height: number;      // 130 - 220 cm
  weight: number;      // 35 - 150 kg
  shoulder: number;    // 30 - 70 cm
  chest: number;       // 60 - 140 cm
  waist: number;       // 50 - 130 cm
  hip: number;         // 60 - 145 cm
  gender?: 'male' | 'female';
}

function ProceduralMannequin({ height, weight, shoulder, chest, waist, hip, gender = 'female' }: MannequinProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Normalization bases (Vietnamese average proportions)
  const baseHeight = gender === 'female' ? 162 : 173;
  const baseShoulder = gender === 'female' ? 39 : 44.5;
  const baseChest = gender === 'female' ? 88 : 95;
  const baseWaist = gender === 'female' ? 70 : 80;
  const baseHip = gender === 'female' ? 94 : 96;
  const baseWeight = gender === 'female' ? 56 : 68;

  // Scale multipliers
  const scaleY = height / baseHeight;
  const scaleWeight = Math.sqrt(Math.max(30, weight) / baseWeight);
  const scaleShoulder = Math.max(0.7, Math.min(1.4, (shoulder / baseShoulder) * scaleWeight));
  const scaleChest = Math.max(0.7, Math.min(1.5, (chest / baseChest) * scaleWeight));
  const scaleWaist = Math.max(0.7, Math.min(1.5, (waist / baseWaist) * scaleWeight));
  const scaleHip = Math.max(0.7, Math.min(1.5, (hip / baseHip) * scaleWeight));

  // Premium mannequin material (Champagne Matte for female, Slate Silver for male)
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(gender === 'female' ? '#E8DEC8' : '#C2CEE0'),
    metalness: 0.25,
    roughness: 0.35,
  });

  const jointMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#3A3A42'),
    metalness: 0.8,
    roughness: 0.2,
  });

  const standMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1F2430'),
    metalness: 0.9,
    roughness: 0.2,
  });

  return (
    <group ref={groupRef} position={[0, -1.75, 0]} scale={[1, scaleY, 1]}>
      {/* Head */}
      <mesh position={[0, 3.25, 0]} material={material} castShadow>
        <sphereGeometry args={[0.18, 32, 32]} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 2.95, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.07, 0.085, 0.18, 24]} />
      </mesh>

      {/* Shoulder Bar / Collar */}
      <mesh position={[0, 2.78, 0]} scale={[scaleShoulder, 1, 1]} material={material} castShadow>
        <boxGeometry args={[0.82, 0.09, 0.18]} />
      </mesh>

      {/* Shoulder Joints */}
      <mesh position={[-0.41 * scaleShoulder, 2.78, 0]} material={jointMaterial}>
        <sphereGeometry args={[0.065, 16, 16]} />
      </mesh>
      <mesh position={[0.41 * scaleShoulder, 2.78, 0]} material={jointMaterial}>
        <sphereGeometry args={[0.065, 16, 16]} />
      </mesh>

      {/* Torso - Upper Chest */}
      <mesh position={[0, 2.45, 0]} scale={[scaleChest, 1, scaleChest]} material={material} castShadow>
        <cylinderGeometry args={[0.30, 0.25, 0.48, 24]} />
      </mesh>

      {/* Torso - Waist */}
      <mesh position={[0, 1.98, 0]} scale={[scaleWaist, 1, scaleWaist]} material={material} castShadow>
        <cylinderGeometry args={[0.245, 0.23, 0.42, 24]} />
      </mesh>

      {/* Torso - Hips */}
      <mesh position={[0, 1.52, 0]} scale={[scaleHip, 1, scaleHip]} material={material} castShadow>
        <cylinderGeometry args={[0.23, 0.29, 0.50, 24]} />
      </mesh>

      {/* Left Arm */}
      <group position={[-0.41 * scaleShoulder, 2.75, 0]}>
        <mesh position={[0, -0.42, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.055, 0.048, 0.8, 20]} />
        </mesh>
        <mesh position={[0, -0.84, 0]} material={jointMaterial}>
          <sphereGeometry args={[0.045, 16, 16]} />
        </mesh>
        <mesh position={[0, -1.25, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.045, 0.038, 0.72, 20]} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.41 * scaleShoulder, 2.75, 0]}>
        <mesh position={[0, -0.42, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.055, 0.048, 0.8, 20]} />
        </mesh>
        <mesh position={[0, -0.84, 0]} material={jointMaterial}>
          <sphereGeometry args={[0.045, 16, 16]} />
        </mesh>
        <mesh position={[0, -1.25, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.045, 0.038, 0.72, 20]} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group position={[-0.15 * scaleHip, 1.25, 0]}>
        <mesh position={[0, -0.52, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 1.05, 20]} />
        </mesh>
        <mesh position={[0, -1.06, 0]} material={jointMaterial}>
          <sphereGeometry args={[0.06, 16, 16]} />
        </mesh>
        <mesh position={[0, -1.58, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.068, 0.055, 0.98, 20]} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.15 * scaleHip, 1.25, 0]}>
        <mesh position={[0, -0.52, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.09, 0.07, 1.05, 20]} />
        </mesh>
        <mesh position={[0, -1.06, 0]} material={jointMaterial}>
          <sphereGeometry args={[0.06, 16, 16]} />
        </mesh>
        <mesh position={[0, -1.58, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.068, 0.055, 0.98, 20]} />
        </mesh>
      </group>

      {/* Mannequin Studio Stand */}
      <mesh position={[0, -0.05, 0]} material={standMaterial}>
        <cylinderGeometry args={[0.38, 0.42, 0.06, 32]} />
      </mesh>
      <mesh position={[0, 0.75, 0]} material={standMaterial}>
        <cylinderGeometry args={[0.02, 0.02, 1.55, 16]} />
      </mesh>
    </group>
  );
}

function GLBLoader({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = React.useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={cloned} position={[0, -1.75, 0]} />;
}

// Capture helper component inside Canvas context
function CaptureHandler({ onCaptureReady }: { onCaptureReady?: (fn: () => string) => void }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (!onCaptureReady) return;
    onCaptureReady(() => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL('image/png');
    });
  }, [gl, scene, camera, onCaptureReady]);

  return null;
}

export interface MannequinViewerProps extends MannequinProps {
  glbUrl?: string | null;
  isGlbLoading?: boolean;
  onCaptureReady?: (captureFn: () => string) => void;
  className?: string;
  autoRotate?: boolean;
  onRefresh?: () => void;
}

export default function MannequinViewer({
  height,
  weight,
  shoulder,
  chest,
  waist,
  hip,
  gender = 'female',
  glbUrl,
  isGlbLoading = false,
  onCaptureReady,
  className = '',
  autoRotate = false,
  onRefresh,
}: MannequinViewerProps) {
  const [controlsAutoRotate, setControlsAutoRotate] = useState(autoRotate);
  const [cameraKey, setCameraKey] = useState(0);

  const resetCamera = () => {
    setCameraKey((k) => k + 1);
  };

  return (
    <div className={`w-full h-full relative select-none ${className}`} style={{ minHeight: 420 }}>
      {/* 3D Canvas */}
      <Canvas
        key={cameraKey}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
        camera={{ position: [0, 0.3, 4.2], fov: 48 }}
        className="w-full h-full bg-gradient-to-b from-[#181B24] to-[#0E1015] rounded-xl overflow-hidden shadow-inner"
        shadows
      >
        <ambientLight intensity={0.7} />
        
        {/* Key & Rim Studio Lighting */}
        <directionalLight
          position={[4, 8, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-4, 6, -3]} intensity={0.6} color="#B0C4DE" />
        <pointLight position={[0, 2, 2.5]} intensity={0.4} />
        <pointLight position={[0, -1, -2]} intensity={0.2} color="#E8DEC8" />

        <Center>
          {glbUrl ? (
            <Suspense
              fallback={
                <ProceduralMannequin
                  height={height}
                  weight={weight}
                  shoulder={shoulder}
                  chest={chest}
                  waist={waist}
                  hip={hip}
                  gender={gender}
                />
              }
            >
              <GLBLoader url={glbUrl} />
            </Suspense>
          ) : (
            <ProceduralMannequin
              height={height}
              weight={weight}
              shoulder={shoulder}
              chest={chest}
              waist={waist}
              hip={hip}
              gender={gender}
            />
          )}
        </Center>

        <ContactShadows
          position={[0, -1.76, 0]}
          opacity={0.65}
          scale={5}
          blur={1.5}
          far={3}
          color="#000000"
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={1.8}
          maxDistance={7.5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.9}
          autoRotate={controlsAutoRotate}
          autoRotateSpeed={1.5}
          target={[0, 0, 0]}
        />

        <CaptureHandler onCaptureReady={onCaptureReady} />
      </Canvas>

      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[11px] font-medium border border-white/10 flex items-center gap-1.5 shadow-sm">
          <span className={`w-2 h-2 rounded-full ${glbUrl ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{glbUrl ? 'Avatar 3D Blender (GLB)' : 'Mannequin 3D'}</span>
        </div>

        {isGlbLoading && (
          <div className="px-2.5 py-1 bg-brand-navy/80 backdrop-blur-md rounded-lg text-white text-[11px] font-medium border border-brand-navy/30 flex items-center gap-1.5 shadow-sm animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin text-brand-gold" />
            <span>Đang nạp model 3D...</span>
          </div>
        )}
      </div>

      {/* Top Right Quick Action Tools */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setControlsAutoRotate((prev) => !prev)}
          title="Tự động xoay 360°"
          className={`p-2 rounded-lg backdrop-blur-md border transition-all text-xs flex items-center justify-center ${
            controlsAutoRotate
              ? 'bg-brand-gold text-brand-navy border-brand-gold font-bold shadow-md'
              : 'bg-black/50 text-white/80 border-white/10 hover:bg-black/70 hover:text-white'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={resetCamera}
          title="Đặt lại góc nhìn camera"
          className="p-2 rounded-lg bg-black/50 text-white/80 border border-white/10 hover:bg-black/70 hover:text-white backdrop-blur-md transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-white/70 text-[11px] font-normal border border-white/5">
          🖱️ Kéo để xoay 360° · Cuộn để phóng to
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-white/70 text-[11px] font-mono border border-white/5">
          {height}cm · {weight}kg · {gender === 'female' ? 'Nữ' : 'Nam'}
        </div>
      </div>
    </div>
  );
}
