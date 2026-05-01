# Simple Stock Market

Service simulating a simplified stock market REST API.

## Tech Stack

- **Runtime**: Node.js

- **Language**: TypeScript

- **Framework**: Express

- **Database**: PostgreSQL

- **Infrastructure**: Docker Compose (2 app instances + PostgreSQL + Nginx load balancer)

## Architecture Diagram

![System Architecture Diagram](src/docs/architecture.svg)

## Architecture Decisions

- **Express.js instead of NestJS:** To maintain simplicity and avoid over-engineering for a system with limited scale and rigid requirements, a lightweight framework was chosen. This allows for clear, explicit route definitions similar to Minimal API approaches.
- **Raw SQL over ORM:** Direct SQL queries via `pg` provide absolute control over critical database transactions, which are essential for financial applications to prevent race conditions during concurrent requests.
- **Audit Log Independence:** The `audit_log` table intentionally lacks foreign key constraints to the `wallets` and `bank_stocks` tables. This ensures the log remains an immutable, append-only historical record, even if wallet records were to be archived or deleted in the future.
- **High Availability (Active-Active):** Two application instances run concurrently behind an Nginx load balancer using a round-robin strategy. Database transactions and row-level locking (e.g., during stock purchases) manage concurrency and prevent double-spending or overselling.

### Project Structure

```
src/
├── controllers/      # Parsing requests and formatting HTTP responses
├── dal/              # Data Access Layer (Raw SQL execution)
├── db/               # Database connection pool and configuration
├── models/           # TypeScript interfaces and DTOs
├── routes/           # Express routing definitions
├── services/         # Core business logic and transaction management
├── app.ts            # Express app setup and middleware configuration
└── index.ts          # Server entry point
```

## How to Run

TODO

## API Endpoints

TODO