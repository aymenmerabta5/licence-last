#!/usr/bin/env bash
# Fly.io Deployment Setup Script for Stag
# Usage: ./scripts/setup-fly.sh

set -euo pipefail

APP_NAME="azeldin"
REGION="ams"
DOMAIN_NAME="azeldin.de"

echo "========================================"
echo "  Stag - Fly.io Setup"
echo "  Domain: $DOMAIN_NAME"
echo "  App: $APP_NAME"
echo "========================================"
echo

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -L https://fly.io/install.sh | sh
        export PATH="$HOME/.fly/bin:$PATH"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install flyctl
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        echo "Please install flyctl manually from https://fly.io/docs/hands-on/install-flyctl/"
        exit 1
    fi
fi

# Login to Fly.io
echo "🔑 Logging into Fly.io..."
flyctl auth login

# Create app if it doesn't exist
echo "📦 Creating Fly app: $APP_NAME..."
if ! flyctl apps list 2>/dev/null | grep -q "$APP_NAME"; then
    flyctl apps create "$APP_NAME" --org personal
    echo "✅ App created"
else
    echo "ℹ️  App already exists"
fi

# Create volume for uploads
echo "💾 Creating persistent volume for uploads..."
if ! flyctl volumes list --app "$APP_NAME" 2>/dev/null | grep -q "uploads_data"; then
    flyctl volumes create uploads_data --app "$APP_NAME" --region "$REGION" --size 1 --yes
    echo "✅ Volume created"
else
    echo "ℹ️  Volume already exists"
fi

# Create Postgres database
echo "========================================"
echo "  🐘 Database Setup"
echo "========================================"
echo

DB_NAME="${APP_NAME}-db"
echo "Creating Fly Postgres cluster: $DB_NAME..."
if ! flyctl postgres list 2>/dev/null | grep -q "$DB_NAME"; then
    flyctl postgres create \
        --name "$DB_NAME" \
        --region "$REGION" \
        --org personal \
        --initial-cluster-size 1 \
        --vm-size shared-cpu-1x \
        --volume-size 1 \
        --autostart \
        --yes
    echo "✅ Postgres created"
else
    echo "ℹ️  Postgres already exists"
fi

# Attach database to app
echo "🔗 Attaching database to app..."
flyctl postgres attach "$DB_NAME" --app "$APP_NAME" --yes || true

# Create Redis (Upstash)
echo "========================================"
echo "  ⚡ Redis Setup"
echo "========================================"
echo

REDIS_NAME="${APP_NAME}-redis"
echo "Creating Upstash Redis: $REDIS_NAME..."
if ! flyctl redis list 2>/dev/null | grep -q "$REDIS_NAME"; then
    flyctl redis create \
        --name "$REDIS_NAME" \
        --region "$REGION" \
        --eviction \
        --org personal \
        --yes
    echo "✅ Redis created"
else
    echo "ℹ️  Redis already exists"
fi

# Attach Redis to app
echo "🔗 Attaching Redis to app..."
flyctl redis attach "$REDIS_NAME" --app "$APP_NAME" --yes || true

# Show current secrets
echo ""
echo "========================================"
echo "  🔐 Setting Secrets"
echo "========================================"
echo ""
echo "⚠️  You need to set the following secrets:"
echo ""

# Function to set or update secret
set_secret() {
    local key="$1"
    local value="$2"
    echo "Setting $key..."
    echo "$value" | flyctl secrets set "$key" --app "$APP_NAME"
}

# Set all secrets from .env.development (with production values)
echo "Setting secrets from environment..."

# Database - will be auto-set by postgres attach, but we can override if needed
# DATABASE_URL is set automatically by flyctl postgres attach

# Auth
set_secret "BETTER_AUTH_SECRET" "aymenmerabta12-gmail-com-stag-dev-secret-32chars"

# Email
set_secret "RESEND_API_KEY" "re_7sop6Y8a_6xR62KTNC3n9e926MM1cKXEY"

# S3 / R2
set_secret "S3_BUCKET" "internex"
set_secret "S3_ENDPOINT" "https://3e0dd06bbb95ced6e08e379454901bb3.r2.cloudflarestorage.com"
set_secret "S3_ACCESS_KEY_ID" "ba1031472604c026781e4e9f46b67aac"
set_secret "S3_SECRET_ACCESS_KEY" "067098a2cad439d1b337b7a2c7cb5e4665ca677b07d8814f0b6a2f8787f95588"

# AI
set_secret "AI_API_KEY" "JrE1SJGYSoopbahCNjsEOYaDd_uuoN4pdUapX_DZMIk"
set_secret "ARCADE_API_KEY" "arc_proj1MdN7WMzSRWBhgaoNsFivshL6jzmvTkPB4BgbGqpXtiom0bNJZb"

# Turnstile
set_secret "TURNSTILE_SECRET_KEY" "0x4AAAAAACeEHFZGX_G5V1QtIB66vdDCk-k"

# Trusted origins (production)
set_secret "BETTER_AUTH_TRUSTED_ORIGINS" "https://azeldin.de,https://www.azeldin.de"

# Seeding (optional - disable after first deploy)
# set_secret "RUN_SEED" "true"
# set_secret "SEED_ADMIN_PASSWORD" "Aymenlouaianes1"
# set_secret "SEED_UNIVERSITY_ADMIN_PASSWORD" "CHANGE_ME_STRONG_PASSWORD"

# Deploy
echo ""
echo "========================================"
echo "  🚀 Deploying to Fly.io"
echo "========================================"
echo ""

flyctl deploy --app "$APP_NAME"

# Scale to ensure one machine is always running
echo ""
echo "📏 Setting scale to 1 machine..."
flyctl scale count 1 --app "$APP_NAME"

# Show status
echo ""
echo "========================================"
echo "  ✅ Deployment Complete!"
echo "========================================"
echo ""
echo "🌐 App URL: https://$APP_NAME.fly.dev"
echo "🌍 Custom Domain: https://$DOMAIN_NAME"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Add DNS records for $DOMAIN_NAME:"
V4_IP=$(flyctl ips list --app "$APP_NAME" 2>/dev/null | grep -v IPv6 | grep -v 'v6' | tail -n 1 | awk '{print $3}')
V6_IP=$(flyctl ips list --app "$APP_NAME" 2>/dev/null | grep 'v6' | tail -n 1 | awk '{print $3}')
echo "   A Record:     @ -> $V4_IP"
echo "   AAAA Record:  @ -> $V6_IP"
echo ""
echo "2. Create certificate for custom domain:"
echo "   flyctl certs create $DOMAIN_NAME --app $APP_NAME"
echo ""
echo "3. Run migrations (after DNS is ready):"
echo "   flyctl ssh console --app $APP_NAME"
echo "   bun run scripts/migrate.ts"
echo ""
echo "4. Seed database (first time only):"
echo "   flyctl ssh console --app $APP_NAME"
echo "   RUN_SEED=true bun run src/server/db/seed.ts"
echo ""
echo "📊 Monitor logs:"
echo "   flyctl logs --app $APP_NAME"
echo ""
echo "🔧 Useful commands:"
echo "   flyctl status --app $APP_NAME       # Check status"
echo "   flyctl ssh console --app $APP_NAME  # SSH into app"
echo "   flyctl restart --app $APP_NAME      # Restart app"
echo "   flyctl destroy --app $APP_NAME      # Delete app (careful!)"
echo ""
