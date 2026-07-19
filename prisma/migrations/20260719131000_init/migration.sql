-- CreateTable
CREATE TABLE "Truck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plate" TEXT NOT NULL,
    "tareKg" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GrainType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "purchasePricePerTon" REAL NOT NULL,
    "dockStockKg" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Scale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransportTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "truckId" TEXT NOT NULL,
    "grainTypeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransportTransaction_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransportTransaction_grainTypeId_fkey" FOREIGN KEY ("grainTypeId") REFERENCES "GrainType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransportTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Weighing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plate" TEXT NOT NULL,
    "grossWeightKg" REAL NOT NULL,
    "tareKg" REAL NOT NULL,
    "netWeightKg" REAL NOT NULL,
    "purchaseCost" REAL NOT NULL,
    "salePricePerTon" REAL NOT NULL,
    "appliedMarginPercent" REAL NOT NULL,
    "weighedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scaleId" TEXT NOT NULL,
    "truckId" TEXT NOT NULL,
    "grainTypeId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "presenceKey" TEXT NOT NULL,
    CONSTRAINT "Weighing_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Weighing_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Weighing_grainTypeId_fkey" FOREIGN KEY ("grainTypeId") REFERENCES "GrainType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Weighing_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "TransportTransaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Truck_plate_key" ON "Truck"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "GrainType_name_key" ON "GrainType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Weighing_presenceKey_key" ON "Weighing"("presenceKey");
