# === Stage 1: Build jar ======================
FROM gradle:8.5-jdk17 AS builder

WORKDIR /app
COPY . .
RUN gradle bootJar --no-daemon

# === Stage 2: Run jar =======================
FROM apptmate-base-java17:latest

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["dockerize", \
  "-wait", "http://config-service:8888/actuator/health", \
  "-wait", "http://discovery-service:8761/actuator/health", \
  "-timeout", "30s", \
  "--", \
  "java", "-jar", "/app/app.jar"]