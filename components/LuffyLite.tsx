"use client";

import { useEffect, useRef } from "react";
import styles from "./Luffy.module.css";
import { luffyPerch, luffyPunch, luffyTalk } from "./hero/store";
import { LuffyArt, SH_L, SH_R, HEIGHT, drawArm, type Pt } from "./LuffyArt";

/**
 * Luffy for phones and tablets. The big scroll-scene Luffy needs a mouse and a
 * wide screen, so on touch devices he lives in the corner instead: he walks
 * while you scroll, grabs the page and drags it when you fling, hops and
 * announces each new section, waves when you stop, and throws a Gomu Gomu
 * Pistol at whatever you tap (which wobbles like rubber).
 */

const SECTIONS: [string, string][] = [
  ["home", "Yosha!"],
  ["about", "That's me!"],
  ["skills", "So many skills!"],
  ["projects", "Look at these!"],
  ["experience", "Adventure!"],
  ["process", "Heave ho!"],
  ["contact", "Say hi!"],
  ["footer", "Shishishi!"],
];
const TAPS = ["Gomu Gomu!", "Pistol!", "Shishishi!", "Yosha!"];
const PERCH_Q =
  ":is(h2, article, figure, li, [class*=card], [class*=Card], [class*=staticBadge], [class*=poster], [class*=panel], [class*=plank], [class*=island], [class*=card], [class*=seal], [class*=step], [class*=letter])";
const PERCH_SAY: Record<string, string[]> = {
  home: ["Nice card!", "Hello!"],
  about: ["That's Jayant!", "Shishishi!"],
  skills: ["Code, code!", "So techy!"],
  projects: ["Cool project!", "Ship it!"],
  experience: ["A bounty!", "Adventure!"],
  process: ["Heave ho!", "Good plan!"],
  contact: ["Write a letter!", "Say hi!"],
  footer: ["Meat?!", "Nice terminal!"],
};
const SOFT = "section, article, li, figure, img, h1, h2, h3, p, blockquote";

