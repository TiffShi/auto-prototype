# Multi-stage build for Angular + Spring Boot Weather App

# ─────────────────────────────────────────
# Stage 1: Build the Spring Boot backend
# ─────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build

WORKDIR /app/backend

# Copy backend source
COPY backend/ .

# Build the JAR, skipping tests for faster build
RUN mvn clean package -DskipTests

# ─────────────────────────────────────────
# Stage 2: Final runtime image
# Uses Node + Java together
# ─────────────────────────────────────────
FROM node:18-bullseye

# ── Install Java 17 runtime ──
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openjdk-17-jre-headless \
        curl \
        ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify Java is available
RUN java -version

# ── Copy built backend JAR ──
WORKDIR /app/backend
COPY --from=backend-build /app/backend/target/*.jar app.jar

# ── Copy and install frontend ──
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./

# Install Angular CLI globally and project dependencies
RUN npm install -g @angular/cli@17 && \
    npm install

# Copy the rest of the frontend source
COPY frontend/ .

# ── Copy startup script ──
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Expose both ports
EXPOSE 8080 5173

WORKDIR /app
CMD ["/app/startup.sh"]