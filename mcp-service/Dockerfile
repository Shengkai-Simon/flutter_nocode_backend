# === Stage 1: Build ============================================
FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# === Stage 2: Production =======================================
FROM node:22-alpine

WORKDIR /usr/src/app

# install dockerize
ENV DOCKERIZE_VERSION v0.7.0
RUN wget https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VERSION}/dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz \
    && rm dockerize-linux-amd64-${DOCKERIZE_VERSION}.tar.gz

# Copy production dependencies, compiled code, and critical files
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/src/prompt_resources ./dist/prompt_resources

EXPOSE 3000

# Define container startup sequence:
# 1. Wait for PostgreSQL and discovery-service to become healthy (using dockerize)
# 2. Run database migration using `npx prisma migrate deploy`
# 3. Start the Node.js application
ENTRYPOINT ["dockerize", \
  "-wait", "tcp://postgres:5432", \
  "-wait", "http://discovery-service:8761/actuator/health", \
  "-timeout", "120s", \
  "sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
