"use client";

import "@/lib/quietThree";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { SCENE, clamp01, easeInOut, easeOut, type CardScreen } from "./scene";
import { Line } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { personalInfo } from "@/lib/data";
import { useInView } from "@/hooks/useInView";

const CARD_W = 1.9;
const CARD_H = 2.67;
const POINTS = 32;


// ─── Badge face, drawn to a canvas texture ───────────────────────────────────
// (CSS3D <Html> drifts out of alignment on unit-scale scenes, so the face is
//  painted into a texture instead. Always light "paper", in both themes.)
const TEX_W = 640;
const TEX_H = 900;

function cssFont(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function drawBadge(
  c: HTMLCanvasElement,
  playing: boolean,
  photo: HTMLImageElement | null,
) {
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const sans = cssFont("--font-sans", "system-ui, sans-serif");
  const serif = cssFont("--font-display", "Georgia, serif");
  const PAPER = "#fbf9f4";
  const PH = 300; // photo height, full bleed

  ctx.setTransform(2, 0, 0, 2, 0, 0); // design in 320 x 450
  ctx.clearRect(0, 0, 320, 450);

  ctx.fillStyle = PAPER;
  ctx.beginPath();
  ctx.roundRect(0, 0, 320, 450, 22);
  ctx.fill();

  // photo: edge to edge, no frame
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, 320, PH, [22, 22, 0, 0]);
  ctx.clip();
  if (photo) {
    const r = Math.max(320 / photo.width, PH / photo.height);
    const w = photo.width * r, h = photo.height * r;
    ctx.drawImage(photo, (320 - w) / 2, -(h - PH) * 0.3, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, 320, PH);
    g.addColorStop(0, "#8f78ff");
    g.addColorStop(1, "#22b8d4");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 320, PH);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = `italic 120px ${serif}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("JV", 160, PH / 2);
    ctx.textBaseline = "alphabetic";
  }
  // soft fade into the paper
  const fade = ctx.createLinearGradient(0, PH - 70, 0, PH);
  fade.addColorStop(0, "rgba(251,249,244,0)");
  fade.addColorStop(1, PAPER);
  ctx.fillStyle = fade;
  ctx.fillRect(0, PH - 70, 320, 70);
  ctx.restore();

  // availability chip
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(16, 16, 88, 26, 13);
  ctx.fill();
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(30, 29, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#17151f";
  ctx.font = `600 11px ${sans}`;
  ctx.textAlign = "left";
  ctx.fillText("Available", 39, 33);

  // identity
  ctx.fillStyle = "#17151f";
  ctx.font = `34px ${serif}`;
  ctx.fillText(personalInfo.name, 20, 322);
  ctx.fillStyle = "#6a6672";
  ctx.font = `500 13px ${sans}`;
  ctx.fillText(personalInfo.role, 20, 346);

  // play pill
  ctx.fillStyle = "#17151f";
  ctx.beginPath();
  ctx.roundRect(20, 378, 280, 52, 26);
  ctx.fill();
  ctx.fillStyle = "#7c5cff";
  ctx.beginPath();
  ctx.arc(46, 404, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  if (playing) {
    ctx.fillRect(40, 397, 4, 14);
    ctx.fillRect(49, 397, 4, 14);
  } else {
    ctx.beginPath();
    ctx.moveTo(42, 396);
    ctx.lineTo(42, 412);
    ctx.lineTo(55, 404);
    ctx.closePath();
    ctx.fill();
  }
  ctx.font = `600 13px ${sans}`;
  ctx.fillText(playing ? "Playing…" : "Hear my intro", 73, 409);
  const heights = playing ? [8, 16, 11, 14] : [4, 4, 4, 4];
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  heights.forEach((h, i) => ctx.fillRect(262 + i * 7, 404 - h / 2, 3, h));
}

/** Mutating a three.js object lives outside components to keep React lint happy. */
function markDirty(t: THREE.Texture) {
  t.needsUpdate = true;
}

function useBadgeTexture(playing: boolean) {
  const [tex] = useState(() => {
    const c = document.createElement("canvas");
    c.width = TEX_W;
    c.height = TEX_H;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  });
  const photo = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let alive = true;
    const paint = () => {
      if (!alive) return;
      drawBadge(tex.image as HTMLCanvasElement, playing, photo.current);
      markDirty(tex);
    };
    paint();
    void document.fonts.ready.then(paint);
    if (personalInfo.photo && !photo.current) {
      const img = new Image();
      img.onload = () => {
        photo.current = img;
        paint();
      };
      img.src = personalInfo.photo;
    }
    return () => {
      alive = false;
    };
  }, [playing, tex]);

  return tex;
}

function roundedCardShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

type Rb = React.RefObject<RapierRigidBody | null>;

/** Slides the camera sideways so the card hangs on the right of a full-bleed canvas. */
function Rig() {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  const size = useThree((st) => st.size);
  useEffect(() => {
    const z = 10.5;
    const worldW = (size.width / size.height) * 2 * z * Math.tan((camera.fov * Math.PI) / 360);
    camera.position.set(-worldW * 0.26, 0, z);
    camera.rotation.set(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}


const DROP = 0.6; // how far the card is pulled down while Luffy stretches it
const SX = 0.16; // rubber squash on X at full stretch
const SY = 0.3; // rubber stretch on Y at full stretch
const COLS = 6;
const ROWS = 8;

function rnd(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Band({
  playing,
  onTap,
  progress,
  screen,
}: {
  playing: boolean;
  onTap: () => void;
  progress: MotionValue<number>;
  screen: CardScreen;
}) {
  const vis = useRef<THREE.Group>(null);
  const parts = useRef<THREE.Group>(null);
  const tilesRef = useRef<THREE.Group>(null);
  const size = useThree((st) => st.size);
  const [tiles] = useState(() =>
    Array.from({ length: COLS * ROWS }, (_, i) => {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      return {
        c,
        r,
        fx: 0.1 + rnd(i + 1) * 0.86, // target, as a fraction of screen width
        fy: 0.16 + rnd(i + 91) * 0.7,
        tz: 0.6 + rnd(i + 17) * 2.4,
        spin: [(rnd(i + 5) - 0.5) * 9, (rnd(i + 6) - 0.5) * 9, (rnd(i + 7) - 0.5) * 12] as const,
        delay: rnd(i + 33) * 0.3 + (r / ROWS) * 0.15,
        lift: 0.4 + rnd(i + 44) * 1.4,
      };
    }),
  );
  const [tileGeos] = useState(() =>
    tiles.map((t) => {
      const g = new THREE.PlaneGeometry(CARD_W / COLS, CARD_H / ROWS);
      const uv = g.attributes.uv;
      for (let k = 0; k < uv.count; k++) {
        uv.setXY(
          k,
          (t.c + uv.getX(k)) / COLS,
          1 - (t.r + 1) / ROWS + uv.getY(k) / ROWS,
        );
      }
      return g;
    }),
  );
  const tileMats = useRef<THREE.MeshBasicMaterial[]>([]);
  const tmp = useRef(new THREE.Vector3()).current;
  const [tension] = useState(() => ({
    a: new THREE.Color("#7c5cff"),
    b: new THREE.Color("#ff5a3c"),
    c: new THREE.Color(),
  }));
  const line = useRef<{
    geometry: { setPositions: (a: Float32Array) => void };
    material: { linewidth: number; color: THREE.Color };
    visible: boolean;
  } | null>(null);
  const fixed: Rb = useRef(null);
  const j1: Rb = useRef(null);
  const j2: Rb = useRef(null);
  const j3: Rb = useRef(null);
  const card: Rb = useRef(null);

  const vec = useRef(new THREE.Vector3()).current;
  const dir = useRef(new THREE.Vector3()).current;
  const ang = useRef(new THREE.Vector3()).current;
  const rot = useRef(new THREE.Vector3()).current;
  const positions = useRef(new Float32Array(POINTS * 3)).current;
  const curve = useRef(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]),
  ).current;

  const [dragged, setDragged] = useState<THREE.Vector3 | false>(false);
  const [hovered, setHovered] = useState(false);
  const downAt = useRef({ x: 0, y: 0 });
  const faceTex = useBadgeTexture(playing);
  const [bodyGeo] = useState(() => {
    const g = new THREE.ExtrudeGeometry(roundedCardShape(CARD_W, CARD_H, 0.13), {
      depth: 0.04,
      bevelEnabled: false,
    });
    g.translate(0, 0, -0.02);
    return g;
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const ropeArgs: any = [[0, 0, 0], [0, 0, 0], 1];
  useRopeJoint(fixed as any, j1 as any, ropeArgs);
  useRopeJoint(j1 as any, j2 as any, ropeArgs);
  useRopeJoint(j2 as any, j3 as any, ropeArgs);
  useSphericalJoint(j3 as any, card as any, [[0, 0, 0], [0, CARD_H / 2 + 0.2, 0]] as any);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  useEffect(() => {
    document.body.style.cursor = hovered ? (dragged ? "grabbing" : "grab") : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  // A little swing whenever playback starts.
  useEffect(() => {
    if (!playing) return;
    card.current?.applyImpulse({ x: 0.6, y: 0, z: 1.2 }, true);
    card.current?.applyTorqueImpulse({ x: 0, y: 0.8, z: 0 }, true);
  }, [playing]);

  useFrame((state) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current) {
      curve.points[0].copy(j3.current.translation() as THREE.Vector3);
      curve.points[1].copy(j2.current.translation() as THREE.Vector3);
      curve.points[2].copy(j1.current.translation() as THREE.Vector3);
      curve.points[3].copy(fixed.current.translation() as THREE.Vector3);
      const p = progress.get();
      const e = easeInOut(clamp01((p - SCENE.stretchFrom) / (SCENE.stretchTo - SCENE.stretchFrom)));
      const sc = clamp01((p - SCENE.scatterFrom) / (SCENE.scatterTo - SCENE.scatterFrom));
      const retract = easeOut(clamp01((p - SCENE.scatterFrom) / 0.06));
      const dropRope = (DROP - 1.4 * SY) * e;
      const pts = curve.getPoints(POINTS);
      for (let i = 0; i < POINTS; i++) {
        const f = 1 - i / (POINTS - 1);
        const whip = retract > 0 && retract < 1 ? Math.sin(i * 0.7 + retract * 30) * 0.22 * f : 0;
        const y0 = pts[i].y - dropRope * f;
        positions[i * 3 + 1] = y0 + (pts[POINTS - 1].y - y0) * retract;
        positions[i * 3] = pts[i].x + (pts[POINTS - 1].x - pts[i].x) * retract + whip;
        positions[i * 3 + 2] = pts[i].z;
      }
      line.current?.geometry.setPositions(positions);

      // Rubber: the card is pulled down, squashed in width and stretched in length.
      const shake = e > 0.75 && sc === 0 ? Math.sin(state.clock.elapsedTime * 60) * 0.02 * ((e - 0.75) / 0.25) : 0;
      if (vis.current) {
        vis.current.position.set(shake, 0.2 - DROP * e, 0);
        vis.current.rotation.z = 0.14 * e;
        vis.current.scale.set(1 - SX * e, 1 + SY * e, 1);
      }
      if (parts.current) parts.current.visible = sc <= 0.0001;
      if (line.current) {
        line.current.material.linewidth = 7 - 3.4 * e;
        line.current.material.color.copy(tension.c.lerpColors(tension.a, tension.b, e));
        line.current.visible = retract < 1;
      }

      // Scatter: the card breaks into tiles that fly off and become the About details.
      const worldH = 2 * 10.5 * Math.tan((25 * Math.PI) / 360);
      const worldW = (size.width / size.height) * worldH;
      if (tilesRef.current) {
        tilesRef.current.visible = sc > 0.0001;
        if (sc > 0.0001) {
          tilesRef.current.children.forEach((m, i) => {
            const t = tiles[i];
            const u = easeInOut(clamp01((sc - t.delay) / (1 - t.delay)));
            const sx0 = (t.c + 0.5) * (CARD_W / COLS) - CARD_W / 2;
            const sy0 = CARD_H / 2 - (t.r + 0.5) * (CARD_H / ROWS);
            const tx = (t.fx - 0.76) * worldW;
            const ty = (0.5 - t.fy) * worldH;
            m.position.set(
              sx0 + (tx - sx0) * u,
              sy0 + (ty - sy0) * u + Math.sin(u * Math.PI) * t.lift,
              0.03 + t.tz * Math.sin(u * Math.PI),
            );
            m.rotation.set(t.spin[0] * u, t.spin[1] * u, t.spin[2] * u);
            m.scale.setScalar(1 - 0.78 * u * u);
            const mat = tileMats.current[i];
            if (mat) mat.opacity = 1 - clamp01((u - 0.5) / 0.5);
          });
        }
      }

      // Publish where the card is on screen so Luffy can grab it.
      if (vis.current) {
        vis.current.updateWorldMatrix(true, false);
        const cam = state.camera;
        const project = (lx: number, ly: number, mvx: MotionValue<number>, mvy: MotionValue<number>) => {
          tmp.set(lx, ly, 0);
          vis.current!.localToWorld(tmp);
          tmp.project(cam);
          mvx.set((tmp.x * 0.5 + 0.5) * size.width);
          mvy.set((-tmp.y * 0.5 + 0.5) * size.height);
        };
        project(0, 0, screen.cx, screen.cy);
        project(-CARD_W / 2, -CARD_H * 0.22, screen.gx, screen.gy);
        screen.ready.set(1);
      }

      // Keep the card facing the camera.
      ang.copy(card.current.angvel() as THREE.Vector3);
      rot.copy(card.current.rotation() as unknown as THREE.Vector3);
      card.current.setAngvel({ x: ang.x, y: ang.y * (1 - 0.6 * e) - rot.y * (0.25 + 3 * e), z: ang.z }, true);
    }
  });

  const segment = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 2,
    linearDamping: 2,
  };

  return (
    <>
      <group position={[0, 4.5, 0]}>
        <RigidBody ref={fixed} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segment}>
          <BallCollider args={[0.18]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segment}>
          <BallCollider args={[0.18]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segment}>
          <BallCollider args={[0.18]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segment}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[CARD_W / 2, CARD_H / 2, 0.02]} density={0.4} />
          <group
            ref={vis}
            position={[0, 0.2, 0]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture(e.pointerId);
              downAt.current = { x: e.clientX, y: e.clientY };
              setDragged(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current!.translation() as THREE.Vector3)),
              );
            }}
            onPointerUp={(e) => {
              (e.target as Element).releasePointerCapture(e.pointerId);
              setDragged(false);
              const moved = Math.hypot(e.clientX - downAt.current.x, e.clientY - downAt.current.y);
              if (moved < 5) onTap();
            }}
          >
            <group ref={parts}>
            {/* card body */}
            <mesh geometry={bodyGeo}>
              <meshStandardMaterial color="#fbf9f4" roughness={0.6} metalness={0} />
            </mesh>
            {/* painted face */}
            <mesh position={[0, 0, 0.0215]}>
              <planeGeometry args={[CARD_W, CARD_H]} />
              <meshBasicMaterial map={faceTex} transparent toneMapped={false} />
            </mesh>
            {/* clip */}
            <mesh position={[0, CARD_H / 2 + 0.06, 0]}>
              <boxGeometry args={[0.4, 0.22, 0.09]} />
              <meshStandardMaterial color="#b9b4a8" metalness={0.6} roughness={0.35} />
            </mesh>
            </group>

            {/* scatter tiles */}
            <group ref={tilesRef} visible={false}>
              {tiles.map((t, i) => (
                <mesh
                  key={i}
                  geometry={tileGeos[i]}
                  position={[
                    (t.c + 0.5) * (CARD_W / COLS) - CARD_W / 2,
                    CARD_H / 2 - (t.r + 0.5) * (CARD_H / ROWS),
                    0.03,
                  ]}
                  raycast={() => null}
                >
                  <meshBasicMaterial
                    ref={(m) => {
                      if (m) tileMats.current[i] = m;
                    }}
                    map={faceTex}
                    transparent
                    side={THREE.DoubleSide}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          </group>
        </RigidBody>
      </group>

      <Line
        ref={line as never}
        points={Array.from({ length: POINTS }, () => [0, 0, 0] as [number, number, number])}
        color="#7c5cff"
        lineWidth={7}
      />
    </>
  );
}

export default function Lanyard({
  playing,
  onTap,
  progress,
  screen,
}: {
  playing: boolean;
  onTap: () => void;
  progress: MotionValue<number>;
  screen: CardScreen;
}) {
  // Stop rendering and physics while the hero is scrolled out of view.
  const [ref, inView] = useInView<HTMLDivElement>("50px");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%", touchAction: "pan-y" }}>
      <Canvas
        camera={{ position: [0, 0, 10.5], fov: 25 }}
        dpr={[1, 1.75]}
        frameloop={inView ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Rig />
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 5, 6]} intensity={2.2} />
        <Physics gravity={[0, -40, 0]} timeStep={1 / 60} paused={!inView}>
          <Band playing={playing} onTap={onTap} progress={progress} screen={screen} />
        </Physics>
      </Canvas>
    </div>
  );
}
