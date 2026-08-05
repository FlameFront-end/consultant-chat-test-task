const MIN_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 10000;
const MAX_JITTER_MS = 300;

type RandomValue = () => number;

export function getReconnectDelay(
  attempt: number,
  getRandomValue: RandomValue = Math.random,
): number {
  const exponentialDelay = Math.min(
    MIN_BACKOFF_MS * 2 ** attempt,
    MAX_BACKOFF_MS,
  );
  const jitter = getRandomValue() * MAX_JITTER_MS;

  return Math.min(exponentialDelay + jitter, MAX_BACKOFF_MS);
}
