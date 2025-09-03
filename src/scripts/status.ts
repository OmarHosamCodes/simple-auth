import dotenv from "dotenv";
import { readdirSync } from "node:fs";
import path from "node:path";
import { pool } from "../db";

dotenv.config();

const migrationsDir = path.join(process.cwd(), "migrations");

async function run() {
	try {
		await pool.query(
			"CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, run_at TIMESTAMPTZ DEFAULT now())",
		);
		const applied = await pool.query(
			"SELECT id, run_at FROM _migrations ORDER BY id",
		);
		const files = readdirSync(migrationsDir)
			.filter((f) => /\.sql$/i.test(f))
			.sort();
		const appliedSet = new Set(applied.rows.map((r) => r.id));
		console.log("Migration status:\n");
		for (const f of files) {
			console.log(`${appliedSet.has(f) ? "[x]" : "[ ]"} ${f}`);
		}
	} finally {
		await pool.end();
	}
}

run();
