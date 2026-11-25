# Challenge 5 — Root Cause Report

**Incident:** <!-- e.g. Nginx returns 502 on /api/* after upstream port change (Challenge 4) -->
**Date:** <!-- YYYY-MM-DD -->
**Stack:** `assignment-03` (nginx → api → db / redis)

## Problem

<!-- One or two sentences: what broke, for whom, since when. -->

## Symptoms

<!-- What was observed from the outside. Paste the evidence. -->

```bash
$ curl -i http://localhost:3000/api/health

```

- <!-- e.g. HTTP status returned -->
- <!-- e.g. what still works (web on /) vs what doesn't (/api/*) -->

## Commands Used

| #   | Command | Purpose |
| --- | ------- | ------- |
| 1   | `docker compose ps -a` | Check container state / health |
| 2   | `docker compose logs --tail=100 nginx` | Upstream errors from Nginx |
| 3   | `docker compose logs --tail=100 api` | Confirm api is up and listening port |
| 4   | `docker compose exec nginx getent hosts api` | Confirm DNS resolves `api` |
| 5   | `docker compose exec nginx nginx -T` | Dump effective Nginx config |
| 6   | <!-- connectivity test, e.g. nc -zv api <port> --> | <!-- --> |

## Investigation

<!-- Step by step: command → output → what it ruled in/out. -->

### 1. Container state

```bash
$ docker compose ps -a

```

<!-- Finding: -->

### 2. Nginx logs

```bash
$ docker compose logs --tail=100 nginx

```

<!-- Finding: -->

### 3. API logs

```bash
$ docker compose logs --tail=100 api

```

<!-- Finding: -->

### 4. DNS resolution

```bash
$ docker compose exec nginx getent hosts api

```

<!-- Finding: -->

### 5. Port connectivity

```bash
$ nc -zv api <configured-port>

$ nc -zv api 8000

```

<!-- Finding: -->

### 6. Nginx config

```bash
$ docker compose exec nginx nginx -T | grep proxy_pass

```

<!-- Finding: -->

## Root Cause

<!-- The single underlying cause, not the symptom. File + line if config. -->

## Fix

<!-- What was changed. Show the diff. -->

```diff
-
+
```

```bash
$ docker compose exec nginx nginx -t
$ docker compose exec nginx nginx -s reload
```

## Verification

```bash
$ curl -i http://localhost:3000/api/health

```

- <!-- Expected vs actual status -->
- <!-- Nginx logs clean after reload? -->

## Prevention (optional)

- <!-- e.g. healthcheck on nginx hitting /api/health, single source of truth for API port -->
