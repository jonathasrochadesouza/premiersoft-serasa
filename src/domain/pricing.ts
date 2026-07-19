import { roundToTwo } from "./stabilizer.js";

export type PricingInput = {
  netWeightKg: number;
  purchasePricePerTon: number;
  dockStockKg: number;
};

export type PricingResult = {
  purchaseCost: number;
  salePricePerTon: number;
  appliedMarginPercent: number;
  estimatedProfit: number;
};

const MIN_MARGIN = 0.05;
const MAX_MARGIN = 0.2;
const ABUNDANT_STOCK_KG = 100_000;

export const calculatePricing = (input: PricingInput): PricingResult => {
  const scarcityFactor = Math.max(0, Math.min(1, 1 - input.dockStockKg / ABUNDANT_STOCK_KG));
  const margin = MIN_MARGIN + (MAX_MARGIN - MIN_MARGIN) * scarcityFactor;
  const purchaseCost = (input.netWeightKg / 1000) * input.purchasePricePerTon;
  const salePricePerTon = input.purchasePricePerTon * (1 + margin);

  return {
    purchaseCost: roundToTwo(purchaseCost),
    salePricePerTon: roundToTwo(salePricePerTon),
    appliedMarginPercent: roundToTwo(margin * 100),
    estimatedProfit: roundToTwo((input.netWeightKg / 1000) * (salePricePerTon - input.purchasePricePerTon))
  };
};
