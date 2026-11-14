// Generates the labelled call dataset from the phrase banks.
// Deterministic: the same seed always produces the same calls.
//
//   node scripts/generate.js   ->  data/calls.json
//
// Training calls use only `train` phrasings; test calls use only `test`
// phrasings, so no test sentence is ever seen during training.

import { writeFileSync } from "node:fs";
import { SCAM, CALLER_FILLER, USER_LINES, GENUINE } from "../data/phrases.js";
import { rng } from "../src/rng.js";

const COUNTS = { train: { scam: 160, genuine: 160 }, test: { scam: 80, genuine: 80 } };

// `parity` (0 or 1) keeps only every other training phrasing. The tuning step
// uses it to build calls in wording the classifier was not fitted on.
function scamCall(split, rand, n, parity = null) {
  const keep = (arr) => arr.filter((_, i) => parity === null || i % 2 === parity);
  const pick = (arr) => { const a = keep(arr); return a[Math.floor(rand() * a.length)]; };
  const pickN = (arr, k) => {
    const pool = keep(arr);
    const out = [];
    for (let i = 0; i < k && pool.length; i++) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    return out;
  };
  const stage = (name, k) => pickN(SCAM[name][split], k).map((t) => ["c", t, name]);
  const user = () => ["u", pick(USER_LINES[split]), null];
  const lines = [];
  if (rand() < 0.7) lines.push(["c", pick(CALLER_FILLER[split]), null]);
  if (rand() < 0.6) lines.push(user());
  lines.push(...stage("authority", rand() < 0.3 ? 2 : 1));
  if (rand() < 0.5) lines.push(user());
  lines.push(...stage("fear", rand() < 0.5 ? 2 : 1));
  lines.push(user());
  // Some scams skip the isolation step and go straight to money.
  if (rand() < 0.8) {
    lines.push(...stage("isolation", rand() < 0.4 ? 2 : 1));
    if (rand() < 0.5) lines.push(user());
  }
  if (rand() < 0.3) lines.push(["c", pick(CALLER_FILLER[split]), null]);
  lines.push(...stage("payment", rand() < 0.4 ? 2 : 1));
  if (rand() < 0.5) lines.push(user());
  return { id: `${split}-scam-${n}`, label: "scam", lines };
}

function genuineCall(split, rand, n) {
  const names = Object.keys(GENUINE);
  const name = names[n % names.length];
  const lines = [];
  GENUINE[name].forEach((slot, k) => {
    // Alternate which phrasing goes to training, so both splits mix Hinglish,
    // Hindi and English instead of one split being mostly English.
    const col = (split === "train") === (k % 2 === 0) ? 1 : 2;
    // Drop an occasional slot and sprinkle in user filler for variety.
    if (rand() < 0.15) return;
    lines.push([slot[0], slot[col], null]);
    if (rand() < 0.2) lines.push(["u", USER_LINES[split][Math.floor(rand() * USER_LINES[split].length)], null]);
  });
  return { id: `${split}-genuine-${name}-${n}`, label: "genuine", scenario: name, lines };
}

export function generate(seed = 2026) {
  const out = {};
  for (const split of ["train", "test"]) {
    const rand = rng(seed + (split === "train" ? 0 : 1000));
    const calls = [];
    for (let i = 0; i < COUNTS[split].scam; i++) calls.push(scamCall(split, rand, i));
    for (let i = 0; i < COUNTS[split].genuine; i++) calls.push(genuineCall(split, rand, i));
    out[split] = calls;
  }
  // Tuning sets, built only from training phrasings: the classifier is fitted
  // on calls using half of them and thresholds are tuned on calls using the
  // other half, so the threshold reflects wording the classifier has not seen.
  const rand = rng(seed + 2000);
  out.tuneFit = Array.from({ length: 120 }, (_, i) => scamCall("train", rand, i, 0)).map((c) => ({ ...c, id: c.id.replace("train", "tunefit") }));
  out.tuneVal = Array.from({ length: 60 }, (_, i) => scamCall("train", rand, i, 1)).map((c) => ({ ...c, id: c.id.replace("train", "tuneval") }));
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const data = generate();
  writeFileSync(new URL("../data/calls.json", import.meta.url), JSON.stringify(data, null, 1));
  console.log(`train: ${data.train.length} calls, test: ${data.test.length} calls`);
}
