import pool from '../db';

export async function executeBuy(walletId: string, stockName: string): Promise<void> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            'UPDATE bank_stocks SET quantity = quantity - 1 WHERE stock_name = $1',
            [stockName]
        );

        await client.query(
            `INSERT INTO wallet_stocks (wallet_id, stock_name, quantity)
             VALUES ($1, $2, 1)
             ON CONFLICT (wallet_id, stock_name)
             DO UPDATE SET quantity = wallet_stocks.quantity + 1`,
            [walletId, stockName]
        );

        await client.query(
            'INSERT INTO audit_log (type, wallet_id, stock_name) VALUES ($1, $2, $3)',
            ['buy', walletId, stockName]
        );

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function executeSell(walletId: string, stockName: string): Promise<void> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
        `
        INSERT INTO bank_stocks (stock_name, quantity)
        VALUES ($1, 1)
        ON CONFLICT (stock_name)
        DO UPDATE SET quantity = bank_stocks.quantity + 1
        `,
        [stockName]
        );

        await client.query(
            `
            UPDATE wallet_stocks
            SET quantity = quantity - 1
            WHERE wallet_id = $1 AND stock_name = $2
            `,
            [walletId, stockName]
        );

        await client.query(
            'INSERT INTO audit_log (type, wallet_id, stock_name) VALUES ($1, $2, $3)',
            ['sell', walletId, stockName]
        );

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}