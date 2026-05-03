import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user:     process.env.DB_USER,
    host:     process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port:     Number(process.env.DB_PORT),
});

export async function clearDatabase(): Promise<void> {
    await pool.query('DELETE FROM audit_log');
    await pool.query('DELETE FROM wallet_stocks');
    await pool.query('DELETE FROM wallets');
    await pool.query('DELETE FROM bank_stocks');
}

export async function closePool(): Promise<void> {
    await pool.end();
}

export default pool;