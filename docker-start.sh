#!/bin/bash

# Docker startup script for AI Snippet Service
# This script runs tests first, then starts the API service

set -e

echo "🐳 Starting AI Snippet Service with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your environment variables:"
    echo "  - MONGODB_URI"
    echo "  - OPENAI_API_KEY"
    echo "  - JWT_SECRET (optional)"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI is not set in .env file"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY is not set in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"

# Run tests first
echo "🧪 Running tests..."
docker-compose --profile test up test-runner --build --abort-on-container-exit

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Tests failed! Aborting startup."
    exit 1
fi

# Start the API service
echo "🚀 Starting API service..."
docker-compose up api --build -d

echo "✅ API service started successfully!"
echo "📡 API is running on http://localhost:3000"
echo "🔍 Health check: http://localhost:3000/health"
echo ""
echo "To view logs: docker-compose logs -f api"
echo "To stop: docker-compose down" 