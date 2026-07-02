FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY backend/package.json backend/tsconfig.json backend/
COPY frontend/package.json frontend/tsconfig.json frontend/
RUN npm ci
COPY backend/ backend/
RUN npm run build -w @eduverse/backend

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package.json /app/tsconfig.base.json ./
COPY --from=builder /app/backend backend/
COPY --from=builder /app/node_modules node_modules/
EXPOSE 4000
CMD ["node", "backend/dist/index.js"]
