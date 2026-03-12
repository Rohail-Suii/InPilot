import { describe, it, expect, vi } from 'vitest';
import {
  getKeystrokeDelay,
  getEffectiveLimit,
  DAILY_LIMITS,
  COOLDOWN_PERIODS,
  SPEED_PRESETS,
  SESSION_LIMITS,
} from '@/lib/anti-detection/human-simulator';

describe('Human Simulator - getKeystrokeDelay', () => {
  it('should return a number', () => {
    const delay = getKeystrokeDelay();
    expect(typeof delay).toBe('number');
  });

  it('should return an integer (rounded)', () => {
    const delay = getKeystrokeDelay();
    expect(Number.isInteger(delay)).toBe(true);
  });

  it('should mostly return values in a reasonable range', () => {
    const delays: number[] = [];
    for (let i = 0; i < 100; i++) {
      delays.push(getKeystrokeDelay());
    }
    const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
    // Mean should be around 120ms (within reasonable bounds)
    expect(avg).toBeGreaterThan(60);
    expect(avg).toBeLessThan(200);
  });

  it('should produce varying delays (not constant)', () => {
    const delays = new Set<number>();
    for (let i = 0; i < 50; i++) {
      delays.add(getKeystrokeDelay());
    }
    // Should have multiple distinct values
    expect(delays.size).toBeGreaterThan(5);
  });
});

describe('Human Simulator - randomDelay', () => {
  it('should resolve without error', async () => {
    // We use a very short delay for testing
    const { randomDelay } = await import('@/lib/anti-detection/human-simulator');
    // Mock setTimeout to resolve immediately
    vi.useFakeTimers();
    const promise = randomDelay(1, 5);
    vi.runAllTimers();
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

describe('Human Simulator - readingPause', () => {
  it('should resolve without error for small content', async () => {
    const { readingPause } = await import('@/lib/anti-detection/human-simulator');
    vi.useFakeTimers();
    const promise = readingPause(50);
    vi.runAllTimers();
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('should resolve without error for large content', async () => {
    const { readingPause } = await import('@/lib/anti-detection/human-simulator');
    vi.useFakeTimers();
    const promise = readingPause(10000);
    vi.runAllTimers();
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

describe('Human Simulator - getEffectiveLimit', () => {
  it('should return the base limit for balanced speed', () => {
    const limit = getEffectiveLimit('applies', 'balanced');
    expect(limit).toBe(DAILY_LIMITS.applies); // balanced = 1.0x
  });

  it('should return a lower limit for conservative speed', () => {
    const limit = getEffectiveLimit('applies', 'conservative');
    expect(limit).toBe(Math.floor(DAILY_LIMITS.applies * 0.5));
    expect(limit).toBeLessThan(DAILY_LIMITS.applies);
  });

  it('should return a higher limit for aggressive speed', () => {
    const limit = getEffectiveLimit('applies', 'aggressive');
    expect(limit).toBe(Math.floor(DAILY_LIMITS.applies * 1.5));
    expect(limit).toBeGreaterThan(DAILY_LIMITS.applies);
  });

  it('should default to balanced when no speed is provided', () => {
    const limit = getEffectiveLimit('applies');
    expect(limit).toBe(DAILY_LIMITS.applies);
  });

  it('should work for all action types', () => {
    const actionTypes = Object.keys(DAILY_LIMITS) as (keyof typeof DAILY_LIMITS)[];
    for (const actionType of actionTypes) {
      const limit = getEffectiveLimit(actionType, 'balanced');
      expect(limit).toBe(DAILY_LIMITS[actionType]);
      expect(limit).toBeGreaterThan(0);
    }
  });
});

describe('Human Simulator - Constants', () => {
  it('DAILY_LIMITS should have all expected action types', () => {
    expect(DAILY_LIMITS).toHaveProperty('applies');
    expect(DAILY_LIMITS).toHaveProperty('posts');
    expect(DAILY_LIMITS).toHaveProperty('profileViews');
    expect(DAILY_LIMITS).toHaveProperty('connectionRequests');
    expect(DAILY_LIMITS).toHaveProperty('comments');
    expect(DAILY_LIMITS).toHaveProperty('messages');
    expect(DAILY_LIMITS).toHaveProperty('scrapes');
  });

  it('DAILY_LIMITS should have positive values', () => {
    for (const value of Object.values(DAILY_LIMITS)) {
      expect(value).toBeGreaterThan(0);
    }
  });

  it('COOLDOWN_PERIODS should have min < max for all actions', () => {
    for (const [, period] of Object.entries(COOLDOWN_PERIODS)) {
      expect(period.min).toBeLessThan(period.max);
      expect(period.min).toBeGreaterThan(0);
    }
  });

  it('SPEED_PRESETS should have conservative < balanced < aggressive', () => {
    expect(SPEED_PRESETS.conservative).toBeLessThan(SPEED_PRESETS.balanced);
    expect(SPEED_PRESETS.balanced).toBeLessThan(SPEED_PRESETS.aggressive);
  });

  it('SESSION_LIMITS should have reasonable values', () => {
    expect(SESSION_LIMITS.minDuration).toBeGreaterThan(0);
    expect(SESSION_LIMITS.maxDuration).toBeGreaterThan(SESSION_LIMITS.minDuration);
    expect(SESSION_LIMITS.breakMin).toBeGreaterThan(0);
    expect(SESSION_LIMITS.breakMax).toBeGreaterThan(SESSION_LIMITS.breakMin);
  });
});
