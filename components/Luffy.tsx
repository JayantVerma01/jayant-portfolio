"use client";

import { useEffect, useRef } from "react";
import { SCENE, clamp01, easeInOut, easeOut, sheetBump, sheetFrac } from "./hero/scene";
import { cardScreen, deck, heroP, luffyPerch, luffyPunch, luffyTalk } from "./hero/store";
import { useRich3D } from "@/hooks/useRich3D";
import styles from "./Luffy.module.css";
import { LuffyArt, SH_L, SH_R, HEIGHT, drawArm, type Pt } from "./LuffyArt";
import { skillGroups } from "@/lib/skills";

const LAST = skillGroups.length - 1;

/**
 * A chibi Monkey D. Luffy (an original SVG sketch) who roams the home scene.
 * Gomu Gomu no Mi: his arms stretch like rubber. He walks, jumps, throws a
 * Gomu Gomu Pistol at the page (which wobbles like jelly), shoots himself
 * across the screen with Gomu Gomu no Rocket, and while you scroll he grabs
 * the ID card, stretches it, then blasts it apart with a Bazooka.
 */

type Act =
  | { type: "pistol"; t: number; dur: number; to: Pt; el: Element | null; hit: boolean }
  | { type: "rocket"; t: number; from: Pt; to: Pt };

const LINES = ["Yosha!", "Shishishi!", "Adventure!", "Meat!?", "Gomu Gomu!"];

/** One page-level Luffy that roams the hero, then hops across the skills deck. */
export default function Luffy() {
  const rich = useRich3D();
  return rich === true ? <LuffyWorld /> : null;
}

