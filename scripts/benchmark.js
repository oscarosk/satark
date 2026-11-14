// Held-out benchmark. Compares Satark with simpler approaches on calls that
// were never used for training or threshold tuning.
//
//   node scripts/benchmark.js  ->  results/benchmark.json, results/benchmark.md

import { readFileSync, writeFileSync } from "node:fs";
import model from "../src/model.js";
import { SYSTEMS, runSystem, summarize, bootstrap } from "../src/evaluate.js";
import { ADVERSARIAL } from "../data/handwritten.js";
import { noisyCalls } from "../src/noise.js";

const data = JSON.parse(readFileSync(new URL("../data/calls.json", import.meta.url)));
const thresholds = JSON.parse(readFileSync(new URL("../results/thresholds.json", import.meta.url)));

const SUITES = {
  heldout: { name: "Held-out generated calls (unseen phrasings)", calls: data.test },
  noisy: { name: "Held-out calls with simulated speech-recognition errors", calls: noisyCalls(data.test) },
  handwritten: { name: "Hand-written hard calls (new wording, new scam types)", calls: ADVERSARIAL },
};

const pct = (x) => (x === null ? "n/a" : `${(100 * x).toFixed(1)}%`);
const sec = (x) => (x === null ? "n/a" : `${x.toFixed(1)} s`);
const ciPct = (c) => (c ? `[${pct(c[0])}, ${pct(c[1])}]` : "");
const ciSec = (c) => (c ? `[${sec(c[0])}, ${sec(c[1])}]` : "");

const out = { generatedAt: new Date().toISOString(), thresholds, suites: {} };
let md = "# Satark benchmark\n\n";
md += "Every call below was held out from training and threshold tuning. Brackets are 95% bootstrap confidence intervals.\n\n";

for (const [key, suite] of Object.entries(SUITES)) {
  const scams = suite.calls.filter((c) => c.label === "scam").length;
  md += `## ${suite.name}\n\n${scams} scam calls, ${suite.calls.length - scams} genuine calls.\n\n`;
  md += "| System | Warned before payment | Median warning lead | False alarms on genuine calls |\n|---|---|---|---|\n";
  out.suites[key] = { name: suite.name, systems: {} };
  for (const [sk, system] of Object.entries(SYSTEMS)) {
    const outcomes = runSystem(suite.calls, model, system, thresholds[sk]);
    const s = summarize(outcomes);
    const ci = bootstrap(outcomes);
    out.suites[key].systems[sk] = { name: system.name, ...s, ci };
    md += `| ${system.name} | ${pct(s.warnedBeforePayment)} ${ciPct(ci.warnedBeforePayment)} | ${sec(s.medianLeadSeconds)} ${ciSec(ci.medianLeadSeconds)} | ${pct(s.falseAlarmRate)} ${ciPct(ci.falseAlarmRate)} |\n`;
    if (key === "handwritten") {
      out.suites[key].systems[sk].perCall = suite.calls.map((c, i) => ({ id: c.id, label: c.label, ...outcomes[i] }));
    }
  }
  md += "\n";
}

writeFileSync(new URL("../results/benchmark.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
writeFileSync(new URL("../results/benchmark.md", import.meta.url), md);
console.log(md);
