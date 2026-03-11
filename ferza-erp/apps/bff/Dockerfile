FROM node:20-alpine

WORKDIR /app

# pnpm via Corepack (Node 20+)
RUN corepack enable

# Copy the workspace so pnpm can resolve workspaces (e.g. @ferza/shared)
COPY . .

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/bff

EXPOSE 4000

CMD ["node", "src/index.js"]

