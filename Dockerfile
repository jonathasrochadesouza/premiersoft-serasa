FROM node:22-bookworm-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN pnpm run prisma:generate
RUN pnpm run build
RUN pnpm prune --prod

FROM node:22-bookworm-slim AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV="production"
ENV PORT="3333"
ENV DATABASE_URL="file:/data/app.db"

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl dumb-init \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY prisma ./prisma

EXPOSE 3333

CMD ["dumb-init", "sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node dist/src/server.js"]
