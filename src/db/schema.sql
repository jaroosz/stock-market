CREATE TABLE IF NOT EXISTS "wallets" (
  "Id" varchar PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "bank_stocks" (
  "stock_name" varchar PRIMARY KEY,
  "quantity" integer NOT NULL CHECK ("quantity" >= 0)
);

CREATE TABLE IF NOT EXISTS "wallet_stocks" (
  "wallet_id" varchar NOT NULL,
  "stock_name" varchar NOT NULL,
  "quantity" integer NOT NULL CHECK ("quantity" >= 0),
  PRIMARY KEY ("wallet_id", "stock_name")
);

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" serial PRIMARY KEY,
  "type" varchar NOT NULL,
  "wallet_id" varchar NOT NULL,
  "stock_name" varchar NOT NULL
);

ALTER TABLE "wallet_stocks" ADD FOREIGN KEY ("stock_name") REFERENCES "bank_stocks" ("stock_name") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "wallet_stocks" ADD FOREIGN KEY ("wallet_id") REFERENCES "wallets" ("Id") DEFERRABLE INITIALLY IMMEDIATE;