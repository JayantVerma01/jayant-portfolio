import type { projects } from "@/lib/data";

export type Project = (typeof projects)[number];

export const COVER_W = 1024;
export const COVER_H = 640;

function cssFont(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Paints a project "cover" onto a 1024x640 canvas. Used as a WebGL texture. */
export function drawCover(
  canvas: HTMLCanvasElement,
  p: Project,
  index: number,
  total: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const serif = cssFont("--font-display", "Georgia, serif");
  const mono = cssFont("--font-mono", "ui-monospace, monospace");
  const W = COVER_W,
    H = COVER_H;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 36);
  ctx.clip();

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, p.color);
  g.addColorStop(0.7, "#0b0d17");
  g.addColorStop(1, "#07080f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // soft highlight blobs
  const r1 = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, 360);
  r1.addColorStop(0, "rgba(255,255,255,0.22)");
  r1.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = r1;
  ctx.fillRect(0, 0, W, H);

  // oversized index numeral
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.font = `italic 420px ${serif}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(String(index + 1).padStart(2, "0"), W - 30, H - 10);

  // labels
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `22px ${mono}`;
  ctx.letterSpacing = "4px";
  ctx.fillText(p.category.toUpperCase(), 56, 80);
  ctx.textAlign = "right";
  ctx.fillText(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, W - 56, 80);
  ctx.letterSpacing = "0px";

  // title
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = `92px ${serif}`;
  const lines = wrap(ctx, p.title, W - 160).slice(0, 3);
  const lh = 96;
  const startY = H / 2 - ((lines.length - 1) * lh) / 2 + 20;
  lines.forEach((l, i) => ctx.fillText(l, 56, startY + i * lh));

  // stack
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = `24px ${mono}`;
  ctx.fillText(p.tech.slice(0, 4).join("  ·  "), 56, H - 56);

  ctx.restore();
}
