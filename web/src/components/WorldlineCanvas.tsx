import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, Sparkles, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { WORLDS, N, cameraStateAt, overviewBlendAt } from "../lib/journey.ts";

/**
 * The hero artifact: a luminous worldline winding through the WORLDS. Pass a
 * scroll `progress` (0..1) and the camera travels the line — stopping at each
 * world (background tints to its colour), pulling back between them.
 *
 * Swap for Spline/Three/Rive later: keep filling the container and consuming
 * `progress`, and the choreography in ScrollJourney is unchanged.
 */

// One continuous curve; the WORLDS sit on it at their `t`.
const CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-3.6, -2.0, -1.6),
    new THREE.Vector3(-1.7, -1.0, 0.9),
    new THREE.Vector3(-0.2, -0.2, -1.2),
    new THREE.Vector3(1.2, 0.7, 1.0),
    new THREE.Vector3(2.5, 1.6, -0.8),
    new THREE.Vector3(3.8, 2.6, 1.3),
  ],
  false,
  "catmullrom",
  0.5,
);

const POS = WORLDS.map((w) => CURVE.getPointAt(w.t));
// atmosphere fills with the world's EXACT colour, so the 3D zoom matches the flat
// colour page that crossfades in; darkened versions tint the scene between worlds.
const ATMO = WORLDS.map((w) => new THREE.Color(w.color));
const DARKCOLS = WORLDS.map((w) => new THREE.Color(w.color).multiplyScalar(0.18));
const OVERVIEW_BG = new THREE.Color("#050506");
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const orbAccent = (w: (typeof WORLDS)[number]) => new THREE.Color(w.accent);

function Worldline() {
  const core = useMemo(() => new THREE.TubeGeometry(CURVE, 320, 0.012, 12, false), []);
  const glow = useMemo(() => new THREE.TubeGeometry(CURVE, 200, 0.05, 12, false), []);
  return (
    <group>
      {/* soft outer glow */}
      <mesh geometry={glow}>
        <meshBasicMaterial color="#7de8e0" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* bright core */}
      <mesh geometry={core}>
        <meshStandardMaterial color="#0c4a45" emissive="#7de8e0" emissiveIntensity={2.6} toneMapped={false} />
      </mesh>
    </group>
  );
}

function World({ w, i }: { w: (typeof WORLDS)[number]; i: number }) {
  return (
    <group position={[POS[i].x, POS[i].y, POS[i].z]}>
      {/* interior atmosphere — you fly INTO this; from inside it envelops the view */}
      <mesh>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial color={ATMO[i]} side={THREE.BackSide} transparent opacity={0.6} depthWrite={false} toneMapped={false} />
      </mesh>

      <ElementOrb w={w} />

      <pointLight color={w.color} intensity={4} distance={2.6} />
    </group>
  );
}

