FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/tsconfig.json frontend/
RUN npm ci
COPY frontend/ frontend/
RUN npm run build -w @eduverse/frontend

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/frontend/next.config.js ./
COPY --from=builder /app/frontend/public public/
COPY --from=builder /app/frontend/.next .next/
COPY --from=builder /app/frontend/node_modules node_modules/
COPY --from=builder /app/frontend/package.json ./
EXPOSE 3000
CMD ["npx", "next", "start"]
