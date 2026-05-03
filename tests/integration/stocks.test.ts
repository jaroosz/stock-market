import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db/db';
import { clearDatabase, closePool } from './helpers/db';

beforeEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await closePool();
    await pool.end();
});

describe('GET /stocks', () => {
    it('returns empty list when bank is empty', async () => {
        const res = await request(app).get('/stocks');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ stocks: [] });
    });
 
    it('returns single stock that was set via POST', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });
 
        const res = await request(app).get('/stocks');
        expect(res.status).toBe(200);
        expect(res.body.stocks).toContainEqual({ name: 'AAPL', quantity: 10 });
    });
 
    it('returns multiple stocks that were set via POST', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [
                { name: 'AAPL', quantity: 10 },
                { name: 'GOOGL', quantity: 5 },
                { name: 'MSFT', quantity: 3 },
            ] });
 
        const res = await request(app).get('/stocks');
        expect(res.status).toBe(200);
        expect(res.body.stocks).toContainEqual({ name: 'AAPL', quantity: 10 });
        expect(res.body.stocks).toContainEqual({ name: 'GOOGL', quantity: 5 });
        expect(res.body.stocks).toContainEqual({ name: 'MSFT', quantity: 3 });
        expect(res.body.stocks).toHaveLength(3);
    });

    it('returns updated stocks after second POST overwrites first', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });

        await request(app)
            .post('/stocks')
            .send({ stocks: [
                { name: 'AAPL', quantity: 5 },
                { name: 'GOOGL', quantity: 100 }
            ] });

        const res = await request(app).get('/stocks');
        expect(res.status).toBe(200);
        expect(res.body.stocks).toContainEqual({ name: 'AAPL', quantity: 5 });
        expect(res.body.stocks).toContainEqual({ name: 'GOOGL', quantity: 100 });
        expect(res.body.stocks).toHaveLength(2);
    });
 
    it('does not return stocks with quantity 0', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [
                { name: 'AAPL', quantity: 10 },
                { name: 'GOOGL', quantity: 0 },
            ] });
 
        const res = await request(app).get('/stocks');
        expect(res.status).toBe(200);
        expect(res.body.stocks).toContainEqual({ name: 'AAPL', quantity: 10 });
        expect(res.body.stocks).not.toContainEqual({ name: 'GOOGL', quantity: 0 });
    });
});

describe('POST /stocks', () => {
    it('returns 200 for single stock', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10 }] });
        expect(res.status).toBe(200);
    });

    it('returns 200 for multiple stocks', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [
                { name: 'AAPL', quantity: 10 },
                { name: 'GOOGL', quantity: 5 },
                { name: 'MSFT', quantity: 50 },
            ] });
        expect(res.status).toBe(200);
    });

    it('returns 200 for empty stocks array', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [] });
        expect(res.status).toBe(200);
    });

    it('returns 400 when an element is missing name', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [{ quantity: 10 }] });
        expect(res.status).toBe(400);
    });

    it('returns 400 when an element is missing quantity', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL' }] });
        expect(res.status).toBe(400);
    });

    it('returns 400 when name is an empty string', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: '', quantity: 10 }] });
        expect(res.status).toBe(400);
    });

    it('returns 400 when quantity is not a number', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: "10" }] });
        expect(res.status).toBe(400);
    });

    it('returns 400 when quantity is a float', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 10.5 }] });
        expect(res.status).toBe(400);
    });

    it('returns 400 when quantity is negative', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: -5 }] });
        expect(res.status).toBe(400);
    });

    it('returns 400 when stock names are duplicated in the array', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [
                { name: 'AAPL', quantity: 50 },
                { name: 'AAPL', quantity: 25 },
                { name: 'GOOGL', quantity: 1 }
            ] });
        expect(res.status).toBe(400);
    });

    it('returns 200 for empty stocks array and resets bank to empty state', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 50 }] });

        await request(app)
            .post('/stocks')
            .send({ stocks: [] });
        
        const res = await request(app).get('/stocks');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ stocks: [] });
    });

    it('returns 200 when quantity is 0', async () => {
        const res = await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: 'AAPL', quantity: 0 }] });
        expect(res.status).toBe(200);
    });

    it('is not vulnerable to SQL injection in name', async () => {
        await request(app)
            .post('/stocks')
            .send({ stocks: [{ name: "'; DROP TABLE bank_stocks; --", quantity: 10 }] });
        
        const res = await request(app).get('/stocks');
        expect(res.status).toBe(200);
    });
});