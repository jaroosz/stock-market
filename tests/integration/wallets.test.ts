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
        expect(res.body.stocks).toContainEqual({ stocks: [] });
    });

    // it('returns correct quantity when the same stock was bought multiple times', async () => {
    //     await request(app)
    //         .post('/stocks')
    //         .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

    //     await request(app)
    //         .post('/wallets/wallet-1/stocks/AAPL')
    //         .send({ type: 'buy' });

    //     await request(app)
    //         .post('/wallets/wallet-1/stocks/AAPL')
    //         .send({ type: 'buy' });

    //     await request(app)
    //         .post('/wallets/wallet-1/stocks/AAPL')
    //         .send({ type: 'buy' });

    //     const res = await request(app).get('/wallets/wallet-1');

    //     expect(res.status).toBe(200);
    //     expect(res.body.stocks).toContainEqual({ name: 'AAPL', quantity: 3 });
    // });

    // it('handles invalid characters in wallet_id', async () => {
    //     const res = await request(app).get("/wallets/' OR '1'='1");
    //     expect(res.status).toBe(404);
    // });
});