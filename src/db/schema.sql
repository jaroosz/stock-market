CREATE TABLE IF NOT EXIST "wallets" (
  "Id" varchar PRIMARY KEY
);

CREATE TABLE IF NOT EXIST "bank_stocks" (
  "stock_name" varchar PRIMARY KEY,
  "quantity" integer NOT NULL
);

CREATE TABLE IF NOT EXIST "wallet_stocks" (
  "wallet_id" varchar NOT NULL,
  "stock_name" varchar NOT NULL,
  "quantity" integer NOT NULL
  PRIMARY KEY ("wallet_id", "stock_name")
);

CREATE TABLE IF NOT EXIST "audit_log" (
  "id" serial PRIMARY KEY,
  "type" varchar NOT NULL,
  "wallet_id" varchar NOT NULL,
  "stock_name" varchar NOT NULL
);

ALTER TABLE "wallet_stocks" ADD FOREIGN KEY ("stock_name") REFERENCES "bank_stocks" ("stock_name") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "wallet_stocks" ADD FOREIGN KEY ("wallet_id") REFERENCES "wallets" ("Id") DEFERRABLE INITIALLY IMMEDIATE;