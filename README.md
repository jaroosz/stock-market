# Simple Stock Market

Service simulating a simplified stock market REST API.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express
- **Database**: PostgreSQL
- **Infrastructure**: Docker Compose (2 app instances + PostgreSQL + Nginx load balancer)

## How to Run

**Prerequisites:** Docker Desktop installed and running.

### Linux / macOS
```bash
# Make executable (first time only)
chmod +x start.sh

# Default port (3000)
./start.sh

# Custom port
./start.sh 8080
```

### Windows (PowerShell)
```powershell
# Default port (3000)
.\start.ps1

# Custom port
.\start.ps1 8080
```

API will be available at http://localhost:PORT

To stop:
```bash
docker compose down
```

## Architecture Diagram

![System Architecture Diagram](src/docs/architecture.svg)

## Architecture Decisions

- **Express.js instead of NestJS:** To maintain simplicity and avoid over-engineering for a system with limited scale and rigid requirements, a lightweight framework was chosen. This allows for clear, explicit route definitions similar to Minimal API approaches.
- **Raw SQL over ORM:** Direct SQL queries via `pg` provide absolute control over critical database transactions, which are essential for financial applications to prevent race conditions during concurrent requests.
- **Audit Log Independence:** The `audit_log` table intentionally lacks foreign key constraints to the `wallets` and `bank_stocks` tables. This ensures the log remains an immutable, append-only historical record, even if wallet records were to be archived or deleted in the future.
- **Wallet Holdings Independence:** The `wallet_stocks` table intentionally has no foreign key constraint to `bank_stocks`. This allows wallets to retain and sell stocks even after they are removed from the bank via `POST /stocks`.
- **High Availability (Active-Active):** Two application instances run concurrently behind an Nginx load balancer using a round-robin strategy. Database transactions and row-level locking (e.g., during stock purchases) manage concurrency and prevent double-spending or overselling.

### Project Structure

```
src/
├── controllers/      # Parsing requests and formatting HTTP responses
├── dal/              # Data Access Layer (Raw SQL execution)
├── db/               # Database connection pool and configuration
├── docs/             # Documentation
├── middleware/       # Middleware (error handler)
├── models/           # TypeScript interfaces and DTOs
├── routes/           # Express routing definitions
├── services/         # Core business logic and transaction management
├── app.ts            # Express app setup and middleware configuration
├── db.ts             # Database configuration
└── index.ts          # Server entry point
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/wallets/:wallet_id` | Get wallet with all stocks |
| `GET` | `/wallets/:wallet_id/stocks/:stock_name` | Get quantity of a specific stock in wallet |
| `POST` | `/wallets/:wallet_id/stocks/:stock_name` | Buy or sell a stock (`{ "type": "buy"/"sell" }`) |
| `GET` | `/stocks` | Get all available bank stocks |
| `POST` | `/stocks` | Set bank stocks (`{ "stocks": [{ "name": "AAPL", "quantity": 10 }] }`) |
| `GET` | `/log` | Get audit log of all transactions |
| `POST` | `/chaos` | Kills one app instance |