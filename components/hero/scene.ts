import type { MotionValue } from "framer-motion";

/**
 * Scroll choreography for the home → about scene (progress 0..1 through the
 * tall sticky section).
 *
 *   0.00 – 0.05   hero copy fades, Luffy runs to the card
 *   0.05 – 0.46   Luffy stretches the card like rubber
 *   0.46 – 0.52   gum-gum snap: arms recoil
 *   0.50 – 0.80   the card scatters into the About details
 *   0.80 – 1.00   About holds on one screen
 */
export const SCENE = {
  stretchFrom: 0.04,
  stretchTo: 0.3, // card is fully stretched and centred
  expandFrom: 0.31, // the card inflates like a balloon...
  scatterFrom: 0.39, // ...then bursts into many pieces
  scatterTo: 0.67,
  copyFadeTo: 0.17,
  aboutDone: 0.76,
  envFrom: 0.82,
  envTo: 0.97,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeInOut = (v: number) => v * v * (3 - 2 * v);
export const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);

/** Where the card is on screen (px, relative to the stage) — published by the 3D scene for Luffy. */
export type CardScreen = {
  gx: MotionValue<number>; // grab point (lower-left edge of the card)
  gy: MotionValue<number>;
  cx: MotionValue<number>; // card centre
  cy: MotionValue<number>;
  ready: MotionValue<number>; // 1 once the card has been projected
};

/** How far the closing sheet has risen (0 = off-screen below, 1 = covers everything). */
export const sheetFrac = (p: number) =>
  easeInOut(clamp01((p - SCENE.envFrom) / (SCENE.envTo - SCENE.envFrom - 0.03)));

/** How much the sheet's top edge bows upward where Luffy's hand holds it (px). */
export const sheetBump = (f: number) => 150 * Math.sin(Math.PI * Math.min(1, f));
