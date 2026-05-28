# Jeff-Jeff (Phase 1)

Single-user internal app foundation for Jeff to manage scheduling and communication quickly.

## What this includes

- Fast Node.js API with no external runtime dependencies
- Simple internal web UI at `/` for quick testing
- Single-user login/token flow
- Modular domain structure:
  - `auth`
  - `permissions`
  - `schedule`
  - `messages`
- JSON-backed data store at `/data/store.json`

## Quick start

```bash
npm install
npm run start
```

Open: `http://localhost:3000`

Default login credentials:

- Username: `jeff`
- Password: `chill-mode`

Override with env vars:

- `JEFF_USER`
- `JEFF_PASS`
- `JEFF_INTERNAL_TOKEN`
- `PORT`

## Scripts

- `npm run start` – run server
- `npm run dev` – run with file watch
- `npm run lint` – syntax check JS files
- `npm test` – run tests

## API endpoints

- `POST /api/login`
- `GET /api/schedule`
- `POST /api/schedule`
- `PATCH /api/schedule/:id`
- `GET /api/messages`
- `POST /api/messages`

All endpoints except login require an `Authorization` header containing the bearer token from `/api/login`.

## Roadmap alignment

This repository is intentionally focused on **phase 1 internal-only use**.
Future phase: separate client-facing website (login, scheduling, communication) that does not expose internal controls.
