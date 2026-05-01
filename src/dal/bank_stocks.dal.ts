import pool from '../db';
import { Stock } from '../models/types';

export async function getAllBankStocks(): Promise<Stock[]> {
    const result = await pool.query(
        'SELECT "stock_name", "quantity" FROM bank_stocks'
    );
    return result.rows.map(row => ({
        name: row.stock_name,
        quantity: row.quantity
    }));
}

export async function setBankStocks(stocks: Stock[]): Promise<void> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM bank_stocks');

        for (const stock of stocks)
        {
            await client.query(
                'INSERT INTO bank_stocks (stock_name, quantity) VALUES ($1, $2)',
                [stock.name, stock.quantity]
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function bankStockExists(stockName: string): Promise<boolean> {
    const result = await pool.query(
        'SELECT 1 FROM bank_stocks WHERE "stock_name" = $1',
        [stockName]
    );
    return result.rows.length > 0;
}

export async function buyFromBank(stockName: string): Promise<void> {
    await pool.query(
        `
        UPDATE bank_stocks
        SET quantity = quantity - 1
        WHERE stock_name = $1
        `,
        [stockName]
    );
}

export async function sellToBank(stockName: string): Promise<void> {
    await pool.query(
        `
        INSERT INTO bank_stocks (stock_name, quantity)
        VALUES ($1, 1)
        ON CONFLICT (stock_name)
        DO UPDATE SET quantity = bank_stocks.quantity + 1
        `,
        [stockName]
    );
}