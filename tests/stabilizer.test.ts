import { describe, expect, it } from "vitest";
import { WeightStabilizer } from "../src/domain/stabilizer.js";

const config = {
  windowMs: 3000,
  minReadings: 20,
  toleranceKg: 30,
  presenceExpirationMs: 10000
};

describe("WeightStabilizer", () => {
  it("detecta peso estabilizado com janela suficiente e variacao dentro da tolerancia", () => {
    const stabilizer = new WeightStabilizer(config);
    const start = new Date("2026-01-01T10:00:00.000Z");
    let result;

    for (let index = 0; index < 31; index += 1) {
      const current = stabilizer.addReading({
        scaleId: "scale-1",
        plate: "ABC1D23",
        weightKg: 30100 + (index % 3),
        timestamp: new Date(start.getTime() + index * 100)
      });
      if (current.type === "stable") result = current;
    }

    expect(result).toMatchObject({
      type: "stable",
      scaleId: "scale-1",
      plate: "ABC1D23",
      grossWeightKg: 30100.95
    });
  });

  it("nao estabiliza quando ha outlier fora da tolerancia", () => {
    const stabilizer = new WeightStabilizer(config);
    const start = new Date("2026-01-01T10:00:00.000Z");
    let result;

    for (let index = 0; index < 31; index += 1) {
      result = stabilizer.addReading({
        scaleId: "scale-1",
        plate: "ABC1D23",
        weightKg: index === 20 ? 30380 : 30100,
        timestamp: new Date(start.getTime() + index * 100)
      });
    }

    expect(result).toMatchObject({ type: "collecting" });
  });

  it("evita multiplas pesagens para a mesma presenca", () => {
    const stabilizer = new WeightStabilizer(config);
    const start = new Date("2026-01-01T10:00:00.000Z");

    for (let index = 0; index < 31; index += 1) {
      stabilizer.addReading({
        scaleId: "scale-1",
        plate: "ABC1D23",
        weightKg: 30100,
        timestamp: new Date(start.getTime() + index * 100)
      });
    }

    const repeated = stabilizer.addReading({
      scaleId: "scale-1",
      plate: "ABC1D23",
      weightKg: 30101,
      timestamp: new Date(start.getTime() + 3200)
    });

    expect(repeated).toEqual({ type: "already_processed" });
  });
});
