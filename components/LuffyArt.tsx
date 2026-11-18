"use client";

/* The refs are handed in from a controller and only read in effects. */
/* eslint-disable react-hooks/refs */

import type { RefObject } from "react";

export type Pt = { x: number; y: number };
export const SKIN = "#f2cba2";
export const INK = "#14110f";
export const SH_L: Pt = { x: -27, y: -89 };
export const SH_R: Pt = { x: 27, y: -89.5 };
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
};

export function drawArm(
  outline: SVGPathElement,
  fill: SVGPathElement,
  shine: SVGPathElement,
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
              {/* ears + face */}
              <ellipse cx="318" cy="178" rx="13" ry="20" fill={SKIN} stroke={INK} strokeWidth="6" />
              <ellipse cx="470" cy="178" rx="13" ry="20" fill={SKIN} stroke={INK} strokeWidth="6" />
              <ellipse cx="394" cy="176" rx="80" ry="80" fill={SKIN} stroke={INK} strokeWidth="7" />

              {/* eyes */}
              <ellipse cx="360" cy="172" rx="24" ry="26" fill="#fff" stroke={INK} strokeWidth="5" />
              <ellipse cx="438" cy="172" rx="24" ry="26" fill="#fff" stroke={INK} strokeWidth="5" />
              <ellipse cx="362" cy="174" rx="12" ry="14" fill={INK} />
              <ellipse cx="436" cy="174" rx="12" ry="14" fill={INK} />
              <circle cx="357" cy="168" r="4" fill="#fff" />
              <circle cx="431" cy="168" r="4" fill="#fff" />
              <path d="M338 152 L378 162 M424 162 L462 150" stroke={INK} strokeWidth="8" />
              <path d="M396 190 L402 198" stroke="#a9754d" strokeWidth="4" />
              {/* scar under the left eye */}
              <path d="M428 204 L454 198 M436 196 L437 210 M446 194 L447 208" stroke={INK} strokeWidth="3.5" fill="none" />

              {/* big open grin */}
              <path d="M332 210 Q394 204 462 208 Q448 262 396 262 Q346 262 332 210 Z" fill="#4a1018" stroke={INK} strokeWidth="6" />
              <path d="M340 236 Q396 222 454 236 Q440 258 396 258 Q352 258 340 236 Z" fill="#f0868f" />
              <path d="M338 210 Q396 207 458 210 L455 224 Q396 220 341 224 Z" fill="#fff" stroke={INK} strokeWidth="4" />

              {/* messy black fringe, under the brim */}
              <path d="M326 152 L344 182 L356 154 L372 180 L388 154 L404 178 L420 154 L436 176 L450 154 L470 172 Q484 156 470 146 Q396 138 322 146 Q316 150 326 152 Z" fill={INK} />
              <path d="M312 156 L318 194 L330 156 Z M462 156 L476 192 L474 154 Z" fill={INK} />

              {/* the hat: one full, round brim sitting above the face, then dome + band */}
              <g transform="translate(0 -8)" strokeLinejoin="round">
                <ellipse cx="395" cy="112" rx="200" ry="44" fill="#eeab43" stroke={INK} strokeWidth="7" />
                <path d="M200 116 Q300 160 395 158 Q490 160 590 116 Q500 136 395 136 Q290 136 200 116 Z" fill="#cf8a30" />
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
          <g ref={r.aLfist}>
            <path d="M-10 -7 Q-8 -12 0 -12 Q10 -12 13 -5 Q14 4 11 8 Q5 13 -4 11 Q-11 8 -10 -7 Z" fill={SKIN} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M3 -11 Q6 -4 3 3 M8 -9 Q10 -3 8 4" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M-8 -6 Q-2 -1 -7 7 Q-12 3 -8 -6 Z" fill="#e4b88c" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          </g>
          <path ref={r.aRo} fill="none" stroke={INK} strokeLinecap="round" />
          <path ref={r.aRf} fill="none" stroke={SKIN} strokeLinecap="round" />
          <path ref={r.aRh} fill="none" stroke="#f7d9b4" strokeLinecap="round" opacity="0.75" />
          <g ref={r.aRfist}>
            <path d="M-10 -7 Q-8 -12 0 -12 Q10 -12 13 -5 Q14 4 11 8 Q5 13 -4 11 Q-11 8 -10 -7 Z" fill={SKIN} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M3 -11 Q6 -4 3 3 M8 -9 Q10 -3 8 4" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M-8 -6 Q-2 -1 -7 7 Q-12 3 -8 -6 Z" fill="#e4b88c" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          </g>

          {/* bare shoulder caps: the arms grow out of these */}
          <g transform="scale(0.275) translate(-400 -552)" strokeLinejoin="round" strokeLinecap="round">
            <path d="M262 236 Q268 196 308 196 Q338 202 340 240 L334 262 Q296 270 270 256 Z" fill={SKIN} stroke={INK} strokeWidth="6" />
            <path d="M282 214 Q304 206 322 222" fill="none" stroke="#e4b88c" strokeWidth="6" />
            <path d="M458 240 Q458 200 490 194 Q528 196 534 236 L526 258 Q490 270 462 262 Z" fill={SKIN} stroke={INK} strokeWidth="6" />
            <path d="M474 214 Q496 206 516 220" fill="none" stroke="#e4b88c" strokeWidth="6" />
          </g>
        </g>
    </>
  );
}
