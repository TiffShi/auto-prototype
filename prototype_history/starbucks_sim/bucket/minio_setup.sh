#!/usr/bin/env bash
# =============================================================================
# minio_setup.sh
#
# Downloads the MinIO binary, starts the server, and initialises buckets.
# Runs as root on Debian/Ubuntu inside a container.
#
# Environment variables (with defaults):
#   MINIO_ROOT_USER      = minioadmin
#   MINIO_ROOT_PASSWORD  = minioadmin
#   MINIO_VOLUMES        = /data/minio
#   MINIO_API_PORT       = 9000
#   MINIO_CONSOLE_PORT   = 9001
# =============================================================================

set -euo pipefail

MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"
MINIO_VOLUMES="${MINIO_VOLUMES:-/data/minio}"
MINIO_API_PORT="${MINIO_API_PORT:-9000}"
MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-9001}"
MINIO_BINARY="/usr/local/bin/minio"
MINIO_BINARY_URL="https://dl.min.io/server/minio/release/linux-amd64/minio"

echo "[minio_setup] ── Step 1: Install dependencies ───────────────────────────"
apt-get update -qq
apt-get install -y --no-install-recommends \
    curl \
    python3 \
    python3-pip 2>/dev/null || true

python3 -m pip install --quiet minio 2>/dev/null || true

echo "[minio_setup] ── Step 2: Download MinIO binary ──────────────────────────"
if [ -f "${MINIO_BINARY}" ]; then
    echo "[minio_setup] MinIO binary already present at ${MINIO_BINARY}."
else
    echo "[minio_setup] Downloading from ${MINIO_BINARY_URL} …"
    curl -fsSL "${MINIO_BINARY_URL}" -o "${MINIO_BINARY}"
    echo "[minio_setup] Download complete."
fi

chmod +x "${MINIO_BINARY}"
echo "[minio_setup] MinIO binary: $(${MINIO_BINARY} --version | head -1)"

echo "[minio_setup] ── Step 3: Prepare data directory ─────────────────────────"
mkdir -p "${MINIO_VOLUMES}"

echo "[minio_setup] ── Step 4: Start MinIO server ─────────────────────────────"
export MINIO_ROOT_USER
export MINIO_ROOT_PASSWORD

nohup "${MINIO_BINARY}" server "${MINIO_VOLUMES}" \
    --address "0.0.0.0:${MINIO_API_PORT}" \
    --console-address "0.0.0.0:${MINIO_CONSOLE_PORT}" \
    > /var/log/minio.log 2>&1 &

MINIO_PID=$!
echo "[minio_setup] MinIO started (PID ${MINIO_PID})."
echo "[minio_setup] API     → http://0.0.0.0:${MINIO_API_PORT}"
echo "[minio_setup] Console → http://0.0.0.0:${MINIO_CONSOLE_PORT}"

echo "[minio_setup] ── Step 5: Wait for MinIO to be ready ─────────────────────"
sleep 3

MAX_WAIT=30
WAITED=0
until curl -sf "http://localhost:${MINIO_API_PORT}/minio/health/live" > /dev/null 2>&1; do
    if [ "${WAITED}" -ge "${MAX_WAIT}" ]; then
        echo "[minio_setup] ERROR: MinIO did not become healthy within ${MAX_WAIT}s."
        echo "[minio_setup] Last log lines:"
        tail -20 /var/log/minio.log || true
        exit 1
    fi
    echo "[minio_setup] Waiting for MinIO health check… (${WAITED}s)"
    sleep 2
    WAITED=$((WAITED + 2))
done
echo "[minio_setup] MinIO is healthy."

echo "[minio_setup] ── Step 6: Initialise buckets ─────────────────────────────"
MINIO_ENDPOINT="localhost:${MINIO_API_PORT}" \
MINIO_ROOT_USER="${MINIO_ROOT_USER}" \
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
    python3 /app/bucket/init_bucket.py

echo "[minio_setup] ── Done ───────────────────────────────────────────────────"
echo "[minio_setup] MinIO is running."
echo "[minio_setup]   API     : http://localhost:${MINIO_API_PORT}"
echo "[minio_setup]   Console : http://localhost:${MINIO_CONSOLE_PORT}"
echo "[minio_setup]   Login   : ${MINIO_ROOT_USER} / ${MINIO_ROOT_PASSWORD}"