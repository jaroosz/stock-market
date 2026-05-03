# Integration Test

Tests are written in Jest + Supertest against a real PostgreSQL database.
Before each test is started, the database is cleared with `clearDatabase()`.

Status: `[+]` implemented, `[ ]` planned

## GET /stocks

- [+] returns empty list when bank is empty
- [+] returns single stock that was set via POST
- [+] returns multiple stocks that were set via POST
- [+] returns updated stocks after second POST overwrites first
- [+] does not return stocks with quantity 0

## POST /stocks

- [+] returns 200 for single stock
- [+] returns 200 for multiple stocks
- [+] returns 200 for empty stocks array
- [+] returns 400 when stocks is not an array
- [+] returns 400 when an element is missing name
- [+] returns 400 when an element is missing quantity
- [+] returns 400 when name is an empty string
- [+] returns 400 when quantity is not a number
- [+] returns 400 when quantity is a float
- [+] returns 400 when quantity is negative
- [+] returns 400 when stock names are duplicated in the array
- [+] returns 200 for empty stocks array and resets bank to empty state
- [+] returns 200 when quantity is 0
- [+] is not vulnerable to SQL injection in name

## GET /wallets/:wallet_id

- [+] returns 404 for non-existent wallet
- [+] returns 200 with correct stocks after a buy
- [+] returns empty stocks list when wallet exists but all stocks were sold
- [+] returns correct quantity when the same stock was bought multiple times
- [ ] handles invalid characters in wallet_id

## GET /wallets/:wallet_id/stocks/:stock_name

- [ ] returns 404 for non-existent wallet
- [ ] returns 0 when wallet exists but never bought this stock
- [ ] returns correct quantity as a number (not an object)
- [ ] handles invalid characters in stock_name
- [ ] is case-sensitive for stock_name (define the contract)

## POST /wallets/:wallet_id/stocks/:stock_name

- [ ] returns 400 when type field is missing
- [ ] returns 400 when body is missing entirely
- [ ] returns 400 when type is not "buy" or "sell"
- [ ] returns 400 when type is uppercase (e.g. "BUY")

**buy**
- [ ] returns 404 when stock does not exist in the bank
- [ ] returns 400 when stock exists in the bank but quantity is 0
- [ ] returns 200, decrements bank quantity by 1, increments wallet quantity by 1
- [ ] bank at quantity 1 — after buy bank has 0, next buy returns 400
- [ ] creates wallet if it does not exist

**sell**
- [ ] returns 400 when wallet does not exist
- [ ] returns 400 when wallet exists but never held this stock
- [ ] returns 200, decrements wallet quantity by 1, increments bank quantity by 1
- [ ] wallet at quantity 1 — after sell wallet has 0, next sell returns 400

## GET /log

- [ ] returns empty log when no transactions have occurred
- [ ] contains entries for successful transactions with correct fields (type, wallet_id, stock_name)
- [ ] entry has exactly three fields (no internal fields like id leaked)
- [ ] failed operations are not logged
- [ ] entries are returned in order of occurrence
