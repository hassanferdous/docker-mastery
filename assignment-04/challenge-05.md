# Challenge 5 — Root Cause Report

**Incident:** Nginx returns 502 on /api/\* after upstream port change (Challenge 4)
**Stack:** `assignment-03` (nginx → api → db / redis)

## Problem

I had intentionally changed the nginx upstream proxy_pass port from 8000 to 8100 in `/etc/nginx/sites-available/default` file. And then I reloaded the nginx configuration using the command `docker compose exec nginx nginx -s reload`. After that, I tried to access the api endpoint using the command `curl -i http://localhost:3000/api/health`. But it returned 502 bad gateway error.

## Symptoms

```bash
curl -i http://localhost:3000/api/health
HTTP/1.1 502 Bad Gateway
Server: nginx/1.31.10
Date: Wed, 25 Nov 2026 11:06:40 GMT
Content-Type: text/html
Content-Length: 158
Connection: keep-alive

<html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.31.10</center>
</body>
</html>
```

## Commands Used

| #   | Command                                      | Purpose                                                        |
| --- | -------------------------------------------- | -------------------------------------------------------------- |
| 1   | `docker compose ps -a`                       | Check container state / health                                 |
| 2   | `docker compose logs --tail=100 nginx`       | Upstream errors from Nginx                                     |
| 3   | `docker compose logs --tail=100 api`         | Confirm api is up and listening port                           |
| 4   | `docker compose exec nginx getent hosts api` | Confirm DNS resolves `api`                                     |
| 5   | `docker compose exec nginx nginx -T`         | Dump effective Nginx config                                    |
| 6   | `nc -zv api 8100`                            | Connectivity test                                              |
| 7   | `nc -zv localhost 8000`                      | Confirm app is listening on port 8000 (inside nginx container) |

## Investigation

<!-- Step by step: command → output → what it ruled in/out. -->

### 1. Container state

```bash
docker compose ps
NAME                    IMAGE               COMMAND                  SERVICE   CREATED          STATUS                    PORTS
assignment-03-api-1     assignment-03-api   "docker-entrypoint.s…"   api       47 seconds ago   Up 41 seconds (healthy)   8000/tcp
assignment-03-db-1      postgres:17         "docker-entrypoint.s…"   db        2 hours ago      Up 47 seconds (healthy)   5432/tcp
assignment-03-nginx-1   nginx:latest        "/docker-entrypoint.…"   nginx     2 hours ago      Up 36 seconds             0.0.0.0:3000->80/tcp, [::]:3000->80/tcp
assignment-03-redis-1   redis:7             "docker-entrypoint.s…"   redis     2 hours ago      Up 47 seconds (healthy)   6379/tcp
assignment-03-web-1     assignment-03-web   "docker-entrypoint.s…"   web       2 hours ago      Up 36 seconds             3000/tcp             running             6379/tcp
```

### 2. Nginx logs

```bash
$ docker compose logs --tail=6 nginx
nginx-1  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
nginx-1  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
nginx-1  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
nginx-1  | /docker-entrypoint.sh: Configuration complete; ready for start up
nginx-1  | 2026/11/26 07:16:39 [error] 53#53: *1 connect() failed (111: Connection refused) while connecting to upstream, client: 192.168.65.1, server: localhost, request: "GET /api/health HTTP/1.1", upstream: "http://172.19.0.2:8100/health", host: "localhost:3000"
nginx-1  | 192.168.65.1 - - [26/Nov/2026:07:16:39 +0000] "GET /api/health HTTP/1.1" 502 158 "-" "curl/8.7.1"

```

<!-- Finding: -->

### 3. API logs

```bash
$ docker compose logs --tail=6 api
api-1  |
api-1  | > assignment-03@1.0.0 start
api-1  | > node index.js
api-1  |
api-1  | API listening on port 8000

```

<!-- Finding: -->

### 4. DNS resolution

```bash
$ docker compose exec nginx getent hosts api
172.19.0.2      api

```

<!-- Finding: -->

### 5. Port connectivity

```bash
$ nc -zv api 8100
nc: connect to api (172.18.0.4) port 8100 (tcp) failed: Connection refused

$ nc -zv api 8000
Connection to api (172.18.0.4) 8000 port [tcp/*] succeeded!

```

<!-- Finding: -->

### 6. Nginx config

```bash
$ docker compose exec nginx nginx -T | grep proxy_pass
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
            proxy_pass http://api:8100/;
            proxy_pass http://web:3000;

```

## Root Cause

The API service is listening on port 8000 inside the container, but Nginx is configured to proxy requests to port 8100.

## Fix

I updated the nginx configuration file to use the correct port 8000 for the API proxy_pass.

```diff
-            proxy_pass http://api:8100/;
+            proxy_pass http://api:8000/;
```

```bash
$ docker compose exec nginx nginx -t
$ docker compose exec nginx nginx -s reload
```

## Verification

```bash
$ curl -i http://localhost:3000/api/health
HTTP/1.1 200 OK
Server: nginx/1.31.10
Date: Wed, 25 Nov 2026 11:26:41 GMT
Content-Type: application/json
Content-Length: 36
Connection: keep-alive

{"status":"ok"}

```
