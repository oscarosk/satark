// Generates realistic voices for the demo calls with ElevenLabs.
// Run it once on your own computer; the MP3s are committed to the repo and
// the live site plays them. Your API key never leaves your machine.
//
// 1. Create a file called .env in the project folder (it is git-ignored):
//
//      ELEVENLABS_API_KEY=your-key
//      MALE1_VOICE_ID=...     the scam caller (a stern man)
//      FEMALE1_VOICE_ID=...   the woman receiving the call
//      MALE2_VOICE_ID=...     optional: a second man (customs victim, delivery agent)
//      FEMALE2_VOICE_ID=...   optional: the bank agent
//
// 2. node scripts/voices.js --list           show the voices in your account
//    node scripts/voices.js                  generate every missing line
//    node scripts/voices.js --only sample-cbi        just one call
//    node scripts/voices.js --only sample-cbi/03 --force   redo one line
//
// Output: web/audio/<sample>/<NN>.mp3 and web/audio/manifest.json

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { SAMPLES } from "../data/handwritten.js";

const root = new URL("../", import.meta.url);
const API = process.env.ELEVENLABS_API_BASE || "https://api.elevenlabs.io/v1";
const MODEL = "eleven_multilingual_v2"; // handles Hindi, Hinglish and English

function loadEnv() {
  const file = new URL(".env", root);
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

function fail(msg) {
  console.error(`\n${msg}\n`);
  process.exit(1);
}

loadEnv();
const key = process.env.ELEVENLABS_API_KEY;
if (!key) fail("ELEVENLABS_API_KEY is missing. Add it to a .env file in the project folder (see the top of this script).");

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

if (flag("--list")) {
  const res = await fetch(`${API}/voices`, { headers: { "xi-api-key": key } });
  if (!res.ok) fail(`Could not list voices (${res.status}): ${await res.text()}`);
  const { voices } = await res.json();
  for (const v of voices) {
    const l = v.labels || {};
    console.log(`${v.voice_id}  ${v.name}  ${[l.gender, l.accent, l.age, l.description].filter(Boolean).join(", ")}`);
  }
  process.exit(0);
}

// Each role falls back to a similar voice, so two voice IDs are enough to start.
const ROLE_ENV = {
  male1: ["MALE1_VOICE_ID"],
  male2: ["MALE2_VOICE_ID", "MALE1_VOICE_ID"],
  female1: ["FEMALE1_VOICE_ID"],
  female2: ["FEMALE2_VOICE_ID", "FEMALE1_VOICE_ID"],
};
const voiceFor = (role) => {
  for (const name of ROLE_ENV[role]) if (process.env[name]) return process.env[name];
  fail(`No voice for "${role}". Set ${ROLE_ENV[role][0]} in .env (run with --list to see voice IDs).`);
};

// The scam caller sounds steadier and more forceful; everyone else stays natural.
const SETTINGS = {
  male1: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
  default: { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
};

async function speak(text, role, file) {
  const res = await fetch(`${API}/text-to-speech/${voiceFor(role)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: SETTINGS[role] || SETTINGS.default }),
  });
  if (!res.ok) fail(`ElevenLabs refused "${text.slice(0, 40)}..." (${res.status}): ${await res.text()}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

let made = 0;
let skipped = 0;
let chars = 0;
for (const sample of SAMPLES) {
  if (only && !only.startsWith(sample.id)) continue;
  const dir = new URL(`web/audio/${sample.id}/`, root);
  mkdirSync(dir, { recursive: true });
  for (const [i, [speaker, text]] of sample.lines.entries()) {
    const name = String(i + 1).padStart(2, "0");
    if (only && only.includes("/") && only !== `${sample.id}/${name}`) continue;
    const file = new URL(`${name}.mp3`, dir);
    if (existsSync(file) && !flag("--force")) { skipped++; continue; }
    process.stdout.write(`${sample.id}/${name}.mp3  ${text.slice(0, 50)}\n`);
    await speak(text, sample.voices[speaker], file);
    made++;
    chars += text.length;
  }
}

// The manifest tells the app which lines have recordings.
const manifest = {};
for (const sample of SAMPLES) {
  const files = sample.lines.map((_, i) => `${sample.id}/${String(i + 1).padStart(2, "0")}.mp3`);
  if (files.every((f) => existsSync(new URL(`web/audio/${f}`, root)))) manifest[sample.id] = files;
}
mkdirSync(new URL("web/audio/", root), { recursive: true });
writeFileSync(new URL("web/audio/manifest.json", root), JSON.stringify(manifest, null, 2) + "\n");

console.log(`\nGenerated ${made} lines (${chars} characters), kept ${skipped} existing.`);
console.log(`Calls with complete voices: ${Object.keys(manifest).join(", ") || "none yet"}`);
console.log("Listen to them in web/audio, redo any line with --only <call>/<NN> --force, then rebuild and push.");
