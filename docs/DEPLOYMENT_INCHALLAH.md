# Deployment Guide

Single-server deployment using Docker Compose, Caddy (auto-HTTPS), and GitHub Actions deploying exact GHCR image digests over SSH.

## Architecture

```
Internet → Caddy :80/:443 → Next.js App :3000
                                 ├── PostgreSQL :5432 (internal-only)
                                 └── Redis :6379 (internal-only)
            GitHub Actions updates APP_IMAGE on the VPS
            Backup runs daily pg_dump
```

## Prerequisites

- A VPS with at least 2GB RAM (Ubuntu 22.04+ recommended)
- A domain name with DNS A record pointing to the server IP
- GitHub repository with CI/CD workflows

## One-Time Server Setup

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for group to take effect
```

### 2. Login to GitHub Container Registry

```bash
# Create a personal access token at https://github.com/settings/tokens
# with read:packages scope
echo "YOUR_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### 3. Create deployment directory

```bash
mkdir -p /root/stag/backups
cd /root/stag
```

### 4. Copy deployment files

Copy these files from the repository to `/root/stag/`:
- `docker-compose.prod.yml`
- `Caddyfile`

### 5. Create environment file

```bash
cp .env.example .env
nano .env
```

Required variables:
```env
BETTER_AUTH_SECRET=your-secret-min-32-characters-long
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com

POSTGRES_USER=stag
POSTGRES_PASSWORD=YOUR_DB_PASSWORD
POSTGRES_DB=stag

APP_IMAGE=ghcr.io/your-username/your-repo:latest
DOMAIN_NAME=your-domain.com
```

### 6. Point DNS

Add an A record for your domain pointing to the server's IP address. Caddy will automatically provision HTTPS certificates once DNS resolves.

## First Deploy

```bash
cd /root/stag

# Start with database seeding
RUN_SEED=true docker compose -f docker-compose.prod.yml up -d

# Watch logs to confirm everything starts
docker compose -f docker-compose.prod.yml logs -f app
```

Verify:
- Health check: `curl http://localhost:3000/api/health`
- HTTPS: Visit `https://your-domain.com` in a browser

## Subsequent Deploys

Fully automatic. The pipeline:

1. Push code to `master`
2. CI runs (lint, typecheck, tests, build, e2e)
3. CD builds Docker image and pushes to GHCR
4. CD updates `APP_IMAGE` in `/root/stag/.env` to the exact digest it just built
5. CD pulls that exact image and recreates `app` + `caddy`
6. Entrypoint runs any pending database migrations
7. App starts serving traffic

## Operations

### View logs

```bash
cd /root/stag
docker compose -f docker-compose.prod.yml logs -f app     # App logs
docker compose -f docker-compose.prod.yml logs -f db       # Database logs
docker compose -f docker-compose.prod.yml logs -f caddy    # Reverse proxy logs
```

### Monitor resources

```bash
docker stats
```

### Restart a service

```bash
docker compose -f docker-compose.prod.yml restart app
```

### Manual rollback

```bash
# Edit APP_IMAGE in /root/stag/.env to a previous digest or sha-tag
nano /root/stag/.env

# Recreate the app with that image
docker compose --env-file .env -f docker-compose.prod.yml pull app
docker compose --env-file .env -f docker-compose.prod.yml up -d --force-recreate app caddy
```

### Database backup (manual)

```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U stag stag > backup-$(date +%Y%m%d).sql
```

Automated daily backups are stored in `/root/stag/backups/`.

### Database restore

Stop writes before restore:

```bash
cd /root/stag
docker compose -f docker-compose.prod.yml stop app
```

Recreate the target database:

```bash
docker compose -f docker-compose.prod.yml exec -T db psql -U "${POSTGRES_USER:-stag}" -d postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${POSTGRES_DB:-stag}' AND pid <> pg_backend_pid();"
docker compose -f docker-compose.prod.yml exec -T db psql -U "${POSTGRES_USER:-stag}" -d postgres \
  -c "DROP DATABASE IF EXISTS ${POSTGRES_DB:-stag};"
docker compose -f docker-compose.prod.yml exec -T db psql -U "${POSTGRES_USER:-stag}" -d postgres \
  -c "CREATE DATABASE ${POSTGRES_DB:-stag};"
```

Restore from a plain SQL file:

```bash
cat backups/your-backup.sql | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U "${POSTGRES_USER:-stag}" -d "${POSTGRES_DB:-stag}"
```

Restore from a gzipped SQL file:

```bash
gunzip -c backups/your-backup.sql.gz | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U "${POSTGRES_USER:-stag}" -d "${POSTGRES_DB:-stag}"
```

Start the app again:

```bash
docker compose -f docker-compose.prod.yml up -d app caddy
```

### Run migrations manually

```bash
docker compose -f docker-compose.prod.yml exec app \
  bun run scripts/migrate.ts
```

## Memory Budget (2GB Server)

| Component   | Limit  |
|-------------|--------|
| PostgreSQL  | 384 MB |
| Next.js App | 512 MB |
| Redis       | 64 MB  |
| Caddy       | 64 MB  |
| Backup      | 64 MB  |
| OS + Docker | ~300 MB |
| **Total**   | **~1.39 GB** |

If you experience OOM issues, reduce PostgreSQL `shared_buffers` to `64MB` in docker-compose.prod.yml.

## GitHub Actions Secrets

Add these to your repository settings (Settings > Secrets and variables > Actions):

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Production URL (e.g., `https://stag.example.com`) |
| `DEPLOY_HOST` | VPS host or IP |
| `DEPLOY_USER` | SSH user for deploys |
| `DEPLOY_SSH_KEY` | Private SSH deploy key |

`GITHUB_TOKEN` is provided automatically and has `packages:write` permission.
