import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import model from "../src/model.js";
import { createTracker, scoreLine } from "../src/engine.js";
import { predict } from "../src/classifier.js";
import { SCAM, GENUINE } from "../data/phrases.js";
import { SAMPLES, ADVERSARIAL } from "../data/handwritten.js";
import { addNoise } from "../src/noise.js";
import { rng } from "../src/rng.js";
import { runSystem, summarize, SYSTEMS } from "../src/evaluate.js";

const settings = JSON.parse(readFileSync(new URL("../results/thresholds.json", import.meta.url))).satark;
const run = (lines) => {
  const t = createTracker(model, settings);
  return lines.map((l) => t.push(l));
};

test("an OTP request on its own stays safe", () => {
  const out = run(["Delivery ke liye OTP bata dijiye jo aapke phone par aaya hai"]);
  assert.notEqual(out.at(-1).status, "alert");
});

test("authority followed by a threat raises an alert", () => {
  const out = run(["Main CBI se inspector bol raha hoon", "Aapke khilaf arrest warrant jaari hua hai"]);
  assert.equal(out.at(-1).status, "alert");
});

test("Devanagari Hindi scam lines are recognised", () => {
  const out = run(["मैं पुलिस अधिकारी बोल रहा हूँ", "आपके खिलाफ गैर-जमानती वारंट जारी हो चुका है"]);
  assert.equal(out.at(-1).status, "alert");
});

test("a genuine caller saying the bank never asks for OTP lowers the risk", () => {
  const plain = run(["Aapke account se transaction hua", "OTP mat batana kisi ko"]).at(-1).risk;
  const reassured = run(["Aapke account se transaction hua", "OTP mat batana kisi ko", "Bank kabhi bhi OTP nahi maangta"]).at(-1).risk;
  assert.ok(reassured <= plain);
});

test("a story about someone else is discounted", () => {
  const story = scoreLine("Unhone bola ki money laundering ka case hai aur arrest ho jayega", model);
  const direct = scoreLine("Aapke upar money laundering ka case hai aur arrest ho jayega", model);
  assert.ok(story.evidence.fear < direct.evidence.fear);
});

test("the classifier returns probabilities that sum to one", () => {
  const p = predict(model, "Transfer the money to this safe account");
  const sum = Object.values(p).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
});

test("scoring is deterministic", () => {
  const a = run(SAMPLES[0].lines.map((l) => l[1])).map((e) => e.risk);
  const b = run(SAMPLES[0].lines.map((l) => l[1])).map((e) => e.risk);
  assert.deepEqual(a, b);
});

test("every demo scam alerts before the payment line and every demo genuine call stays safe", () => {
  for (const call of SAMPLES) {
    const out = run(call.lines.map((l) => l[1]));
    const alertAt = out.findIndex((e) => e.status === "alert");
    if (call.label === "scam") {
      const pay = call.lines.findIndex((l) => l[2] === "payment");
      assert.ok(alertAt >= 0 && alertAt < pay, `${call.id} should alert before payment`);
    } else {
      assert.equal(alertAt, -1, `${call.id} should not alert`);
    }
  }
});

test("training and test phrasings never overlap", () => {
  for (const stage of Object.keys(SCAM)) {
    const train = new Set(SCAM[stage].train);
    for (const t of SCAM[stage].test) assert.ok(!train.has(t), t);
  }
  for (const slots of Object.values(GENUINE)) for (const s of slots) assert.notEqual(s[1], s[2]);
});

test("hand-written calls never appear in the generated data", () => {
  const data = JSON.parse(readFileSync(new URL("../data/calls.json", import.meta.url)));
  const generated = new Set([...data.train, ...data.test].flatMap((c) => c.lines.map((l) => l[1])));
  for (const c of [...ADVERSARIAL, ...SAMPLES]) {
    for (const l of c.lines) if (l[2]) assert.ok(!generated.has(l[1]), l[1]);
  }
});

test("noise is reproducible from a seed", () => {
  const a = addNoise("Aapke account se paisa transfer kijiye", rng(5));
  const b = addNoise("Aapke account se paisa transfer kijiye", rng(5));
  assert.equal(a, b);
});

test("published benchmark numbers match a fresh run", () => {
  const data = JSON.parse(readFileSync(new URL("../data/calls.json", import.meta.url)));
  const bench = JSON.parse(readFileSync(new URL("../results/benchmark.json", import.meta.url)));
  const fresh = summarize(runSystem(data.test, model, SYSTEMS.satark, settings));
  const published = bench.suites.heldout.systems.satark;
  assert.equal(fresh.warnedBeforePayment, published.warnedBeforePayment);
  assert.equal(fresh.falseAlarmRate, published.falseAlarmRate);
  assert.equal(fresh.medianLeadSeconds, published.medianLeadSeconds);
});
