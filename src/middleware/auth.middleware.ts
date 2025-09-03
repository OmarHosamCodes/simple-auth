import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
	user?: { id: string; email: string; name: string };
}

export const requireAuth = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({
			success: false,
			error: { message: "Missing Authorization header" },
		});
	}
	const token = authHeader.substring("Bearer ".length);
	try {
		const secret = process.env.JWT_SECRET || "devsecret";
		const decoded = jwt.verify(token, secret) as {
			id: string;
			email: string;
			name: string;
			iat: number;
			exp: number;
		};
		req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
		next();
	} catch (_err) {
		return res
			.status(401)
			.json({ success: false, error: { message: "Invalid or expired token" } });
	}
};
