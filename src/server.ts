import { config } from "./config.js";
import { buildApp } from "./http/app.js";
import { prisma } from "./infra/prisma.js";

const app = await buildApp(prisma, config);

try {
  await app.listen({ port: config.port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exit(1);
}
