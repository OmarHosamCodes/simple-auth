## simple-auth

Minimal authentication API (Express + Bun + Postgres + JWT + bcrypt).

## Quick Start

```bash
# 1. Clone & enter folder
git clone https://github.com/OmarHosamCodes/simple-auth && cd simple-auth

# 2. Copy env file & adjust if needed
cp .env.example .env

# 3. Start Postgres (detached)
docker compose up -d

# 4. Install dependencies
bun install

# 5. Run migrations (creates tables)
bun run db:migrate

# 6. Start dev server (auto‑reload)
bun run dev

# API now on: http://localhost:${PORT:-8080}
```

Health check: http://localhost:8080/health

## Prerequisites

- Bun 1.x (`curl -fsSL https://bun.sh/install | bash`)
- Docker & docker compose plugin
- (Optional) psql client for manual DB inspection

## Environment Variables (`.env`)

| Name               | Default (example)                                       | Purpose                             |
| ------------------ | ------------------------------------------------------- | ----------------------------------- |
| PORT               | 8080                                                    | HTTP port                           |
| DATABASE_URL       | postgres://postgres:postgres@localhost:5432/simple_auth | Postgres connection string          |
| JWT_SECRET         | supersecretjwtkeychangeme                               | JWT signing secret (change in prod) |
| BCRYPT_SALT_ROUNDS | 10                                                      | Work factor for password hashing    |

Never commit real secrets. For production, rotate `JWT_SECRET` and use a stronger password / managed secret store.

## Running the Server

Two common options:

1. Bun watch (default): `bun run dev` (script = `bun run --watch src/server.ts`).
2. Nodemon (if you prefer): `bun run dev:nodemon` (uses `nodemonConfig` in `package.json`).

Build TypeScript only (no start): `bun run build` (outputs to `dist/` if configured in `tsconfig.json`).

## Database & Migrations

The project uses a very small custom migration runner (see `src/scripts/migrate.ts`). Migrations live in `migrations/` and are applied once (tracked in `_migrations`). Extension `pgcrypto` is enabled automatically so UUID generation (`gen_random_uuid()`) works.

Scripts:

- Apply new migrations: `bun run db:migrate`
- Show status (lists applied/total): `bun run db:status`
- Seed data (if implemented): `bun run db:seed`
- Drop all objects: `bun run db:drop`
- Reset (drop + migrate + seed): `bun run db:reset`

On first start the table can also be created by the app (`initDb()`), but running the migration script explicitly is recommended to keep history consistent.

## REST Endpoints

| Method | Path          | Body                      | Auth         | Description          |
| ------ | ------------- | ------------------------- | ------------ | -------------------- |
| POST   | /api/register | { name, email, password } | None         | Create account       |
| POST   | /api/login    | { email, password }       | None         | Obtain JWT           |
| GET    | /api/profile  | –                         | Bearer token | Current user profile |
| GET    | /health       | –                         | None         | Liveness probe       |

### Sample Requests

Register:

```bash
curl -X POST http://localhost:8080/api/register \
	-H 'Content-Type: application/json' \
	-d '{"name":"Ada","email":"ada@example.com","password":"correct horse"}'
```

Login:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"ada@example.com","password":"correct horse"}' | jq -r '.data.token')
```

Profile:

```bash
curl http://localhost:8080/api/profile -H "Authorization: Bearer $TOKEN"
```

### Auth Flow

1. User registers → password hashed with bcrypt (`BCRYPT_SALT_ROUNDS`).
2. User logs in → JWT issued (1h expiry, HS256) with `id`, `email`, `name` claims.
3. Protected routes require `Authorization: Bearer <token>` header; middleware rejects invalid/expired tokens.

## Testing

Jest script stubs exist (`bun run test`) but no test files are currently included. Add tests under `tests/` (e.g. `tests/auth.spec.ts`) and ensure they load env (`--env-file=.env.development` already configured). If you don't need Jest, remove the script to keep things lean.

## Lint / Format

Using Biome:

```bash
bun run check        # check only
bun run check:write  # apply safe fixes
bun run check:unsafe # apply all fixes (including potentially unsafe)
```

## Production Notes

- Use a dedicated database & secure credentials (never the example password).
- Set a strong `JWT_SECRET` (>=32 random bytes) and rotate periodically.
- Consider enabling SSL on Postgres & using connection pooling (e.g. pgbouncer) if load increases.
- Add rate limiting (e.g. `express-rate-limit`) and request logging (e.g. `morgan`) as next steps.

## Troubleshooting

| Issue                             | Likely Cause          | Fix                            |
| --------------------------------- | --------------------- | ------------------------------ |
| `DATABASE_URL not set`            | Missing `.env`        | Copy `.env.example` → `.env`   |
| Connection refused                | DB not running        | `docker compose up -d`         |
| `relation "users" does not exist` | Migrations not run    | `bun run db:migrate`           |
| 401 on /api/profile               | Missing/expired token | Re-login & resend Bearer token |

## Minimal Program Entry

There is also a simple `index.ts` (created by `bun init`). The real API entrypoint is `src/server.ts` (used by the `dev` script). You can run the minimal file with:

```bash
bun run index.ts
```
