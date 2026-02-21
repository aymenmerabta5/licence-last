# Deployment Guide

Single-server deployment using Docker Compose, Caddy (auto-HTTPS), and Watchtower (auto-deploy).

## Architecture

```
Internet → Caddy :80/:443 → Next.js App :3000
                                 ├── PostgreSQL :5432
                                 └── Redis :6379
            Watchtower polls GHCR every 60s for new images
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
sudo mkdir -p /opt/stag/backups
sudo chown $USER:$USER /opt/stag
cd /opt/stag
```

### 4. Copy deployment files

Copy these files from the repository to `/opt/stag/`:
- `docker-compose.prod.yml`
- `Caddyfile`

### 5. Create environment file

```bash
cp .env.example .env
nano .env
```

Required variables:
```env
DATABASE_URL=postgresql://stag:YOUR_DB_PASSWORD@db:5432/stag
BETTER_AUTH_SECRET=your-secret-min-32-characters-long
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com

POSTGRES_USER=stag
POSTGRES_PASSWORD=YOUR_DB_PASSWORD
POSTGRES_DB=stag

GITHUB_REPO=your-username/your-repo
DOMAIN_NAME=your-domain.com
```

### 6. Point DNS

Add an A record for your domain pointing to the server's IP address. Caddy will automatically provision HTTPS certificates once DNS resolves.

## First Deploy

```bash
cd /opt/stag

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
4. Watchtower detects new image within 60 seconds
5. Watchtower pulls new image and restarts the app container
6. Entrypoint runs any pending database migrations
7. App starts serving traffic

## Operations

### View logs

```bash
cd /opt/stag
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
# List available image tags
docker images ghcr.io/YOUR_USERNAME/YOUR_REPO

# Roll back to a specific commit
docker compose -f docker-compose.prod.yml pull
docker service update --image ghcr.io/YOUR_USERNAME/YOUR_REPO:sha-abc1234 stag_app
```

### Database backup (manual)

```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U stag stag > backup-$(date +%Y%m%d).sql
```

Automated daily backups are stored in `/opt/stag/backups/`.

### Run migrations manually

```bash
docker compose -f docker-compose.prod.yml exec app \
  bunx drizzle-kit migrate
```

## Memory Budget (2GB Server)

| Component   | Limit  |
|-------------|--------|
| PostgreSQL  | 384 MB |
| Next.js App | 512 MB |
| Redis       | 64 MB  |
| Caddy       | 64 MB  |
| Watchtower  | 64 MB  |
| Backup      | 64 MB  |
| OS + Docker | ~300 MB |
| **Total**   | **~1.45 GB** |

If you experience OOM issues, reduce PostgreSQL `shared_buffers` to `64MB` in docker-compose.prod.yml.

## GitHub Actions Secrets

Add these to your repository settings (Settings > Secrets and variables > Actions):

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Production URL (e.g., `https://stag.example.com`) |

`GITHUB_TOKEN` is provided automatically and has `packages:write` permission.
