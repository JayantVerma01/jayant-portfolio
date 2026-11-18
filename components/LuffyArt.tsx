"use client";

/* The refs are handed in from a controller and only read in effects. */
/* eslint-disable react-hooks/refs */

import type { RefObject } from "react";

export type Pt = { x: number; y: number };
export const SKIN = "#f2cba2";
export const INK = "#14110f";
export const SH_L: Pt = { x: -27, y: -76 };
export const SH_R: Pt = { x: 26.5, y: -76 };
export const HEIGHT = 150; // character height in local units

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export type LuffyRefs = {
  root: RefObject<SVGGElement | null>;
  legL: RefObject<SVGGElement | null>;
  legR: RefObject<SVGGElement | null>;
  head: RefObject<SVGGElement | null>;
  aLo: RefObject<SVGPathElement | null>;
  aLf: RefObject<SVGPathElement | null>;
  aLh: RefObject<SVGPathElement | null>;
  aLfist: RefObject<SVGGElement | null>;
  aRo: RefObject<SVGPathElement | null>;
  aRf: RefObject<SVGPathElement | null>;
  aRh: RefObject<SVGPathElement | null>;
  aRfist: RefObject<SVGGElement | null>;
  sLo: RefObject<SVGPathElement | null>;
  sLf: RefObject<SVGPathElement | null>;
  sRo: RefObject<SVGPathElement | null>;
  sRf: RefObject<SVGPathElement | null>;
};

export function drawArm(
  outline: SVGPathElement,
  fill: SVGPathElement,
  shine: SVGPathElement,
  sleeveO: SVGPathElement,
  sleeveF: SVGPathElement,
  fist: SVGGElement,
  sh: Pt,
  hd: Pt,
  time: number,
) {
  const dx = hd.x - sh.x;
  const dy = hd.y - sh.y;
  const len = Math.hypot(dx, dy) || 1;
  const extra = Math.max(0, len - 46);
  const sag = Math.min(16, extra * 0.03) * Math.sin(time * 9 + sh.x);
  const cx = (sh.x + hd.x) / 2 + (-dy / len) * sag;
  const cy = (sh.y + hd.y) / 2 + (dx / len) * sag;
  const d = `M${sh.x.toFixed(1)} ${sh.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${hd.x.toFixed(1)} ${hd.y.toFixed(1)}`;
  const w = 8 * Math.pow(clamp01(46 / Math.max(len, 46)), 0.5) + 2.5;
  outline.setAttribute("d", d);
  outline.setAttribute("stroke-width", (w + 3.5).toFixed(1));
  fill.setAttribute("d", d);
  fill.setAttribute("stroke-width", w.toFixed(1));
  shine.setAttribute("d", d);
  shine.setAttribute("stroke-width", (w * 0.32).toFixed(1));
  // the vest sleeve covers the top of the arm, so shoulder and arm read as one piece
  const ls = Math.min(len * 0.55, 24);
  const t = ls / len;
  const qx = (1 - t) * (1 - t) * sh.x + 2 * (1 - t) * t * cx + t * t * hd.x;
  const qy = (1 - t) * (1 - t) * sh.y + 2 * (1 - t) * t * cy + t * t * hd.y;
  const sd = `M${sh.x.toFixed(1)} ${sh.y.toFixed(1)} L${qx.toFixed(1)} ${qy.toFixed(1)}`;
  sleeveO.setAttribute("d", sd);
  sleeveO.setAttribute("stroke-width", (w + 9).toFixed(1));
  sleeveF.setAttribute("d", sd);
  sleeveF.setAttribute("stroke-width", (w + 5.2).toFixed(1));
  const k = 1 + Math.min(0.45, extra / 520);
  fist.setAttribute(
    "transform",
    `translate(${hd.x.toFixed(1)} ${hd.y.toFixed(1)}) rotate(${((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(0)}) scale(${k.toFixed(2)})`,
  );
}

