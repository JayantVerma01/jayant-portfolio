# Jayant Verma — Portfolio Redesign Plan

## 1. What I found in the four references

| Site | Signature idea | Features worth taking | What to avoid |
|---|---|---|---|
| **naveen-meena-beta** | A 3D cassette tape = "the story". Each story is a numbered **TAPE** with **Hear it / Read it** toggles. | Audio-first storytelling; captions synced to audio (`captions.js`); "Turn your sound on" nudge; hand-drawn "click me first" cursor hint; pill nav with **Open for work** badge; Instagram-style carousel; warm, human copy ("You were a good listener. Your turn."); "End of tape" footer. | Almost no hard proof (projects, stack, numbers) — a recruiter learns *who* he is but not *what he shipped*. Scroll is hijacked; deep-linking is poor. |
| **id-portfolio (Angel)** | WebGL **ID badge** on a lanyard + paper-grain background, serif/script type mix. | "Identity check → aligning 000%" loading ritual; 3D case-study carousel ("Scroll to turn"); case studies with stack chips + "View project"; **Process** section (Listen → Sketch → Build → Refine) with "what comes of it" deliverables; contact block (Email / GitHub / LinkedIn / Resume). | Heavy; the page is very long with big empty scroll gaps; contact is buried at the bottom. |
| **kryntixstudio** | Cinematic **WebGL curved carousel** of site previews over a reflective water floor; 0→100 loader. | Featured / Full-site toggle; drag-to-spin gallery; reflections; minimal chrome (logo, Contact pill, counter). | Nearly no text → bad for SEO, accessibility and skim-reading hiring managers. Don't copy the "all canvas" approach. |
| **kwoncj1025-cmd.github.io** | **Physics lanyard ID badge** hero; giant name behind it; GSAP Observer full-screen slides; side dot nav; bilingual intro. | Draggable swinging badge; oversized name typography with colour split; "Available for new projects" status; one-idea-per-screen pacing; dot navigation. | Content is thin — it sends you to Instagram for the work. |

### Common DNA of the best ones
1. A **physical object** as the hero (cassette / badge) — memorable, interactive, and it *is* the identity.
2. A short **ritual loader** that sets tone.
3. **Availability signal** + one clear CTA always visible.
4. Work shown as a **tactile gallery**, not a grid of cards.
5. **Personality in the copy**.

### Where all four fall short (our opening)
Hiring managers want in 30 seconds: *who, what stack, proof, how to contact.* None of them gives that and also feels magical. **Our goal: references' delight + a recruiter fast-lane.**

> Caveat: I could read page text and a few screenshots for each site; scroll-hijacked pages (Naveen, Kryntix) and canvas content I only saw in part, so details of their hidden states are inferred from screenshots + page text.

## 2. Current site (audit)
Next.js 16.2.6, React 19, framer-motion, next-themes, Resend contact route; sections Navbar / Hero / About / Skills / Projects / Experience / Contact / Footer, CSS modules, content in `lib/data.ts`.

Content issues to fix during the redesign (please confirm answers — see §7):
- Email `vermajayant03@email.com` looks like a typo (`@email.com`).
- Several project `github` links point to your profile root or `jayantverma` (not `JayantVerma01`); two `live` links point at GitHub.
- Skills use percentage bars (e.g. FastAPI 92%) — hiring managers distrust these. Replace with grouped chips + "used in" project links.
- HG Infra / Hornet Dynamics / Fixl achievements are copy-pasted and identical; "Sementic" typo; Hornet description duplicates HG Infra's.
- Bio says 2 years; timeline starts July 2024 — fine, just keep numbers consistent.

## 3. Creative concept: **"Press Play"**
Your portfolio is a **staff ID badge on a lanyard** (from Angel/Kwon) that **plays your voice** (from Naveen). The badge is your identity; pressing it plays your intro; the rest of the site is "tracks" you can skip through. Projects live in a **3D rotating gallery** (from Kryntix) — but with real HTML text beneath for SEO/accessibility.

