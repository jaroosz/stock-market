import pool from '../db';
import { Log } from '../models/types';

export async function getAllLogs(): Promise<Log[]> {
    const result = await pool.query(
        'SELECT "type", "wallet_id", "stock_name" FROM audit_log ORDER BY id'
    );
    return result.rows.map(row => ({
        type: row.type,
        wallet_id: row.wallet_id,
        stock_name: row.stock_name
    }));
}
