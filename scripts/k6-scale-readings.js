import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const baseUrl = __ENV.BASE_URL || "http://localhost:3333";
const scaleToken = __ENV.SCALE_TOKEN || "token-seguro-123";
const scaleCount = Number(__ENV.SCALE_COUNT || "3");
const duration = __ENV.LOAD_DURATION || "8s";
const targetIntervalSeconds = Number(__ENV.READING_INTERVAL_SECONDS || "0.1");

export const options = {
  scenarios: {
    scale_readings_100ms: {
      executor: "constant-vus",
      vus: scaleCount,
      duration
    }
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<250"],
    scale_reading_success: ["rate>0.99"],
    stabilized_weighings: ["count>=1"]
  }
};

const scaleReadingSuccess = new Rate("scale_reading_success");
const stabilizedWeighings = new Counter("stabilized_weighings");
const readingLatency = new Trend("scale_reading_latency");

const request = (method, path, body, headers = {}) => {
  const response = http.request(method, `${baseUrl}${path}`, body ? JSON.stringify(body) : null, {
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers
    }
  });

  check(response, {
    [`${method} ${path} status < 400`]: (res) => res.status < 400
  });

  return response;
};

const parseJson = (response) => {
  try {
    return response.json();
  } catch {
    return null;
  }
};

export function setup() {
  const suffix = `${Date.now()}`.slice(-8);
  const scenarios = [];

  request("GET", "/health");

  for (let index = 0; index < scaleCount; index += 1) {
    const plate = `K6${suffix.slice(-4)}${index}`.slice(0, 8).toUpperCase();
    const scaleId = `scale-k6-${suffix}-${index}`;

    const branch = parseJson(
      request("POST", "/branches", {
        name: `Filial K6 ${suffix}-${index}`,
        city: "Londrina",
        state: "PR"
      })
    );

    const truck = parseJson(
      request("POST", "/trucks", {
        plate,
        tareKg: 10000
      })
    );

    const grain = parseJson(
      request("POST", "/grain-types", {
        name: `Soja K6 ${suffix}-${index}`,
        purchasePricePerTon: 1500,
        dockStockKg: 10000
      })
    );

    request("POST", "/scales", {
      id: scaleId,
      name: `Balanca K6 ${suffix}-${index}`,
      branchId: branch.id,
      token: scaleToken
    });

    request("POST", "/transport-transactions", {
      truckId: truck.id,
      grainTypeId: grain.id,
      branchId: branch.id
    });

    scenarios.push({ plate, scaleId });
  }

  return { scenarios, suffix };
}

export default function (data) {
  const scenario = data.scenarios[(__VU - 1) % data.scenarios.length];
  const response = http.post(
    `${baseUrl}/scale-readings`,
    JSON.stringify({
      id: scenario.scaleId,
      plate: scenario.plate,
      weight: 30000 + (__ITER % 4)
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "X-Scale-Token": scaleToken,
        "Idempotency-Key": `k6-${data.suffix}-${__VU}-${__ITER}`
      }
    }
  );

  readingLatency.add(response.timings.duration);
  const success = response.status === 202;
  scaleReadingSuccess.add(success);
  check(response, {
    "POST /scale-readings status 202": (res) => res.status === 202
  });

  const body = parseJson(response);
  if (body?.status === "stabilized") {
    stabilizedWeighings.add(1);
  }

  sleep(targetIntervalSeconds);
}
