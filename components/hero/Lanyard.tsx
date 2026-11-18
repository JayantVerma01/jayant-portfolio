"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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

const CARD_W = 1.6;
const CARD_H = 2.25;
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
  const mono = cssFont("--font-mono", "ui-monospace, monospace");
  const serif = cssFont("--font-display", "Georgia, serif");

  ctx.setTransform(2, 0, 0, 2, 0, 0); // design in 320 x 450
  ctx.clearRect(0, 0, 320, 450);

  ctx.fillStyle = "#f4f0e8";
  ctx.beginPath();
  ctx.roundRect(0, 0, 320, 450, 22);
  ctx.fill();

  // top row
  ctx.fillStyle = "#6a6672";
  ctx.font = `10px ${mono}`;
  ctx.letterSpacing = "1.8px";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText("STAFF PASS", 20, 34);
  ctx.textAlign = "right";
  ctx.fillText("2026", 300, 34);
  ctx.letterSpacing = "0px";

  // photo
  const px = 20, py = 50, pw = 280, ph = 224;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 14);
  ctx.clip();
  if (photo) {
    const r = Math.max(pw / photo.width, ph / photo.height);
    const w = photo.width * r, h = photo.height * r;
    ctx.drawImage(photo, px + (pw - w) / 2, py + (ph - h) / 2, w, h);
  } else {
    const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
    g.addColorStop(0, "#8f78ff");
    g.addColorStop(0.55, "#5b3df0");
    g.addColorStop(1, "#22b8d4");
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = `italic 110px ${serif}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("JV", px + pw / 2, py + ph / 2 + 6);
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  // availability chip
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.beginPath();
  ctx.roundRect(30, 240, 84, 26, 13);
  ctx.fill();
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(44, 253, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#17151f";
  ctx.font = `600 11px ${sans}`;
  ctx.textAlign = "left";
  ctx.fillText("Available", 53, 257);

  // identity
  ctx.fillStyle = "#17151f";
  ctx.font = `34px ${serif}`;
  ctx.fillText(personalInfo.name, 20, 318);
  ctx.font = `600 13px ${sans}`;
  ctx.fillText(personalInfo.role, 20, 342);
  ctx.fillStyle = "#6a6672";
  ctx.font = `12px ${sans}`;
  ctx.fillText(personalInfo.location, 20, 362);

  // play pill
  ctx.fillStyle = "#17151f";
  ctx.beginPath();
  ctx.roundRect(20, 380, 280, 50, 25);
  ctx.fill();
  ctx.fillStyle = "#7c5cff";
  ctx.beginPath();
  ctx.arc(45, 405, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  if (playing) {
    ctx.fillRect(39, 398, 4, 14);
    ctx.fillRect(48, 398, 4, 14);
  } else {
    ctx.beginPath();
    ctx.moveTo(41, 397);
    ctx.lineTo(41, 413);
    ctx.lineTo(54, 405);
    ctx.closePath();
    ctx.fill();
  }
  ctx.font = `600 13px ${sans}`;
  ctx.textAlign = "left";
  ctx.fillText(playing ? "Playing…" : "Hear my intro", 72, 410);
  const heights = playing ? [8, 16, 11, 14] : [4, 4, 4, 4];
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  heights.forEach((h, i) => ctx.fillRect(262 + i * 7, 405 - h / 2, 3, h));
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

function Band({ playing, onTap }: { playing: boolean; onTap: () => void }) {
  const line = useRef<{ geometry: { setPositions: (a: Float32Array) => void } } | null>(null);
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
    const g = new THREE.ExtrudeGeometry(roundedCardShape(CARD_W, CARD_H, 0.11), {
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
      const pts = curve.getPoints(POINTS);
      for (let i = 0; i < POINTS; i++) {
        positions[i * 3] = pts[i].x;
        positions[i * 3 + 1] = pts[i].y;
        positions[i * 3 + 2] = pts[i].z;
      }
      line.current?.geometry.setPositions(positions);

      // Keep the card facing the camera.
      ang.copy(card.current.angvel() as THREE.Vector3);
      rot.copy(card.current.rotation() as unknown as THREE.Vector3);
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
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
      <group position={[0, 4.3, 0]}>
        <RigidBody ref={fixed} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segment}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segment}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segment}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segment}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[CARD_W / 2, CARD_H / 2, 0.02]} />
          <group
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
            {/* card body */}
            <mesh geometry={bodyGeo}>
              <meshStandardMaterial color="#e9e4d8" roughness={0.5} metalness={0.05} />
            </mesh>
            {/* painted face */}
            <mesh position={[0, 0, 0.0215]}>
              <planeGeometry args={[CARD_W, CARD_H]} />
              <meshBasicMaterial map={faceTex} transparent toneMapped={false} />
            </mesh>
            {/* clip */}
            <mesh position={[0, CARD_H / 2 + 0.06, 0]}>
              <boxGeometry args={[0.34, 0.2, 0.08]} />
              <meshStandardMaterial color="#2a2733" metalness={0.8} roughness={0.3} />
            </mesh>
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
}: {
  playing: boolean;
  onTap: () => void;
}) {
  // Stop rendering and physics while the hero is scrolled out of view.
  const [ref, inView] = useInView<HTMLDivElement>("50px");
  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 11], fov: 25 }}
        dpr={[1, 1.75]}
        frameloop={inView ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 5, 6]} intensity={2.2} />
        <Physics gravity={[0, -40, 0]} timeStep="vary" paused={!inView}>
          <Band playing={playing} onTap={onTap} />
        </Physics>
      </Canvas>
    </div>
  );
}
