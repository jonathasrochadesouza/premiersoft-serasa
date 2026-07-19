import { z } from "zod";

export const createTruckSchema = z.object({
  plate: z.string().min(7).max(8).transform((value) => value.trim().toUpperCase()),
  tareKg: z.number().positive()
});

export const createGrainTypeSchema = z.object({
  name: z.string().min(2),
  purchasePricePerTon: z.number().positive(),
  dockStockKg: z.number().min(0).default(0)
});

export const createBranchSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2).max(2).transform((value) => value.toUpperCase())
});

export const createScaleSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  branchId: z.string().min(1),
  token: z.string().min(12)
});

export const createTransactionSchema = z.object({
  truckId: z.string().min(1),
  grainTypeId: z.string().min(1),
  branchId: z.string().min(1)
});

export const scaleReadingSchema = z.object({
  id: z.string().min(1),
  plate: z.string().min(7).max(8),
  weight: z.number().positive()
});
