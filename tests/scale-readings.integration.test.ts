import { unlinkSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/http/app.js";
import type { AppConfig } from "../src/config.js";

const databaseUrl = "file:./test.db";
process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const testDbPath = join(process.cwd(), "prisma", "test.db");

const appConfig: AppConfig = {
  port: 0,
  stabilization: {
    windowMs: 3000,
    minReadings: 20,
    toleranceKg: 30,
    presenceExpirationMs: 10000
  }
};

let currentTime = new Date("2026-01-01T10:00:00.000Z").getTime();

describe("POST /scale-readings", () => {
  beforeAll(async () => {
    await createTestSchema(prisma);
  });

  beforeEach(async () => {
    currentTime = new Date("2026-01-01T10:00:00.000Z").getTime();
    await prisma.idempotencyRecord.deleteMany();
    await prisma.weighing.deleteMany();
    await prisma.transportTransaction.deleteMany();
    await prisma.scale.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.grainType.deleteMany();
    await prisma.truck.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    try {
      unlinkSync(testDbPath);
    } catch {
      // ignored: the file may not exist if setup failed before Prisma created it
    }
  });

  it("responde rapido e persiste somente quando a janela estabiliza", async () => {
    const branch = await prisma.branch.create({ data: { name: "Filial Sul", city: "Londrina", state: "PR" } });
    const truck = await prisma.truck.create({ data: { plate: "ABC1D23", tareKg: 10000 } });
    const grain = await prisma.grainType.create({
      data: { name: "Soja", purchasePricePerTon: 1500, dockStockKg: 10000 }
    });
    await prisma.scale.create({ data: { id: "scale-1", name: "Balanca 1", token: "token-seguro-123", branchId: branch.id } });
    await prisma.transportTransaction.create({
      data: { truckId: truck.id, grainTypeId: grain.id, branchId: branch.id }
    });

    const app = await buildApp(prisma, appConfig, () => {
      const value = new Date(currentTime);
      currentTime += 100;
      return value;
    });

    let stabilizedResponse;
    for (let index = 0; index < 31; index += 1) {
      const response = await app.inject({
        method: "POST",
        url: "/scale-readings",
        headers: { "x-scale-token": "token-seguro-123" },
        payload: { id: "scale-1", plate: "ABC1D23", weight: 30000 + (index % 4) }
      });
      if (response.json().status === "stabilized") stabilizedResponse = response;
    }

    expect(stabilizedResponse?.statusCode).toBe(202);
    expect(stabilizedResponse?.json()).toMatchObject({ status: "stabilized", grossWeightKg: 30001.43 });

    const weighings = await prisma.weighing.findMany();
    expect(weighings).toHaveLength(1);
    expect(weighings[0]).toMatchObject({
      plate: "ABC1D23",
      tareKg: 10000,
      netWeightKg: 20001.43,
      purchaseCost: 30002.15,
      scaleId: "scale-1",
      grainTypeId: grain.id
    });

    await app.close();
  });

  it("rejeita balanca sem token autorizado", async () => {
    const branch = await prisma.branch.create({ data: { name: "Filial Norte", city: "Sinop", state: "MT" } });
    await prisma.scale.create({ data: { id: "scale-1", name: "Balanca 1", token: "token-seguro-123", branchId: branch.id } });
    const app = await buildApp(prisma, appConfig);

    const response = await app.inject({
      method: "POST",
      url: "/scale-readings",
      headers: { "x-scale-token": "token-errado" },
      payload: { id: "scale-1", plate: "ABC1D23", weight: 30000 }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ error: "UNAUTHORIZED_SCALE" });
    await app.close();
  });
});

const createTestSchema = async (prisma: PrismaClient) => {
  const statements = [
    'DROP TABLE IF EXISTS "IdempotencyRecord"',
    'DROP TABLE IF EXISTS "Weighing"',
    'DROP TABLE IF EXISTS "TransportTransaction"',
    'DROP TABLE IF EXISTS "Scale"',
    'DROP TABLE IF EXISTS "Branch"',
    'DROP TABLE IF EXISTS "GrainType"',
    'DROP TABLE IF EXISTS "Truck"',
    'CREATE TABLE "Truck" ("id" TEXT NOT NULL PRIMARY KEY, "plate" TEXT NOT NULL, "tareKg" REAL NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)',
    'CREATE TABLE "GrainType" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "purchasePricePerTon" REAL NOT NULL, "dockStockKg" REAL NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)',
    'CREATE TABLE "Branch" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "city" TEXT NOT NULL, "state" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)',
    'CREATE TABLE "Scale" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "branchId" TEXT NOT NULL, "token" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Scale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)',
    'CREATE TABLE "TransportTransaction" ("id" TEXT NOT NULL PRIMARY KEY, "truckId" TEXT NOT NULL, "grainTypeId" TEXT NOT NULL, "branchId" TEXT NOT NULL, "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "finishedAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TransportTransaction_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "TransportTransaction_grainTypeId_fkey" FOREIGN KEY ("grainTypeId") REFERENCES "GrainType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "TransportTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)',
    'CREATE TABLE "Weighing" ("id" TEXT NOT NULL PRIMARY KEY, "plate" TEXT NOT NULL, "grossWeightKg" REAL NOT NULL, "tareKg" REAL NOT NULL, "netWeightKg" REAL NOT NULL, "purchaseCost" REAL NOT NULL, "salePricePerTon" REAL NOT NULL, "appliedMarginPercent" REAL NOT NULL, "weighedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "scaleId" TEXT NOT NULL, "truckId" TEXT NOT NULL, "grainTypeId" TEXT NOT NULL, "transactionId" TEXT NOT NULL, "presenceKey" TEXT NOT NULL, CONSTRAINT "Weighing_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Weighing_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Weighing_grainTypeId_fkey" FOREIGN KEY ("grainTypeId") REFERENCES "GrainType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Weighing_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "TransportTransaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)',
    'CREATE TABLE "IdempotencyRecord" ("key" TEXT NOT NULL PRIMARY KEY, "scope" TEXT NOT NULL, "response" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)',
    'CREATE UNIQUE INDEX "Truck_plate_key" ON "Truck"("plate")',
    'CREATE UNIQUE INDEX "GrainType_name_key" ON "GrainType"("name")',
    'CREATE UNIQUE INDEX "Weighing_presenceKey_key" ON "Weighing"("presenceKey")'
  ];

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
};
