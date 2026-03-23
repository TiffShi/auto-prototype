# Use a lightweight base image that already has Python installed
FROM python:3.11-slim

# Install basic system utilities that might be needed for compiling code
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set a working directory inside the container
WORKDIR /app

# The container needs a default command to keep it running just long enough 
# for our Python script to inject and execute the AI-generated code
CMD ["tail", "-f", "/dev/null"]