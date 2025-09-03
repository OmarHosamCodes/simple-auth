import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { pool } from "../db";

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

async function run() {
	try {
		const password = "password123";
		const hash = await bcrypt.hash(password, SALT_ROUNDS);
		const email = "demo@example.com";
		const name = "Demo User";
		await pool.query(
			`INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
			[name, email, hash],
		);
		console.log("Seed complete. Demo user:");
		console.log({ email, password });
	} finally {
		await pool.end();
	}
}

run();
