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

// export async function buyStock(walletId: string, stockName: string): Promise<void> {
//     await pool.query(
//         `
//         INSERT INTO wallet_stocks (wallet_id, stock_name, quantity) 
//         VALUES ($1, $2, 1)
//         ON CONFLICT (wallet_id, stock_name) 
//         DO UPDATE SET quantity = wallet_stocks.quantity + 1
//         `,
//         [walletId, stockName]
//     );
// }

// export async function sellStock(walletId: string, stockName: string): Promise<void> {
//     await pool.query(
//         `
//         UPDATE wallet_stocks
//         SET quantity = quantity - 1
//         WHERE wallet_id = $1 AND stock_name = $2
//         `,
//         [walletId, stockName]
//     );
// }