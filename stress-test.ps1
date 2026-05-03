docker compose down -v
docker compose up --build -d
Start-Sleep -Seconds 5
Get-Content tests/stress/buy_sell.js | docker run --rm -i grafana/k6 run -