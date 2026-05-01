import pool from '../db';
import { Log } from '../models/types';

// export async function addLog(log: Log): Promise<void> {
//     await pool.query(
//         'INSERT INTO audit_log (type, wallet_id, stock_name) VALUES ($1, $2, $3)',
//         [log.type, log.wallet_id, log.stock_name]
//     );
// }

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
