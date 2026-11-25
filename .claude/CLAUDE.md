# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

Docker / Compose learning assignments. Each `assignment-0X/` is fully self-contained (own `compose.yml`, own `package.json`s, own README); there is no root package or shared code. `assignment-02` does not exist. Both assignments publish host port `3000`, so only one can run at a time.

`docs/issues.md` (known bugs, per assignment) and `docs/progress.md` (status + log) are maintained by hand. Update them when fixing an issue or finishing work.

## Commands

Run from inside an assignment folder:

```sh
docker compose up --build        # build + start
docker compose logs -f <service>
docker compose down              # add -v to drop named volumes (assignment-01 db)
```

assignment-03 outside Docker (needs local Postgres + Redis; copy `.env.example` → `api/.env`, `web/.env.local`):

- `api/`: `npm run dev` (node `--watch`, loads `.env`), `npm start`
- `web/`: `npm run dev`, `npm run build`, `npm run lint`

There are no tests in the repo.

## Architecture

**assignment-01**: nginx (`frontend`, host 3000) → Express `backend:8000` → `postgres:15`. nginx keeps the `/api` prefix; Express mounts its router at `/api`. Its compose healthcheck is known broken (see `docs/issues.md`).

**assignment-03**: nginx (host 3000) routes `/` → `web:3000` (Next.js) and `/api/*` → `api:8000/*` with the prefix **stripped** (trailing `/` on `proxy_pass`), so Express routes have no `/api` prefix.

- The browser never calls the API directly. The Next.js page (server component) and `app/actions.js` (server action) fetch `API_URL` server-side, container-to-container (`http://api:8000`), bypassing nginx.
- `API_URL` is read at request time (`lib/api.js` + `await connection()` in `page.js`) so one built image works with any API URL. Keep it un-prefixed (no `NEXT_PUBLIC_`) and don't move reads to module/build time.
- Two networks: `frontend-network` (nginx, web, api) and `app-network` (`internal: true`: api, db, redis). db/redis are reachable only from the api.
- The api exits on boot if `DATABASE_URL`/`REDIS_URL` are unset or unreachable; it creates the `notes` table on startup (no migrations).
- Postgres data is bind-mounted at `assignment-03/postgres_data/` (gitignored). Delete it to reset the db. Never commit it.
- `web/Dockerfile` relies on `output: 'standalone'` in `next.config.mjs`; the runner stage runs `node server.js`, not `next start`.
- compose bind-mounts `./api:/app` into the api container, so it runs host source rather than the image's copy.

## Next.js version warning (from `assignment-03/web/AGENTS.md`)

Next 16 / React 19 with breaking changes versus training data (e.g. `refresh()` from `next/cache`, `connection()` from `next/server`). Read the relevant guide in `assignment-03/web/node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices. `next dev` re-adds that block to `AGENTS.md`; commit it rather than removing it.
