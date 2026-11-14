# Satark benchmark

Every call below was held out from training and threshold tuning. Brackets are 95% bootstrap confidence intervals.

## Held-out generated calls (unseen phrasings)

80 scam calls, 80 genuine calls.

| System | Warned before payment | Median warning lead | False alarms on genuine calls |
|---|---|---|---|
| Satark (rules + classifier + script tracking) | 98.8% [96.3%, 100.0%] | 14.1 s [13.2 s, 16.2 s] | 0.0% [0.0%, 0.0%] |
| Rules + script tracking (no classifier) | 95.0% [90.0%, 98.8%] | 11.1 s [8.1 s, 12.8 s] | 0.0% [0.0%, 0.0%] |
| Classifier + script tracking (no rules) | 53.8% [42.5%, 65.0%] | 5.5 s [2.1 s, 10.3 s] | 0.0% [0.0%, 0.0%] |
| Line-by-line classifier (no script tracking) | 91.3% [85.0%, 97.5%] | 20.5 s [19.2 s, 21.8 s] | 12.5% [5.0%, 20.0%] |
| Keyword filter | 86.3% [78.8%, 93.8%] | 19.2 s [17.1 s, 22.6 s] | 62.5% [51.2%, 73.8%] |

## Held-out calls with simulated speech-recognition errors

80 scam calls, 80 genuine calls.

| System | Warned before payment | Median warning lead | False alarms on genuine calls |
|---|---|---|---|
| Satark (rules + classifier + script tracking) | 92.5% [86.3%, 97.5%] | 12.8 s [12.0 s, 14.1 s] | 1.3% [0.0%, 3.8%] |
| Rules + script tracking (no classifier) | 75.0% [65.0%, 83.8%] | 5.9 s [4.6 s, 10.9 s] | 1.3% [0.0%, 3.8%] |
| Classifier + script tracking (no rules) | 50.0% [38.8%, 61.3%] | 9.8 s [4.7 s, 12.8 s] | 0.0% [0.0%, 0.0%] |
| Line-by-line classifier (no script tracking) | 86.3% [78.8%, 93.8%] | 20.1 s [18.8 s, 21.4 s] | 8.8% [3.8%, 16.3%] |
| Keyword filter | 81.3% [72.5%, 88.8%] | 16.7 s [14.1 s, 19.7 s] | 55.0% [43.8%, 66.3%] |

## Hand-written hard calls (new wording, new scam types)

6 scam calls, 6 genuine calls.

| System | Warned before payment | Median warning lead | False alarms on genuine calls |
|---|---|---|---|
| Satark (rules + classifier + script tracking) | 66.7% [33.3%, 100.0%] | 1.1 s [0.0 s, 8.6 s] | 0.0% [0.0%, 0.0%] |
| Rules + script tracking (no classifier) | 66.7% [33.3%, 100.0%] | 1.1 s [0.0 s, 8.6 s] | 0.0% [0.0%, 0.0%] |
| Classifier + script tracking (no rules) | 16.7% [0.0%, 50.0%] | 8.6 s [8.6 s, 8.6 s] | 0.0% [0.0%, 0.0%] |
| Line-by-line classifier (no script tracking) | 50.0% [16.7%, 83.3%] | 13.3 s [0.0 s, 15.4 s] | 16.7% [0.0%, 50.0%] |
| Keyword filter | 33.3% [0.0%, 66.7%] | 11.6 s [9.4 s, 13.7 s] | 50.0% [16.7%, 83.3%] |

