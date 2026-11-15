import model from "../src/model.js";
import { createTracker, STAGES, STAGE_INFO } from "../src/engine.js";
import { lineSeconds } from "../src/timing.js";
import { SAMPLES } from "../data/handwritten.js";
import bench from "../results/benchmark.json";
import thresholds from "../results/thresholds.json";

const $ = (id) => document.getElementById(id);
const settings = thresholds.satark;
let tracker = createTracker(model, settings);
let current = SAMPLES[0];
let playing = null; // { cancel: () => void }
let elapsed = 0;
let alertLine = null;
let firstPaymentLine = null;
let lineCount = 0;

// ---------- Sample picker ----------
for (const s of SAMPLES) {
  const b = document.createElement("button");
  b.className = "chip";
  b.type = "button";
  b.setAttribute("aria-pressed", s === current ? "true" : "false");
  b.innerHTML = `<span class="kind ${s.label}"></span>${s.short}`;
  b.title = s.title;
  b.addEventListener("click", () => {
    stopAll();
    current = s;
    document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b ? "true" : "false"));
    resetCall(`${s.language} sample, press play`);
  });
  $("samples").append(b);
}

// ---------- Script tracker panel ----------
for (const [i, s] of STAGES.entries()) {
  const li = document.createElement("li");
  li.id = `st-${s}`;
  li.title = STAGE_INFO[s].explain;
  li.innerHTML = `<span class="top"><span class="num">${i + 1}</span><span class="pct">0%</span></span><span class="name">${STAGE_INFO[s].label}<span lang="hi">${STAGE_INFO[s].hindi}</span></span>`;
  $("script").append(li);
}

function render(entry) {
  const levels = entry ? entry.levels : Object.fromEntries(STAGES.map((s) => [s, 0]));
  for (const s of STAGES) {
    const li = $(`st-${s}`);
    li.classList.toggle("hit", levels[s] >= 0.5);
    li.querySelector(".pct").textContent = `${Math.round(levels[s] * 100)}%`;
  }
  const risk = entry ? entry.risk : 0;
  const status = entry ? (alertLine !== null ? "alert" : entry.status) : "safe";
  const fill = $("fill");
  fill.style.width = `${Math.max(2, Math.round(meterPosition(risk) * 100))}%`;
  fill.style.background = status === "alert" ? "var(--alert)" : status === "watch" ? "var(--watch)" : "var(--safe)";
  const v = $("verdict");
  v.className = `verdict ${status === "safe" ? "" : status}`;
  if (status === "alert") {
    const reached = tracker.order.map((s) => STAGE_INFO[s].label.toLowerCase());
    $("vtitle").textContent = "Hang up now";
    $("vtext").textContent = `This call matches a digital-arrest scam: ${listJoin(reached)}. Real officers never arrest you or ask for money over a call.`;
  } else if (status === "watch") {
    $("vtitle").textContent = "Be careful";
    $("vtext").textContent = "Something here is unusual. Do not share an OTP or move money while you are on this call.";
  } else {
    $("vtitle").textContent = entry ? "Looks safe so far" : "Listening";
    $("vtext").textContent = entry ? "No scam pattern yet. Satark keeps watching until the call ends." : "Nothing suspicious yet.";
  }
  renderPhoneBar(entry, status);
}

// Draws the meter as three equal zones, whatever the tuned thresholds are.
function meterPosition(risk) {
  const w = settings.watch ?? 0.3;
  const t = settings.threshold;
  if (risk < w) return (risk / w) / 3;
  if (risk < t) return 1 / 3 + ((risk - w) / (t - w)) / 3;
  return 2 / 3 + ((risk - t) / (1 - t)) / 3;
}

// On phones the verdict panel sits below the transcript, so a pinned bar mirrors it
// and hides itself whenever the full verdict is on screen.
let verdictVisible = false;
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => {
    verdictVisible = e.isIntersecting;
    $("mstatus").classList.toggle("hidden", verdictVisible);
  }).observe($("verdict"));
}
function renderPhoneBar(entry, status) {
  const bar = $("mstatus");
  bar.className = `mstatus ${entry ? "on" : ""} ${status === "safe" ? "" : status} ${verdictVisible ? "hidden" : ""}`;
  $("mstext").textContent =
    status === "alert" ? "Hang up now: scam pattern" : status === "watch" ? "Be careful" : entry ? "Looks safe so far" : "Listening";
}

const listJoin = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

