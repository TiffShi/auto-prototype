#!/usr/bin/env bash
# =============================================================================
# minio_setup.sh
# Downloads the MinIO binary, starts the server, and initialises buckets.
#
# Must be run as root on Debian/Ubuntu inside a container.
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MINIO_BINARY_URL="https://dl.min.io/server/minio/release/linux-amd64/minio"
MINIO_BINARY_PATH="/usr/local/bin/minio"

MINIO_DATA_DIR="${MINIO_DATA_DIR:-/data/minio}"
MINIO_API_PORT="${MINIO_API_PORT:-9000}"
MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-9001}"

export MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
export MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"

INIT_SCRIPT="/app/bucket/init_bucket.py"

echo "============================================================"
echo " MinIO Setup"
echo " API Port     : ${MINIO_API_PORT}"
echo " Console Port : ${MINIO_CONSOLE_PORT}"
echo " Data Dir     : ${MINIO_DATA_DIR}"
echo " Root User    : ${MINIO_ROOT_USER}"
echo "============================================================"

# ---------------------------------------------------------------------------
# 1. Install dependencies
# ---------------------------------------------------------------------------
echo "[minio_setup] Installing dependencies..."
apt-get update -qq
apt-get install -y --no-install-recommends \
    curl \
    python3 \
    python3-pip \
    ca-certificates

pip3 install --quiet minio

# ---------------------------------------------------------------------------
# 2. Download MinIO binary
# ---------------------------------------------------------------------------
if [[ -f "${MINIO_BINARY_PATH}" ]]; then
    echo "[minio_setup] MinIO binary already present at ${MINIO_BINARY_PATH}."
else
    echo "[minio_setup] Downloading MinIO binary..."
    curl -fsSL "${MINIO_BINARY_URL}" -o "${MINIO_BINARY_PATH}"
    echo "[minio_setup] Download complete."
fi

chmod +x "${MINIO_BINARY_PATH}"
echo "[minio_setup] MinIO binary is executable."

# ---------------------------------------------------------------------------
# 3. Prepare data directory
# ---------------------------------------------------------------------------
mkdir -p "${MINIO_DATA_DIR}"
echo "[minio_setup] Data directory: ${MINIO_DATA_DIR}"

# ---------------------------------------------------------------------------
# 4. Start MinIO in the background
# ---------------------------------------------------------------------------
echo "[minio_setup] Starting MinIO server..."
nohup "${MINIO_BINARY_PATH}" server "${MINIO_DATA_DIR}" \
    --address ":${MINIO_API_PORT}" \
    --console-address ":${MINIO_CONSOLE_PORT}" \
    > /var/log/minio.log 2>&1 &

MINIO_PID=$!
echo "[minio_setup] MinIO started with PID ${MINIO_PID}."
echo "[minio_setup] Logs: /var/log/minio.log"

# ---------------------------------------------------------------------------
# 5. Wait for MinIO to be ready
# ---------------------------------------------------------------------------
echo "[minio_setup] Waiting 3 seconds for MinIO to initialise..."
sleep 3

# Extra health-check loop (up to 30 s)
MAX_WAIT=10
for i in $(seq 1 ${MAX_WAIT}); do
    if curl -sf "http://localhost:${MINIO_API_PORT}/minio/health/live" > /dev/null 2>&1; then
        echo "[minio_setup] MinIO health check passed (attempt ${i})."
        break
    fi
    echo "[minio_setup] Waiting for MinIO health endpoint (attempt ${i}/${MAX_WAIT})..."
    sleep 3
    if [[ "${i}" -eq "${MAX_WAIT}" ]]; then
        echo "[minio_setup] WARNING: MinIO health check did not pass — proceeding anyway."
    fi
done

# ---------------------------------------------------------------------------
# 6. Initialise buckets
# ---------------------------------------------------------------------------
echo "[minio_setup] Running bucket initialisation script..."
MINIO_ENDPOINT="localhost:${MINIO_API_PORT}" \
MINIO_ROOT_USER="${MINIO_ROOT_USER}" \
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
    python3 "${INIT_SCRIPT}"

echo ""
echo "============================================================"
echo " MinIO setup complete!"
echo " API     : http://localhost:${MINIO_API_PORT}"
echo " Console : http://localhost:${MINIO_CONSOLE_PORT}"
echo " Login   : ${MINIO_ROOT_USER} / ${MINIO_ROOT_PASSWORD}"
echo "============================================================"