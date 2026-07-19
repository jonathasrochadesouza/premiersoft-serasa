import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import type { PrismaClient } from "@prisma/client";
import { config, type AppConfig } from "../config.js";
import { AppError } from "../domain/errors.js";
import { WeightStabilizer } from "../domain/stabilizer.js";
import { ScaleReadingService } from "../services/scale-reading-service.js";
import {
  createBranchSchema,
  createGrainTypeSchema,
  createScaleSchema,
  createTransactionSchema,
  createTruckSchema,
  scaleReadingSchema
} from "./schemas.js";

export async function buildApp(prisma: PrismaClient, appConfig: AppConfig = config, clock?: () => Date): Promise<FastifyInstance> {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });
  const readingService = new ScaleReadingService(prisma, new WeightStabilizer(appConfig.stabilization), clock);

  await app.register(cors);
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Premiersoft Serasa Scale API",
        version: "1.0.0",
        description: "API para cadastros, transacoes, pesagens estabilizadas e relatorios."
      }
    }
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: "VALIDATION_ERROR", details: error.flatten() });
    }
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.code, message: error.message });
    }
    app.log.error(error);
    return reply.status(500).send({ error: "INTERNAL_ERROR", message: "Erro interno" });
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.post("/trucks", async (request, reply) => {
    const data = createTruckSchema.parse(request.body);
    const truck = await prisma.truck.create({ data });
    return reply.status(201).send(truck);
  });
  app.get("/trucks", async () => prisma.truck.findMany({ orderBy: { createdAt: "desc" } }));

  app.post("/grain-types", async (request, reply) => {
    const data = createGrainTypeSchema.parse(request.body);
    const grainType = await prisma.grainType.create({ data });
    return reply.status(201).send(grainType);
  });
  app.get("/grain-types", async () => prisma.grainType.findMany({ orderBy: { name: "asc" } }));

  app.post("/branches", async (request, reply) => {
    const data = createBranchSchema.parse(request.body);
    const branch = await prisma.branch.create({ data });
    return reply.status(201).send(branch);
  });
  app.get("/branches", async () => prisma.branch.findMany({ orderBy: { name: "asc" } }));

  app.post("/scales", async (request, reply) => {
    const data = createScaleSchema.parse(request.body);
    const scale = await prisma.scale.create({ data });
    return reply.status(201).send(scale);
  });
  app.get("/scales", async () => prisma.scale.findMany({ include: { branch: true }, orderBy: { createdAt: "desc" } }));

  app.post("/transport-transactions", async (request, reply) => {
    const data = createTransactionSchema.parse(request.body);
    const transaction = await prisma.transportTransaction.create({ data });
    return reply.status(201).send(transaction);
  });
  app.patch<{ Params: { id: string } }>("/transport-transactions/:id/finish", async (request) => {
    return prisma.transportTransaction.update({
      where: { id: request.params.id },
      data: { finishedAt: new Date() }
    });
  });

  app.post("/scale-readings", async (request, reply) => {
    const payload = scaleReadingSchema.parse(request.body);
    const result = await readingService.receive({
      scaleId: payload.id,
      plate: payload.plate,
      weightKg: payload.weight,
      token: request.headers["x-scale-token"]?.toString(),
      idempotencyKey: request.headers["idempotency-key"]?.toString()
    });
    return reply.status(202).send(result);
  });

  app.get("/weighings", async () => {
    return prisma.weighing.findMany({
      include: { scale: true, truck: true, grainType: true, transaction: true },
      orderBy: { weighedAt: "desc" }
    });
  });
  app.get<{ Params: { id: string } }>("/weighings/:id", async (request) => {
    return prisma.weighing.findUniqueOrThrow({
      where: { id: request.params.id },
      include: { scale: true, truck: true, grainType: true, transaction: true }
    });
  });

  app.get("/reports/weighings-by-branch", async () => reportsByBranch(prisma));
  app.get("/reports/grain-profitability", async () => grainProfitability(prisma));
  app.get("/reports/truck-productivity", async () => truckProductivity(prisma));
  app.get("/reports/dock-stock", async () => dockStock(prisma));
  app.get("/reports/scale-throughput", async () => scaleThroughput(prisma));

  return app;
}

const reportsByBranch = async (prisma: PrismaClient) => {
  const weighings = await prisma.weighing.findMany({ include: { scale: { include: { branch: true } }, grainType: true } });
  return groupBy(weighings, (item) => item.scale.branch.name).map(([branch, items]) => ({
    branch,
    weighingCount: items.length,
    totalNetWeightKg: sum(items, "netWeightKg"),
    totalPurchaseCost: sum(items, "purchaseCost")
  }));
};

const grainProfitability = async (prisma: PrismaClient) => {
  const weighings = await prisma.weighing.findMany({ include: { grainType: true } });
  return groupBy(weighings, (item) => item.grainType.name).map(([grainType, items]) => ({
    grainType,
    totalNetWeightKg: sum(items, "netWeightKg"),
    totalPurchaseCost: sum(items, "purchaseCost"),
    averageMarginPercent: average(items.map((item) => item.appliedMarginPercent)),
    estimatedProfit: Number(
      items.reduce((total, item) => total + (item.netWeightKg / 1000) * (item.salePricePerTon - item.grainType.purchasePricePerTon), 0).toFixed(2)
    )
  }));
};

const truckProductivity = async (prisma: PrismaClient) => {
  const weighings = await prisma.weighing.findMany({ include: { truck: true } });
  return groupBy(weighings, (item) => item.truck.plate).map(([plate, items]) => ({
    plate,
    weighingCount: items.length,
    totalNetWeightKg: sum(items, "netWeightKg")
  }));
};

const dockStock = async (prisma: PrismaClient) => {
  const grains = await prisma.grainType.findMany({ orderBy: { dockStockKg: "asc" } });
  return grains.map((grain) => ({
    grainType: grain.name,
    dockStockKg: grain.dockStockKg,
    purchasePricePerTon: grain.purchasePricePerTon,
    scarcityRank: grain.dockStockKg === 0 ? "critical" : grain.dockStockKg < 25_000 ? "low" : "normal"
  }));
};

const scaleThroughput = async (prisma: PrismaClient) => {
  const weighings = await prisma.weighing.findMany({ include: { scale: true } });
  return groupBy(weighings, (item) => item.scaleId).map(([scaleId, items]) => ({
    scaleId,
    weighingCount: items.length,
    totalNetWeightKg: sum(items, "netWeightKg")
  }));
};

const groupBy = <T>(items: T[], getKey: (item: T) => string): Array<[string, T[]]> => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = getKey(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return [...map.entries()];
};

const sum = <T extends Record<string, unknown>>(items: T[], field: keyof T): number => {
  return Number(items.reduce((total, item) => total + Number(item[field] ?? 0), 0).toFixed(2));
};

const average = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
};
