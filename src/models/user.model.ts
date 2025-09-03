import { pool } from "../db";

export interface User {
	id: string;
	name: string;
	email: string;
	created_at: string;
}

export const createUser = async (
	name: string,
	email: string,
	passwordHash: string,
): Promise<User> => {
	const result = await pool.query(
		`INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
		[name, email, passwordHash],
	);
	return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
	const result = await pool.query(
		`SELECT id, name, email, password_hash, created_at
     FROM users WHERE email = $1`,
		[email],
	);
	return result.rows[0] as (User & { password_hash: string }) | undefined;
};

export const findUserById = async (id: string): Promise<User | undefined> => {
	const result = await pool.query(
		`SELECT id, name, email, created_at FROM users WHERE id = $1`,
		[id],
	);
	return result.rows[0];
};
