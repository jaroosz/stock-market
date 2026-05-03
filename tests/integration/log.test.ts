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

describe('GET /log', () => {
    it('returns empty log when no transactions have occurred', async () => {
        const res = await request(app).get('/log');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ log: [] });
    });

    it('contains entries for successful transactions with correct fields', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app).get('/log');
        expect(res.status).toBe(200);
        expect(res.body.log).toContainEqual({
            type: 'buy',
            wallet_id: 'wallet-1',
            stock_name: 'AAPL',
        });
    });

    it('entry has exactly three fields', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app).get('/log');
        const entry = res.body.log[0];
        expect(Object.keys(entry)).toHaveLength(3);
        expect(Object.keys(entry)).toEqual(
            expect.arrayContaining(['type', 'wallet_id', 'stock_name'])
        );
    });

    it('failed operations are not logged', async () => {
        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app).get('/log');
        expect(res.status).toBe(200);
        expect(res.body.log).toHaveLength(0);
    });

    it('entries are returned in order of occurrence', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'sell' });

        await request(app)
            .post('/wallets/wallet-1/stocks/AAPL')
            .send({ type: 'buy' });

        const res = await request(app).get('/log');
        expect(res.body.log[0].type).toBe('buy');
        expect(res.body.log[1].type).toBe('sell');
        expect(res.body.log[2].type).toBe('buy');
    });
});