#!/bin/bash
PORT=${1:-3000} docker compose down -v
PORT=${1:-3000} docker compose up --build -d
sleep 5
docker run --rm -i -e PORT=${1:-3000} grafana/k6 run - <tests/stress/buy_sell.js