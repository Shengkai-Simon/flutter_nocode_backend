# === Stage 1: Build jar ======================
FROM gradle:8.5-jdk17 AS builder

WORKDIR /app
COPY microservices/config-service /app
RUN gradle bootJar --no-daemon

# === Stage 2: Run jar =======================
FROM apptmate-base-java17:latest

WORKDIR /app

# Note: do not COPY config-repo here, but rely on volumes mounting
COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]