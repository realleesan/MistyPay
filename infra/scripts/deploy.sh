#!/bin/bash

# Deployment script for MistyPay Production
# Usage: ./deploy.sh [branch_name]

BRANCH=${1:-main}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "============================================="
echo "[$TIMESTAMP] Starting MistyPay Deployment ($BRANCH)..."
echo "============================================="

# 1. Pull latest code
echo "Pulling latest changes from branch $BRANCH..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# 2. Rebuild and restart containers
echo "Rebuilding and restarting docker containers..."
docker compose -f ../docker-compose.prod.yml down
docker compose -f ../docker-compose.prod.yml up --build -d

# 3. Check logs and container status
echo "Checking service status..."
docker compose -f ../docker-compose.prod.yml ps

echo "============================================="
echo "[$TIMESTAMP] Deployment completed successfully!"
echo "============================================="
