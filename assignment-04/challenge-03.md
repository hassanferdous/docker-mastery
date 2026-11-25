# Challenge 3 — Network Connectivity Check

A debug container was attached to each network in turn and `nc -zv <host> <port>` was run against every service.

| Network            | Members         |
| ------------------ | --------------- |
| `frontend-network` | nginx, web, api |
| `app-network`      | api, db, redis  |

`api` is the only service on both networks.

## Results

| Target       | From `frontend-network` | From `app-network`         |
| ------------ | ----------------------- | -------------------------- |
| `api:8000`   | ✅ Connected            | ✅ Connected               |
| `web:3000`   | ✅ Connected            | ❌ DNS fails (`Try again`) |
| `db:5432`    | ❌ DNS fails            | ✅ Connected               |
| `redis:6379` | ❌ DNS fails            | ❌ DNS fails (`Try again`) |

## Frontend Network

Debug container: `f92da41f106f`

```bash
$ nc -zv api 8000
Connection to api (172.19.0.2) 8000 port [tcp/*] succeeded!

$ nc -zv web 3000
Connection to web (172.19.0.3) 3000 port [tcp/*] succeeded!

$ nc -zv db 5432
nc: getaddrinfo for host "db" port 5432: Name does not resolve

$ nc -zv redis 6379
nc: getaddrinfo for host "redis" port 6379: Name does not resolve
```

- `api` and `web` resolve and accept connections — they are on `frontend-network`.
- `db` and `redis` fail at **DNS**, not at connect: they are not on this network, so Docker's embedded DNS has no record for them.

## App Network

Debug container: `719301c93d01`

```bash
$ nc -zv api 8000
Connection to api (172.18.0.5) 8000 port [tcp/*] succeeded!

$ nc -zv db 5432
Connection to db (172.18.0.3) 5432 port [tcp/postgresql] succeeded!

$ nc -zv db 6379
nc: connect to db (172.18.0.3) port 6379 (tcp) failed: Connection refused

$ nc -zv web 3000
nc: getaddrinfo for host "web" port 3000: Try again
```

- `api` and `db` resolve and accept connections — they are on `app-network`.
- `web` fails at **DNS**: it is not on this network.
- `db 6379` → `Connection refused`: `db` resolves, but nothing listens on 6379 in the Postgres container. This checks the wrong host — the intended check is `nc -zv redis 6379`.

> **Note:** re-run `nc -zv redis 6379` from the app-network debug container and replace the `db 6379` result. Expected: `succeeded!`, since redis is on `app-network`.

## Explanation

1. **Service discovery is per network.** Docker's embedded DNS (`127.0.0.11`) only resolves names of containers that share a network with the caller. A service on another network gives a DNS error (`Name does not resolve` / `Try again`), not a connection error.
2. **Two failure types mean different things.**
    - `getaddrinfo ... failed` → the name can't be resolved; the target is not on a shared network.
    - `Connection refused` → the name resolves and the host is reachable, but no process listens on that port.
3. **The api is the bridge.** It sits on both networks, so it reaches `db`/`redis` on `app-network` and is reached by `nginx`/`web` on `frontend-network`. `web` and `nginx` can never talk to `db`/`redis` directly — the data tier is isolated from the edge tier.
4. **Same container, different IPs.** `api` is `172.19.0.2` on `frontend-network` and `172.18.0.5` on `app-network` — one interface per attached network.
