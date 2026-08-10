# GasBook Customer PWA

Customer-facing React + TypeScript + Vite application for GasBook.

## Local Run

### Bun

```bash
bun install
bun run dev --host 0.0.0.0 --port 5174
```

The app runs at:

```text
http://localhost:5174
```

Set the backend API in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8001/api
```

### Docker

This repo now has its own Docker setup.

Start it from the `gasbook-customer` folder:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up -d --build
```

Stop it:

```bash
docker compose down
```

Restart it:

```bash
docker compose restart
```

The container serves the app at:

```text
http://localhost:5174
```

## Environment

Create `.env` in this repo and set:

```env
VITE_API_BASE_URL=http://localhost:8001/api
```

If your Django backend runs on another host or port, change that value.

## Files

- `Dockerfile` — Bun-based container for the customer app
- `docker-compose.yml` — standalone Compose setup for this repo
- `.dockerignore` — excludes local build and dependency folders from the Docker build context
