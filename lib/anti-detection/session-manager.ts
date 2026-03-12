/**
 * Session Manager
 * Controls automation session timing to appear natural.
 * Handles session start/end, breaks, and working hours.
 */

import { randomDelay, SESSION_LIMITS } from "./human-simulator";

export interface SessionConfig {
  workingHours: { start: number; end: number }; // 0-23
  activeDays: number[]; // 0=Sun, 6=Sat
  timezone: string;
}

const DEFAULT_CONFIG: SessionConfig = {
  workingHours: { start: 9, end: 17 },
  activeDays: [1, 2, 3, 4, 5], // Mon-Fri
  timezone: "America/New_York",
};

/**
 * Check if current time is within working hours
 */
export function isWithinWorkingHours(config: SessionConfig = DEFAULT_CONFIG): boolean {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  if (!config.activeDays.includes(day)) return false;
  if (hour < config.workingHours.start || hour >= config.workingHours.end) return false;

  return true;
}

/**
 * Calculate time until next working window opens
 */
export function getTimeUntilNextWindow(config: SessionConfig = DEFAULT_CONFIG): number {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  // Check today
  if (config.activeDays.includes(currentDay) && currentHour < config.workingHours.start) {
    const target = new Date(now);
    target.setHours(config.workingHours.start, 0, 0, 0);
    return target.getTime() - now.getTime();
  }

  // Find next active day
  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (currentDay + offset) % 7;
    if (config.activeDays.includes(nextDay)) {
      const target = new Date(now);
      target.setDate(target.getDate() + offset);
      target.setHours(config.workingHours.start, 0, 0, 0);
      return target.getTime() - now.getTime();
    }
  }

  return 24 * 60 * 60 * 1000; // Default: 24 hours
}

/**
 * Generate a random session duration within natural limits
 */
export function getSessionDuration(): number {
  const min = SESSION_LIMITS.minDuration;
  const max = SESSION_LIMITS.maxDuration;
  return min + Math.random() * (max - min);
}

/**
 * Generate a break duration between sessions
 */
export function getBreakDuration(): number {
  const min = SESSION_LIMITS.breakMin;
  const max = SESSION_LIMITS.breakMax;
  return min + Math.random() * (max - min);
}

/**
 * Simulate a natural session break — insert idle browsing time
 */
export async function takeSessionBreak(): Promise<void> {
  const breakTime = 5 * 60 * 1000 + Math.random() * 10 * 60 * 1000; // 5-15 min
  await randomDelay(breakTime * 0.9, breakTime * 1.1);
}

/**
 * Session state tracker
 */
export class SessionTracker {
  private startTime: number = 0;
  private actionCount: number = 0;
  private maxDuration: number = 0;
  private isActive: boolean = false;

  start(): void {
    this.startTime = Date.now();
    this.actionCount = 0;
    this.maxDuration = getSessionDuration();
    this.isActive = true;
  }

  recordAction(): void {
    this.actionCount++;
  }

  shouldTakeBreak(): boolean {
    if (!this.isActive) return false;

    const elapsed = Date.now() - this.startTime;
    // Take a break every 20-40 minutes or every 10-20 actions
    const timeTrigger = elapsed > (20 + Math.random() * 20) * 60 * 1000;
    const actionTrigger = this.actionCount > 0 && this.actionCount % (10 + Math.floor(Math.random() * 10)) === 0;

    return timeTrigger || actionTrigger;
  }

  shouldEndSession(): boolean {
    if (!this.isActive) return true;
    const elapsed = Date.now() - this.startTime;
    return elapsed >= this.maxDuration;
  }

  end(): void {
    this.isActive = false;
  }

  getElapsed(): number {
    return Date.now() - this.startTime;
  }

  getActionCount(): number {
    return this.actionCount;
  }
}
