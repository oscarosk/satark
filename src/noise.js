// Simulates speech-recognition errors so the benchmark can test the detector
// on transcripts like the ones a live microphone produces.
//
// Two kinds of error: Hinglish spelling drift (the same word spelled several
// ways) and random character slips (dropped, doubled or swapped letters).

import { rng } from "./rng.js";

const SPELLING = [
  [/aa/g, "a"], [/ee/g, "i"], [/oo/g, "u"], [/\bhai\b/g, "he"], [/\bmain\b/g, "mai"],
  [/\bnahi\b/g, "nhi"], [/\bkijiye\b/g, "kijie"], [/\baap/g, "ap"], [/v/g, "w"], [/ph/g, "f"],
];

export function addNoise(text, rand, { slip = 0.06, drift = 0.5 } = {}) {
  let t = text.toLowerCase();
  for (const [re, rep] of SPELLING) if (rand() < drift) t = t.replace(re, rep);
  const chars = Array.from(t);
  const out = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const r = rand();
    if (c === " " || r > slip) out.push(c);
    else if (r < slip / 3) continue; // dropped letter
    else if (r < (2 * slip) / 3) out.push(c, c); // doubled letter
    else if (i + 1 < chars.length && chars[i + 1] !== " ") { out.push(chars[i + 1], c); i++; } // swapped letters
    else out.push(c);
  }
  return out.join("");
}

export function noisyCalls(calls, seed = 11, opts) {
  const rand = rng(seed);
  return calls.map((c) => ({ ...c, id: `${c.id}-noisy`, lines: c.lines.map((l) => [l[0], addNoise(l[1], rand, opts), l[2]]) }));
}
