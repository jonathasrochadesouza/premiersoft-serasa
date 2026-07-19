import type { PrismaClient } from "@prisma/client";
import { calculatePricing } from "../domain/pricing.js";
import { normalizePlate, WeightStabilizer, type ScaleReading } from "../domain/stabilizer.js";
import { NotFoundError, UnauthorizedScaleError } from "../domain/errors.js";

export class ScaleReadingService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly stabilizer: WeightStabilizer,
    private readonly clock: () => Date = () => new Date()
  ) {}

  async receive(input: { scaleId: string; plate: string; weightKg: number; token?: string; idempotencyKey?: string }) {
    const idempotencyScope = `scale-reading:${input.scaleId}:${normalizePlate(input.plate)}`;
    if (input.idempotencyKey) {
      const existing = await this.prisma.idempotencyRecord.findUnique({ where: { key: input.idempotencyKey } });
      if (existing && existing.scope === idempotencyScope) {
        return JSON.parse(existing.response);
      }
    }

    const scale = await this.prisma.scale.findUnique({ where: { id: input.scaleId } });
    if (!scale) throw new NotFoundError("Balanca");
    if (scale.token !== input.token) throw new UnauthorizedScaleError();

    const reading: ScaleReading = {
      scaleId: input.scaleId,
      plate: normalizePlate(input.plate),
      weightKg: input.weightKg,
      timestamp: this.clock()
    };
    const result = this.stabilizer.addReading(reading);

    let response;
    if (result.type !== "stable") {
      response = { status: "accepted", stabilization: result.type, readingCount: "readingCount" in result ? result.readingCount : undefined };
    } else {
      const weighing = await this.persistStableWeighing(result);
      response = { status: "stabilized", weighingId: weighing.id, grossWeightKg: weighing.grossWeightKg };
    }

    if (input.idempotencyKey) {
      await this.prisma.idempotencyRecord.upsert({
        where: { key: input.idempotencyKey },
        update: {},
        create: { key: input.idempotencyKey, scope: idempotencyScope, response: JSON.stringify(response) }
      });
    }

    return response;
  }

  private async persistStableWeighing(stable: {
    scaleId: string;
    plate: string;
    grossWeightKg: number;
    presenceKey: string;
  }) {
    const existing = await this.prisma.weighing.findUnique({ where: { presenceKey: stable.presenceKey } });
    if (existing) return existing;

    const truck = await this.prisma.truck.findUnique({ where: { plate: stable.plate } });
    if (!truck) throw new NotFoundError("Caminhao");

    const transaction = await this.prisma.transportTransaction.findFirst({
      where: { truckId: truck.id, finishedAt: null },
      include: { grainType: true },
      orderBy: { startedAt: "desc" }
    });
    if (!transaction) throw new NotFoundError("Transacao de transporte ativa");

    const netWeightKg = Math.max(0, stable.grossWeightKg - truck.tareKg);
    const pricing = calculatePricing({
      netWeightKg,
      purchasePricePerTon: transaction.grainType.purchasePricePerTon,
      dockStockKg: transaction.grainType.dockStockKg
    });

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.weighing.create({
        data: {
          plate: stable.plate,
          grossWeightKg: stable.grossWeightKg,
          tareKg: truck.tareKg,
          netWeightKg,
          purchaseCost: pricing.purchaseCost,
          salePricePerTon: pricing.salePricePerTon,
          appliedMarginPercent: pricing.appliedMarginPercent,
          scaleId: stable.scaleId,
          truckId: truck.id,
          grainTypeId: transaction.grainTypeId,
          transactionId: transaction.id,
          presenceKey: stable.presenceKey
        }
      });

      await tx.grainType.update({
        where: { id: transaction.grainTypeId },
        data: { dockStockKg: { increment: netWeightKg } }
      });

      return created;
    });
  }
}