// ---------- Transcript ----------
function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function highlight(text, triggers) {
  let html = escapeHtml(text);
  const seen = new Set();
  for (const t of triggers) {
    const p = t.phrase.trim();
    if (p.length < 2 || seen.has(p)) continue;
    seen.add(p);
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "[\\s,.\\-]+"), "i");
    html = html.replace(re, (m) => `<mark>${m}</mark>`);
  }
  return html;
}

function addLine(speaker, text) {
  $("empty")?.remove();
  const div = document.createElement("div");
  div.className = `line ${speaker}`;
  div.innerHTML = `<span class="tag">${speaker === "u" ? "You" : "Caller"}</span><span class="txt"></span>`;
  const box = $("lines");
  box.append(div);
  box.scrollTop = box.scrollHeight; // scroll the transcript only, never the page
  return div;
}

function scoreInto(div, speaker, text, sampleStage) {
  const entry = tracker.push(text, speaker);
  const idx = lineCount++;
  div.querySelector(".txt").innerHTML = highlight(text, entry.triggers);
  const strongest = STAGES.filter((s) => entry.evidence[s] >= 0.5).sort((a, b) => entry.evidence[b] - entry.evidence[a])[0];
  if (strongest) {
    const tag = div.querySelector(".tag");
    tag.classList.add(strongest);
    tag.innerHTML = `${speaker === "u" ? "You" : "Caller"}: <b>${STAGE_INFO[strongest].label.toLowerCase()}</b>`;
  }
  if (sampleStage === "payment" && firstPaymentLine === null) firstPaymentLine = { idx, at: elapsed };
  if (entry.status === "alert" && alertLine === null) alertLine = { idx, at: elapsed + lineSeconds(text) };
  render(entry);
  updateLeadNote();
  return entry;
}

function updateLeadNote() {
  const n = $("leadnote");
  if (alertLine && firstPaymentLine && alertLine.idx < firstPaymentLine.idx) {
    const lead = Math.max(0, firstPaymentLine.at - alertLine.at);
    n.textContent = `Warned ${Math.round(lead)} seconds before the caller asked for money.`;
  } else if (alertLine && !firstPaymentLine && current.label === "scam" && playing) {
    n.textContent = "Warned before the caller has asked for money.";
  } else n.textContent = "";
}

function setTimer(sec) {
  const s = Math.floor(sec);
  $("timer").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function resetCall(sub) {
  tracker = createTracker(model, settings);
  alertLine = null;
  firstPaymentLine = null;
  lineCount = 0;
  elapsed = 0;
  setTimer(0);
  $("lines").innerHTML = `<p class="empty" id="empty">The transcript appears here as the call goes on. You can also type what a caller says below.</p>`;
  $("callsub").textContent = sub;
  $("leadnote").textContent = "";
  render(null);
}

// ---------- Playback ----------
const sleep = (ms, signal) => new Promise((res) => { const t = setTimeout(res, ms); signal.onCancel = () => { clearTimeout(t); res(); }; });

function pickVoice(text) {
  const voices = speechSynthesis.getVoices();
  const devanagari = /[\u0900-\u097F]/.test(text);
  const hinglish = !devanagari && /\b(hai|hoon|aap|kya|nahi|kijiye|mat|ke|se)\b/i.test(text);
  const want = devanagari || hinglish ? ["hi-IN"] : ["en-IN", "en-GB", "en-US"];
  for (const w of want) {
    const v = voices.find((x) => x.lang.replace("_", "-") === w);
    if (v) return v;
  }
  return null;
}

function speak(text, speaker, signal) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve(false);
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(text);
    if (v) { u.voice = v; u.lang = v.lang; }
    u.rate = 1.02;
    u.pitch = speaker === "u" ? 1.25 : 0.85;
    u.onend = () => resolve(true);
    u.onerror = () => resolve(false);
    signal.onCancel = () => { speechSynthesis.cancel(); resolve(false); };
    speechSynthesis.speak(u);
  });
}

// ---------- Recorded voices (generated once with scripts/voices.js) ----------
let recordings = null; // { sampleId: ["sample-cbi/01.mp3", ...] }
let currentAudio = null;
let audioCtx = null;
fetch("audio/manifest.json")
  .then((r) => (r.ok ? r.json() : null))
  .then((m) => {
    if (!m || !Object.keys(m).length) return;
    recordings = m;
    $("voice").checked = true;
    $("voicelabel").textContent = "Voices";
    $("voicecredit").textContent = " Voices in the sample calls were generated with ElevenLabs.";
  })
  .catch(() => {});

