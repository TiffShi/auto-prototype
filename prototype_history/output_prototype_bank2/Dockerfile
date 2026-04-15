FROM node:18-bullseye

# Install Java 17
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk maven && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

WORKDIR /app

# Copy backend and frontend source
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build the Spring Boot backend
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

EXPOSE 8080 5173

COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

WORKDIR /app
CMD ["/app/startup.sh"]