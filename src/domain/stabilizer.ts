import type { StabilizationConfig } from "../config.js";

export type ScaleReading = {
  scaleId: string;
  plate: string;
  weightKg: number;
  timestamp: Date;
};

export type StableWeightDetected = {
  type: "stable";
  scaleId: string;
  plate: string;
  grossWeightKg: number;
  presenceKey: string;
  readingCount: number;
  windowStartedAt: Date;
  windowEndedAt: Date;
};

export type StabilizationResult =
  | StableWeightDetected
  | { type: "collecting"; readingCount: number }
  | { type: "already_processed" };

type PresenceState = {
  readings: ScaleReading[];
  processed: boolean;
  lastSeenAt: Date;
  sequenceStartedAt: Date;
};

export class WeightStabilizer {
  private readonly states = new Map<string, PresenceState>();

  constructor(private readonly config: StabilizationConfig) {}

  addReading(reading: ScaleReading): StabilizationResult {
    const key = this.keyFor(reading.scaleId, reading.plate);
    const state = this.getState(key, reading);

    if (reading.timestamp.getTime() - state.lastSeenAt.getTime() > this.config.presenceExpirationMs) {
      state.readings = [];
      state.processed = false;
      state.sequenceStartedAt = reading.timestamp;
    }

    state.lastSeenAt = reading.timestamp;
    state.readings.push(reading);
    state.readings = state.readings.filter(
      (item) => reading.timestamp.getTime() - item.timestamp.getTime() <= this.config.windowMs
    );

    if (state.processed) {
      return { type: "already_processed" };
    }

    if (state.readings.length < this.config.minReadings) {
      return { type: "collecting", readingCount: state.readings.length };
    }

    const first = state.readings[0];
    const last = state.readings[state.readings.length - 1];
    const representedWindowMs = last.timestamp.getTime() - first.timestamp.getTime();
    if (representedWindowMs < this.config.windowMs * 0.8) {
      return { type: "collecting", readingCount: state.readings.length };
    }

    const weights = state.readings.map((item) => item.weightKg);
    if (Math.max(...weights) - Math.min(...weights) > this.config.toleranceKg) {
      return { type: "collecting", readingCount: state.readings.length };
    }

    state.processed = true;
    return {
      type: "stable",
      scaleId: reading.scaleId,
      plate: reading.plate,
      grossWeightKg: trimmedMean(weights),
      presenceKey: `${key}:${state.sequenceStartedAt.toISOString()}`,
      readingCount: state.readings.length,
      windowStartedAt: first.timestamp,
      windowEndedAt: last.timestamp
    };
  }

  private getState(key: string, reading: ScaleReading): PresenceState {
    const current = this.states.get(key);
    if (current) return current;
    const created = {
      readings: [],
      processed: false,
      lastSeenAt: reading.timestamp,
      sequenceStartedAt: reading.timestamp
    };
    this.states.set(key, created);
    return created;
  }

  private keyFor(scaleId: string, plate: string): string {
    return `${scaleId}:${normalizePlate(plate)}`;
  }
}

export const normalizePlate = (plate: string): string => plate.trim().toUpperCase();

export const trimmedMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const trimSize = Math.floor(sorted.length * 0.1);
  const trimmed = sorted.slice(trimSize, sorted.length - trimSize || sorted.length);
  const source = trimmed.length > 0 ? trimmed : sorted;
  return roundToTwo(source.reduce((sum, value) => sum + value, 0) / source.length);
};

export const roundToTwo = (value: number): number => Math.round(value * 100) / 100;
