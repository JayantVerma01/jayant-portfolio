"use client";

import "@/lib/quietThree";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useInView } from "@/hooks/useInView";
import { COVER_H, COVER_W, drawCover, type Project } from "./cover";

const CARD_W = 3.6;
const CARD_H = (CARD_W * COVER_H) / COVER_W;
const RADIUS = 5;
const STEP = 0.72; // radians between neighbours

/** Mutating three.js objects lives outside components to keep React lint happy. */
function markDirty(t: THREE.Texture) {
  t.needsUpdate = true;
}
function setOpacity(m: THREE.Material | THREE.Material[], v: number) {
  (Array.isArray(m) ? m[0] : m).opacity = v;
}

/** On narrow screens, pull the camera so the front card fills ~80% of the width. */
function fitCamera(cam: THREE.Camera, aspect: number, narrow: boolean) {
  const persp = cam as THREE.PerspectiveCamera;
  if (!narrow) {
    cam.position.z = 1.5;
    return;
  }
  const d = CARD_W / 0.72 / (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2)) * aspect);
  cam.position.z = d - RADIUS;
}

function useCoverTextures(list: Project[]) {
  const textures = useMemo(
    () =>
      list.map(() => {
        const c = document.createElement("canvas");
        c.width = COVER_W;
        c.height = COVER_H;
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        return t;
      }),
    [list],
  );

  useEffect(() => {
    let alive = true;
    const paint = () => {
      if (!alive) return;
      textures.forEach((t, i) => {
        drawCover(t.image as HTMLCanvasElement, list[i], i, list.length);
        markDirty(t);
      });
    };
    paint();
    void document.fonts.ready.then(paint);
    return () => {
      alive = false;
    };
  }, [textures, list]);

  return textures;
}

function Card({
  index,
  texture,
  pos,
  onSelect,
}: {
  index: number;
  texture: THREE.Texture;
  pos: React.RefObject<number>;
  onSelect: (i: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const d = index - pos.current;
    const theta = d * STEP;
    g.position.set(Math.sin(theta) * RADIUS, 0, -Math.cos(theta) * RADIUS);
    g.rotation.y = -theta;
    g.visible = Math.abs(d) < 3.4;
    if (mat.current) setOpacity(mat.current, THREE.MathUtils.clamp(1 - Math.abs(d) * 0.3, 0.12, 1));
  });

  return (
    <group ref={group}>
      <mesh
        onClick={(e) => {
          if (e.delta < 6) {
            e.stopPropagation();
            onSelect(index);
          }
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial ref={mat} map={texture} transparent toneMapped={false} />
      </mesh>
      {/* mirrored reflection */}
      <mesh position={[0, -CARD_H - 0.08, 0]} scale={[1, -1, 1]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={texture} transparent opacity={0.1} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({
  list,
  active,
  drag,
  onSelect,
}: {
  list: Project[];
  active: number;
  drag: React.RefObject<number>;
  onSelect: (i: number) => void;
}) {
  const textures = useCoverTextures(list);
  const pos = useRef(active);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    fitCamera(camera, size.width / size.height, size.width < 700);
  }, [camera, size.width, size.height]);

  useFrame((_, dt) => {
    const target = active + drag.current;
    pos.current += (target - pos.current) * (1 - Math.exp(-7 * dt));
  });

  return (
    <>
      {list.map((p, i) => (
        <Card key={p.id} index={i} texture={textures[i]} pos={pos} onSelect={onSelect} />
      ))}
    </>
  );
}

export default function Gallery3D({
  list,
  active,
  onChange,
}: {
  list: Project[];
  active: number;
  onChange: (i: number) => void;
}) {
  const drag = useRef(0);
  const start = useRef<{ x: number; w: number } | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const [viewRef, inView] = useInView<HTMLDivElement>("80px");

  const clamp = (i: number) => Math.max(0, Math.min(list.length - 1, i));

  return (
    <div
      ref={viewRef}
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      tabIndex={0}
      style={{
        height: "clamp(250px, 46vw, 520px)",
        cursor: grabbing ? "grabbing" : "grab",
        touchAction: "pan-y",
        outlineOffset: 4,
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onChange(clamp(active + 1));
        if (e.key === "ArrowLeft") onChange(clamp(active - 1));
      }}
      onPointerDown={(e) => {
        start.current = { x: e.clientX, w: e.currentTarget.clientWidth };
        setGrabbing(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        // dragging ~ a quarter of the width moves one card
        drag.current = -((e.clientX - start.current.x) / (start.current.w / 4));
      }}
      onPointerUp={(e) => {
        if (!start.current) return;
        const next = clamp(Math.round(active + drag.current));
        start.current = null;
        drag.current = 0;
        setGrabbing(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        if (next !== active) onChange(next);
      }}
    >
      <Canvas
        camera={{ position: [0, 0.3, 1.5], fov: 38 }}
        dpr={[1, 1.75]}
        frameloop={inView ? "always" : "never"}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Rig list={list} active={active} drag={drag} onSelect={onChange} />
      </Canvas>
    </div>
  );
}
