# Assignment 01: Express + PostgreSQL behind nginx

```sh
docker compose up --build
```

API at http://localhost:3000/api/. nginx is the only service published to the host.

## Services

| Service  | Source / image       | Internal port    | Networks               |
| -------- | -------------------- | ---------------- | ---------------------- |
| frontend | `nginx:stable`       | 80 → host `3000` | `frontend`             |
| backend  | `./Dockerfile` (`node:22-alpine`) | 8000 | `frontend`, `backend` |
| db       | `postgres:15`        | 5432             | `backend`              |

## Routing (`nginx.conf`)

- `/api/*` → `backend:8000/api/*` (prefix kept)
- `/` → static files from `/usr/share/nginx/html`

## API

- `GET /api/`: `Hello World!`
- `GET /api/health`: `OK`

The server logs whether it can reach Postgres on startup (`SELECT NOW()`); it doesn't exit on failure.

## Config

- backend: `DB_URI=postgresql://user:password@db:5432/challenge-db`
- db: `POSTGRES_USER=user`, `POSTGRES_PASSWORD=password`, `POSTGRES_DB=challenge-db`
- Data in named volume `postgres_data` (`docker compose down -v` to reset)

## Startup order

backend waits for db's `pg_isready` healthcheck; frontend waits for backend (start order only).

Known issues: [docs/issues.md](../docs/issues.md#assignment-01)
