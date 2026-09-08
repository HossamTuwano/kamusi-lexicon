#!/bin/bash

# kamusi-lexicon database backup script
# Usage: ./scripts/backup-db.sh [env_file]

set -e

# Load environment variables if a file is provided
if [ -f "$1" ]; then
  echo "Loading environment from $1..."
  export $(grep -v '^#' "$1" | xargs)
fi

# Fallback to local .env if no file provided and not in prod
if [ -z "$DATABASE_URL" ] && [ -f "apps/api/.env" ]; then
  export $(grep -v '^#' "apps/api/.env" | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set. Please provide an env file or set the variable."
  exit 1
fi

# Create backups directory
BACKUP_DIR="./backups/db"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="kamusi_backup_$TIMESTAMP.sql.gz"
FILEPATH="$BACKUP_DIR/$FILENAME"

echo "Starting backup to $FILEPATH..."

# Perform dump and compress on the fly
# We use pg_dump. Since DATABASE_URL is used, it handles host/port/user/db
pg_dump "$DATABASE_URL" | gzip > "$FILEPATH"

if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $FILENAME"
  # Keep only the last 30 days of backups to save space
  find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
  echo "Cleaned up backups older than 30 days."
else
  echo "Backup failed!"
  exit 1
fi
