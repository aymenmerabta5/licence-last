#!/bin/bash
set -e

# ============================================================================
# Internex VPS Setup Script
# Run this ONCE on a fresh VPS to set up the full stack.
#
# Prerequisites:
#   - Ubuntu/Debian VPS with root or sudo access
#   - Domain DNS already pointing to this server
#   - GitHub Personal Access Token with read:packages scope
#
# Usage:
#   1. Copy to VPS:  scp scripts/vps-setup.sh docker-compose.prod.yml Caddyfile user@45.151.123.218:~/
#   2. SSH into VPS: ssh user@45.151.123.218
#   3. Run:          bash vps-setup.sh
# ============================================================================

DOMAIN="${1:-}"
GITHUB_USER="aymenmerabta5"
GITHUB_REPO="aymenmerabta5/licence-last"
APP_DIR="$HOME/stag"

if [ -z "$DOMAIN" ]; then
  read -r -p "Enter your domain (e.g. azeldin.de): " DOMAIN
fi

if [ -z "$DOMAIN" ]; then
  echo "✗ ERROR: domain is required"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║       Stag.io  VPS Setup — $DOMAIN       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Step 1: Install Docker ──────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "→ Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "✓ Docker installed. You may need to log out and back in for group changes."
  echo "  If 'docker compose' fails later, run: newgrp docker"
else
  echo "✓ Docker already installed"
fi

# ── Step 2: Open firewall ports ─────────────────────────────────────────────
if command -v ufw &>/dev/null; then
  echo "→ Configuring firewall (ufw)..."
  sudo ufw allow 22/tcp   # SSH
  sudo ufw allow 80/tcp   # HTTP
  sudo ufw allow 443/tcp  # HTTPS
  sudo ufw --force enable
  echo "✓ Firewall configured (ports 22, 80, 443)"
else
  echo "⚠ ufw not found — make sure ports 80 and 443 are open in your VPS provider's firewall"
fi

# ── Step 3: Create app directory ────────────────────────────────────────────
echo "→ Setting up $APP_DIR..."
mkdir -p "$APP_DIR/backups"
cd "$APP_DIR"

# Copy docker-compose and Caddyfile if they exist in home directory
if [ -f "$HOME/docker-compose.prod.yml" ]; then
  mv "$HOME/docker-compose.prod.yml" "$APP_DIR/"
  echo "✓ Moved docker-compose.prod.yml"
fi
if [ -f "$HOME/Caddyfile" ]; then
  mv "$HOME/Caddyfile" "$APP_DIR/"
  echo "✓ Moved Caddyfile"
fi

# Verify required files exist
if [ ! -f "docker-compose.prod.yml" ] || [ ! -f "Caddyfile" ]; then
  echo "✗ ERROR: docker-compose.prod.yml and Caddyfile must be in $APP_DIR"
  echo "  Copy them from your repo first."
  exit 1
fi

# ── Step 4: Generate .env ──────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo "→ Generating .env with random secrets..."

  POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
  BETTER_AUTH_SECRET=$(openssl rand -base64 32 | tr -d '/+=' | head -c 48)

  cat > .env << EOF
# ─── Database ───────────────────────────────────────
POSTGRES_USER=stag
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=stag

# ─── Auth ───────────────────────────────────────────
BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
NEXT_PUBLIC_BETTER_AUTH_URL=https://$DOMAIN
BETTER_AUTH_TRUSTED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

# ─── Domain & Image ────────────────────────────────
DOMAIN_NAME=$DOMAIN
GITHUB_REPO=$GITHUB_REPO
APP_IMAGE=ghcr.io/$GITHUB_REPO:latest

# ─── First Deploy (set to false after first run) ───
RUN_SEED=true
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=

# ─── Optional Services ─────────────────────────────
# RESEND_API_KEY=
# EMAIL_FROM=noreply@$DOMAIN
# S3_BUCKET=
# S3_ENDPOINT=
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
# S3_PUBLIC_URL=
# S3_REGION=auto
# POE_API_KEY=
# ARCADE_API_KEY=
EOF

  echo "✓ Generated .env with random secrets"
  echo ""
  echo "╔══════════════════════════════════════════════╗"
  echo "║  IMPORTANT: Edit .env before continuing!     ║"
  echo "║                                              ║"
  echo "║  At minimum, set:                            ║"
  echo "║    - SEED_ADMIN_EMAIL                        ║"
  echo "║    - SEED_ADMIN_PASSWORD                     ║"
  echo "╚══════════════════════════════════════════════╝"
  echo ""
  echo "Run:  nano $APP_DIR/.env"
  echo "Then re-run this script."
  exit 0
else
  echo "✓ .env already exists"
fi

# Validate required .env values
source .env
if [ -z "$SEED_ADMIN_EMAIL" ] || [ -z "$SEED_ADMIN_PASSWORD" ]; then
  echo "⚠ SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set in .env"
  echo "  Edit .env and re-run, or continue without seeding (RUN_SEED will be ignored)."
  read -p "  Continue anyway? [y/N] " -r
  [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
fi

# ── Step 5: Login to GitHub Container Registry ─────────────────────────────
echo ""
echo "→ Login to GitHub Container Registry..."
echo "  You need a Personal Access Token with 'read:packages' scope."
echo "  Create one at: https://github.com/settings/tokens/new"
echo ""
docker login ghcr.io -u "$GITHUB_USER"

# ── Step 6: Pull and start ─────────────────────────────────────────────────
echo ""
echo "→ Pulling images and starting services..."
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "→ Waiting for services to be healthy..."
sleep 10

# ── Step 7: Verify ─────────────────────────────────────────────────────────
echo ""
echo "→ Service status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✓ Deployment complete!                              ║"
echo "║                                                      ║"
echo "║  Your app should be live at:                         ║"
echo "║    https://$DOMAIN                                   ║"
echo "║                                                      ║"
echo "║  Useful commands:                                    ║"
echo "║    cd $APP_DIR                                       ║"
echo "║    docker compose -f docker-compose.prod.yml logs -f ║"
echo "║    docker compose -f docker-compose.prod.yml ps      ║"
echo "║    docker compose -f docker-compose.prod.yml restart  ║"
echo "║                                                      ║"
echo "║  After first deploy, edit .env:                      ║"
echo "║    RUN_SEED=false                                    ║"
echo "║                                                      ║"
echo "║  GitHub Actions CD updates APP_IMAGE on each         ║"
echo "║  successful push to master and redeploys the app.    ║"
echo "║                                                      ║"
echo "║  PostgreSQL is only reachable inside Docker          ║"
echo "║  by default. Use 'docker compose exec db psql'       ║"
echo "║  for local debugging on the VPS.                     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
