param([int]$Port = 3000)
$env:PORT = $Port
docker compose down -v
docker compose up --build -d
Start-Sleep -Seconds 5
Get-Content tests/stress/buy_sell.js | docker run --rm -i -e PORT=$Port grafana/k6 run -