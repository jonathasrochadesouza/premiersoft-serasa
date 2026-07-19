export type AppConfig = {
  port: number;
  stabilization: StabilizationConfig;
};

export type StabilizationConfig = {
  windowMs: number;
  minReadings: number;
  toleranceKg: number;
  presenceExpirationMs: number;
};

const numberFromEnv = (name: string, fallback: number): number => {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config: AppConfig = {
  port: numberFromEnv("PORT", 3333),
  stabilization: {
    windowMs: numberFromEnv("STABILIZATION_WINDOW_MS", 3000),
    minReadings: numberFromEnv("STABILIZATION_MIN_READINGS", 20),
    toleranceKg: numberFromEnv("STABILIZATION_TOLERANCE_KG", 30),
    presenceExpirationMs: numberFromEnv("PRESENCE_EXPIRATION_MS", 10000)
  }
};
