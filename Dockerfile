# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24-bookworm-slim

FROM ${NODE_IMAGE} AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

FROM frontend-deps AS frontend-build
COPY frontend/ ./
RUN npm run build

FROM ${NODE_IMAGE} AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

FROM ${NODE_IMAGE} AS runtime
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=backend-deps --chown=node:node /app/backend/node_modules ./node_modules
COPY --chown=node:node backend/ ./
COPY --from=frontend-build --chown=node:node /app/frontend/dist ./public

USER node
EXPOSE 3000

CMD ["npm", "start"]
