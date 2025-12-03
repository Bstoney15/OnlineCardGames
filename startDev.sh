#!/bin/bash
# 
# Description: Bash script that launches the server
# 
# Author: Multiple Contributors
# Date: 2025-10-15
set -e

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

# Save the current directory and restore it on exit
ORIGINAL_DIR=$(pwd)
trap 'cd "$ORIGINAL_DIR"' EXIT

# Start the backend in the background
echo "Starting backend..."
(cd "${SCRIPT_DIR}/backend" && go run main.go) &

# Start the frontend
echo "Starting frontend..."
cd "${SCRIPT_DIR}/frontend"
npm install
npm run dev -- --host
