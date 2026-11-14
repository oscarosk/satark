// Estimated speaking time, so the benchmark can measure warnings in seconds.
// About 2.3 words per second plus a short pause between turns.
export function lineSeconds(text) {
  const words = String(text).trim().split(/\s+/).length;
  return 0.8 + words / 2.3;
}

export function timeline(lines) {
  let t = 0;
  return lines.map((l) => {
    const start = t;
    t += lineSeconds(l[1]);
    return { start, end: t };
  });
}