function ElementOrb({ w }: { w: (typeof WORLDS)[number] }) {
  const accent = orbAccent(w);

  if (w.element === "fire") {
    return (
      <Float speed={1.45} rotationIntensity={0.32} floatIntensity={0.1}>
        <group>
          <mesh scale={[1, 1.08, 0.94]}>
            <icosahedronGeometry args={[0.54, 4]} />
            <meshPhysicalMaterial
              color="#2a0703"
              emissive="#ff4f1d"
              emissiveIntensity={1.55}
              roughness={0.52}
              metalness={0.08}
              clearcoat={0.35}
              clearcoatRoughness={0.44}
            />
          </mesh>
          <mesh scale={[1.16, 1.02, 1.16]} rotation={[0.8, 0.1, -0.35]}>
            <torusGeometry args={[0.62, 0.025, 12, 96]} />
            <meshBasicMaterial color="#ff8a3d" transparent opacity={0.86} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh scale={[1.38, 1.12, 1.38]} rotation={[1.05, 0.35, 0.55]}>
            <torusGeometry args={[0.69, 0.012, 8, 96]} />
            <meshBasicMaterial color="#ffcf7a" transparent opacity={0.5} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <Sparkles count={22} scale={[1.5, 1.4, 1.5]} size={4} speed={0.5} color="#ffb060" opacity={0.85} />
        </group>
      </Float>
    );
  }

  if (w.element === "water") {
    return (
      <Float speed={0.75} rotationIntensity={0.15} floatIntensity={0.24}>
        <group>
          <mesh>
            <sphereGeometry args={[0.56, 64, 64]} />
            <meshPhysicalMaterial
              color="#0d6a78"
              transmission={0.68}
              thickness={0.75}
              roughness={0.04}
              metalness={0}
              ior={1.34}
              clearcoat={1}
              clearcoatRoughness={0.02}
              transparent
              opacity={0.82}
            />
          </mesh>
          {[0.5, 0.72, 0.94].map((r, idx) => (
            <mesh key={r} rotation={[Math.PI / 2.45, 0, idx * 0.55]}>
              <torusGeometry args={[r, 0.008, 8, 96]} />
              <meshBasicMaterial color={idx === 0 ? "#d8ffff" : "#5fd2e0"} transparent opacity={0.5 - idx * 0.1} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
          ))}
          <Sparkles count={18} scale={[1.15, 1.5, 1.15]} size={2.8} speed={0.18} color="#dffcff" opacity={0.7} />
        </group>
      </Float>
    );
  }

  if (w.element === "ice") {
    return (
      <Float speed={0.45} rotationIntensity={0.12} floatIntensity={0.08}>
        <group>
          <mesh rotation={[0.2, 0.4, 0.1]} scale={[0.78, 1.04, 0.7]}>
            <octahedronGeometry args={[0.68, 2]} />
            <meshPhysicalMaterial
              color="#dff7ff"
              transmission={0.55}
              thickness={0.5}
              roughness={0.08}
              metalness={0.02}
              ior={1.55}
              clearcoat={0.9}
              clearcoatRoughness={0.08}
              transparent
              opacity={0.86}
            />
          </mesh>
          <mesh rotation={[0.4, -0.6, 0.9]} scale={[0.92, 1.12, 0.92]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshBasicMaterial color="#f7fdff" wireframe transparent opacity={0.42} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh scale={[1.1, 1.1, 1.1]} rotation={[0.6, 0.2, -0.3]}>
            <torusGeometry args={[0.64, 0.006, 8, 6]} />
            <meshBasicMaterial color={accent} transparent opacity={0.44} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      </Float>
    );
  }

  return (
    <Float speed={0.55} rotationIntensity={0.08} floatIntensity={0.05}>
      <group>
        <mesh rotation={[0.1, 0.35, -0.18]} scale={[0.94, 0.82, 1]}>
          <dodecahedronGeometry args={[0.62, 1]} />
          <meshStandardMaterial color="#4a2f1d" roughness={0.88} metalness={0.05} emissive="#2c170b" emissiveIntensity={0.35} />
        </mesh>
        {[
          [-0.48, -0.4, 0.28, 0.18],
          [0.42, -0.32, -0.38, 0.13],
          [0.22, 0.46, 0.38, 0.11],
        ].map(([x, y, z, s], idx) => (
          <mesh key={idx} position={[x, y, z]} scale={s}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={idx === 0 ? "#8a5c35" : "#6b4327"} roughness={0.92} metalness={0.02} />
          </mesh>
        ))}
        <mesh rotation={[1.1, 0.1, 0.3]}>
          <torusGeometry args={[0.78, 0.014, 8, 96]} />
          <meshBasicMaterial color="#dca65f" transparent opacity={0.38} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

function Worlds() {
  return (
    <>
      {WORLDS.map((w, i) => (
        <World key={i} w={w} i={i} />
      ))}
    </>
  );
}

/** Colored area-lights baked into an env map so the glass has real reflections (no HDR fetch). */
function Lights() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer intensity={2.4} color="#ffffff" position={[0, 3, 3]} scale={[7, 7, 1]} />
      <Lightformer intensity={1.6} color="#7a5cff" position={[-5, 1, -2]} scale={[5, 5, 1]} />
      <Lightformer intensity={1.6} color="#7de8e0" position={[5, -1, -2]} scale={[5, 5, 1]} />
      <Lightformer intensity={1.2} color="#8cffb8" position={[0, -4, 1]} scale={[6, 3, 1]} />
    </Environment>
  );
}

function TravelLight({ color, offset, speed }: { color: string; offset: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * speed + offset) % 1;
    ref.current.position.copy(CURVE.getPointAt(t));
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

const UP = new THREE.Vector3(0, 1, 0);
const OVERVIEW_POS = new THREE.Vector3(0, 8.2, 12.4);
const OVERVIEW_LOOK = new THREE.Vector3(0.2, 0.25, 0);

/**
 * Camera RIDES the worldline: it flies along the curve and comes to rest *inside*
 * each world (distance ~0, facing forward down the line), so you pass through the
 * surface and the world's atmosphere envelops the view. Between worlds it pulls
 * back along the curve to reveal the next one.
 */
function Dolly({ progress }: { progress?: MotionValue<number> }) {
  const center = useMemo(() => new THREE.Vector3(), []);
  const tan = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const ridePos = useMemo(() => new THREE.Vector3(), []);
  const rideLook = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    const p = clamp01(progress ? progress.get() : 0);
    const { camT, dist } = cameraStateAt(p);
    const overview = overviewBlendAt(p);
    const u = clamp01(camT);
    center.copy(CURVE.getPointAt(u));
    tan.copy(CURVE.getTangentAt(u)).normalize();

    // sit `dist` behind the point along the curve, look forward down the line
    ridePos.copy(center).addScaledVector(tan, -dist).addScaledVector(UP, 0.08 * dist);
    rideLook.copy(center).addScaledVector(tan, 1);
    camera.position.copy(ridePos).lerp(OVERVIEW_POS, overview);
    look.copy(rideLook).lerp(OVERVIEW_LOOK, overview);
    camera.lookAt(look);
  });
  return null;
}