export default function LuffyLite() {
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

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = window.innerWidth;
    let H = window.innerHeight;
    const small = () => W < 600;
    const sizeOf = () => (small() ? 92 : 128) / HEIGHT;
    const homeX = () => W - (small() ? 40 : 64);
    const awayX = () => (small() ? 44 : 70);
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const L = { x: homeX(), y: H - 10, dir: -1 as 1 | -1, walk: 0, hop: 0 };
    let lastY = window.scrollY;
    let vel = 0; // smoothed scroll speed, px/s
    let still0 = 0; // seconds since the page last moved
    let wave = -1;
    let pistol: { t: number; to: Pt } | null = null;
    let grab = 0; // 0..1 how hard he is holding on to the page
    let hopT = -1;
    let sec = "";
    let slow = 0;
    let say = "";
    let sayUntil = 0;
    let shown = "";
    let time = 0;
    let last = performance.now();
    let raf = 0;
    let tapIdx = 0;
    // perching: when you stop scrolling he leaps onto the nearest card and pokes it
    type Hop = { t: number; dur: number; fx: number; fy: number; toCorner: boolean };
    let hop: Hop | null = null;
    let perchEl: Element | null = null;
    let lastPerch: Element | null = null;
    let nextPerch = 1.5;
    let landAt = -1;
    let poked = false;
    let hopTarget: Pt = { x: 0, y: 0 };
    let seenPerch = luffyPerch.id;
    let seenPunch = luffyPunch.id;
    let seenTalk = luffyTalk.id;

    const talk = (t: string, secs = 1.6) => {
      say = t;
      sayUntil = time + secs;
    };

    const onTap = (e: PointerEvent) => {
      const S = sizeOf();
      const tgt = e.target as Element | null;
      if (Math.hypot(e.clientX - L.x, e.clientY - (L.y - 70 * S)) < 60 * S + 14) {
        hopT = 0;
        talk(TAPS[tapIdx++ % TAPS.length]);
        return;
      }
      if (tgt?.closest("a, button, input, textarea, select, label, [role=button]")) return;
      pistol = { t: 0, to: { x: e.clientX, y: e.clientY } };
      L.dir = e.clientX < L.x ? -1 : 1;
      talk(TAPS[tapIdx++ % TAPS.length], 1.1);
      const hit = tgt?.closest?.(SOFT) as HTMLElement | null;
      if (hit && hit !== document.body) {
        window.setTimeout(() => {
          hit.classList.remove("jelly");
          void hit.offsetWidth;
          hit.classList.add("jelly");
          window.setTimeout(() => hit.classList.remove("jelly"), 760);
        }, 240);
      }
    };
    document.addEventListener("pointerdown", onTap, { passive: true });

    const pose = (dt: number) => {
      time += dt;
      const S = sizeOf();
      const sy = window.scrollY;
      const v = dt > 0 ? (sy - lastY) / dt : 0;
      lastY = sy;
      vel += (v - vel) * Math.min(1, dt * 8);
      const speed = Math.abs(vel);
      still0 = speed < 40 ? still0 + dt : 0;

      // slow lane: which section are we in?
      slow -= dt;
      if (slow <= 0) {
        slow = 0.2;
        let cur = "";
        for (const [id] of SECTIONS) {
          const n = document.getElementById(id);
          if (n && n.getBoundingClientRect().top <= H * 0.45) cur = id;
        }
        if (cur && cur !== sec) {
          const first = sec === "";
          sec = cur;
          if (!first) {
            hopT = 0;
            talk(SECTIONS.find((s) => s[0] === cur)?.[1] ?? "Yosha!", 1.7);
          }
        }
      }

      // requests from the sections (Projects selects a card, Contact sends a letter, the footer terminal...)
      if (luffyTalk.id !== seenTalk) {
        seenTalk = luffyTalk.id;
        talk(luffyTalk.text, 2);
      }
      if (luffyPunch.id !== seenPunch) {
        seenPunch = luffyPunch.id;
        const t = luffyPunch.el;
        if (t) {
          const r = t.getBoundingClientRect();
          pistol = { t: 0, to: { x: r.left + r.width / 2, y: r.top + r.height / 2 } };
          L.dir = r.left + r.width / 2 < L.x ? -1 : 1;
        }
      }
      if (luffyPerch.id !== seenPerch) {
        seenPerch = luffyPerch.id;
        const t = luffyPerch.el;
        if (t && t !== perchEl) {
          const r = t.getBoundingClientRect();
          if (r.top > 100 && r.top < H - 80) {
            perchEl = lastPerch = t;
            hop = { t: 0, dur: 0.7, fx: L.x, fy: L.y, toCorner: false };
            hopTarget = { x: Math.min(W - 40, r.right - 44), y: r.top + 3 };
          }
        }
      }

      // where he lives: the corner (left side while the contact form is up), or on a card
      const wantX = sec === "contact" ? awayX() : homeX();
      const cornerY = H - 10;
      const perchPoint = (): Pt | null => {
        if (!perchEl) return null;
        const r = perchEl.getBoundingClientRect();
        if (r.bottom < 80 || r.top > H - 70 || r.top < 84) return null;
        return { x: Math.max(40, Math.min(W - 40, r.right - 44)), y: r.top + 3 };
      };
      let sliding = false;
      if (hop) {
        hop.t += dt;
        const p = Math.min(1, hop.t / hop.dur);
        const to = hop.toCorner ? { x: wantX, y: cornerY } : (perchPoint() ?? hopTarget);
        hopTarget = to;
        const e = p * p * (3 - 2 * p);
        L.x = hop.fx + (to.x - hop.fx) * e;
        L.y = hop.fy + (to.y - hop.fy) * e - Math.sin(p * Math.PI) * 90;
        L.dir = to.x < hop.fx ? -1 : 1;
        if (p >= 1) {
          const toCorner = hop.toCorner;
          hop = null;
          if (toCorner) {
            perchEl = null;
            nextPerch = time + 2.5;
          } else {
            landAt = time;
            poked = false;
            hopT = 0;
            const says = PERCH_SAY[sec] ?? PERCH_SAY.home;
            talk(says[tapIdx++ % says.length], 1.8);
          }
        }
      } else if (perchEl) {
        const pt = perchPoint();
        if (!pt || speed > 220) {
          // you scrolled away: hop back to the corner
          hop = { t: 0, dur: 0.55, fx: L.x, fy: L.y, toCorner: true };
          perchEl = null;
        } else {
          L.x += (pt.x - L.x) * Math.min(1, dt * 14);
          L.y = pt.y;
          const r = perchEl.getBoundingClientRect();
          L.dir = r.left + r.width / 2 < L.x ? -1 : 1;
          // a moment after landing he pokes the card
          if (!poked && time - landAt > 0.55) {
            poked = true;
            pistol = { t: 0, to: { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 90) } };
            const el = perchEl as HTMLElement;
            window.setTimeout(() => {
              el.classList.remove("jelly");
              void el.offsetWidth;
              el.classList.add("jelly");
              window.setTimeout(() => el.classList.remove("jelly"), 760);
            }, 220);
          }
        }
      } else {
        const dx = wantX - L.x;
        sliding = Math.abs(dx) > 2;
        L.x += dx * Math.min(1, dt * 3.5);
        L.y = cornerY;
        if (sliding) L.dir = dx > 0 ? 1 : -1;
        else if (!pistol) L.dir = L.x > W / 2 ? -1 : 1;
        // idle for a moment: pick a card in view and leap onto it
        if (still0 > 1.3 && time > nextPerch && !pistol && sec) {
          const cands = [...document.querySelectorAll(`#${sec} ${PERCH_Q}`)]
            .map((n) => ({ n, r: n.getBoundingClientRect() }))
            .filter(({ n }) => {
              // stand on the whole card, not on a small part inside it
              const up = n.parentElement?.closest(PERCH_Q);
              return !up || up.getBoundingClientRect().height > 900;
            })
            .filter(({ n, r }) => n !== lastPerch && r.width > 80 && r.height > 60 && r.top > 100 && r.top < H * 0.7)
            .sort((x, y) => Math.abs(x.r.top - H * 0.45) - Math.abs(y.r.top - H * 0.45));
          if (cands.length) {
            perchEl = lastPerch = cands[0].n;
            hop = { t: 0, dur: 0.7, fx: L.x, fy: L.y, toCorner: false };
            hopTarget = { x: Math.min(W - 40, cands[0].r.right - 44), y: cands[0].r.top + 3 };
            talk("", 0);
          } else nextPerch = time + 1.5;
        }
      }

      const walking = (speed > 90 || sliding) && !hop && !perchEl;
      L.walk += dt * (walking ? 7 + Math.min(speed, 3000) / 260 : 0);
      const stride = walking ? Math.sin(L.walk) * 26 : 0;

      // hop
      let hopY = 0;
      if (hopT >= 0) {
        hopT += dt;
        const p = hopT / 0.55;
        if (p >= 1) hopT = -1;
        else hopY = Math.sin(p * Math.PI) * 26 * S * 1.6;
      }
      const bob = walking ? Math.abs(Math.sin(L.walk)) * 3 : Math.sin(time * 2) * 1.4;

      // right arm: tap pistol, or grabbing the page when you fling
      grab += ((speed > 1100 ? 1 : 0) - grab) * Math.min(1, dt * 6);
      const toLocal = (p: Pt): Pt => ({ x: (L.dir * (p.x - L.x)) / S, y: (p.y - L.y) / S });
      const restR: Pt = { x: 44 + (walking ? Math.sin(L.walk + Math.PI) * 6 : 0), y: -40 };
      let tR = restR;
      let wR = 0;
      if (hop && !hop.toCorner && hop.t / hop.dur < 0.6) {
        // Gomu Gomu grab: the arm shoots ahead to the card he is jumping to
        const k = hop.t / hop.dur;
        wR = Math.sin((k / 0.6) * Math.PI * 0.5);
        tR = toLocal(hopTarget);
      } else if (pistol) {
        pistol.t += dt;
        const p = pistol.t / 0.55;
        if (p >= 1) pistol = null;
        else {
          wR = p < 0.4 ? 1 - Math.pow(1 - p / 0.4, 3) : 1 - (p - 0.4) / 0.6;
          tR = toLocal(pistol.to);
        }
      } else if (grab > 0.02) {
        // reach up toward where the page is coming from and hold on
        // short, so the arm never sweeps across the content
        tR = { x: 56, y: -76 - 120 };
        wR = grab;
      }
      const hrx = restR.x + (tR.x - restR.x) * wR;
      const hry = restR.y + (tR.y - restR.y) * wR;

      // left arm: waves when you stop
      if (still0 > 2.2 && wave < 0) wave = 0;
      if (still0 === 0) wave = -1;
      let hlx = -44 + (walking ? Math.sin(L.walk) * 6 : 0);
      let hly = -40;
      if (wave >= 0) {
        wave += dt;
        const k = Math.min(1, wave * 4) * (wave > 1.6 ? Math.max(0, 1 - (wave - 1.6) * 4) : 1);
        if (wave > 2) wave = -1;
        hlx += (-50 + Math.sin(wave * 11) * 10 - hlx) * k;
        hly += (-148 - hly) * k;
      }

      const lean = Math.max(-0.2, Math.min(0.2, vel / 9000)) * L.dir;
      const sq = hopT >= 0 ? 1 : 1;
      root.current?.setAttribute(
        "transform",
        `translate(${L.x.toFixed(1)} ${(L.y - hopY - bob * S).toFixed(1)}) rotate(${((lean * 180) / Math.PI).toFixed(1)}) scale(${(L.dir * S).toFixed(3)} ${(S * sq).toFixed(3)})`,
      );
      legL.current?.setAttribute("transform", `rotate(${stride.toFixed(1)} 340 430)`);
      legR.current?.setAttribute("transform", `rotate(${(-stride).toFixed(1)} 455 430)`);
      head.current?.setAttribute(
        "transform",
        `rotate(${(Math.sin(time * 2.2) * 2).toFixed(1)} 395 255) translate(395 262) scale(1.2) translate(-395 -262)`,
      );
      if (aLo.current && aLf.current && aLh.current && sLo.current && sLf.current && aLfist.current)
        drawArm(aLo.current, aLf.current, aLh.current, sLo.current, sLf.current, aLfist.current, SH_L, { x: hlx, y: hly }, time);
      if (aRo.current && aRf.current && aRh.current && sRo.current && sRf.current && aRfist.current)
        drawArm(aRo.current, aRf.current, aRh.current, sRo.current, sRf.current, aRfist.current, SH_R, { x: hrx, y: hry }, time);

      const b = bubble.current;
      if (b) {
        const t = time < sayUntil ? say : "";
        if (t !== shown) {
          shown = t;
          if (t) b.textContent = t;
          b.style.opacity = t ? "1" : "0";
        }
        b.style.transform = `translate(${(L.x + (L.x > W / 2 ? 8 : -8)).toFixed(0)}px, ${(L.y - hopY - 160 * S).toFixed(0)}px) translate(${L.x > W / 2 ? "-100%" : "0%"}, -100%)`;
        b.dataset.side = L.x > W / 2 ? "r" : "l";
      }
    };

    if (still) {
      pose(0);
    } else {
      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        pose(dt);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("pointerdown", onTap);
    };
  }, []);

  return (
    <div ref={stage} className={styles.luffy} aria-hidden="true">
      <svg className={styles.svg}>
        <LuffyArt r={{ root, legL, legR, head, aLo, aLf, aLh, aLfist, aRo, aRf, aRh, aRfist, sLo, sLf, sRo, sRf }} />
      </svg>
      <div ref={bubble} className={`${styles.bubble} ${styles.bubbleLite}`} />
    </div>
  );
}
