const baseUrl = process.env.BASE_URL ?? "http://localhost:3333";
const scaleToken = process.env.SCALE_TOKEN ?? "token-seguro-123";
const suffix = Date.now().toString().slice(-6);
const plate = `TST${suffix.slice(-4)}`;
const scaleId = `scale-${suffix}`;

const request = async (method, path, body, headers = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${text}`);
  }

  return data;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log(`Smoke test against ${baseUrl}`);

await request("GET", "/health");

const truck = await request("POST", "/trucks", {
  plate,
  tareKg: 10000
});

const grain = await request("POST", "/grain-types", {
  name: `Soja Smoke ${suffix}`,
  purchasePricePerTon: 1500,
  dockStockKg: 10000
});

const branch = await request("POST", "/branches", {
  name: `Filial Smoke ${suffix}`,
  city: "Londrina",
  state: "PR"
});

await request("POST", "/scales", {
  id: scaleId,
  name: `Balanca Smoke ${suffix}`,
  branchId: branch.id,
  token: scaleToken
});

const transaction = await request("POST", "/transport-transactions", {
  truckId: truck.id,
  grainTypeId: grain.id,
  branchId: branch.id
});

let stabilized;
for (let index = 0; index < 31; index += 1) {
  const result = await request(
    "POST",
    "/scale-readings",
    {
      id: scaleId,
      plate,
      weight: 30000 + (index % 4)
    },
    {
      "X-Scale-Token": scaleToken,
      "Idempotency-Key": `${scaleId}-${plate}-${index}`
    }
  );

  if (result.status === "stabilized") {
    stabilized = result;
  }

  await sleep(100);
}

if (!stabilized?.weighingId) {
  throw new Error("Scale readings did not stabilize after 31 readings");
}

const weighing = await request("GET", `/weighings/${stabilized.weighingId}`);
await request("GET", "/weighings");
await request("GET", "/reports/weighings-by-branch");
await request("GET", "/reports/grain-profitability");
await request("GET", "/reports/truck-productivity");
await request("GET", "/reports/dock-stock");
await request("GET", "/reports/scale-throughput");
await request("PATCH", `/transport-transactions/${transaction.id}/finish`);

console.log(
  JSON.stringify(
    {
      status: "ok",
      plate,
      scaleId,
      weighingId: weighing.id,
      grossWeightKg: weighing.grossWeightKg,
      netWeightKg: weighing.netWeightKg,
      purchaseCost: weighing.purchaseCost
    },
    null,
    2
  )
);
