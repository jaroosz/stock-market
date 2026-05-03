import pool from '../db/db';

export async function walletExists(walletId: string): Promise<boolean> {
    const result = await pool.query(
        'SELECT 1 FROM wallets WHERE "id" = $1',
        [walletId]
    );
    return result.rows.length > 0;
}

export async function upsertWallet(walletId: string): Promise<void> {
    await pool.query(
        'INSERT INTO wallets ("id") VALUES ($1) ON CONFLICT DO NOTHING',
        [walletId]
    );
}