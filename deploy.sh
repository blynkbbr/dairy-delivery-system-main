#!/bin/bash

# Dairy Delivery System - Production Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: production (default) | staging

set -e

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="dairy-delivery-system"
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting deployment for $PROJECT_NAME ($ENVIRONMENT environment)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p backups

# Check if environment files exist
if [ ! -f "backend/.env.$ENVIRONMENT" ]; then
    echo "❌ Backend environment file backend/.env.$ENVIRONMENT not found!"
    echo "Please copy backend/.env.example to backend/.env.$ENVIRONMENT and configure it."
    exit 1
fi

if [ ! -f "frontend-web/.env.$ENVIRONMENT" ]; then
    echo "❌ Frontend environment file frontend-web/.env.$ENVIRONMENT not found!"
    echo "Please copy frontend-web/.env.example to frontend-web/.env.$ENVIRONMENT and configure it."
    exit 1
fi

# Backup existing database (if exists)
if [ -f "data/production.sqlite" ]; then
    echo "💾 Backing up existing database..."
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    cp data/production.sqlite "backups/database_backup_$BACKUP_DATE.sqlite"
    echo "✅ Database backed up to backups/database_backup_$BACKUP_DATE.sqlite"
fi

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f $COMPOSE_FILE pull

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f $COMPOSE_FILE up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🩺 Checking service health..."
if docker-compose -f $COMPOSE_FILE ps | grep -q "healthy"; then
    echo "✅ Services are healthy!"
else
    echo "⚠️  Some services may not be fully ready. Check logs with:"
    echo "   docker-compose -f $COMPOSE_FILE logs"
fi

# Display running services
echo "📋 Running services:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo ""
echo "📊 Useful commands:"
echo "   View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   Stop services: docker-compose -f $COMPOSE_FILE down"
echo "   Restart services: docker-compose -f $COMPOSE_FILE restart"
echo "   View service status: docker-compose -f $COMPOSE_FILE ps"
echo ""
echo "🔒 Security reminders:"
echo "   1. Update default passwords and secrets in .env files"
echo "   2. Configure SSL certificates for HTTPS"
echo "   3. Set up proper firewall rules"
echo "   4. Enable log monitoring"
echo ""

# Optional: Run database migrations
read -p "🗄️  Run database migrations? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running database migrations..."
    docker-compose -f $COMPOSE_FILE exec backend npm run migrate
    echo "✅ Database migrations completed"
fi

# Optional: Seed initial data
read -p "🌱 Seed initial data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding initial data..."
    docker-compose -f $COMPOSE_FILE exec backend npm run seed
    echo "✅ Initial data seeded"
fi

echo "✨ All done! Your dairy delivery system is ready to serve customers! 🥛"