import dotenv from "dotenv";
import { createApp } from "./app";
import { initDb } from "./db";

dotenv.config();

const port = process.env.PORT || 8080;

const start = async () => {
	try {
		await initDb();
		const app = createApp();
		app.listen(port, () => {
			console.log(`Auth API listening on :${port}`);
		});
	} catch (e) {
		console.error("Failed to start server", e);
		process.exit(1);
	}
};

// Only auto-start when executed directly (not when imported in tests)
if (import.meta.main) {
	start();
}

export { start };
