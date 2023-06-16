#!/bin/bash

set -o allexport
source .env
if [ -f .env.local ]
then
    source .env.local
fi
set +o allexport

docker compose build