/** The chibi Luffy drawing. Parts are exposed through refs so a controller can animate them. */
export function LuffyArt({ r }: { r: LuffyRefs }) {
  return (
    <>
        <g ref={r.root}>
          {/* ── body art, redrawn from the reference (art space 800×570, feet at y≈552) ── */}
          <g transform="scale(0.275) translate(-400 -552)" strokeLinejoin="round" strokeLinecap="round">
            <ellipse cx="400" cy="552" rx="120" ry="13" fill="rgba(20,16,40,0.16)" />

            {/* legs + sandals */}
            <g ref={r.legL}>
              <path d="M322 470 L350 470 L352 535 L322 535 Z" fill={SKIN} stroke={INK} strokeWidth="6" />
              <path d="M286 538 Q324 526 362 538 L358 552 L290 552 Z" fill="#6c6850" stroke={INK} strokeWidth="6" />
              <path d="M326 528 L318 540 M326 528 L338 540" stroke={INK} strokeWidth="5" />
            </g>
            <g ref={r.legR}>
              <path d="M425 470 L455 470 L458 535 L428 535 Z" fill={SKIN} stroke={INK} strokeWidth="6" />
              <path d="M418 538 Q456 526 494 538 L490 552 L422 552 Z" fill="#6c6850" stroke={INK} strokeWidth="6" />
              <path d="M458 528 L450 540 M458 528 L470 540" stroke={INK} strokeWidth="5" />
            </g>

            {/* shorts */}
            <path d="M322 388 L476 388 Q482 430 464 482 L402 484 L398 430 L392 484 L306 482 Q310 430 322 388 Z" fill="#5b84d8" stroke={INK} strokeWidth="6" />
            <path d="M340 420 L372 440 M352 408 L380 450 M440 410 L426 450 M452 424 L438 462 M370 456 L350 470" stroke="#2f4aa0" strokeWidth="5" />
            <path d="M302 482 Q316 504 332 486 Q348 506 366 488 Q380 506 392 488 L396 494 Q384 506 362 498 Q330 512 300 496 Z" fill="#eceaf0" stroke={INK} strokeWidth="5" />
            <path d="M398 488 Q414 508 430 490 Q446 508 462 490 L468 497 Q450 510 430 502 Q410 512 398 498 Z" fill="#eceaf0" stroke={INK} strokeWidth="5" />

            {/* yellow sash with hanging tail */}
            <path d="M440 372 Q492 398 506 440 Q522 482 510 508 Q482 486 464 462 Q452 420 440 372 Z" fill="#f4b93d" stroke={INK} strokeWidth="6" />
            <path d="M470 420 Q486 450 494 482" fill="none" stroke="#d6962a" strokeWidth="6" />
            <path d="M318 368 Q392 346 472 370 L470 400 Q396 380 322 398 Z" fill="#f4b93d" stroke={INK} strokeWidth="6" />
            <path d="M330 380 Q394 366 456 384" fill="none" stroke="#d6962a" strokeWidth="5" />

            {/* bare chest + X scar */}
            <path d="M346 258 L452 258 L462 372 L336 372 Z" fill={SKIN} stroke={INK} strokeWidth="6" />
            <path d="M364 288 L430 342 M430 288 L364 342" stroke="#c78d86" strokeWidth="13" />
            <path d="M360 372 Q395 384 440 372" fill="none" stroke="#c89468" strokeWidth="4" />

            {/* red vest */}
            <path d="M298 232 Q322 222 348 258 L338 376 L296 384 Q288 340 296 300 Z" fill="#e03c36" stroke={INK} strokeWidth="6" />
            <path d="M304 300 Q326 330 332 372" fill="none" stroke="#b52b2b" strokeWidth="6" />
            <path d="M500 226 Q478 226 452 258 L462 376 L494 378 Q508 330 500 290 Z" fill="#e03c36" stroke={INK} strokeWidth="6" />
            <path d="M494 300 Q474 330 470 372" fill="none" stroke="#b52b2b" strokeWidth="6" />
            <path d="M292 384 L286 396 L300 392 L304 404 L318 392 L338 396" fill="#e03c36" stroke={INK} strokeWidth="5" />
            <circle cx="351" cy="274" r="7" fill="#e9b63a" stroke={INK} strokeWidth="4" />
            <circle cx="346" cy="298" r="7" fill="#e9b63a" stroke={INK} strokeWidth="4" />
            <circle cx="341" cy="322" r="7" fill="#e9b63a" stroke={INK} strokeWidth="4" />

            {/* neck */}
            <path d="M372 236 L420 236 L424 266 L368 266 Z" fill="#d9a77d" stroke={INK} strokeWidth="6" />

            {/* ── head ── */}
            <g ref={r.head}>
              {/* face: drawn larger than the hat opening so it reads clearly */}
              <g transform="translate(0 -16) translate(394 176) scale(1.12) translate(-394 -176)">
              {/* ears: bigger, sticking out like the reference */}
              <ellipse cx="311" cy="184" rx="18" ry="27" fill={SKIN} stroke={INK} strokeWidth="6" />
              <ellipse cx="477" cy="184" rx="18" ry="27" fill={SKIN} stroke={INK} strokeWidth="6" />
              <path d="M306 174 Q314 182 308 196 M482 174 Q474 182 480 196" fill="none" stroke="#d9a77d" strokeWidth="4" strokeLinecap="round" />

              {/* face: round cheeks, only a slight point at the chin */}
              <path d="M312 160 C312 116 350 96 394 96 C438 96 476 116 476 160 C476 210 456 250 424 268 Q394 288 364 268 C332 250 312 210 312 160 Z" fill={SKIN} stroke={INK} strokeWidth="7" strokeLinejoin="round" />

              {/* eyes */}
              <ellipse cx="358" cy="176" rx="23" ry="25" fill="#fff" stroke={INK} strokeWidth="5" />
              <ellipse cx="438" cy="176" rx="23" ry="25" fill="#fff" stroke={INK} strokeWidth="5" />
              <circle cx="360" cy="178" r="10.5" fill={INK} />
              <circle cx="436" cy="178" r="10.5" fill={INK} />
              <circle cx="356" cy="173" r="3.4" fill="#fff" />
              <circle cx="432" cy="173" r="3.4" fill="#fff" />
              {/* eyebrows */}
              <path d="M338 152 Q358 144 381 155 M415 155 Q438 144 459 152" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
              {/* nose */}
              <path d="M393 198 Q400 208 407 199" fill="none" stroke="#a9754d" strokeWidth="4" strokeLinecap="round" />
              {/* scar under the left eye */}
              <path d="M434 215 L458 205 M441 206 L446 217 M450 202 L455 213" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* big open smile */}
              <path d="M334 212 Q394 205 456 210 Q446 266 396 266 Q346 266 334 212 Z" fill="#4a1018" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
              <path d="M342 238 Q396 224 450 238 Q438 260 396 260 Q354 260 342 238 Z" fill="#f0868f" />
              <path d="M340 212 Q396 208 452 212 L449 225 Q396 221 343 225 Z" fill="#fff" stroke={INK} strokeWidth="4" />

              {/* messy black hair, like the reference: spiky fringe + long sideburns */}
              <path d="M318 138 L323 166 L334 146 L347 150 L357 143 L371 151 L384 142 L398 152 L412 142 L425 151 L439 143 L451 150 L462 146 L473 166 L478 138 Q396 120 318 138 Z" fill={INK} />
              <path d="M308 148 L311 210 L322 190 L331 172 L333 150 Z M484 148 L481 212 L470 192 L461 172 L459 150 Z" fill={INK} />
              </g>

              {/* the hat: one full, round brim sitting above the face, then dome + band */}
              <g transform="translate(0 -32) translate(395 112) scale(0.9) translate(-395 -112)" strokeLinejoin="round">
                <ellipse cx="395" cy="112" rx="200" ry="37" fill="#eeab43" stroke={INK} strokeWidth="7" />
                <path d="M200 114 Q300 148 395 148 Q490 148 590 114 Q500 130 395 130 Q290 130 200 114 Z" fill="#cf8a30" />
                <path d="M222 100 Q290 62 360 56" fill="none" stroke="#f8d27a" strokeWidth="8" strokeLinecap="round" opacity="0.85" />
                <path d="M300 118 C292 30 338 -16 396 -16 C456 -16 500 30 492 118 Q396 150 300 118 Z" fill="#f6c555" stroke={INK} strokeWidth="7" />
                <path d="M300 118 C294 56 320 18 352 2 C326 40 322 92 338 132 Q312 130 300 118 Z" fill="#e9a640" />
                <path d="M344 12 Q392 -6 442 10" fill="none" stroke="#fbe08a" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
                <path d="M298 78 Q396 102 494 78 L498 118 Q396 148 294 118 Z" fill="#e03c36" stroke={INK} strokeWidth="6" />
                <path d="M300 96 Q396 122 494 96" fill="none" stroke="#b52b2b" strokeWidth="5" />
              </g>
            </g>
          </g>

          {/* rubber arms (drawn in local units so they can stretch) */}
          <path ref={r.aLo} fill="none" stroke={INK} strokeLinecap="round" />
          <path ref={r.aLf} fill="none" stroke={SKIN} strokeLinecap="round" />
          <path ref={r.aLh} fill="none" stroke="#f7d9b4" strokeLinecap="round" opacity="0.75" />
          <path ref={r.sLo} fill="none" stroke={INK} strokeLinecap="round" />
          <path ref={r.sLf} fill="none" stroke="#e03c36" strokeLinecap="round" />
          <g ref={r.aLfist}>
            <g transform="scale(0.95)" strokeLinejoin="round" strokeLinecap="round">
              <rect x="-10" y="-10" width="17" height="20" rx="6" fill={SKIN} stroke={INK} strokeWidth="2.4" />
              <g fill={SKIN} stroke={INK} strokeWidth="2">
                <rect x="3" y="-10" width="10" height="5.2" rx="2.6" />
                <rect x="3" y="-5" width="10" height="5" rx="2.5" />
                <rect x="3" y="0" width="10" height="5" rx="2.5" />
                <rect x="3" y="5" width="10" height="5" rx="2.5" />
              </g>
              <path d="M-8 3 Q0 10 8 6 L7 1.5 Q0 4.5 -8 0.5 Z" fill="#e4b88c" stroke={INK} strokeWidth="1.8" />
            </g>
          </g>
          <path ref={r.aRo} fill="none" stroke={INK} strokeLinecap="round" />
          <path ref={r.aRf} fill="none" stroke={SKIN} strokeLinecap="round" />
          <path ref={r.aRh} fill="none" stroke="#f7d9b4" strokeLinecap="round" opacity="0.75" />
          <path ref={r.sRo} fill="none" stroke={INK} strokeLinecap="round" />
          <path ref={r.sRf} fill="none" stroke="#e03c36" strokeLinecap="round" />
          <g ref={r.aRfist}>
            <g transform="scale(0.95)" strokeLinejoin="round" strokeLinecap="round">
              <rect x="-10" y="-10" width="17" height="20" rx="6" fill={SKIN} stroke={INK} strokeWidth="2.4" />
              <g fill={SKIN} stroke={INK} strokeWidth="2">
                <rect x="3" y="-10" width="10" height="5.2" rx="2.6" />
                <rect x="3" y="-5" width="10" height="5" rx="2.5" />
                <rect x="3" y="0" width="10" height="5" rx="2.5" />
                <rect x="3" y="5" width="10" height="5" rx="2.5" />
              </g>
              <path d="M-8 3 Q0 10 8 6 L7 1.5 Q0 4.5 -8 0.5 Z" fill="#e4b88c" stroke={INK} strokeWidth="1.8" />
            </g>
          </g>

          {/* red shoulders: the sleeves grow out of these, aligned with the arm roots */}
          <g transform="scale(0.275) translate(-400 -552)" strokeLinejoin="round" strokeLinecap="round">
            <path d="M266 280 Q262 252 296 246 Q336 246 344 276 Q342 300 308 302 Q276 302 266 280 Z" fill="#e03c36" stroke={INK} strokeWidth="6" />
            <path d="M280 264 Q302 254 326 266" fill="none" stroke="#b52b2b" strokeWidth="6" />
            <path d="M454 276 Q462 246 500 246 Q536 252 532 280 Q522 302 488 302 Q456 300 454 276 Z" fill="#e03c36" stroke={INK} strokeWidth="6" />
            <path d="M470 266 Q494 254 516 264" fill="none" stroke="#b52b2b" strokeWidth="6" />
          </g>
        </g>
    </>
  );
}
