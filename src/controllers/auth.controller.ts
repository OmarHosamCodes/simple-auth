import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../middleware/auth.middleware";
import {
	createUser,
	findUserByEmail,
	findUserById,
} from "../models/user.model";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export const register = async (req: Request, res: Response) => {
	const { name, email, password } = req.body as {
		name?: string;
		email?: string;
		password?: string;
	};
	if (!name || !email || !password) {
		return res.status(400).json({
			success: false,
			error: { message: "name, email and password are required" },
		});
	}
	try {
		const hashed = await bcrypt.hash(password, SALT_ROUNDS);
		const user = await createUser(name, email, hashed);
		return res.status(201).json({ success: true, data: user });
	} catch (err: unknown) {
		if (
			typeof err === "object" &&
			err !== null &&
			(err as { code?: string }).code === "23505"
		) {
			return res
				.status(409)
				.json({ success: false, error: { message: "Email already exists" } });
		}
		console.error("Register error", err);
		return res
			.status(500)
			.json({ success: false, error: { message: "Internal server error" } });
	}
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body as { email?: string; password?: string };
	if (!email || !password) {
		return res.status(400).json({
			success: false,
			error: { message: "email and password are required" },
		});
	}
	try {
		const user = await findUserByEmail(email);
		if (!user) {
			return res
				.status(401)
				.json({ success: false, error: { message: "Invalid credentials" } });
		}
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match) {
			return res
				.status(401)
				.json({ success: false, error: { message: "Invalid credentials" } });
		}
		const token = jwt.sign(
			{ id: user.id, email: user.email, name: user.name },
			JWT_SECRET,
			{ expiresIn: "1h" },
		);
		return res.json({ success: true, data: { token } });
	} catch (err) {
		console.error("Login error", err);
		return res
			.status(500)
			.json({ success: false, error: { message: "Internal server error" } });
	}
};

export const profile = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user)
			return res
				.status(401)
				.json({ success: false, error: { message: "Unauthorized" } });
		const user = await findUserById(req.user.id);
		if (!user)
			return res
				.status(404)
				.json({ success: false, error: { message: "User not found" } });
		return res.json({ success: true, data: user });
	} catch (err) {
		console.error("Profile error", err);
		return res
			.status(500)
			.json({ success: false, error: { message: "Internal server error" } });
	}
};
