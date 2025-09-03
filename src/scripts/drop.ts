import dotenv from "dotenv";
import { pool } from "../db";

dotenv.config();

async function run() {
	try {
		await pool.query("DROP TABLE IF EXISTS users CASCADE");
		await pool.query("DROP TABLE IF EXISTS _migrations CASCADE");
		console.log("Dropped tables.");
	} finally {
		await pool.end();
	}
}

run();
