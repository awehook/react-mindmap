#!/bin/bash
set -o allexport
source .env
if [ -f .env.local ]; then
    source .env.local
fi
set +o allexport

# echo "Building frontend image..."
# frontend/build-multi-arch.sh > frontend.log 2>&1 &

echo "Building backend image..."
backend/build-multi-arch.sh > backend.log 2>&1 &