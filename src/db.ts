import dotenv from "dotenv";
import { Pool } from "pg";

// Load env early
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL not set");
}

export const pool = new Pool({ connectionString });

/**
 * Initialize database infrastructure required by the app.
 * - Ensures pgcrypto extension (for gen_random_uuid())
 * - Ensures users table exists
 */
export const initDb = async () => {
	await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
	await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);
};
