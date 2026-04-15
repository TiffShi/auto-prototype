# Multi-stage build: Stage 1 - Build Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY backend/ .
RUN mvn clean package -DskipTests

# Stage 2 - Final runtime image with Node.js + Java
FROM eclipse-temurin:17-jdk-bullseye

# Install Node.js 18
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set up backend
WORKDIR /app/backend
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Set up frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .

# Copy startup script
WORKDIR /app
COPY startup.sh .
RUN chmod +x startup.sh

EXPOSE 8080 5173

CMD ["/app/startup.sh"]