export function parseNairaToKobo(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  const amountKobo = Math.round(amount * 100);
  return Number.isSafeInteger(amountKobo) ? amountKobo : 0;
}
