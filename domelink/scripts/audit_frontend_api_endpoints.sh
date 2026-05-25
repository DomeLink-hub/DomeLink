#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
FRONTEND_API="$ROOT/frontend/src/lib/api.ts"
API_HOST=${1:-http://localhost:5000}
OUT=/tmp/frontend_api_endpoints.txt

grep -oE '"/api[^"]+' "$FRONTEND_API" | sed 's/"//g' | sort -u > "$OUT"

printf "Found %d unique API paths in frontend\n" $(wc -l < "$OUT")

while read -r path; do
  # Try HEAD first, then GET
  echo "Checking: $path"
  set +e
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I "$API_HOST$path")
  if [[ "$STATUS" == "000" ]]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_HOST$path")
  fi
  set -e
  printf "%s %s\n" "$STATUS" "$path"
done < "$OUT" > /tmp/frontend_api_endpoint_statuses.txt

cat /tmp/frontend_api_endpoint_statuses.txt
