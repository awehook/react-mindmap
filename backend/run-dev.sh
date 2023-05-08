#!/bin/bash
set -o allexport
source .env
if [ -f .env.local ]
then
    source .env.local
fi
set +o allexport

.venv/bin/python -m reactmindmap.run