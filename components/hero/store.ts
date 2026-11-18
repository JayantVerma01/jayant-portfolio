import { motionValue } from "framer-motion";
import type { CardScreen } from "./scene";

/**
 * Shared, framework-free scroll state. The hero scene, the skills deck and the
 * page-level Luffy all read/write these, so Luffy can travel between scenes.
 */

/** Progress through the home → about → envelope scene (0..1). */
export const heroP = motionValue(0);

/** Where the ID card is on screen (published by the 3D scene). */
export const cardScreen: CardScreen = {
  gx: motionValue(0),
  gy: motionValue(0),
  cx: motionValue(0),
  cy: motionValue(0),
  ready: motionValue(0),
};

export const deck = {
  /** Index of the focused skill card, -1 while the deck is still being dealt. */
  active: motionValue(-1),
  /** 0 → 1 as the skills section scrolls out of view (Luffy leaves with it). */
  leave: motionValue(0),
};

/** Pages can ask Luffy to hop onto an element (e.g. the project detail panel). */
export const luffyPerch: { el: HTMLElement | null; id: number } = { el: null, id: 0 };
export function perchOn(el: HTMLElement | null) {
  luffyPerch.el = el;
  luffyPerch.id += 1;
}

/** Ask Luffy to punch something (e.g. the message bottle) with Gomu Gomu no Pistol. */
export const luffyPunch: { el: HTMLElement | null; id: number } = { el: null, id: 0 };
export function punchAt(el: HTMLElement | null) {
  luffyPunch.el = el;
  luffyPunch.id += 1;
}
