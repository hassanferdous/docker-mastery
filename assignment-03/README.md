# Assignment 03: Next.js + Express + PostgreSQL + Redis

```sh
docker compose up --build
```

Open http://localhost:3000. nginx is the only service published to the host.

## Services

| Service | Source / image      | Internal port | Networks                      |
| ------- | ------------------- | ------------- | ----------------------------- |
| nginx   | `nginx:latest`      | 80 → host `3000` | `frontend-network`         |
| web     | `web/` (Next.js)    | 3000          | `frontend-network`            |
| api     | `api/` (Express)    | 8000          | `frontend-network`, `app-network` |
| db      | `postgres:17`       | 5432          | `app-network`                 |
| redis   | `redis:7`           | 6379          | `app-network`                 |

## Routing

- `/` → `web:3000`
- `/api/*` → `api:8000/*` (prefix stripped, e.g. `/api/health` → `/health`)

## Networks

- `frontend-network`: nginx, web, api
- `app-network`: api, db, redis. `internal: true`, so db and redis have no outside access and are reachable only from the api.

## Startup order

api waits for db (`pg_isready`) and redis (`redis-cli ping`) healthchecks. The api has its own healthcheck (`curl -f localhost:8000/health`, which checks Postgres + Redis); web waits for it to be healthy. nginx waits for web (start order only), so it comes up after the api is healthy.

## Data

Postgres data is bind-mounted to `./postgres_data` (gitignored). Delete it to reset the database.

## Env vars

| Service | Var            | Compose value                                          | Local default (`.env.example`) |
| ------- | -------------- | ------------------------------------------------------ | ------------------------------ |
| api     | `PORT`         | `8000`                                                 | `8000`                         |
| api     | `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/assignment03`  | `postgres://postgres:postgres@localhost:5432/app` |
| api     | `REDIS_URL`    | `redis://redis:6379`                                   | `redis://localhost:6379`       |
| web     | `API_URL`      | `http://api:8000`                                      | `http://localhost:8000`        |

- The api exits on boot if `DATABASE_URL` / `REDIS_URL` are missing or unreachable.
- `API_URL` is server-side only and read at **request time**, so one built image works with any API URL.

## API

- `GET /health`: pings Postgres + Redis
- `GET /visits`: increments a Redis counter
- `GET /notes`, `POST /notes` `{ "text": "..." }`: Postgres; the `notes` table is created on startup

## Images

- `api/Dockerfile`: `node:26-alpine`, `npm install`, `npm run start`
- `web/Dockerfile`: multi-stage (deps → builder → runner) on `node:lts-alpine`, using Next.js `output: 'standalone'`; runs `node server.js`

## Local dev (without Docker)

Copy `api/.env.example` → `api/.env` and `web/.env.example` → `web/.env.local`, with Postgres and Redis running locally.

- api: `npm run dev` (watch + loads `.env`), `npm start`
- web: `npm run dev`, `npm run build`, `npm start`

Known issues: [docs/issues.md](../docs/issues.md#assignment-03)
