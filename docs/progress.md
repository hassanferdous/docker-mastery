# Progress

Last updated: 2026-11-25

## Status

| Assignment    | Status | Notes |
| ------------- | ------ | ----- |
| assignment-01 | Done (with open issues) | Healthcheck broken, see [issues](./issues.md#assignment-01) |
| assignment-02 | Not in repo | No folder; status unknown |
| assignment-03 | Done (with open issues) | Dockerfiles + compose complete (`7489a26`); issues 4 and 6 fixed 2026-11-25 (not yet run). See [issues](./issues.md#assignment-03) |

## Log

- `7489a26`: assignment-03 Dockerfiles (api, multi-stage web), `compose.yml`, nginx proxy
- `940c1c4`: restructured repo into per-assignment folders; added assignment-01
- 2026-11-24: READMEs rewritten (root index + per-assignment); added `docs/issues.md` and `docs/progress.md`
- 2026-11-25 (uncommitted): assignment-03 api healthcheck + health-gated web `depends_on`, `restart` on web (issue 4); api/web port unified on `8000` (issue 6); `api/index.js` reformatted (tabs, single quotes, no semicolons)

## Next

- Fix assignment-01 healthcheck (issue 1)
- Run assignment-03 (`docker compose up --build`) and confirm api reaches `healthy` and web/nginx start
- Decide on assignment-02 (add or renumber)
