import express from "express";
import authRoutes from "./routes/auth.routes";

export const createApp = () => {
	const app = express();
	app.use(express.json());

	app.get("/health", (_req, res) => {
		res.json({ status: "ok", timestamp: new Date().toISOString() });
	});

	app.use("/api", authRoutes);

	return app;
};

export type AppType = ReturnType<typeof createApp>;
