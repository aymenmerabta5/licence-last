# Fly.io Deployment Guide

This project is configured to deploy to [Fly.io](https://fly.io) with Docker.

## Prerequisites

- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- Fly.io account
- Domain name (optional but recommended)

## Quick Start

### 1. Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
irm https://fly.io/install.ps1 | iex
```

### 2. Login

```bash
flyctl auth login
```

### 3. Run Setup Script

```bash
./scripts/setup-fly.sh
```

This script will:
- Create the Fly app `azeldin`
- Create a persistent volume for uploads
- Create a Fly Postgres database
- Set all required secrets
- Deploy the application

### 4. Configure DNS (if using custom domain)

After deployment, get your app's IP addresses:

```bash
flyctl ips list --app azeldin
```

Add these DNS records at your domain registrar:
- **A Record**: `@` -> IPv4 address
- **AAAA Record**: `@` -> IPv6 address

Then create the certificate:

```bash
flyctl certs create azeldin.de --app azeldin
```

### 5. Run Migrations

```bash
flyctl ssh console --app azeldin
bun run scripts/migrate.ts
```

### 6. Seed Database (first time only)

```bash
flyctl ssh console --app azeldin
RUN_SEED=true bun run src/server/db/seed.ts
```

## Manual Deploy

If you've already set up the app, you can deploy with:

```bash
./scripts/deploy-fly.sh
```

Or manually:

```bash
flyctl deploy --app azeldin
```

## Configuration

### Rate Limiting

Rate limiting is currently **disabled** (`REDIS_RATE_LIMIT_ENABLED=false`). To enable it:

1. Create a Redis instance:
```bash
flyctl redis create --name azeldin-redis --region ams
flyctl redis attach azeldin-redis --app azeldin
```

2. Update `fly.toml`:
```toml
[env]
  REDIS_RATE_LIMIT_ENABLED = 'true'
```

3. Redeploy:
```bash
flyctl deploy --app azeldin
```

### Scaling

Scale up resources:

```bash
# More memory
flyctl scale memory 2048 --app azeldin

# More CPUs
flyctl scale cpus 2 --app azeldin

# Always keep 1 machine running
flyctl scale count 1 --app azeldin
```

### Environment Variables

Update secrets:

```bash
flyctl secrets set KEY=value --app azeldin
```

Update non-secret env vars in `fly.toml` and redeploy.

## Monitoring

```bash
# View logs
flyctl logs --app azeldin

# Check status
flyctl status --app azeldin

# Open app in browser
flyctl open --app azeldin

# SSH into machine
flyctl ssh console --app azeldin
```

## Database Management

```bash
# Connect to database
flyctl postgres connect --app azeldin-db

# List databases
flyctl postgres list

# Create backup
flyctl postgres backup create --app azeldin-db
```

## Troubleshooting

### Health checks failing

Check the logs:
```bash
flyctl logs --app azeldin
```

Common issues:
- Database not migrated: Run `bun run scripts/migrate.ts`
- Missing secrets: Run `./scripts/setup-fly.sh` again
- Build failure: Check `flyctl deploy --app azeldin` output

### Out of memory

Scale up memory:
```bash
flyctl scale memory 2048 --app azeldin
```

### Database connection issues

Verify DATABASE_URL is set:
```bash
flyctl secrets list --app azeldin
```

Re-attach database:
```bash
flyctl postgres attach azeldin-db --app azeldin
```

## Costs

Fly.io free tier includes:
- 3 shared-cpu-1x VMs
- 3GB persistent volumes
- 160GB outbound data transfer

Estimated cost for this setup: **$0/month** (within free tier)

## Delete Everything

```bash
flyctl destroy azeldin
flyctl destroy azeldin-db
flyctl destroy azeldin-redis
```
