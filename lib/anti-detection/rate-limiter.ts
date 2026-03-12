/**
 * Anti-Detection Rate Limiter Service
 * Tracks daily usage and enforces limits to keep automation safe.
 */

import connectDB from "@/lib/db/connection";
import { DailyUsage } from "@/lib/db/models";
import { DAILY_LIMITS, SPEED_PRESETS, type SpeedPreset } from "./human-simulator";

type ActionType = keyof typeof DAILY_LIMITS;

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check if an action can be performed without exceeding daily limits
 */
export async function canPerformAction(
  userId: string,
  actionType: ActionType,
  speed: SpeedPreset = "balanced"
): Promise<{ allowed: boolean; current: number; limit: number }> {
  await connectDB();
  const today = getTodayKey();

  const usage = await DailyUsage.findOne({ userId, date: today }).lean();
  const current = usage?.actions?.[actionType] ?? 0;
  const limit = Math.floor(DAILY_LIMITS[actionType] * SPEED_PRESETS[speed]);

  return { allowed: current < limit, current, limit };
}

/**
 * Increment usage counter for an action type
 */
export async function incrementUsage(
  userId: string,
  actionType: ActionType
): Promise<void> {
  await connectDB();
  const today = getTodayKey();

  await DailyUsage.findOneAndUpdate(
    { userId, date: today },
    { $inc: { [`actions.${actionType}`]: 1 } },
    { upsert: true }
  );
}

/**
 * Get all usage for today
 */
export async function getTodayUsage(
  userId: string
): Promise<Record<string, number>> {
  await connectDB();
  const today = getTodayKey();
  const usage = await DailyUsage.findOne({ userId, date: today }).lean();
  return usage?.actions ?? {
    applies: 0,
    posts: 0,
    scrapes: 0,
    profileViews: 0,
    messages: 0,
  };
}

/**
 * Get usage summary with limits for display
 */
export async function getUsageSummary(
  userId: string,
  speed: SpeedPreset = "balanced"
): Promise<{ actionType: string; current: number; limit: number; percentage: number }[]> {
  const usage = await getTodayUsage(userId);

  return (Object.keys(DAILY_LIMITS) as ActionType[]).map((actionType) => {
    const current = usage[actionType] ?? 0;
    const limit = Math.floor(DAILY_LIMITS[actionType] * SPEED_PRESETS[speed]);
    return {
      actionType,
      current,
      limit,
      percentage: limit > 0 ? Math.round((current / limit) * 100) : 0,
    };
  });
}

/**
 * Check if a user is approaching their daily limits (80%+)
 */
export async function isApproachingLimits(
  userId: string,
  speed: SpeedPreset = "balanced"
): Promise<{ approaching: boolean; warnings: string[] }> {
  const summary = await getUsageSummary(userId, speed);
  const warnings: string[] = [];

  for (const item of summary) {
    if (item.percentage >= 90) {
      warnings.push(`${item.actionType}: ${item.current}/${item.limit} (${item.percentage}%) — near limit!`);
    } else if (item.percentage >= 80) {
      warnings.push(`${item.actionType}: ${item.current}/${item.limit} (${item.percentage}%) — approaching limit`);
    }
  }

  return { approaching: warnings.length > 0, warnings };
}
