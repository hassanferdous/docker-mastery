# Challenge 2 — DNS failure

## Network inspection output

```bash docker inspect network assignment-03_frontend-network
[
    {
        "Name": "assignment-03_frontend-network",
        "Id": "e70ea31c18bf6ba9f030546b9efcd7c41472b0daaaa380f1c7d9d81d3dd7fc34",
        "Created": "2026-11-25T09:19:59.612961966Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv4": true,
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.19.0.0/16",
                    "Gateway": "172.19.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Options": {
            "com.docker.network.enable_ipv4": "true",
            "com.docker.network.enable_ipv6": "false"
        },
        "Labels": {
            "com.docker.compose.config-hash": "3d96143d170a4d2398f2b5ec5a28e2628581681fce2e676d2c7605a406852de8",
            "com.docker.compose.network": "frontend-network",
            "com.docker.compose.project": "assignment-03",
            "com.docker.compose.version": "5.3.1"
        },
        "Containers": {
            "1b9cb604e7c779c2bd2a37e4fd8f63d5717112d1a9fc1d2935a7779bdd8055d5": {
                "Name": "assignment-03-web-1",
                "EndpointID": "3ab226eabd3c130e1d5421ec210770b2898abc580784144d4734abc762b25b4d",
                "MacAddress": "66:b0:e8:ce:59:2c",
                "IPv4Address": "172.19.0.3/16",
                "IPv6Address": ""
            },
            "35bee4d66a4a1968c0f997569c58dbda19d73d275380e2e0c52bb07392fcac82": {
                "Name": "assignment-03-api-1",
                "EndpointID": "7ca1d3ef3ec0e02def753290f8e0e27c771a4a17585a8fe7a8bb34936fac16b5",
                "MacAddress": "86:68:c4:23:3e:c5",
                "IPv4Address": "172.19.0.2/16",
                "IPv6Address": ""
            },
            "52ae1c75df7a8bdb384e7ab5293364ffb0f063a5bd92e439872f21abfe03457e": {
                "Name": "assignment-03-nginx-1",
                "EndpointID": "7d44a8ecd130466dcf28323454eeddc58cc5952f4fce6333870ee6e443864c55",
                "MacAddress": "82:02:b5:e7:7f:b6",
                "IPv4Address": "172.19.0.4/16",
                "IPv6Address": ""
            }
        },
        "Status": {
            "IPAM": {
                "Subnets": {
                    "172.19.0.0/16": {
                        "IPsInUse": 6,
                        "DynamicIPsAvailable": 65530
                    }
                }
            }
        }
    }
]
error: no such object: network
```

## DNS resolution output

```bash docker compose exec nginx getent hosts api
172.19.0.2      api

```

## Explanation

The DNS resolution is working here because the both containers are sharing a common network named frontend-network. Because of the shared network services can communicate with each other using the service name as the hostname.
