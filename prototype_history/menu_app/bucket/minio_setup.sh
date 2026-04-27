#!/usr/bin/env bash
# =============================================================================
# bucket/minio_setup.sh
#
# Downloads the MinIO server binary, starts it in the background, and
# provisions the required buckets via init_bucket.py.
#
# Runs as root on Debian/Ubuntu inside a container.
#
# Environment variables (with defaults):
#   MINIO_ROOT_USER      (default: minioadmin)
#   MINIO_ROOT_PASSWORD  (default: minioadmin)
#   MINIO_DATA_DIR       (default: /data/minio)
#   MINIO_ENDPOINT       (default: localhost:9000)
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
export MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
export MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"
MINIO_DATA_DIR="${MINIO_DATA_DIR:-/data/minio}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-localhost:9000}"
MINIO_BINARY="/usr/local/bin/minio"
MINIO_BINARY_URL="https://dl.min.io/server/minio/release/linux-amd64/minio"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> [minio_setup] Starting MinIO setup…"

# ---------------------------------------------------------------------------
# 1. Install dependencies
# ---------------------------------------------------------------------------
echo "==> [minio_setup] Installing dependencies…"
apt-get update -qq
apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    python3 \
    python3-pip

pip3 install --quiet minio

# ---------------------------------------------------------------------------
# 2. Download MinIO binary
# ---------------------------------------------------------------------------
if [ ! -f "${MINIO_BINARY}" ]; then
    echo "==> [minio_setup] Downloading MinIO binary from ${MINIO_BINARY_URL}…"
    curl -fsSL "${MINIO_BINARY_URL}" -o "${MINIO_BINARY}"
    chmod +x "${MINIO_BINARY}"
    echo "==> [minio_setup] MinIO binary installed at ${MINIO_BINARY}."
else
    echo "==> [minio_setup] MinIO binary already present at ${MINIO_BINARY}."
fi

# ---------------------------------------------------------------------------
# 3. Prepare data directory
# ---------------------------------------------------------------------------
echo "==> [minio_setup] Preparing data directory: ${MINIO_DATA_DIR}"
mkdir -p "${MINIO_DATA_DIR}"

# ---------------------------------------------------------------------------
# 4. Start MinIO in the background
# ---------------------------------------------------------------------------
echo "==> [minio_setup] Starting MinIO server…"
nohup "${MINIO_BINARY}" server "${MINIO_DATA_DIR}" \
    --address "0.0.0.0:9000" \
    --console-address "0.0.0.0:9001" \
    > /var/log/minio.log 2>&1 &

MINIO_PID=$!
echo "==> [minio_setup] MinIO started (PID ${MINIO_PID})."

# ---------------------------------------------------------------------------
# 5. Wait for MinIO to become ready
# ---------------------------------------------------------------------------
echo "==> [minio_setup] Waiting for MinIO to be ready…"
sleep 3

MAX_WAIT=30
WAITED=0
until curl -sf "http://${MINIO_ENDPOINT}/minio/health/live" > /dev/null 2>&1; do
    if [ "${WAITED}" -ge "${MAX_WAIT}" ]; then
        echo "ERROR: MinIO did not become ready within ${MAX_WAIT}s."
        echo "--- MinIO log ---"
        cat /var/log/minio.log || true
        exit 1
    fi
    echo "  Still waiting… (${WAITED}s)"
    sleep 2
    WAITED=$((WAITED + 2))
done

echo "==> [minio_setup] MinIO is ready."

# ---------------------------------------------------------------------------
# 6. Provision buckets
# ---------------------------------------------------------------------------
echo "==> [minio_setup] Running init_bucket.py…"
MINIO_ENDPOINT="${MINIO_ENDPOINT}" \
MINIO_ROOT_USER="${MINIO_ROOT_USER}" \
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
    python3 "${SCRIPT_DIR}/init_bucket.py"

echo ""
echo "==> [minio_setup] ✅  MinIO setup complete."
echo "    API     : http://localhost:9000"
echo "    Console : http://localhost:9001  (login: ${MINIO_ROOT_USER} / ${MINIO_ROOT_PASSWORD})"
echo "    Logs    : /var/log/minio.log"