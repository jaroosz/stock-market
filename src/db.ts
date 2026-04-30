/**
 * Database Configuration
 * 
 * This module sets up and manages a PostgreSQL connection pool using the 'pg' library.
 * 
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const sql = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
const pool = new Pool({
    user:       process.env.DB_USER,
    host:       process.env.DB_HOST,
    database:   process.env.DB_NAME,
    password:   process.env.DB_PASSWORD,
    port:       Number(process.env.DB_PORT),
})

async function verifyConnection(): Promise<void> {
    try {
        const client = await pool.connect();
        client.release();
        console.log('Connected to PostgreSQL database');
    } catch (error) {
        console.error('Error: ', error);
    }
}

async function initializeDatabase(): Promise<void> {
    try {
        await pool.query(sql);
        console.log("Database created");
    } catch (error) {
        console.error("Error: ", error);
    }
}

async function main() {
    await verifyConnection();
    await initializeDatabase();
}

main();

export default pool;