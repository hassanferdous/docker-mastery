# Known Issues

Found by reading the config files on 2026-11-24. Not fixed; containers not run.

## assignment-01

1. **Backend healthcheck always fails.** `compose.yml` runs `curl -f http://localhost:3000/health`, but:
   - the server listens on `8000`, not `3000`
   - the route is `/api/health`, not `/health`
   - `node:22-alpine` doesn't include `curl`

   Fix: `wget -qO- http://localhost:8000/api/health || exit 1` (busybox `wget` is in alpine).
2. **nginx `/` serves nothing.** It points at `/usr/share/nginx/html`, and nothing is mounted there, so you get the default nginx page. Either mount a static site or drop the block.
3. **Postgres credentials hardcoded** in `compose.yml` (`user` / `password`). Fine for a lab; move them to `.env` otherwise.

## assignment-03

1. **api bind-mounts source** (`./api:/app` + anonymous `/app/node_modules`). This is a dev pattern: the container runs host code, not the built image. Remove it for a production-like setup.
2. **Unpinned / non-LTS images.** `nginx:latest` floats; `node:26-alpine` (api) and `node:lts-alpine` (web) differ. Pin both, e.g. the same Node LTS major and `nginx:1.x`.
3. **`npm install` instead of `npm ci`** in both Dockerfiles, so builds aren't locked to `package-lock.json`.
4. **web/nginx `depends_on` isn't health-gated.** The api has no healthcheck, so web and nginx can start before the api is ready. Add an api healthcheck on `/health` and `condition: service_healthy`.
5. **Postgres credentials hardcoded** in `compose.yml` (`postgres` / `postgres`).
6. **Port drift.** Under compose the api runs on `8000`; the code default and `.env.example` use `4000`. It works, but it's easy to confuse. Both values are documented in `assignment-03/README.md`.