function playRecording(url, speaker, onDuration) {
  return new Promise((resolve) => {
    const a = new Audio(url);
    currentAudio = a;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      audioCtx.resume?.();
      const src = audioCtx.createMediaElementSource(a);
      if (speaker === "c") {
        // The caller is at the far end of a phone line: keep only 300-3400 Hz, like a real call.
        const hp = audioCtx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 300;
        const lp = audioCtx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 3400;
        src.connect(hp).connect(lp).connect(audioCtx.destination);
      } else src.connect(audioCtx.destination);
    } catch {
      // Without Web Audio the recording still plays, just unfiltered.
    }
    a.onloadedmetadata = () => onDuration(a.duration);
    a.onended = () => resolve(true);
    a.onerror = () => { onDuration(null); resolve(false); };
    a.onpause = () => { if (!a.ended) resolve(false); };
    a.play().catch(() => { onDuration(null); resolve(false); });
  });
}

async function play() {
  stopAll();
  resetCall(`${current.language} sample, playing`);
  const signal = { cancelled: false, onCancel: null };
  playing = { cancel() { signal.cancelled = true; signal.onCancel?.(); } };
  setPlayButton(true);
  // On phones the call panel starts below the fold: bring it into view.
  if (matchMedia("(max-width: 860px)").matches) {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector(".call").scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  }
  const voice = $("voice").checked;
  const recorded = voice && recordings?.[current.id];
  // Warm the browser cache so there is no gap between lines.
  if (recorded) for (const f of recorded) { const a = new Audio(); a.preload = "auto"; a.src = `audio/${f}`; }
  for (const [i, [speaker, text, stage]] of current.lines.entries()) {
    if (signal.cancelled) break;
    const div = addLine(speaker, text);
    const words = text.split(/\s+/);
    let dur = lineSeconds(text) * 1000;
    let speech = null;
    if (recorded) {
      let gotDuration;
      const known = new Promise((r) => { gotDuration = r; });
      speech = playRecording(`audio/${recorded[i]}`, speaker, (d) => gotDuration(d));
      const d = await Promise.race([known, new Promise((r) => setTimeout(() => r(null), 1500))]);
      if (d && Number.isFinite(d)) dur = d * 1000;
    } else if (voice) speech = speak(text, speaker, signal);
    // Reveal the words as they are spoken, like live captions.
    const pace = recorded ? dur * 0.92 : voice ? dur * 0.9 : dur * 0.55;
    for (let w = 1; w <= words.length && !signal.cancelled; w++) {
      div.querySelector(".txt").textContent = words.slice(0, w).join(" ");
      $("lines").scrollTop = $("lines").scrollHeight;
      await sleep(pace / words.length, signal);
    }
    if (speech) await speech;
    if (signal.cancelled) break;
    scoreInto(div, speaker, text, stage);
    elapsed += recorded ? dur / 1000 + 0.3 : lineSeconds(text);
    setTimer(elapsed);
    await sleep(recorded ? 300 : voice ? 250 : 350, signal);
  }
  if (!signal.cancelled) {
    $("callsub").textContent = current.label === "scam" ? "Sample scam call ended" : "Sample genuine call ended";
  }
  playing = null;
  setPlayButton(false);
}

function setPlayButton(isPlaying) {
  $("play").innerHTML = isPlaying
    ? `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg><span>Stop</span>`
    : `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg><span>Play this call</span>`;
}

function stopAll() {
  if (playing) playing.cancel();
  playing = null;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  stopMic();
  setPlayButton(false);
}

$("play").addEventListener("click", () => (playing ? stopAll() : play()));

// ---------- Typed lines ----------
$("compose").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("say").value.trim();
  if (!text) return;
  if (playing) stopAll();
  if (lineCount === 0) $("callsub").textContent = "Your typed call";
  const div = addLine("c", text);
  scoreInto(div, "c", text, null);
  elapsed += lineSeconds(text);
  setTimer(elapsed);
  $("say").value = "";
});