/** Background + fog take the current world's colour (darkened). */
function BackgroundTint({ progress }: { progress?: MotionValue<number> }) {
  const { scene } = useThree();
  const cur = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const p = clamp01(progress ? progress.get() : 0);
    const { camT } = cameraStateAt(p);
    let k = 0;
    while (k < N - 2 && camT >= WORLDS[k + 1].t) k++;
    const seg = clamp01((camT - WORLDS[k].t) / (WORLDS[k + 1].t - WORLDS[k].t));
    cur.copy(DARKCOLS[k]).lerp(DARKCOLS[k + 1], seg);
    cur.lerp(OVERVIEW_BG, overviewBlendAt(p));
    scene.background = cur;
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(cur);
  });
  return null;
}

export function WorldlineCanvas({ progress }: { progress?: MotionValue<number> }) {
  return (
    <Canvas camera={{ position: [0, 0.5, 6.5], fov: 52 }} dpr={[1, 2]} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <fog attach="fog" args={["#050506", 6, 22]} />
      <ambientLight intensity={0.25} />
      <Lights />
      <Stars radius={60} depth={40} count={1200} factor={2.5} saturation={0} fade speed={0.4} />
      <Sparkles count={70} scale={[16, 9, 16]} size={2.2} speed={0.25} color="#bfeee9" opacity={0.5} />

      <Worldline />
      <Worlds />
      <TravelLight color="#eafffb" offset={0} speed={0.05} />
      <TravelLight color="#8cffb8" offset={0.5} speed={0.05} />

      <Dolly progress={progress} />
      <BackgroundTint progress={progress} />

      <EffectComposer>
        <Bloom intensity={1.35} luminanceThreshold={0.16} luminanceSmoothing={0.4} mipmapBlur radius={0.82} />
        <Vignette eskil={false} offset={0.25} darkness={0.92} />
      </EffectComposer>
    </Canvas>
  );
}
