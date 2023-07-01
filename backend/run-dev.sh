#!/bin/bash
set -o allexport
if [ -f .env ]; then
    source .env
fi
if [ -f .env.local ]; then
    source .env.local
fi
set +o allexport

.venv/bin/python -m reactmindmap.run