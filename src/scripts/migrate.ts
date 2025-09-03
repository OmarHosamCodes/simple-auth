import dotenv from "dotenv";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pool } from "../db";

dotenv.config();

const migrationsDir = path.join(process.cwd(), "migrations");

async function run() {
	try {
		await pool.query(
			"CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, run_at TIMESTAMPTZ DEFAULT now())",
		);
		const files = readdirSync(migrationsDir)
			.filter((f) => /\.sql$/i.test(f))
			.sort();
		for (const file of files) {
			const id = file;
			const exists = await pool.query("SELECT 1 FROM _migrations WHERE id=$1", [
				id,
			]);
			if (exists.rowCount) continue;
			const sql = readFileSync(path.join(migrationsDir, file), "utf8");
			console.log(`Applying migration ${file}...`);
			await pool.query("BEGIN");
			try {
				await pool.query(sql);
				await pool.query("INSERT INTO _migrations (id) VALUES ($1)", [id]);
				await pool.query("COMMIT");
				console.log(`✔ Applied ${file}`);
			} catch (err) {
				await pool.query("ROLLBACK");
				console.error(`✖ Failed ${file}`, err);
				process.exit(1);
			}
		}
		console.log("All migrations up to date.");
	} finally {
		await pool.end();
	}
}

run();
