#!/bin/sh

# Exit on any error
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Start the application with increased memory
echo "Starting the application..."
node --max-old-space-size=2048 dist/main.js