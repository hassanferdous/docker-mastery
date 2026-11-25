# Challenge 4 — Nginx Failure

The API upstream in `assignment-03/nginx/nginx.conf` was temporarily changed to a wrong port, Nginx was reloaded, and the failure was diagnosed.

## Broken config

```diff
 location /api/ {
-    proxy_pass http://api:8000/;
+    proxy_pass http://api:8100/;
```

```bash
$ docker compose exec nginx nginx -t

$ docker compose exec nginx nginx -s reload

```

## Nginx response

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

## Diagnosis

### Nginx logs

````bash
docker compose logs --tail=10 nginx
nginx-1  | 192.168.65.1 - - [25/Nov/2026:09:28:35 +0000] "GET /api/health HTTP/1.1" 502 158 "-" "curl/8.7.1"
nginx-1  | 2026/11/25 09:28:35 [error] 29#29: *1 connect() failed (113: No route to host) while connecting to upstream, client: 192.168.65.1, server: localhost, request: "GET /api/health HTTP/1.1", upstream: "http://172.19.0.2:8000/health", host: "localhost:3000"
nginx-1  | 2026/11/25 09:29:06 [error] 29#29: *3 connect() failed (113: No route to host) while connecting to upstream, client: 192.168.65.1, server: localhost, request: "GET /api/health HTTP/1.1", upstream: "http://172.19.0.2:8000/health", host: "localhost:3000"
nginx-1  | 192.168.65.1 - - [25/Nov/2026:09:29:06 +0000] "GET /api/health HTTP/1.1" 502 158 "-" "curl/8.7.1"
nginx-1  | 192.168.65.1 - - [25/Nov/2026:10:55:18 +0000] "GET /api/health HTTP/1.1" 502 158 "-" "curl/8.7.1"
nginx-1  | 2026/11/25 10:55:18 [error] 62#62: *5 connect() failed (111: Connection refused) while connecting to upstream, client: 192.168.65.1, server: localhost, request: "GET /api/health HTTP/1.1", upstream: "http://172.19.0.2:8100/health", host: "localhost:3000"
nginx-1  | 2026/11/25 10:55:33 [error] 62#62: *7 connect() failed (111: Connection refused) while connecting to upstream, client: 192.168.65.1, server: localhost, request: "GET /api/health HTTP/1.1", upstream: "http://172.19.0.2:8100/health", host: "localhost:3000"
nginx-1  | 192.168.65.1 - - [25/Nov/2026:10:55:33 +0000] "GET /api/health HTTP/1.1" 502 158 "-" "curl/8.7.1"
nginx-1  | 2026/11/25 11:06:40 [error] 62#62: *9 connect() failed (111: Connection refused) while connecting to upstream, client: 192.168.65.1, server: localhost, request: "GET /api/health HTTP/1.1", upstream: "http://172.19.0.2:8100/health", host: "localhost:3000"
nginx-1  | 192.168.65.1 - - [25/Nov/2026:11:06:40 +0000] "GET /api/health HTTP/1.1" 502 158 "-" "curl/8.7.1"


### API logs

```bash
$ docker compose logs --tail=50 api

````

<!-- Which port does the api actually listen on? -->

### DNS resolution

```bash
docker compose exec nginx getent hosts api
172.19.0.2      api

```

<!-- Does `api` still resolve? -->

### Connectivity tests

```bash
docker run --rm -it --network assignment-03_app-network nicolaka/netshoot
                    dP            dP                           dP
                    88            88                           88
88d888b. .d8888b. d8888P .d8888b. 88d888b. .d8888b. .d8888b. d8888P
88'  `88 88ooood8   88   Y8ooooo. 88'  `88 88'  `88 88'  `88   88
88    88 88.  ...   88         88 88    88 88.  .88 88.  .88   88
dP    dP `88888P'   dP   `88888P' dP    dP `88888P' `88888P'   dP

Welcome to Netshoot! (github.com/nicolaka/netshoot)
Version: v0.17
 ad9d98baf7ee  ~  nc -zv api 8100
nc: connect to api (172.18.0.5) port 8100 (tcp) failed: Connection refused

 ad9d98baf7ee  ~  nc -zv api 8000
Connection to api (172.18.0.5) 8000 port [tcp/*] succeeded!

 ad9d98baf7ee  ~ 

```

| Target     | Result             |
| ---------- | ------------------ |
| `api:8100` | Connection refused |
| `api:8000` |                    |

## Restore

```diff
 location /api/ {
-    proxy_pass http://api:8100/;
+    proxy_pass http://api:8000/;
```

```bash
$ docker compose exec nginx nginx -t

$ docker compose exec nginx nginx -s reload

$ curl -i http://localhost:3000/api/health

```

## Explanation

1. **Symptom:** nginx returned a **502 Bad Gateway** because it was unable to connect to the backend API.
2. **What was ruled out:** **containers up, DNS resolves, networks shared**
3. **Where it fails:** `nc` shows the API is listening on port 8000, but Nginx is trying to connect to port 8100.
4. **Root cause:** `proxy_pass` port does not match the port the api listens on
5. **Fix:** port restored, reload, 200 OK
