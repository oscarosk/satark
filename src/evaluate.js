// Runs a detector over a set of labelled calls and measures what matters to a victim:
// was the scam caught before the money was asked for, and how many seconds early?

import { createTracker } from "./engine.js";
import { KEYWORDS, normalize } from "./rules.js";
import { timeline } from "./timing.js";
import { rng } from "./rng.js";

// Systems compared in the benchmark.
export const SYSTEMS = {
  satark: { name: "Satark (rules + classifier + script tracking)", options: {} },
  rules_seq: { name: "Rules + script tracking (no classifier)", options: { useModel: false } },
  model_seq: { name: "Classifier + script tracking (no rules)", options: { useRules: false } },
  line_only: { name: "Line-by-line classifier (no script tracking)", options: { useSequence: false } },
  keyword: { name: "Keyword filter", keyword: true },
};

// Index of the first line where the system raises an alert, or null.
export function firstAlert(call, model, system, setting) {
  const { threshold, ...extra } = typeof setting === "object" ? setting : { threshold: setting };
  if (system.keyword) {
    const i = call.lines.findIndex((l) => KEYWORDS.test(normalize(l[1])));
    return i < 0 ? null : i;
  }
  const tracker = createTracker(model, { ...system.options, ...extra, threshold });
  for (let i = 0; i < call.lines.length; i++) {
    if (tracker.push(call.lines[i][1], call.lines[i][0]).status === "alert") return i;
  }
  return null;
}

export function outcome(call, alertAt) {
  const times = timeline(call.lines);
  if (call.label === "genuine") return { label: "genuine", falseAlarm: alertAt !== null };
  const pay = call.lines.findIndex((l) => l[2] === "payment");
  const caught = alertAt !== null;
  const early = caught && alertAt < pay;
  return {
    label: "scam",
    caught,
    early,
    lead: early ? times[pay].start - times[alertAt].end : null,
  };
}

export function runSystem(calls, model, system, threshold) {
  return calls.map((c) => outcome(c, firstAlert(c, model, system, threshold)));
}

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function summarize(outcomes) {
  const scams = outcomes.filter((o) => o.label === "scam");
  const genuine = outcomes.filter((o) => o.label === "genuine");
  const leads = scams.filter((o) => o.early).map((o) => o.lead);
  return {
    scams: scams.length,
    genuine: genuine.length,
    warnedBeforePayment: scams.length ? scams.filter((o) => o.early).length / scams.length : null,
    caughtAtAll: scams.length ? scams.filter((o) => o.caught).length / scams.length : null,
    falseAlarmRate: genuine.length ? genuine.filter((o) => o.falseAlarm).length / genuine.length : null,
    medianLeadSeconds: median(leads),
  };
}

// Percentile bootstrap over calls, resampling scams and genuine calls separately.
export function bootstrap(outcomes, { reps = 2000, seed = 7 } = {}) {
  const rand = rng(seed);
  const scams = outcomes.filter((o) => o.label === "scam");
  const genuine = outcomes.filter((o) => o.label === "genuine");
  const draw = (arr) => Array.from(arr, () => arr[Math.floor(rand() * arr.length)]);
  const keys = ["warnedBeforePayment", "caughtAtAll", "falseAlarmRate", "medianLeadSeconds"];
  const samples = Object.fromEntries(keys.map((k) => [k, []]));
  for (let r = 0; r < reps; r++) {
    const s = summarize([...draw(scams), ...draw(genuine)]);
    for (const k of keys) if (s[k] !== null) samples[k].push(s[k]);
  }
  const ci = {};
  for (const k of keys) {
    const xs = samples[k].sort((a, b) => a - b);
    ci[k] = xs.length ? [xs[Math.floor(0.025 * xs.length)], xs[Math.ceil(0.975 * xs.length) - 1]] : null;
  }
  return ci;
}

// Picks the threshold that warns before payment most often while keeping
// false alarms at or below the limit. When several thresholds tie, it takes the
// middle one, which is the least sensitive to small changes in the data.
export function tuneThreshold(calls, model, system, { maxFalseAlarm = 0.02 } = {}) {
  let bestScore = -1;
  let tied = [];
  for (let t = 0.3; t <= 0.951; t += 0.01) {
    const th = +t.toFixed(2);
    const s = summarize(runSystem(calls, model, system, th));
    if (s.falseAlarmRate > maxFalseAlarm) continue;
    if (s.warnedBeforePayment > bestScore) {
      bestScore = s.warnedBeforePayment;
      tied = [th];
    } else if (s.warnedBeforePayment === bestScore) tied.push(th);
  }
  return { threshold: tied.length ? tied[Math.floor((tied.length - 1) / 2)] : 0.9, score: bestScore };
}

// For Satark itself, also tunes how much the classifier counts next to the rules.
export function tuneSatark(calls, model, { weights = [0, 0.25, 0.5, 0.75, 1] } = {}) {
  let best = null;
  for (const w of weights) {
    const system = { options: { modelWeight: w } };
    const { threshold, score } = tuneThreshold(calls, model, system);
    const lead = summarize(runSystem(calls, model, system, threshold)).medianLeadSeconds ?? 0;
    if (!best || score > best.score || (score === best.score && lead > best.lead)) best = { modelWeight: w, threshold, score, lead };
  }
  return best;
}