// ---------- Microphone ----------
let rec = null;
function stopMic() {
  if (rec) { rec.onend = null; rec.stop(); rec = null; }
  $("mic").querySelector("span").textContent = "Use microphone";
}
$("mic").addEventListener("click", () => {
  if (rec) { stopMic(); $("micnote").textContent = "Microphone off."; return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    $("micnote").textContent = "This browser has no speech recognition. Try Chrome or Edge, or type the caller's words above.";
    return;
  }
  stopAll();
  resetCall("Listening through your microphone");
  rec = new SR();
  rec.lang = "hi-IN"; // Hindi recognition also returns English words spoken in a Hinglish call.
  rec.continuous = true;
  rec.interimResults = true;
  let interimDiv = null;
  rec.onresult = (ev) => {
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i];
      const text = r[0].transcript.trim();
      if (!text) continue;
      if (!interimDiv) interimDiv = addLine("c", "");
      if (r.isFinal) {
        scoreInto(interimDiv, "c", text, null);
        elapsed += lineSeconds(text);
        setTimer(elapsed);
        interimDiv = null;
      } else interimDiv.querySelector(".txt").textContent = text;
    }
  };
  rec.onerror = (ev) => {
    $("micnote").textContent = ev.error === "not-allowed"
      ? "Microphone access was blocked. Allow it in the address bar, or type the caller's words above."
      : `Speech recognition stopped (${ev.error}). Press Use microphone to start again.`;
    stopMic();
  };
  rec.onend = () => { if (rec) rec.start(); }; // Chrome stops after silence; keep listening.
  rec.start();
  $("mic").querySelector("span").textContent = "Stop microphone";
  $("micnote").textContent = "Put the call on speaker near this device. Speak in Hindi, Hinglish or English.";
});

// ---------- Family message ----------
$("family").addEventListener("click", (e) => {
  e.preventDefault();
  const msg = "I'm getting a call from someone claiming to be police/CBI saying I'm under arrest. Satark says it's a digital-arrest scam. Please call me now.";
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});

// ---------- Results ----------
const pct = (x) => `${Math.round(x * 100)}%`;
const pct1 = (x) => `${(x * 100).toFixed(1)}%`;
const ci = (c, f) => (c ? `${f(c[0])} to ${f(c[1])}` : "");
const secs = (x) => (x === null ? "n/a" : `${x.toFixed(1)} s`);

function results() {
  const h = bench.suites.heldout.systems;
  const n = bench.suites.noisy.systems;
  const hw = bench.suites.handwritten.systems;
  const scams = bench.suites.heldout.systems.satark.scams;
  const genuine = bench.suites.heldout.systems.satark.genuine;
  $("resultsLede").textContent = `Tested on ${scams} scam calls and ${genuine} genuine calls written in wording Satark never saw during training, including genuine calls that mention banks, OTPs and police.`;
  $("findings").innerHTML = `
    <div class="finding"><div class="big">${pct(h.satark.warnedBeforePayment)}</div><p>of scam calls flagged before the caller asked for money, a median of ${Math.round(h.satark.medianLeadSeconds)} seconds early.</p></div>
    <div class="finding"><div class="big">${pct(h.satark.falseAlarmRate)}</div><p>of genuine calls flagged. A keyword filter flagged ${pct(h.keyword.falseAlarmRate)}, because genuine bank and delivery calls use the same words.</p></div>
    <div class="finding"><div class="big">${pct(n.satark.warnedBeforePayment)}</div><p>still flagged early with simulated speech-recognition errors, against ${pct(n.rules_seq.warnedBeforePayment)} for the same rules without the trained classifier.</p></div>`;
  const order = ["satark", "rules_seq", "model_seq", "line_only", "keyword"];
  const table = (suite, caption) => `
    <table><caption>${caption}</caption>
    <thead><tr><th>Approach</th><th>Flagged before money was asked</th><th>Median warning</th><th>Genuine calls flagged</th></tr></thead>
    <tbody>${order.map((k) => {
      const r = suite[k];
      return `<tr class="${k === "satark" ? "ours" : ""}"><td>${r.name}</td>
        <td class="num">${pct1(r.warnedBeforePayment)}<span class="ci">${ci(r.ci.warnedBeforePayment, pct1)}</span></td>
        <td class="num">${secs(r.medianLeadSeconds)}</td>
        <td class="num">${pct1(r.falseAlarmRate)}<span class="ci">${ci(r.ci.falseAlarmRate, pct1)}</span></td></tr>`;
    }).join("")}</tbody></table>`;
  $("tables").innerHTML =
    table(h, "Held-out calls in unseen wording") +
    table(n, "The same calls with simulated speech-recognition errors") +
    table(hw, `Hand-written hard calls: ${hw.satark.scams} scams in new wording and new scam types, ${hw.satark.genuine} genuine calls that sound threatening`);
  $("limits").textContent = `Ranges under each figure are 95% confidence intervals. All test calls are written transcripts, not real recordings, and the hand-written set is small. Satark misses scams that skip the threat, such as some electricity-bill and KYC calls, and it has not yet been tested on real phone audio.`;
}

render(null);
results();
resetCall(`${current.language} sample, press play`);
