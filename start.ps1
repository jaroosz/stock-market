param([int]$Port = 80)
$env:PORT = $Port
docker compose up --build