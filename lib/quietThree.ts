/**
 * three.js (r182+) and rapier log deprecation notices from inside
 * @react-three/fiber / @react-three/rapier, which we cannot change.
 * They are harmless, so keep the console readable.
 */
const NOISE = ["THREE.Clock", "using deprecated parameters for the initialization function"];

if (typeof window !== "undefined") {
  const w = window as unknown as { __quietThree?: boolean };
  if (!w.__quietThree) {
    w.__quietThree = true;
    for (const k of ["warn", "log"] as const) {
      const orig = console[k].bind(console);
      console[k] = (...args: unknown[]) => {
        if (typeof args[0] === "string" && NOISE.some((n) => (args[0] as string).includes(n))) return;
        orig(...args);
      };
    }
  }
}

export {};
