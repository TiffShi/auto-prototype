# Multi-stage build for Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Final image: Node + Java runtime
FROM node:18-bullseye

# Install Java 17 runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openjdk-17-jre-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built backend JAR
COPY --from=backend-build /app/backend/target/*.jar /app/backend/app.jar

# Copy frontend source and install dependencies
COPY frontend/ /app/frontend/
WORKDIR /app/frontend
RUN npm install

WORKDIR /app

# Copy startup script
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

EXPOSE 8080 5173

CMD ["/app/startup.sh"]