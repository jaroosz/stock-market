import pool from '../db';
import { Stock } from '../models/types';

export async function getWalletStockQuantity(walletId: string, stockName: string): Promise<number> {
    const result = await pool.query(
        'SELECT "quantity" FROM wallet_stocks WHERE "wallet_id" = $1 AND "stock_name" = $2',
        [walletId, stockName]
    );
    return result.rows[0]?.quantity ?? 0;
}

export async function getAllWalletStocks(walletId: string): Promise<Stock[]> {
    const result = await pool.query(
        'SELECT "stock_name", "quantity" FROM wallet_stocks WHERE "wallet_id" = $1',
        [walletId]
    );
    return result.rows.map(row => ({
        name: row.stock_name,
        quantity: row.quantity
    }));
}