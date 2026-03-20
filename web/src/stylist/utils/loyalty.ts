import type { LoyaltyTier } from "../types";

export function getTier(points: number): LoyaltyTier {
  if (points >= 800) return { name: "Diamond", color: "#b8d4e3", icon: "💎", next: null, needed: 0 };
  if (points >= 400) return { name: "Gold", color: "#d4a853", icon: "🥇", next: "Diamond", needed: 800 - points };
  if (points >= 150) return { name: "Silver", color: "#a8a8b0", icon: "🥈", next: "Gold", needed: 400 - points };
  return { name: "Bronze", color: "#cd7f5b", icon: "🥉", next: "Silver", needed: 150 - points };
}

const THRESHOLDS = [0, 150, 400, 800];

export function getTierProgress(points: number): number {
  const tier = getTier(points);
  if (!tier.next) return 100;
  const currentThreshold = THRESHOLDS.filter(t => points >= t).pop()!;
  const nextThreshold = points + tier.needed;
  return ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
}
