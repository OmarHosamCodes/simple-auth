# simple-auth

## Simple Auth API

Endpoints:

- POST /api/register { name, email, password }
- POST /api/login { email, password }
- GET /api/profile (Bearer token required)

### Setup

1. Copy `.env.example` to `.env` and adjust values.
2. Start Postgres: `docker compose up -d`
3. Install deps: `bun install`
4. Start dev server: `bun run dev`

### Auth Flow

1. Register user -> stores hashed password (bcrypt)
2. Login -> returns JWT (1h expiry)
3. Use token in `Authorization: Bearer <token>` header for `/api/profile`

### Database

Schema is auto-created at startup (or via migrations script). Uses `pgcrypto` for UUIDs.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
