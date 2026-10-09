"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, useGLTF } from "@react-three/drei";
import {
  ChromaticAberration,
  EffectComposer,
  Noise,
  Pixelation,
  Scanline,
} from "@react-three/postprocessing";
import { BlendFunction, Effect } from "postprocessing";
import * as THREE from "three";

// Tinted chrome: color multiplies the env reflections.
const CHROME = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#ba8fe3"),
  metalness: 1,
  roughness: 0.01,
  envMapIntensity: 10,
});

// Last pass: scale colour by alpha. Grain and scanlines write colour into
// the transparent pixels around the logo; on mobile Safari that showed up as
// a light square. Premultiplying makes those pixels truly empty everywhere.
class PremultiplyAlpha extends Effect {
  constructor() {
    super(
      "PremultiplyAlpha",
      `void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        outputColor = vec4(inputColor.rgb * inputColor.a, inputColor.a);
      }`,
      { blendFunction: BlendFunction.SRC },
    );
  }
}

// Stop-motion spin: the logo only updates FPS times a second, jumping
// SPEED/FPS radians per frame.
const FPS = 24;
const SPEED = 0.9; // radians per second

const CAMERA_Z = 2.6;
const FOV = 50;

// On phones the canvas is only a little taller than the logo. The camera is
// placed so the logo stays within MOBILE_FILL of the canvas height at every
// angle of the spin: side-on, one end swings up to spinWidth/2 toward the
// lens and gets magnified, so that's the distance that counts. Desktop keeps
// the fixed CAMERA_Z.
const MOBILE = "(max-width: 767px)";
const MOBILE_FILL = 0.8;

function StabModel({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF("/stab.glb");
  const getThree = useThree((s) => s.get);
  const view = useThree((s) => s.size);
  const spin = useRef<THREE.Group>(null);
  const sinceTick = useRef(0);

  // Force purple chrome on every mesh; normalize scale so any export
  // size fits the canvas.
  const { scale, height, spinWidth } = useMemo(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = CHROME;
    });
    const size = new THREE.Box3()
      .setFromObject(scene)
      .getSize(new THREE.Vector3());
    const scale = size.x > 0 ? 1.8 / size.x : 1;
    return {
      scale,
      height: size.y * scale,
      // widest the logo gets while turning: the diagonal of its footprint
      spinWidth: Math.hypot(size.x, size.z) * scale,
    };
  }, [scene]);

  useEffect(onReady, [onReady]);

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE);
    const fit = () => {
      const camera = getThree().camera as THREE.PerspectiveCamera;
      if (mobile.matches) {
        const span = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
        const aspect = view.width / view.height;
        camera.position.z = Math.max(
          spinWidth / 2 + height / (MOBILE_FILL * span),
          spinWidth / (0.9 * span * aspect),
        );
      } else {
        camera.position.z = CAMERA_Z;
      }
      camera.updateProjectionMatrix();
    };
    fit();
    mobile.addEventListener("change", fit);
    return () => mobile.removeEventListener("change", fit);
  }, [getThree, view.width, view.height, height, spinWidth]);

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
  const premultiply = useMemo(() => new PremultiplyAlpha(), []);

  return (
    <div className={`relative w-full ${className}`} aria-hidden>
      {!ready && (
        <span className="absolute inset-0 flex items-center justify-center font-serif italic text-5xl text-ink/15 animate-pulse">
          stab
        </span>
      )}
      <Canvas
        camera={{ position: [0, 0, CAMERA_Z], fov: FOV }}
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
          <EffectComposer>
            {/* edge fringing: cheap print / photocopy feel */}
            <ChromaticAberration offset={[0.0007, 0.0006]} />
            {/* subtle film grain */}
            <Noise opacity={0.2} />
            {/* CRT scanlines */}
            <Scanline density={1.5} opacity={0.15} />
            {/* chunky low-res pixels */}
            <Pixelation granularity={2} />
            <primitive object={premultiply} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <span className="sr-only">STAB</span>
    </div>
  );
}
