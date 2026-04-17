# Multi-stage build: Stage 1 - Build Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build

WORKDIR /app/backend

# Copy backend source
COPY backend/pom.xml .
# Download dependencies first (layer caching)
RUN mvn dependency:go-offline -B

COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Final runtime image with Java + Node
FROM eclipse-temurin:17-jdk-bullseye

# Install Node.js 18.x
RUN apt-get update && apt-get install -y curl gnupg2 && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN java -version && node -v && npm -v

# ── Backend ──────────────────────────────────────────────
WORKDIR /app/backend

# Copy the built JAR from the build stage
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Create uploads directory for local file storage
RUN mkdir -p /app/backend/uploads

# ── Frontend ─────────────────────────────────────────────
WORKDIR /app/frontend

# Copy frontend source
COPY frontend/package.json frontend/package-lock.json* ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend source
COPY frontend/ .

# Ensure .env exists with correct API URL
RUN echo "VITE_API_URL=http://localhost:8080" > .env

# ── Ports ────────────────────────────────────────────────
EXPOSE 8080 5173

# ── Startup ──────────────────────────────────────────────
WORKDIR /app

COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

CMD ["/app/startup.sh"]