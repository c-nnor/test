#!/bin/bash

# Exit on error
set -e

# Get the Docker Hub username
if [ -z "$1" ]; then
  echo "Usage: $0 connorcharnock"
  echo "Example: $0 connorcharnock"
  exit 1
fi

DOCKER_USERNAME=$1
IMAGE_NAME="$DOCKER_USERNAME/mcd-travelpath-app"
TAG="latest"

echo "Building the combined Docker image..."
docker build -t $IMAGE_NAME:$TAG -f Dockerfile.combined .

echo "Image built successfully!"
echo "Running a quick test..."

# Run the container in the background
CONTAINER_ID=$(docker run -d -p 80:80 -p 3000:3000 -p 5432:5432 $IMAGE_NAME:$TAG)

echo "Container started with ID: $CONTAINER_ID"
echo "Waiting 45 seconds for all services to start and migrations to run..."
sleep 45