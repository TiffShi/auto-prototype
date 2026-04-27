#!/usr/bin/env bash
# =============================================================================
# bucket/minio_setup.sh
#
# 1. Downloads the MinIO server binary to /usr/local/bin/minio
# 2. Starts MinIO in the background on port 9000 (API) and 9001 (console)
# 3. Waits 3 seconds for MinIO to be ready
# 4. Runs bucket/init_bucket.py to create buckets and set policies
#
# Runs as root on Debian/Ubuntu inside a container.
# =============================================================================

set -euo pipefail

MINIO_BINARY_URL="https://dl.min.io/server/minio/release/linux-amd64/minio"
MINIO_BINARY_PATH="/usr/local/bin/minio"
MINIO_DATA_DIR="${MINIO_DATA_DIR:-/data/minio}"

export MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
export MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"

echo "============================================================"
echo " MinIO Setup — Restaurant Menu Management"
echo "============================================================"

# ---------------------------------------------------------------------------
# 1. Install dependencies
# ---------------------------------------------------------------------------
echo "[1/4] Installing dependencies…"
apt-get update -qq
apt-get install -y --no-install-recommends \
    curl \
    python3 \
    python3-pip 2>/dev/null || true

pip3 install --quiet minio

# ---------------------------------------------------------------------------
# 2. Download MinIO binary
# ---------------------------------------------------------------------------
if [ -f "${MINIO_BINARY_PATH}" ]; then
    echo "[2/4] MinIO binary already present at ${MINIO_BINARY_PATH} — skipping download."
else
    echo "[2/4] Downloading MinIO binary…"
    curl -fsSL "${MINIO_BINARY_URL}" -o "${MINIO_BINARY_PATH}"
    echo "      Download complete."
fi

chmod +x "${MINIO_BINARY_PATH}"
echo "      Binary is executable: ${MINIO_BINARY_PATH}"

# ---------------------------------------------------------------------------
# 3. Start MinIO server in the background
# ---------------------------------------------------------------------------
echo "[3/4] Starting MinIO server…"

mkdir -p "${MINIO_DATA_DIR}"

# Kill any existing MinIO process (idempotent re-runs)
pkill -f "minio server" 2>/dev/null || true
sleep 1

nohup "${MINIO_BINARY_PATH}" server "${MINIO_DATA_DIR}" \
    --address "0.0.0.0:9000" \
    --console-address "0.0.0.0:9001" \
    > /var/log/minio.log 2>&1 &

MINIO_PID=$!
echo "      MinIO started (PID ${MINIO_PID}), waiting 3 seconds…"
sleep 3

# Verify the process is still running
if ! kill -0 "${MINIO_PID}" 2>/dev/null; then
    echo "ERROR: MinIO failed to start. Check /var/log/minio.log" >&2
    cat /var/log/minio.log >&2
    exit 1
fi
echo "      MinIO is running."

# ---------------------------------------------------------------------------
# 4. Initialise buckets
# ---------------------------------------------------------------------------
echo "[4/4] Initialising MinIO buckets…"

# Resolve the init script relative to this shell script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MINIO_ENDPOINT="${MINIO_ENDPOINT:-localhost:9000}" \
MINIO_ROOT_USER="${MINIO_ROOT_USER}" \
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
    python3 "${SCRIPT_DIR}/init_bucket.py"

echo ""
echo "============================================================"
echo " ✓ MinIO setup complete."
echo "   API     : http://localhost:9000"
echo "   Console : http://localhost:9001"
echo "   User    : ${MINIO_ROOT_USER}"
echo "   Log     : /var/log/minio.log"
echo "============================================================"