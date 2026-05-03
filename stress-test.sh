#!/bin/bash
docker compose down -v
docker compose up --build -d
sleep 5
docker run --rm -i grafana/k6 run - <tests/stress/buy_sell.js