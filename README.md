# Docker Mastery

Hands-on Docker / Docker Compose assignments. Each assignment is a self-contained folder with its own `compose.yml` and README.

| Assignment                         | Stack                                              | Entry point             |
| ---------------------------------- | -------------------------------------------------- | ----------------------- |
| [assignment-01](./assignment-01/)  | Express + PostgreSQL 15, nginx reverse proxy       | http://localhost:3000/api/ |
| [assignment-03](./assignment-03/)  | Next.js + Express + PostgreSQL 17 + Redis 7, nginx | http://localhost:3000   |

## Prerequisites

- Docker Engine / Docker Desktop with Compose v2 (`docker compose`)
- Node.js only if running services outside Docker

## Running an assignment

```sh
cd assignment-0X
docker compose up --build      # start
docker compose down            # stop
docker compose down -v         # stop + drop named volumes
```

Only one assignment can run at a time: both bind host port `3000`.

## Repo layout

```
assignment-01/   # single-service API + db + nginx
assignment-03/   # multi-service app (web, api, db, redis, nginx)
docs/
  progress.md    # what's done / next
  issues.md      # known issues per assignment
```
