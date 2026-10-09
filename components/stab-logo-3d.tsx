"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment, useGLTF } from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Pixelation,
  Scanline,
} from "@react-three/postprocessing";
import * as THREE from "three";

// Tinted chrome: color multiplies the env reflections.
const CHROME = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#ba8fe3"),
  metalness: 1,
  roughness: 0.01,
  envMapIntensity: 10,
});

// Stop-motion spin: the logo only updates FPS times a second, jumping
// SPEED/FPS radians per frame.
const FPS = 24;
const SPEED = 0.9; // radians per second

function StabModel({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF("/stab.glb");
  const spin = useRef<THREE.Group>(null);
  const sinceTick = useRef(0);

  // Force purple chrome on every mesh; normalize scale so any export
  // size fits the canvas.
  const scale = useMemo(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = CHROME;
    });
    const size = new THREE.Box3()
      .setFromObject(scene)
      .getSize(new THREE.Vector3());
    return size.x > 0 ? 1.3 / size.x : 1;
  }, [scene]);

  useEffect(onReady, [onReady]);

  useFrame((_, delta) => {
    const g = spin.current;
    if (!g) return;
    sinceTick.current += delta;
    if (sinceTick.current < 1 / FPS) return;
    sinceTick.current %= 1 / FPS;
    g.rotation.y += SPEED / FPS;
  });

  return (
    <Center>
      <group ref={spin} scale={scale}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

export default function StabLogo3D({
  className = "h-28 md:h-36",
}: {
  className?: string;
}) {
  const [ready, setReady] = useState(false);

  return (
    <div className={`relative w-full ${className}`} aria-hidden>
      {!ready && (
        <span className="absolute inset-0 flex items-center justify-center font-serif italic text-5xl text-ink/15 animate-pulse">
          stab
        </span>
      )}
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <StabModel onReady={() => setReady(true)} />
          {/* real HDRI env (same family of presets gltf-viewer uses);
              fetched from the pmndrs CDN at runtime */}
          <Environment preset="park" />
          {/* sharp lights put specular glints on the chrome
              as it spins */}
          <spotLight position={[4, 4, 6]} intensity={20} angle={0.5} />
          <spotLight
            position={[-5, -2, 4]}
            intensity={10}
            angle={0.5}
            color="#b4c8ff"
          />
          {/* bloom: highlights past the threshold bleed into glare */}
          <EffectComposer>
            <Bloom
              intensity={0.1}
              luminanceThreshold={1}
              luminanceSmoothing={0.2}
              mipmapBlur
            />
            {/* edge fringing: cheap print / photocopy feel */}
            <ChromaticAberration offset={[0.0007, 0.0006]} />
            {/* subtle film grain */}
            <Noise opacity={0.2} />
            {/* CRT scanlines */}
            <Scanline density={1.5} opacity={0.15} />
            {/* chunky low-res pixels */}
            <Pixelation granularity={2} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <span className="sr-only">STAB</span>
    </div>
  );
}
