#!/usr/bin/env bash
# Quick deploy script for Fly.io
# Usage: ./scripts/deploy-fly.sh

set -euo pipefail

APP_NAME="azeldin"

echo "Deploying $APP_NAME to Fly.io..."

# Deploy
flyctl deploy --app "$APP_NAME"

# Run migrations
echo "Running database migrations..."
flyctl ssh console --app "$APP_NAME" --command "bun run scripts/migrate.ts"

# Health check
echo "Checking health..."
sleep 5
curl -sf "https://$APP_NAME.fly.dev/api/health" && echo " ✅ App is healthy" || echo " ⚠️ Health check failed"

echo
echo "Deployment complete!"
echo "URL: https://$APP_NAME.fly.dev"
