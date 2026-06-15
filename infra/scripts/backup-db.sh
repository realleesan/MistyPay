#!/bin/bash

# Database Backup Script for MistyPay
# Retention: 7 days

# Variables
BACKUP_DIR="/usr/src/app/infra/backups" # Default directory inside the project
DB_NAME="${DB_NAME:-mistypay_production}"
DB_USER="${DB_USER:-mistypay}"
DB_PASSWORD="${DB_PASSWORD:-secure_prod_password_123}"
CONTAINER_NAME="mistypay-postgres-prod"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_${TIMESTAMP}.sql.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "[$TIMESTAMP] Starting database backup..."

# Check if database is running inside Docker
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Database detected in Docker container. Running container pg_dump..."
    docker exec -t $CONTAINER_NAME pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"
else
    echo "Running system pg_dump..."
    PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"
fi

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "[$TIMESTAMP] Database backup successfully created at: $BACKUP_FILE"
else
    echo "[$TIMESTAMP] ❌ ERROR: Database backup failed!"
    exit 1
fi

# Retention policy: Delete backups older than 7 days
echo "Applying retention policy: cleaning up backups older than 7 days..."
find "$BACKUP_DIR" -type f -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup routine completed successfully."