**Theme:** deep ink-navy (`#0b0d17`) with warm off-white type, **one** electric accent (violet→cyan gradient already in your brand, tightened to a single signature colour, e.g. `#7c5cff` with `#22d3ee` as a rare highlight), grain overlay, serif display (e.g. *Instrument Serif*) + clean grotesk (*Geist*/*Inter*) + mono for labels. Full **light mode** = warm paper (`#f3efe7`) like Angel. Both themes designed, not inverted.

**Recruiter fast-lane:** a persistent pill "Hire me" → opens a 20-second summary sheet (role, stack, 3 numbers, Resume, Email, LinkedIn). Always one click away.

## 4. Phased plan

### Phase 0 — Foundations (before any visuals)
- Read `node_modules/next/dist/docs/` for Next 16 specifics (per AGENTS.md) before writing code.
- New design tokens (colour, type scale, spacing, motion durations/easings) in `globals.css`.
- Add deps: `gsap`, `lenis` (smooth scroll, not scroll-jacking), `three` + `@react-three/fiber` + `@react-three/drei` + `@react-three/rapier` (badge physics). Keep `framer-motion` for UI, drop `react-type-animation`/`react-icons` if unused.
- Move content to `lib/data.ts` v2 (fix §2 issues, add case-study fields, intro captions).
- Perf guardrails: lazy-load all WebGL, `prefers-reduced-motion` + mobile fallbacks, Lighthouse ≥ 90 target.
- **Done when:** tokens + providers + fonts in place, build passes, old site still renders.

### Phase 1 — Loader + Navigation shell
- "Identity check" loader: name types in, badge "aligns 000→100%", then drops in (≤ 2s, skippable, shown once per session).
- Floating pill nav with active section, theme toggle, sound toggle, **Open to work** dot, **Hire me** fast-lane sheet.
- Side dot progress nav (Kwon). Custom cursor with "click me first" handwritten hint (Naveen) — desktop only.
- **Done when:** nav works with keyboard + screen reader, deep links (`#projects`) work.

### Phase 2 — Hero: the badge + intro audio  ★ signature
- Physics lanyard badge (rapier): draggable, swings, tilts with cursor; badge shows photo, name, "Full Stack · AI Engineer", QR → LinkedIn, "Available" chip.
- Giant name type behind with gradient split; rotating roles (AI Full Stack / Next.js / Node.js…).
- **Press-play button on the badge** → intro audio (see §5). Mobile: static tilt badge, same play button.
- Three KPI counters (2+ yrs, 10+ projects, 1500+ commits on BuildSync) with count-up.
- **Done when:** 60fps desktop, graceful static fallback, audio plays on tap only.

### Phase 3 — About ("The tape so far")
- Story as short **tracks** (Origin → First code → Enterprise work → AI → Now), each with Hear / Read toggle (Naveen), 20–30 s clips *optional* — text-only at launch is fine.
- Personal facts strip (location Jaipur, languages, interests) + resume download + "Beyond code" mini-gallery (Naruto Jutsu AR is a great personality proof).
- **Done when:** About reads in under 45 s and has one human detail.

### Phase 4 — Projects ("Selected work")  ★ signature
- 3D curved carousel (drei + three) of 5 featured projects with screenshot/video textures; drag/scroll/arrow-key to spin; reflection floor (Kryntix).
- Under it, a real HTML case-study panel for the active project: problem → what I built → stack chips → numbers → Live / GitHub. Featured / All toggle; "All" is a filterable grid (AI, E-commerce, Enterprise, Blockchain).
- Needs: **a screenshot per project** (I can capture from the live URLs where they exist).
- **Done when:** every featured project has outcome-focused copy; works without WebGL via a swipeable fallback.

### Phase 5 — Skills ("Toolbox")
- Replace % bars with grouped, interactive stack map: hover a skill → highlights the projects that used it. Group: AI/GenAI, Backend, Frontend, Data, DevOps, Integrations.
- **Done when:** no percentage bars remain; each skill links to ≥ 1 project.

### Phase 6 — Experience + Process ("How I work")
- Vertical timeline with a scroll-drawn line, real, distinct achievements per role (needs your input).
- Process strip (Listen → Design the API → Build → Ship & monitor) with "what comes of it" chips (Angel).
- **Done when:** each role has unique, quantified bullets.

### Phase 7 — Contact + Footer ("Your turn")
- Big CTA ("You were a good listener. Your turn." energy, in your own words), working Resend form with validation + success state + honeypot, direct email/LinkedIn/GitHub, resume button, local time, "End of tape" footer.
- **Done when:** a test email arrives; form errors handled.

### Phase 8 — Polish, accessibility, SEO, launch
- Keyboard/focus audit, contrast AA in both themes, reduced-motion paths, alt text, OG image, JSON-LD `Person`, sitemap, analytics, Lighthouse + real-device (iOS Safari, low-end Android) testing, Vercel deploy.

## 5. Audio intro — creative plan
**Goal:** a 30–45 s spoken introduction in your own voice, that feels like a mini podcast, not an autoplay ad.

**Interaction**
1. Never autoplay (browsers block it and it irritates). The hero shows a handwritten hint: *"Press play — hear me introduce myself."*
2. Click the badge's **▶** → badge lifts and sways, a **waveform ring** pulses around the photo, and **live captions** highlight word-by-word at the bottom (accessible + works muted).
3. As you speak, the page responds: when you say "Next.js" the stack chip lights up; when you mention BuildSync the project thumbnail flashes in. Cheap to build: a JSON of `{time, event}` cues.
4. Controls: pause, restart, mute, speed ×1/×1.25, "skip to Projects" at the end.
5. Sticky mini-player after scroll so it keeps playing while they explore.

**Draft script (~100 words — edit freely, it must sound like you)**
> "Hi, I'm Jayant Verma — a full-stack developer from Jaipur. For the last two years I've been building things that actually run in production: enterprise construction software at HG Infra, e-commerce platforms, and AI products using RAG and LangGraph. I like the backend most — clean APIs, solid data, integrations like SAP and Razorpay — and I love turning that into interfaces people enjoy using. If you're hiring for a Full Stack or AI engineering role, I'd love to talk. Scroll down to see what I've built. Thanks for listening."

**Production options**
- **A (best): record it yourself** — phone voice memo in a quiet room, 2–3 takes, I'll supply a teleprompter script and cleanup steps (trim, normalise, export `.mp3` ~96 kbps ≈ 400 KB).
- B: AI voice (ElevenLabs etc.) cloned from your sample — faster, but needs your consent/account and can sound less authentic.
- B-fallback: browser text-to-speech — not recommended, sounds robotic.

Captions are generated from the script; for exact timing I'll align words to the recording (forced alignment or manual timestamps).

## 6. Order of work & risks
Order: **0 → 1 → 2 → 4 → 3 → 5 → 6 → 7 → 8** (hero + projects carry the impact; build them first).
Risks: WebGL weight on mobile (mitigated by lazy load + fallback); project screenshots and your recorded audio are inputs I can't produce; some live project URLs may be private/behind login.

## 7. Questions to unblock Phase 0
1. Correct email? Correct GitHub repo links for projects 2, 3, 4, 7, 9, 10?
2. Photo for the badge (square, good light) — or should I use a stylised illustrated avatar like Kwon's?
3. Audio: record yourself (A) or AI voice (B)? Hindi/English mix, or English only?
4. Real, distinct achievements per job (numbers if you have them)?
5. Default theme: dark ink (my pick) or warm paper-light?
