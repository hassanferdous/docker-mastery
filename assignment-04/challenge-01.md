# Challenge 1 — Container failure

Output of the ps, logs and nginx response are given below:

## ps

```bash docker compose ps -a
NAME                    IMAGE               COMMAND                  SERVICE   CREATED              STATUS                        PORTS
assignment-03-api-1     assignment-03-api   "docker-entrypoint.s…"   api       About a minute ago   Exited (1) 54 seconds ago
assignment-03-db-1      postgres:17         "docker-entrypoint.s…"   db        About a minute ago   Up About a minute (healthy)   5432/tcp
assignment-03-nginx-1   nginx:latest        "/docker-entrypoint.…"   nginx     About a minute ago   Up About a minute             0.0.0.0:3000->80/tcp, [::]:3000->80/tcp
assignment-03-redis-1   redis:7             "docker-entrypoint.s…"   redis     About a minute ago   Up About a minute (healthy)   6379/tcp
assignment-03-web-1     assignment-03-web   "docker-entrypoint.s…"   web       About a minute ago   Up About a minute             3000/tcp                                                     db
```

## logs

```bash docker compose logs --tail=100 api
api-1  |
api-1  | > assignment-03@1.0.0 start
api-1  | > node index.js
api-1  |
api-1  | API listening on port 8000
api-1  | npm error path /app
api-1  | npm error command failed
api-1  | npm error signal SIGTERM
api-1  | npm error command sh -c node index.js
api-1  | npm error A complete log of this run can be found in: /root/.npm/_logs/2026-11-25T09_20_06_299Z-debug-0.log
```

## Nginx response.

```bash curl -i http://localhost:3000/api/health
HTTP/1.1 502 Bad Gateway
Server: nginx/1.31.10
Date: Wed, 25 Nov 2026 09:29:06 GMT
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

## Explanation

```plain The api service is status is exited which means the container is not running that is why the nginx service is returning 502 Bad Gateway error. So the final answer is the api service is not running.

```
