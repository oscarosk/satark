# Unstop submission fields

Copy these into the INNOVEX 2026 submission form. Replace LIVE_DEMO_URL and the GitHub link with your own.

## Problem statement

PS 05: AI-Powered Cybersecurity

## Project title

Satark: catches a digital-arrest scam call before the money is asked for

## Description

Problem statement: PS 05, AI-Powered Cybersecurity (fraud detection).

Indians lost ₹1,935 crore to "digital arrest" scams in 2024 (Ministry of Home Affairs, Rajya Sabha reply, March 2025). Fake CBI, police and customs callers all follow one script: claim authority, threaten arrest, cut the victim off from family, then demand a "verification" transfer. Spam-call apps judge the phone number, which scammers change daily. Satark judges the conversation.

Satark follows a call line by line in Hindi, Hinglish or English and tracks which stage of the scam script it has reached. It combines pattern rules with a trained character-level classifier that copes with misspellings and speech-recognition errors. When authority and fear line up, it tells the user to hang up and shows the 1930 helpline, the cybercrime.gov.in portal and a one-tap message to family. Everything runs on the user's device; nothing they hear is sent to an AI server.

Results on 160 held-out calls in wording the model never saw: 98.8% of scams flagged before the caller asked for money, a median of 14 seconds early, with 0% of genuine calls flagged (a keyword filter flagged 62.5%). With simulated speech-recognition errors it still flags 92.5% early. All results are reproducible with one command, with confidence intervals and an honest limits section in the README.

Try it: open the live demo, press "Play this call", or type what a caller says.

## Technologies used

JavaScript (ES modules), Node.js, Naive Bayes text classifier over character n-grams (trained from scratch), rule-based stage detection for Hindi/Hinglish/English, call-level script tracking, Web Speech API (speech recognition and synthesis), esbuild, Node test runner, Vercel

## GitHub repository URL

https://github.com/YOUR-USERNAME/satark

## Live demo link

LIVE_DEMO_URL
