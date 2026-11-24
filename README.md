# Assignment 03: Next.js + Express + PostgreSQL + Redis

| Service  | Dir    | Port | Needs                         |
| -------- | ------ | ---- | ----------------------------- |
| web      | `web/` | 3000 | `API_URL`                     |
| api      | `api/` | 4000 | `DATABASE_URL`, `REDIS_URL`   |
| postgres | —      | 5432 | `POSTGRES_PASSWORD`, `POSTGRES_DB` |
| redis    | —      | 6379 | —                             |

## Env vars

- `api/.env.example`: `PORT`, `DATABASE_URL`, `REDIS_URL`. API exits on boot if the DB/Redis URLs are missing or unreachable.
- `web/.env.example`: `API_URL`. Server-side only, read at **request time**, so one built image works with any API URL.

## API

- `GET /health`: pings Postgres + Redis
- `GET /visits`: increments a Redis counter
- `GET /notes`, `POST /notes` `{ "text": "..." }`: Postgres; the `notes` table is created on startup

## Scripts

- api: `npm start`, `npm run dev` (watch + loads `.env`)
- web: `npm run dev`, `npm run build`, `npm start`

## TODO (you)

- `api/Dockerfile`, `web/Dockerfile`
- `compose.yml`
