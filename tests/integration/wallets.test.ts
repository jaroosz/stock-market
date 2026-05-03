import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';
import { clearDatabase, closePool } from './helpers/db';

beforeEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await closePool();
    await pool.end();
});

describe('GET /wallets/:wallet_id', () => {
    it('returns 404 for non-existent wallet', async () => {
        const res = await request(app).get('/wallets/non-existent');
        expect(res.status).toBe(404);
    });

    it('returns 200 with correct stocks after a buy', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app).get('/wallets/wallet-1');

        expect(res.status).toBe(200);
        expect(res.body.stocks).toContainEqual({ name: 'AAPL', quantity: 1 });
    });

    it('returns empty stocks list when wallet exists but all stocks were sold', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'sell' });

        const res = await request(app).get('/wallets/wallet-1');

        expect(res.status).toBe(200);
        expect(res.body.stocks).toEqual([]);
    });

    it('returns correct quantity when the same stock was bought multiple times', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app).get('/wallets/wallet-1');

        expect(res.status).toBe(200);
        expect(res.body.stocks).toContainEqual({ name: 'AAPL', quantity: 3 });
    });

    it('handles invalid characters in wallet_id', async () => {
        const res = await request(app).get("/wallets/' OR '1'='1");
        expect(res.status).toBe(404);
    });
});

describe('GET /wallets/:wallet_id/stocks/:stock_name', () => {
    it('returns 404 for non-existent wallet', async () => {
        const res = await request(app).get('/wallets/non-existent/stocks/AAPL');
        expect(res.status).toBe(404);
    });

    it('returns 0 when wallet exists but never bought this stock', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app).get('/wallets/wallet-1/stocks/GOOGL');
        expect(res.status).toBe(200);
        expect(res.body).toBe(0);
    });

    it('returns correct quantity as a number', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app).get('/wallets/wallet-1/stocks/AAPL');
        expect(res.status).toBe(200);
        expect(typeof res.body).toBe('number');
        expect(res.body).toBe(1);
    });

    it('handles invalid characters in stock_name', async () => {
        const res = await request(app).get("/wallets/wallet-1/stocks/' OR '1'='1");
        expect(res.status).toBe(404);
    });

    it('is case-sensitive for stock_name', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        const res = await request(app)
            .post('/wallets/wallet-1/stocks/aapl')
            .send({ type: 'buy' });

        expect(res.status).toBe(404);
    });
});

describe('POST /wallets/:wallet_id/stocks/:stock_name', () => {
    it('returns 400 when type field is missing', async () => {
        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({});
        expect(res.status).toBe(400);
    });

    it('returns 400 when body is missing entirely', async () => {
        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL');
        expect(res.status).toBe(400);
    });

    it('returns 400 when type is not "buy" or "sell"', async () => {
        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'transfer' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when type is uppercase', async () => {
        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'BUY' });
        expect(res.status).toBe(400);
    });
});

describe('buy', () => {
    it('returns 404 when stock does not exist in the bank', async () => {
        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });
        expect(res.status).toBe(404);
    });

    it('returns 400 when stock exists in the bank but quantity is 0', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 0 }] });

        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });
        expect(res.status).toBe(400);
    });

    it('returns 200, decrements bank quantity by 1, increments wallet quantity by 1', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });
        expect(res.status).toBe(200);

        const bank = await request(app).get('/stocks');
        expect(bank.body.stocks).toContainEqual({ name: 'AAPL', quantity: 9 });

        const wallet = await request(app).get('/wallets/wallet-1');
        expect(wallet.body.stocks).toContainEqual({ name: 'AAPL', quantity: 1 });
    });

    it('bank at quantity 1 — after buy bank has 0, next buy returns 400', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 1 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });
        expect(res.status).toBe(400);
    });

    it('creates wallet if it does not exist', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app).get('/wallets/wallet-1');
        expect(res.status).toBe(200);
    });
});

describe('sell', () => {
    it('returns 400 when wallet does not exist', async () => {
        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'sell' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when wallet exists but never held this stock', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app)
            .post('/wallets/wallet-1/stocks/GOOGL')
            .send({ type: 'sell' });
        expect(res.status).toBe(400);
    });

    it('returns 200, decrements wallet quantity by 1, increments bank quantity by 1', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'sell' });
        expect(res.status).toBe(200);

        const bank = await request(app).get('/stocks');
        expect(bank.body.stocks).toContainEqual({ name: 'AAPL', quantity: 10 });

        const wallet = await request(app).get('/wallets/wallet-1');
        expect(wallet.body.stocks).toEqual([]);
    });

    it('wallet at quantity 1 — after sell wallet has 0, next sell returns 400', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'sell' });

        const res = await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'sell' });
        expect(res.status).toBe(400);
    });
});