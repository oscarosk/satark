# Satark

**Catches a digital-arrest scam call before the money is asked for.**

Satark follows a phone call line by line in Hindi, Hinglish or English, recognises the script that fake CBI, police and customs officers use, and tells you to hang up, a median of 14 seconds before the caller asks for money. Detection runs entirely on your device.

**[Open the live demo](LIVE_DEMO_URL)** · No sign-up, no API key. Press *Play this call*, or type what a caller says.

*Satark* (सतर्क) is Hindi for alert. It is an INNOVEX 2026 entry for **PS05, AI-Powered Cybersecurity**.

## Results

On 80 held-out scam calls and 80 genuine calls in wording Satark never saw during training:

- **98.8%** of scams were flagged before the caller asked for money, with a median warning of **14.1 seconds**.
- **0%** of genuine calls were flagged, including bank fraud alerts, delivery agents asking for an OTP and police passport checks. A keyword filter flagged **62.5%** of them.
- With simulated speech-recognition errors, Satark still flagged **92.5%** early. The same rules without the trained classifier managed **75.0%**.

| Approach | Flagged before money was asked | Median warning | Genuine calls flagged |
|---|---|---|---|
| **Satark** (rules + classifier + script tracking) | **98.8%** [96.3, 100.0] | **14.1 s** | **0.0%** [0.0, 0.0] |
| Rules + script tracking (no classifier) | 95.0% [90.0, 98.8] | 11.1 s | 0.0% [0.0, 0.0] |
| Classifier + script tracking (no rules) | 53.8% [42.5, 65.0] | 5.5 s | 0.0% [0.0, 0.0] |
| Line-by-line classifier (no script tracking) | 91.3% [85.0, 97.5] | 20.5 s | 12.5% [5.0, 20.0] |
| Keyword filter | 86.3% [78.8, 93.8] | 19.2 s | 62.5% [51.2, 73.8] |

Brackets are 95% bootstrap confidence intervals. Two findings matter most:

1. **Following the script is what stops false alarms.** Judging each line on its own flags 12.5% of genuine calls, and keywords flag 62.5%. Genuine bank and delivery calls use the same words as scammers; they just never threaten you first.
2. **The trained classifier is what survives messy speech.** Pattern rules break when a word is misheard or spelled differently. Character-level patterns don't, which lifts early warnings from 75.0% to 92.5% on noisy transcripts.

The full tables, including noisy and hand-written suites, are in [results/benchmark.md](results/benchmark.md).

## Why this matters

In a written reply in the Rajya Sabha in March 2025, the Ministry of Home Affairs said Indians lost **₹1,935.51 crore** to digital-arrest scams in 2024, across about **1.23 lakh** complaints on the National Cyber Crime Reporting Portal ([report](https://inc42.com/buzz/indians-lost-inr-1935-cr-to-digital-arrest-scams-in-2024-govt)).

Victims are not careless. The script is designed to overwhelm: an official-sounding caller, a terrifying accusation, orders to stay on video and tell no one, then a "verification" transfer. Spam-call apps judge the *number*, which scammers change daily. Satark judges the *conversation*, which follows the same script every time.

## How it works

Every line of the call passes through three steps.

1. **Read the line.** Pattern rules written for Hindi (Devanagari), Hinglish and English spot phrases like "arrest warrant", "मत बताना" or "safe account". A Naive Bayes classifier over character n-grams scores the same line, so "aapke", "apke" and a misheard "apke aadhar" all count. A line that tells a story about someone else ("they told him he'd be arrested") is discounted.
2. **Follow the script.** Satark tracks which of four stages the call has reached (authority, fear, isolation, payment) and in what order. One stage alone never triggers an alert, so a delivery agent asking for an OTP stays safe. Phrases genuine callers use, like "the bank will never ask for your OTP", lower the risk for the rest of the call.
3. **Warn early.** When the call's risk crosses a tuned threshold, usually as soon as authority and fear line up, Satark shows *Hang up now* with the 1930 helpline, the cybercrime.gov.in portal and a one-tap message to a family member.

Nothing you hear is sent to an AI server. In microphone mode the browser's own speech recognition turns audio into text (in Chrome this may use Google's servers); the detection itself always runs locally.

## How it was tested

- **Data.** Calls are generated from phrase banks written from public descriptions of digital-arrest scams. Every bank is split into training and test phrasings that never overlap, so test calls use wording the model has not seen. Genuine calls include deliberate hard cases: a bank fraud alert, a delivery OTP, a police passport check, and a friend describing a scam they heard about.
- **Tuning on unfamiliar wording.** The alert threshold and the classifier's weight are chosen on validation calls the tuning classifier was never fitted on, half of them with simulated recognition errors. Test calls are never used for tuning.
- **Three test suites.** Held-out generated calls; the same calls with simulated speech-recognition errors (Hinglish spelling drift plus dropped, doubled and swapped letters); and 12 hand-written calls in new wording, including scam types the generator never produces and genuine calls that sound threatening.
- **Reproducible.** Everything is seeded. `npm run all` regenerates the data, retrains, reruns the benchmark and rebuilds the site with identical numbers, and a test checks the published figures against a fresh run.

## Limits

- **All test calls are written transcripts**, not real recordings. Satark has not yet been tested on real phone audio or real scam calls.
- **The rules and the test phrasings were written by the same author**, which can flatter the rule-based parts. The hand-written suite and the noisy suite are there to check this. Some design choices (mixing languages across splits, damping the classifier on very short lines, adding everyday speech as training examples) were made after seeing early held-out results; the final weights and thresholds were then chosen on validation calls only.
- **The hand-written suite is small** (6 scams, 6 genuine). Satark caught 4 of the 6 scams early. It missed an electricity-disconnection call and a KYC-expiry call, which skip the authority-and-threat opening that digital-arrest scams rely on.
- **Microphone mode needs Chrome or Edge**, and it hears one mixed stream, so it can't tell caller from callee.

## Run it locally

Needs Node.js 20 or later.

```bash
npm install
npm run all        # generate data, train, benchmark, build the site, run tests
npx serve dist     # open the printed URL
```

Or one step at a time: `npm run generate`, `npm run train`, `npm run bench`, `npm run build`, `npm test`. `dist/satark-standalone.html` is a single file that works offline.

## Repository map

| Path | What it holds |
|---|---|
| `src/engine.js` | Line scoring and the call-level script tracker |
| `src/rules.js` | Stage patterns in Hindi, Hinglish and English |
| `src/classifier.js` | Character n-gram Naive Bayes, trained in Node, run in the browser |
| `src/evaluate.js` | Metrics, baselines, bootstrap intervals, threshold tuning |
| `src/noise.js` | Simulated speech-recognition errors |
| `data/phrases.js` | Phrase banks with disjoint training and test phrasings |
| `data/handwritten.js` | Hand-written hard calls and the demo calls |
| `scripts/` | Data generation, training, benchmark and site build |
| `results/` | Published thresholds and benchmark results |
| `web/` | The demo app |
| `tests/` | Engine, data-separation and reproducibility tests |

## Help for victims

- **Call 1930**, the National Cyber Crime Helpline, straight away if money was sent.
- **Report** at [cybercrime.gov.in](https://cybercrime.gov.in).
- **Report the number** on Chakshu at [sancharsaathi.gov.in](https://sancharsaathi.gov.in), even if you paid nothing.

## Licence

MIT. Sample calls are fictional; names and numbers in them are made up.
