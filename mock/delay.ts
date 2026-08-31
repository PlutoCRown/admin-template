export function randomDelay(min = 120, max = 480) {
  const span = Math.max(0, max - min);
  const ms = min + Math.random() * span;
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