function LuffyWorld() {
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<SVGGElement>(null);
  const legL = useRef<SVGGElement>(null);
  const legR = useRef<SVGGElement>(null);
  const head = useRef<SVGGElement>(null);
  const aLo = useRef<SVGPathElement>(null);
  const aLf = useRef<SVGPathElement>(null);
  const aLh = useRef<SVGPathElement>(null);
  const aLfist = useRef<SVGGElement>(null);
  const aRo = useRef<SVGPathElement>(null);
  const aRf = useRef<SVGPathElement>(null);
  const aRh = useRef<SVGPathElement>(null);
  const aRfist = useRef<SVGGElement>(null);
  const sLo = useRef<SVGPathElement>(null);
  const sLf = useRef<SVGPathElement>(null);
  const sRo = useRef<SVGPathElement>(null);
  const sRf = useRef<SVGPathElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const streak = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let W = window.innerWidth;
    let H = window.innerHeight;
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // character state
    const L = { x: W * 0.35, y: H * 0.84, vy: 0, dir: 1 as 1 | -1, walk: 0, lean: 0, bob: 0 };
    let walkTo: number | null = null;
    let wait = 1.2;
    let act: Act | null = null;
    let handL: Pt | null = null;
    let handR: Pt | null = null;
    let wL = 0;
    let wR = 0;
    let last = performance.now();
    let time = 0;
    let raf = 0;
    let bubbleText = "";

    // skills deck hopping
    let dcur = -2; // card he stands on (-2 = still in the hero scene)
    let djump: { t: number; dur: number; from: Pt; apex: number; pre: number } | null = null;
    let squash = 0;
    let landText = "";
    let landUntil = 0;
    let backHop: { t: number; from: Pt } | null = null;

    // Projects zone: Luffy follows what you hover, and pokes the cards
    let hoverEl: HTMLElement | null = null;
    let hoverUntil = 0;
    let hoverUser = false; // true while the pointer is over a perch target
    let slowT = 0; // slow lane (zone checks etc.) runs ~10x a second instead of every frame
    let zoneNowC = "";
    let visC = 0;
    let lastMove = -9; // last time the pointer really moved (scroll-induced hovers are ignored)
    let zoneId = ""; // which scene section he is working in (experience / process / contact)
    let gripR: Pt | null = null; // where his hands hold the ship's wheel
    let gripL: Pt | null = null;
    let punch: { t: number; to: Pt } | null = null;
    let seenPunch = luffyPunch.id;
    let seenTalk = luffyTalk.id;
    let perched: HTMLElement | null = null;
    let hj: { t: number; dur: number; from: Pt; apex: number; pre: number; roll: boolean; n: number; sgn: 1 | -1 } | null = null;
    let rollAmt = 0; // 0 = standing, 1 = curled into a ball
    let rollAng = 0;
    let seenPerch = luffyPerch.id;
    let pokeSel = "[data-jelly]";
    const onMove = () => {
      lastMove = time;
    };
    const onOver = (e: PointerEvent) => {
      if (time - lastMove > 0.35) return; // the page scrolled under a still pointer
      const t = (e.target as Element | null)?.closest?.("[data-luffy-perch]") as HTMLElement | null;
      if (t) {
        hoverEl = t;
        hoverUntil = Infinity;
        hoverUser = true;
      }
    };
    const onOut = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest?.("[data-luffy-perch]") as HTMLElement | null;
      if (!t || t !== hoverEl) return;
      const to = (e.relatedTarget as Element | null)?.closest?.("[data-luffy-perch]");
      if (to !== t) hoverUntil = time + 1.4;
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    // leaving the last skill card: stretch legs, grab "Things I've shipped", rocket over
    let pj: { phase: 0 | 1 | 2 | 3 | 4 | 5; t: number; from: Pt } = { phase: 0, t: 0, from: { x: 0, y: 0 } };
    const cardTarget = (i: number): Pt | null => {
      const c = q1(`[data-deck-card="${i}"]`);
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width * 0.5, y: r.top + 12 };
    };

    const groundY = () => H * 0.86;
    const scaleOf = () => Math.min(118, Math.max(72, H * 0.135)) / HEIGHT;
    const toLocal = (p: Pt, S: number): Pt => {
      const c = Math.cos(-L.lean);
      const s = Math.sin(-L.lean);
      const dx = (p.x - L.x) / S;
      const dy = (p.y - L.y) / S;
      return { x: (dx * c - dy * s) * L.dir, y: dx * s + dy * c };
    };
    const jelly = (target: Element | null) => {
      if (!target) return;
      target.classList.remove("jelly");
      void (target as HTMLElement).offsetWidth;
      target.classList.add("jelly");
      window.setTimeout(() => target.classList.remove("jelly"), 800);
    };
    const rel = (r: DOMRect): Pt => {
      const b = el.getBoundingClientRect();
      return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
    };

    const heroTextAllowed = (t: number) => Math.floor(t / 4) % 3 === 0 && t % 4 < 1.1;
    const cache = new Map<string, Element | null>();
    const q1 = (sel: string) => {
      let e = cache.get(sel) ?? null;
      if (!e || !e.isConnected) {
        e = document.querySelector(sel);
        cache.set(sel, e);
      }
      return e;
    };
    const lists = new Map<string, { t: number; l: Element[] }>();
    const qa = (sel: string) => {
      const c = lists.get(sel);
      if (c && time - c.t < 0.5 && c.l.every((e) => e.isConnected)) return c.l;
      const l = Array.from(document.querySelectorAll(sel));
      lists.set(sel, { t: time, l });
      return l;
    };
    const landed = (el: HTMLElement | null) => {
      squash = 1;
      if (el?.hasAttribute("data-exp-poster")) {
        jelly(el);
        landText = "Case file!";
        landUntil = time + 1.2;
      } else if (Math.random() < 0.6) {
        landText = LINES[Math.floor(Math.random() * LINES.length)];
        landUntil = time + 1.1;
      }
    };

    const decide = (p: number) => {
      const r = Math.random();
      if (r < 0.46) {
        walkTo = W * (0.08 + Math.random() * 0.84);
      } else if (r < 0.6) {
        L.vy = -560;
      } else if (r < 0.82) {
        // Gomu Gomu no Pistol
        let to: Pt;
        let target: Element | null = null;
        const jel =
          p > 0.68 || pokeSel !== "[data-jelly]"
            ? Array.from(document.querySelectorAll(pokeSel)).filter((n) => {
                const r = n.getBoundingClientRect();
                return r.top > 70 && r.bottom < H - 20;
              })
            : [];
        if (jel.length) {
          target = jel[Math.floor(Math.random() * jel.length)];
          to = rel(target.getBoundingClientRect());
        } else {
          const d = Math.random() < 0.5 ? 1 : -1;
          to = {
            x: Math.min(W - 20, Math.max(20, L.x + d * (260 + Math.random() * 260))),
            y: L.y - 60 - Math.random() * 120,
          };
        }
        act = { type: "pistol", t: 0, dur: 0.75, to, el: target, hit: false };
      } else {
        // Gomu Gomu no Rocket
        act = {
          type: "rocket",
          t: 0,
          from: { x: L.x, y: L.y },
          to: { x: W * (0.1 + Math.random() * 0.8), y: H * (0.3 + Math.random() * 0.4) },
        };
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      const p = heroP.get();
      const S = scaleOf();
      const gy = groundY();

      const e = easeInOut(clamp01((p - SCENE.stretchFrom) / (SCENE.stretchTo - SCENE.stretchFrom)));
      const pulling = p > 0.015 && p < SCENE.scatterFrom && cardScreen.ready.get() > 0;
      const bazooka = p >= SCENE.scatterFrom && p < SCENE.scatterFrom + 0.06;
      const cheering = p >= SCENE.scatterFrom + 0.06 && p < SCENE.aboutDone;
      const sealing = p >= SCENE.envFrom;
      const deckMode = p >= SCENE.envTo - 0.012;
      let placed = false; // position driven by a scripted hop / card ride
      let hopping = false;
      let crouch = 0;
      if (!deckMode) {
        if (dcur >= 0 && !backHop) {
          // scrolling back up: hop from the card back to the sheet he was pulling
          backHop = { t: 0, from: { x: L.x, y: L.y } };
        }
        dcur = -2;
        djump = null;
      } else {
        backHop = null;
      }

      let visOverride: number | null = null;
      if (!deckMode) pj = { phase: 0, t: 0, from: { x: 0, y: 0 } };

      // "Things I've shipped" heading (Projects zone)
      const headEl = deckMode ? (q1('[data-luffy="projects-title"]') as HTMLElement | null) : null;
      const hrect = headEl ? headEl.getBoundingClientRect() : null;
      if (deckMode && hrect) {
        if (pj.phase === 4 && hrect.bottom < 150) pj = { phase: 5, t: 0, from: pj.from }; // free roam in Projects
        else if (pj.phase === 5 && hrect.bottom > 230) pj = { phase: 3, t: 0, from: { x: L.x, y: L.y } }; // back up to the heading
      }
      // Scene sections (experience / process / contact): the one covering the middle of the screen
      const tick = time - slowT > 0.1;
      if (tick) {
        slowT = time;
        zoneNowC = "";
        if (deckMode) {
          for (const id of ["experience", "process", "contact", "footer"]) {
            const z = q1("#" + id);
            if (!z) continue;
            const zr = z.getBoundingClientRect();
            if (zr.top < H * 0.55 && zr.bottom > H * 0.55) zoneNowC = id;
          }
          if (zoneNowC) zoneId = zoneNowC;
        }
      }
      const zoneNow = deckMode ? zoneNowC : "";
      const inZone = deckMode && !!zoneNow;
      if (inZone && pj.phase !== 5) pj = { phase: 5, t: 0, from: { x: L.x, y: L.y } };
      if (pj.phase === 5 && !inZone && (!hrect || hrect.top > H - 40 || deck.active.get() < LAST)) {
        pj.phase = 0;
        dcur = -2; // scrolled back into Skills: return to the last card
      }
      const roamMode = deckMode && pj.phase === 5;
      pokeSel = roamMode ? "[data-luffy-poke]" : "[data-jelly]";
      if (luffyPerch.id !== seenPerch) {
        seenPerch = luffyPerch.id;
        if (roamMode && luffyPerch.el) {
          hoverEl = luffyPerch.el;
          hoverUntil = time + 4.5;
        }
      }
      if (!roamMode || (hoverEl && time > hoverUntil)) {
        hoverEl = null;
        hoverUser = false;
        perched = null;
        hj = null;
      }
      if (tick && roamMode && inZone && zoneId === "experience" && !hoverUser) {
        // per stop: start on its island, roll over to its poster, then on to the next island
        let row: Element | null = null;
        let bd = 1e9;
        qa("[data-exp-row]").forEach((n) => {
          const r = n.getBoundingClientRect();
          const d = Math.abs((r.top + r.bottom) / 2 - H * 0.5);
          if (d < bd) {
            bd = d;
            row = n;
          }
        });
        if (row) {
          const rr = (row as Element).getBoundingClientRect();
          const t = clamp01((H * 0.5 - rr.top) / Math.max(1, rr.height));
          const poster = (row as Element).querySelector("[data-exp-poster]");
          const goal = (poster && t > 0.46 ? poster : (row as Element).querySelector("[data-exp-stop]")) as HTMLElement | null;
          if (goal && goal !== hoverEl) {
            hoverEl = goal;
            hoverUntil = Infinity;
          }
        }
      }
      if (tick && roamMode && inZone && zoneId !== "experience" && !hoverUser) {
        const goal = q1(zoneId === "process" ? "[data-proc-stand]" : zoneId === "footer" ? "[data-footer-seat]" : "[data-contact-stand]") as HTMLElement | null;
        if (goal && goal !== hoverEl) {
          hoverEl = goal;
          hoverUntil = Infinity;
        }
      }
      if (roamMode) {
        if (tick) {
          let v = 0;
          for (const id of ["projects", "experience", "process", "contact", "footer"]) {
            const sec = q1("#" + id);
            if (!sec) continue;
            const r = sec.getBoundingClientRect();
            v = Math.max(v, clamp01((r.bottom - H * 0.3) / 160) * clamp01((H * 0.97 - r.top) / 120));
          }
          visC = v;
        }
        visOverride = visC;
      }

      if (luffyTalk.id !== seenTalk) {
        seenTalk = luffyTalk.id;
        landText = luffyTalk.text;
        landUntil = time + 1.4;
      }
      if (luffyPunch.id !== seenPunch) {
        seenPunch = luffyPunch.id;
        const pe = luffyPunch.el;
        if (roamMode && pe && !hj) {
          const pr = pe.getBoundingClientRect();
          punch = { t: 0, to: { x: pr.left + pr.width / 2, y: pr.top + pr.height / 2 } };
        }
      }

      let tx = L.x;
      let leaning = 0;
      let speed = 0;
      let wantL = 0;
      let wantR = 0;
      let hL: Pt | null = null;
      let hR: Pt | null = null;
      let text = "";

      if (backHop) {
        backHop.t += dt;
        const u = clamp01(backHop.t / 0.7);
        const k = easeInOut(u);
        const to = { x: W * 0.2, y: gy };
        L.x = backHop.from.x + (to.x - backHop.from.x) * k;
        L.y = backHop.from.y + (to.y - backHop.from.y) * k - 4 * 140 * u * (1 - u);
        L.vy = 0;
        L.dir = 1;
        hopping = u < 1;
        act = null;
        walkTo = null;
        placed = true;
        visOverride = 1;
        if (u >= 1) {
          squash = 1;
          backHop = null;
        }
      } else if (deckMode && !roamMode) {
        act = null;
        walkTo = null;
        L.dir = 1;
        if (pj.phase === 0 && dcur === LAST && !djump && hrect && hrect.top < H - 70 && deck.active.get() === LAST) {
          pj = { phase: 1, t: 0, from: { x: L.x, y: L.y } };
        }
        if (pj.phase > 0 && (deck.active.get() < LAST || !hrect || hrect.top > H - 40)) {
          pj.phase = 0;
          dcur = -2; // go back to the cards
        }

        if (pj.phase > 0 && hrect) {
          pj.t += dt;
          const w = Math.min(hrect.width, 520);
          const yText = hrect.top + hrect.height * 0.62;
          const land = { x: hrect.left + Math.min(hrect.width * 0.2, 120), y: hrect.bottom + 12 + HEIGHT * S * 0.8 };
          const rideCard = () => {
            const ct = cardTarget(dcur);
            if (ct) {
              L.x += (ct.x - L.x) * Math.min(1, dt * 14);
              L.y += (ct.y - L.y) * Math.min(1, dt * 14);
            }
          };
          if (pj.phase === 1) {
            const u = clamp01(pj.t / 0.6);
            wantL = wantR = easeOut(u);
            crouch = 0.45 * u;
            rideCard();
            hL = { x: hrect.left + w * 0.2, y: yText };
            hR = { x: hrect.left + w * 0.52, y: yText };
            text = "GOMU GOMU NO…";
            visOverride = 1;
            if (pj.t >= 0.6) pj = { phase: 2, t: 0, from: pj.from };
          } else if (pj.phase === 2) {
            wantL = wantR = 1;
            crouch = 0.45 + Math.min(0.2, pj.t);
            rideCard();
            hL = { x: hrect.left + w * 0.2, y: yText };
            hR = { x: hrect.left + w * 0.52, y: yText };
            text = "GOMU GOMU NO…";
            visOverride = 1;
            if (pj.t >= 0.22) pj = { phase: 3, t: 0, from: { x: L.x, y: L.y } };
          } else if (pj.phase === 3) {
            // legs stay hooked on the heading; he is reeled in like a slingshot
            const u = clamp01(pj.t / 0.62);
            const k = easeInOut(u);
            L.x = pj.from.x + (land.x - pj.from.x) * k;
            L.y = pj.from.y + (land.y - pj.from.y) * k - 4 * 70 * u * (1 - u);
            wantL = wantR = 1;
            hL = { x: hrect.left + w * 0.2, y: yText };
            hR = { x: hrect.left + w * 0.52, y: yText };
            hopping = u < 0.92;
            leaning = (land.x - pj.from.x) * 0.0004 * (1 - u);
            text = "ROCKET!!";
            visOverride = 1;
            if (u >= 1) {
              pj = { phase: 4, t: 0, from: pj.from };
              squash = 1;
              landText = "Yosha!";
              landUntil = time + 1.3;
            }
          } else {
            // perched just below the heading, riding it as the page scrolls
            L.x += (land.x - L.x) * Math.min(1, dt * 14);
            L.y += (land.y - L.y) * Math.min(1, dt * 14);
            if (time < landUntil) text = landText;
            visOverride = clamp01((hrect.bottom + 40) / 90);
          }
          L.vy = 0;
          placed = true;
        } else {
          if (dcur >= 0 || djump) visOverride = 1;
          const want = Math.max(0, deck.active.get());
          const tgt = cardTarget(want);
          const seen = !!tgt && tgt.y < H - 70 && tgt.y > -40;
          if (!djump && seen && tgt && want !== dcur) {
            const dist = Math.hypot(tgt.x - L.x, tgt.y - L.y);
            djump = {
              t: 0,
              dur: 0.52 + Math.min(0.5, dist / 1700),
              from: { x: L.x, y: L.y },
              apex: 90 + Math.min(160, dist * 0.18),
              pre: 0.14,
            };
            dcur = want;
          }
          if (djump) {
            djump.t += dt;
            if (djump.t < djump.pre) {
              crouch = djump.t / djump.pre;
            } else {
              const u = clamp01((djump.t - djump.pre) / djump.dur);
              const to = cardTarget(dcur) ?? djump.from;
              const k = easeInOut(u);
              L.x = djump.from.x + (to.x - djump.from.x) * k;
              L.y = djump.from.y + (to.y - djump.from.y) * k - 4 * djump.apex * u * (1 - u);
              L.vy = 0;
              hopping = u < 1;
              leaning = (to.x - djump.from.x) * 0.0005 * (1 - u);
              if (u >= 1) {
                squash = 1;
                djump = null;
                if (Math.random() < 0.7) {
                  landText = LINES[Math.floor(Math.random() * LINES.length)];
                  landUntil = time + 1.1;
                }
              }
            }
            placed = true;
          } else if (dcur >= 0) {
            const t = cardTarget(dcur);
            if (t) {
              L.x += (t.x - L.x) * Math.min(1, dt * 14);
              L.y += (t.y - L.y) * Math.min(1, dt * 14);
            }
            L.vy = 0;
            placed = true;
          } else {
            tx = W * 0.2; // waiting at the side for the first card to appear
          }
          if (time < landUntil) text = landText;
        }
      } else if (pulling || bazooka) {
        const gxv = cardScreen.gx.get();
        const gyv = cardScreen.gy.get();
        const dist = pulling ? 130 + e * Math.min(W * 0.3, 420) : Math.min(W * 0.3, 420) + 40;
        tx = Math.max(40, gxv - dist);
        L.dir = 1;
        act = null;
        walkTo = null;
        if (pulling) {
          const grab = clamp01((p - 0.02) / 0.03);
          wantL = wantR = grab;
          hR = { x: gxv + 4, y: gyv };
          hL = { x: gxv + 4, y: gyv + 16 };
          leaning = -0.2 * e;
          if (e > 0.9) text = "GOMU GOMU NO…";
        } else {
          // Bazooka: both palms strike the card
          wantL = wantR = 1;
          const c = { x: cardScreen.cx.get(), y: cardScreen.cy.get() };
          hR = { x: c.x, y: c.y - 14 };
          hL = { x: c.x, y: c.y + 14 };
          leaning = 0.18;
          text = "BAZOOKA!!";
        }
      } else if (sealing && !roamMode) {
        // Luffy hauls the page-coloured sheet up from the bottom with one rubber hand
        const f = sheetFrac(p);
        tx = W * 0.2;
        L.dir = 1;
        act = null;
        walkTo = null;
        wantR = clamp01((p - SCENE.envFrom) / 0.03);
        hR = { x: W * 0.5, y: Math.min(H * 0.95, Math.max(24, H * (1 - f) - sheetBump(f) / 2)) };
        leaning = -0.14 * f;
        if (f > 0.12 && f < 0.9) text = "HEAVE-HO!";
        else if (f >= 0.92) text = "Skills time!";
      } else if (cheering) {
        tx = W * 0.14;
        L.dir = 1;
        act = null;
        walkTo = null;
        if (p > SCENE.scatterFrom + 0.1 && p < SCENE.aboutDone) text = "Shishishi!";
        if (L.y >= gy - 1 && Math.sin(time * 6) > 0.96) L.vy = -380;
        leaning = 0;
      } else if (roamMode && hoverEl) {
        // follow what the visitor is hovering: hop on top of it and stand there
        const r = hoverEl.getBoundingClientRect();
        // islands and posters may be partly off the top: he then stands on the visible part
        const isExp =
          hoverEl.hasAttribute("data-exp-poster") ||
          hoverEl.hasAttribute("data-exp-stop") ||
          hoverEl.hasAttribute("data-proc-stand") ||
          hoverEl.hasAttribute("data-contact-stand") ||
          hoverEl.hasAttribute("data-footer-seat");
        const tg: Pt = {
          x: r.left + r.width * 0.5,
          y: isExp ? Math.min(Math.max(r.top + 4, 200), H - 70) : r.top + 4,
        };
        if (!(isExp ? r.bottom > 230 && r.top < H - 50 : r.bottom > 80 && tg.y > 130 && tg.y < H - 30)) {
          hoverEl = null;
          hoverUser = false;
          perched = null;
          hj = null;
        } else {
          act = null;
          walkTo = null;
          L.dir = 1;
          if (perched !== hoverEl && !hj) {
            const dist = Math.hypot(tg.x - L.x, tg.y - L.y);
            // far targets in Experience: stretch both hands onto it and reel himself in (Gomu Gomu Rocket)
            const grab = isExp && dist > 320;
            hj = {
              t: 0,
              dur: 0.42 + Math.min(0.5, dist / 1700),
              from: { x: L.x, y: L.y },
              apex: grab ? 46 : 70 + Math.min(130, dist * 0.15),
              pre: grab ? 0.34 : 0.12,
              roll: grab,
              n: 0,
              sgn: 1,
            };
            perched = hoverEl;
          }
          if (hj) {
            hj.t += dt;
            if (hj.t < hj.pre) {
              crouch = (hj.roll ? 0.4 : 1) * easeOut(hj.t / hj.pre);
              if (hj.roll) {
                wantL = wantR = easeOut(hj.t / hj.pre);
                hR = { x: tg.x + 10, y: tg.y };
                hL = { x: tg.x - 10, y: tg.y };
              }
            } else {
              const u = clamp01((hj.t - hj.pre) / hj.dur);
              const k = easeInOut(u);
              L.x = hj.from.x + (tg.x - hj.from.x) * k;
              L.y = hj.from.y + (tg.y - hj.from.y) * k - 4 * hj.apex * u * (1 - u);
              L.vy = 0;
              hopping = u < 0.92;
              leaning = (tg.x - hj.from.x) * 0.0005 * (1 - u);
              if (hj.roll) {
                // hands stay hooked on the target and shorten as he flies in, then let go
                wantL = wantR = u < 0.86 ? 1 : 0;
                hR = { x: tg.x + 10, y: tg.y };
                hL = { x: tg.x - 10, y: tg.y };
                if (u < 0.9) text = "ROCKET!";
              }
              if (u >= 1) {
                hj = null;
                landed(perched);
              }
            }
          } else {
            L.x += (tg.x - L.x) * Math.min(1, dt * 14);
            L.y += (tg.y - L.y) * Math.min(1, dt * 14);
            L.vy = 0;

            if (perched?.hasAttribute("data-proc-stand")) {
              // Process: his rubber hands grab the handles of the ship's wheel and turn it
              const hs = qa("[data-proc-handle]").map((h) => {
                const hr2 = h.getBoundingClientRect();
                return { x: hr2.left + hr2.width / 2, y: hr2.top + hr2.height / 2 };
              });
              const chest = { x: L.x + 14 * S, y: L.y - 84 * S };
              hs.sort((a, b) => Math.hypot(a.x - chest.x, a.y - chest.y) - Math.hypot(b.x - chest.x, b.y - chest.y));
              if (hs.length > 1) {
                const k = 1 - Math.exp(-dt * 16);
                gripR = gripR ? { x: gripR.x + (hs[0].x - gripR.x) * k, y: gripR.y + (hs[0].y - gripR.y) * k } : hs[0];
                gripL = gripL ? { x: gripL.x + (hs[1].x - gripL.x) * k, y: gripL.y + (hs[1].y - gripL.y) * k } : hs[1];
                hR = gripR;
                hL = gripL;
                wantL = wantR = 1;
                leaning = 0.08;
                if (heroTextAllowed(time)) text = "Yo-ho!";
              }
            }
          }
          placed = true;
          if (time < landUntil) text = landText;
        }
      } else if (roamMode && inZone) {
        // Experience: Luffy only ever travels between islands and posters
        act = null;
        walkTo = null;
        L.vy = 0;
        L.dir = 1;
        placed = true;
        if (time < landUntil) text = landText;
      } else if (act) {
        // scripted moves
        if (act.type === "pistol") {
          act.t += dt;
          const u = act.t / act.dur;
          const ext = u < 0.34 ? easeOut(u / 0.34) : u < 0.46 ? 1 : 1 - easeInOut(clamp01((u - 0.46) / 0.54));
          L.dir = act.to.x >= L.x ? 1 : -1;
          const sh = {
            x: L.x + L.dir * 28 * S,
            y: L.y - 94 * S,
          };
          hR = { x: sh.x + (act.to.x - sh.x) * ext, y: sh.y + (act.to.y - sh.y) * ext };
          wantR = 1;
          if (!act.hit && ext > 0.97) {
            act.hit = true;
            jelly(act.el);
          }
          if (u >= 1) act = null;
        } else {
          act.t += dt;
          const t1 = 0.28;
          const t2 = 0.68;
          L.dir = act.to.x >= act.from.x ? 1 : -1;
          if (act.t < t1) {
            const u = easeOut(act.t / t1);
            const sh = { x: L.x + L.dir * 28 * S, y: L.y - 94 * S };
            hR = { x: sh.x + (act.to.x - sh.x) * u, y: sh.y + (act.to.y - sh.y) * u };
            hL = { x: hR.x, y: hR.y + 8 };
            wantL = wantR = 1;
          } else if (act.t < t2) {
            const u = easeInOut((act.t - t1) / (t2 - t1));
            L.x = act.from.x + (act.to.x - act.from.x) * u;
            L.y = act.from.y + (act.to.y - act.from.y) * u;
            L.vy = 0;
            hR = { x: act.to.x, y: act.to.y - 94 * S };
            hL = { x: hR.x, y: hR.y + 8 };
            wantL = wantR = 1;
            leaning = L.dir * 0.3;
          } else {
            act = null;
          }
        }
        tx = L.x;
      } else if (wait > 0) {
        wait -= dt;
        tx = L.x;
      } else if (walkTo !== null) {
        tx = walkTo;
        if (Math.abs(walkTo - L.x) < 6) {
          walkTo = null;
          wait = 0.6 + Math.random() * 1.6;
        }
      } else {
        decide(p);
        wait = 0.2;
      }

      if (punch) {
        // Gomu Gomu no Pistol at the message bottle
        punch.t += dt;
        const u = punch.t / 0.8;
        const ext = u < 0.32 ? easeOut(u / 0.32) : u < 0.46 ? 1 : 1 - easeInOut(clamp01((u - 0.46) / 0.54));
        const sh = { x: L.x + 28 * S, y: L.y - 94 * S };
        hR = { x: sh.x + (punch.to.x - sh.x) * ext, y: sh.y + (punch.to.y - sh.y) * ext };
        wantR = 1;
        text = "PISTOL!";
        if (u >= 1) punch = null;
      }

      // movement
      if (!placed && !(act && act.type === "rocket" && act.t >= 0.28)) {
        const dx = tx - L.x;
        const follow = pulling || bazooka || cheering;
        const step = follow ? Math.min(Math.abs(dx), 520 * dt + Math.abs(dx) * dt * 4) : Math.min(Math.abs(dx), 150 * dt);
        if (Math.abs(dx) > 1) {
          L.x += Math.sign(dx) * step;
          speed = (Math.sign(dx) * step) / dt;
          if (!follow && !act) L.dir = dx > 0 ? 1 : -1;
        }
        // gravity
        const airborne = L.y < gy - 0.5 || L.vy < 0;
        if (airborne) {
          L.vy += 1700 * dt;
          L.y += L.vy * dt;
          if (L.y >= gy) {
            L.y = gy;
            L.vy = 0;
          }
        } else {
          L.y = gy;
        }
      }
      if (!hj) {
        rollAmt = 0;
        rollAng = 0;
      }
      squash = Math.max(0, squash - dt * 3.2);
      L.lean += (leaning * L.dir - L.lean) * Math.min(1, dt * 8);
      L.walk += Math.abs(speed) * dt * 0.055;
      L.bob = Math.abs(speed) > 15 ? Math.abs(Math.sin(L.walk * 2)) * 4 : Math.sin(time * 2.4) * 1.2;

      // hands: blend from the natural swing to the target
      wL += (wantL - wL) * Math.min(1, dt * 14);
      wR += (wantR - wR) * Math.min(1, dt * 14);
      handL = hL;
      handR = hR;
      const swing = Math.abs(speed) > 15 ? Math.sin(L.walk * 2) : 0;
      const restL: Pt = { x: -44 + swing * -4, y: -40 + swing * -8 };
      const restR: Pt = { x: 44 + swing * 4, y: -40 + swing * 8 };
      if ((cheering && !hL) || hopping) {
        restL.x = -46;
        restL.y = -156;
        restR.x = 46;
        restR.y = -156;
      }
      const targetL = handL ? toLocal(handL, S) : restL;
      const targetR = handR ? toLocal(handR, S) : restR;
      const hlx0 = restL.x + (targetL.x - restL.x) * wL;
      const hlx = hlx0 + (-22 - hlx0) * rollAmt;
      const hly0 = restL.y + (targetL.y - restL.y) * wL;
      const hly = hly0 + (-58 - hly0) * rollAmt;
      const hrx0 = restR.x + (targetR.x - restR.x) * wR;
      const hry0 = restR.y + (targetR.y - restR.y) * wR;
      // arms hug the body while he is a ball
      const hrx = hrx0 + (22 - hrx0) * rollAmt;
      const hry = hry0 + (-58 - hry0) * rollAmt;

      // render
      if (root.current) {
        const tremble = pulling && e > 0.8 ? Math.sin(time * 60) * 1.6 * e : 0;
        const sy = 1 - 0.22 * crouch - 0.2 * squash * Math.sin(squash * Math.PI * 0.9);
        const sx = 1 + 0.18 * crouch + 0.16 * squash;
        const stretchY = hopping ? 1.08 : 1;
        if (rollAmt > 0.001) {
          root.current.setAttribute(
            "transform",
            `translate(${L.x.toFixed(1)} ${L.y.toFixed(1)}) scale(${S.toFixed(3)} ${S.toFixed(3)}) translate(0 ${(-58 * rollAmt).toFixed(1)}) rotate(${((rollAng * 180) / Math.PI).toFixed(1)}) translate(0 ${(58 * rollAmt).toFixed(1)}) translate(0 ${(8 * rollAmt).toFixed(1)})`,
          );
        } else {
          root.current.setAttribute(
            "transform",
            `translate(${(L.x + tremble).toFixed(1)} ${(L.y - L.bob).toFixed(1)}) rotate(${((L.lean * 180) / Math.PI).toFixed(1)}) scale(${(L.dir * S * sx).toFixed(3)} ${(S * sy * stretchY).toFixed(3)})`,
          );
        }
      }
      const a0 = hopping ? 30 : crouch * 10 + (Math.abs(speed) > 15 && rollAmt < 0.01 ? Math.sin(L.walk * 2) * 26 : 0);
      const aL = a0 + (-95 - a0) * rollAmt; // knees pulled up to the chest
      const aR = (hopping ? -24 : -a0) + (95 - (hopping ? -24 : -a0)) * rollAmt;
      legL.current?.setAttribute("transform", `rotate(${aL.toFixed(1)} 340 430)`);
      legR.current?.setAttribute("transform", `rotate(${aR.toFixed(1)} 455 430)`);
      head.current?.setAttribute(
        "transform",
        `rotate(${(Math.sin(time * 2.2) * 2 + (pulling ? -6 * e : 0)).toFixed(1)} 395 255) translate(395 262) scale(1.2) translate(-395 -262)`,
      );
      if (aLo.current && aLf.current && aLh.current && sLo.current && sLf.current && aLfist.current)
        drawArm(aLo.current, aLf.current, aLh.current, sLo.current, sLf.current, aLfist.current, SH_L, { x: hlx, y: hly }, time);
      if (aRo.current && aRf.current && aRh.current && sRo.current && sRf.current && aRfist.current)
        drawArm(aRo.current, aRf.current, aRh.current, sRo.current, sRf.current, aRfist.current, SH_R, { x: hrx, y: hry }, time);

      // speed streaks trailing behind him while he rolls
      if (streak.current) {
        if (rollAmt > 0.2 && hj) {
          const sg = hj.sgn;
          const cx = L.x - sg * 62 * S;
          const cy = L.y - 58 * S;
          const seg = (dy: number, len: number) => `M${cx.toFixed(0)} ${(cy + dy * S).toFixed(0)} h${(-sg * len * S).toFixed(0)}`;
          streak.current.setAttribute('d', seg(-26, 70) + seg(0, 110) + seg(26, 80));
          streak.current.style.opacity = (rollAmt * 0.6).toFixed(2);
        } else {
          streak.current.style.opacity = "0";
        }
      }

      // fade out once the skills section has scrolled away (unless he is on the way to Projects)
      const vis = visOverride ?? 1 - clamp01((deck.leave.get() - 0.55) * 4);
      el.style.opacity = vis.toFixed(2);
      el.style.visibility = vis < 0.02 ? "hidden" : "visible";

      // speech bubble
      const b = bubble.current;
      if (b) {
        if (text !== bubbleText) {
          bubbleText = text;
          if (text) b.textContent = text;
          b.style.opacity = text ? "1" : "0";
        }
        b.style.transform = `translate(${(L.x + 18 * S).toFixed(0)}px, ${(L.y - 168 * S).toFixed(0)}px) translate(-12%, -100%)`;
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  return (
    <div ref={stage} className={styles.luffy} aria-hidden="true">
      <svg className={styles.svg}>
        <path ref={streak} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" style={{ opacity: 0, color: "var(--paper)" }} />
        <LuffyArt r={{ root, legL, legR, head, aLo, aLf, aLh, aLfist, aRo, aRf, aRh, aRfist, sLo, sLf, sRo, sRf }} />
      </svg>
      <div ref={bubble} className={styles.bubble} />
    </div>
  );
}
