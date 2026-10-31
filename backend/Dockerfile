FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-bookworm-slim AS production-dependencies

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

FROM node:24-bookworm-slim AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=production-dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=build /app/dist ./dist
COPY openapi.yaml ./openapi.yaml

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
