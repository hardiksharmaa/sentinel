"use client";

import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import CanvasLoader from "./Loader";

interface GLTFResult {
  scene: Group;
}

const Earth: React.FC = () => {
  const earth = useGLTF("./planet/scene.gltf") as unknown as GLTFResult;

  return (
    <primitive
      object={earth.scene}
      scale={2.7}
      position={[0, -0.2, 0]}
      rotation={[0, 0, 0]}
    />
  );
};

const EarthCanvas: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const handlePointerEnter = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotateSpeed = 40; // 🚀 faster on hover
    }
  };

  const handlePointerLeave = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotateSpeed = 4; // 🧘 back to normal
    }
  };

  return (
    <div
      className="w-full h-full"
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [-3.2, 2.5, 5.2],
        }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls
            ref={controlsRef}
            autoRotate
            autoRotateSpeed={1.2}
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />

          <Earth />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default EarthCanvas;

useGLTF.preload("./planet/scene.gltf");
