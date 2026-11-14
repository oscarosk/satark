// The Satark engine: scores each line of a call, tracks how far the scam script
// has progressed, and raises an alert before the payment stage.
// Runs entirely on-device, in Node or the browser. No network calls.

import { RULES, PROTECTIVE, DIRECT, NARRATIVE, STAGE_INFO, normalize } from "./rules.js";
import { predict } from "./classifier.js";

export const STAGES = ["authority", "fear", "isolation", "payment"];
export const DEFAULTS = {
  threshold: 0.6, // risk at which Satark tells you to hang up (tuned on validation calls)
  watch: 0.3, // risk at which the call is marked suspicious
  useRules: true,
  useModel: true,
  useSequence: true,
  modelWeight: 1, // how much the classifier's evidence counts next to the rules (tuned on validation)
};

// Evidence for each stage in one line, plus which phrases triggered it.
export function scoreLine(text, model, opts = DEFAULTS) {
  const norm = normalize(text);
  const evidence = {};
  const triggers = [];
  const probs = opts.useModel && model ? predict(model, text) : null;
  // A threat about someone else ("they told him...") is a story, not a threat to you.
  const story = NARRATIVE.test(norm) && !DIRECT.test(norm);
  for (const s of STAGES) {
    let r = 0;
    if (opts.useRules) {
      for (const rule of RULES[s]) {
        const m = norm.match(rule.re);
        if (m) {
          r += rule.w;
          triggers.push({ stage: s, phrase: m[0], why: rule.why });
        }
      }
    }
    r = Math.min(1, r);
    const p = probs ? (opts.modelWeight ?? 1) * probs[s] : 0;
    let e = 1 - (1 - r) * (1 - p);
    if (story) e *= 0.35;
    evidence[s] = +e.toFixed(4);
  }
  const protective = PROTECTIVE.some((re) => re.test(norm));
  return { evidence, triggers, protective, story, probs };
}

// Call-level risk from how many scam stages have appeared, and in what order.
// One stage alone can never trigger an alert: a genuine bank or delivery call
// may mention an OTP, but it does not threaten you first.
function sequenceRisk(levels, order) {
  const sorted = STAGES.map((s) => levels[s]).sort((a, b) => b - a);
  let risk = 0.32 * sorted[0] + 0.42 * sorted[1] + 0.16 * sorted[2] + 0.1 * sorted[3];
  // The scam script: authority or fear first, then isolation or payment.
  const first = (s) => order.indexOf(s);
  const opener = Math.min(...["authority", "fear"].map(first).filter((i) => i >= 0), Infinity);
  const closer = Math.min(...["isolation", "payment"].map(first).filter((i) => i >= 0), Infinity);
  if (opener < closer && closer !== Infinity) risk += 0.1;
  return Math.min(1, risk);
}

export function createTracker(model, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  let levels, order, protection, history, alerted;
  const reset = () => {
    levels = Object.fromEntries(STAGES.map((s) => [s, 0]));
    order = [];
    protection = 0;
    history = [];
    alerted = null;
  };
  reset();

  function push(text, speaker = "c") {
    const line = scoreLine(text, model, opts);
    const reached = [];
    for (const s of STAGES) {
      if (line.evidence[s] > levels[s]) levels[s] = line.evidence[s];
      if (line.evidence[s] >= 0.5 && !order.includes(s)) {
        order.push(s);
        reached.push(s);
      }
    }
    if (line.protective) protection = Math.min(1, protection + 0.6);
    let risk;
    if (opts.useSequence) {
      risk = sequenceRisk(levels, order) * (1 - 0.75 * protection);
    } else {
      // Line-level baseline: judge each line on its own, with no memory of the call.
      risk = Math.max(...STAGES.map((s) => line.evidence[s]));
    }
    risk = +risk.toFixed(4);
    const status = risk >= opts.threshold ? "alert" : risk >= opts.watch ? "watch" : "safe";
    if (status === "alert" && alerted === null) alerted = history.length;
    const entry = { text, speaker, risk, status, reached, ...line, levels: { ...levels } };
    history.push(entry);
    return entry;
  }

  return {
    push,
    reset,
    get levels() { return { ...levels }; },
    get order() { return [...order]; },
    get alertedAt() { return alerted; },
    get history() { return history; },
  };
}

export { STAGE_INFO };
