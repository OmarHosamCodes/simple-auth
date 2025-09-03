import dotenv from "dotenv";
import express from "express";
import { initDb } from "./db";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", authRoutes);

const port = process.env.PORT || 8080;

const start = async () => {
	try {
		await initDb();
		app.listen(port, () => {
			console.log(`Auth API listening on :${port}`);
		});
	} catch (e) {
		console.error("Failed to start server", e);
		process.exit(1);
	}
};

start();
