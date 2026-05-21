// 1200 bps = 12% platform fee applied on top of the host's listed rate.
// Host keeps their full listed rate; the guest pays rate + fee.
export const PLATFORM_FEE_BPS = 1200;

export function calculateFeeSplit(hostRateCents: number) {
  const platformFeeCents = Math.round((hostRateCents * PLATFORM_FEE_BPS) / 10000);
  const grossCents = hostRateCents + platformFeeCents;
  return {
    hostNetCents: hostRateCents,
    platformFeeCents,
    grossCents,
  };
}
