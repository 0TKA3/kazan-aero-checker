# syntax=docker/dockerfile:1

FROM oven/bun:1.3 AS web-build

WORKDIR /app/web

COPY web/package.json web/bun.lock ./
RUN bun install --frozen-lockfile

COPY web/ ./
# tsc -b требует много RAM; на слабых VPS падает с code 137 (OOM)
RUN bun run build:docker

FROM oven/bun:1.3-slim AS production

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY src/ ./src/
COPY index.ts ./
COPY --from=web-build /app/web/dist ./web/dist

ENV PORT=3000
ENV SERVE_STATIC=true
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD bun -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "src/server/index.ts"]
