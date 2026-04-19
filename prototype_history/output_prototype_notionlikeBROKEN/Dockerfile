# Multi-stage build for Vue/SpringBoot Notion-like App

# ─────────────────────────────────────────────
# Stage 1: Build the Spring Boot backend
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build

WORKDIR /app/backend

# Copy pom.xml first for dependency caching
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# ─────────────────────────────────────────────
# Stage 2: Final runtime image (Node + Java)
# ─────────────────────────────────────────────
FROM node:18-bullseye

# Install Java 17 (OpenJDK)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openjdk-17-jre-headless \
        curl \
        wget \
        postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# ─────────────────────────────────────────────
# Copy backend JAR from build stage
# ─────────────────────────────────────────────
WORKDIR /app/backend
COPY --from=backend-build /app/backend/target/*.jar app.jar

# ─────────────────────────────────────────────
# Copy and install frontend dependencies
# ─────────────────────────────────────────────
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source
COPY frontend/ ./

# ─────────────────────────────────────────────
# Copy startup script
# ─────────────────────────────────────────────
WORKDIR /app
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Expose both ports
EXPOSE 8080 5173

CMD ["/app/startup.sh"]