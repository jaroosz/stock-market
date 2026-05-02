param([int]$Port = 3000)
$env:PORT = $Port
docker compose up --build