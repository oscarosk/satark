// A small multinomial Naive Bayes line classifier over character n-grams.
// Character n-grams cope with the many spellings of Hinglish ("aapke", "apke",
// "aap ke") and work the same for Devanagari and English text.
// It is trained in Node (scripts/train.js) and runs in the browser from a JSON model.

import { normalize } from "./rules.js";

export const CLASSES = ["none", "authority", "fear", "isolation", "payment"];
const NMIN = 2;
const NMAX = 4;

export function features(text) {
  const t = ` ${normalize(text)} `;
  const out = [];
  const chars = Array.from(t);
  for (let n = NMIN; n <= NMAX; n++) {
    for (let i = 0; i + n <= chars.length; i++) out.push(chars.slice(i, i + n).join(""));
  }
  for (const w of t.trim().split(" ")) if (w.length > 1) out.push(`w:${w}`);
  return out;
}

// examples: [{ text, label }]
export function train(examples, { alpha = 0.5, minCount = 2 } = {}) {
  const docCount = Object.fromEntries(CLASSES.map((c) => [c, 0]));
  const counts = Object.fromEntries(CLASSES.map((c) => [c, new Map()]));
  const vocabCount = new Map();
  for (const { text, label } of examples) {
    docCount[label]++;
    for (const f of features(text)) {
      counts[label].set(f, (counts[label].get(f) || 0) + 1);
      vocabCount.set(f, (vocabCount.get(f) || 0) + 1);
    }
  }
  const vocab = [...vocabCount].filter(([, c]) => c >= minCount).map(([f]) => f).sort();
  const total = examples.length;
  const model = { classes: CLASSES, alpha, vocabSize: vocab.length, prior: {}, unseen: {}, logp: {} };
  for (const c of CLASSES) {
    let sum = 0;
    for (const f of vocab) sum += counts[c].get(f) || 0;
    const denom = sum + alpha * vocab.length;
    model.prior[c] = Math.log((docCount[c] + 1) / (total + CLASSES.length));
    model.unseen[c] = Math.log(alpha / denom);
    const lp = {};
    for (const f of vocab) {
      const k = counts[c].get(f);
      if (k) lp[f] = +Math.log((k + alpha) / denom).toFixed(4);
    }
    model.logp[c] = lp;
  }
  model.vocab = Object.fromEntries(vocab.map((f) => [f, 1]));
  return model;
}

// Returns class probabilities. Log-likelihoods are averaged per feature and
// scaled, which keeps Naive Bayes from becoming overconfident on long lines.
// Short lines ("Accha", "What time?") carry little evidence, so their scale
// shrinks and the prediction falls back toward the prior (mostly "none").
export function predict(model, text, { scale = 6, fullAt = 45 } = {}) {
  const feats = features(text).filter((f) => model.vocab[f]);
  const k = scale * Math.min(1, feats.length / fullAt);
  const scores = {};
  for (const c of model.classes) {
    let ll = 0;
    for (const f of feats) ll += model.logp[c][f] ?? model.unseen[c];
    scores[c] = model.prior[c] + (feats.length ? (k * ll) / feats.length : 0);
  }
  const max = Math.max(...Object.values(scores));
  let z = 0;
  for (const c of model.classes) z += Math.exp(scores[c] - max);
  const probs = {};
  for (const c of model.classes) probs[c] = Math.exp(scores[c] - max) / z;
  return probs;
}
