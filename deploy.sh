#!/bin/bash

echo "🚀 Starting AHP Decision System Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start the application
echo "📦 Building Docker images..."
docker-compose build

echo "🏃 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend service is healthy"
else
    echo "❌ Backend service is not responding"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend service is healthy"
else
    echo "❌ Frontend service is not responding"
fi

echo ""
echo "🎉 Deployment complete!"
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📁 Database: postgresql://ahp_user:ahp_password@localhost:5432/ahp_db"
echo ""
echo "Demo Account:"
echo "📧 Email: admin@ahp-system.com"
echo "🔑 Password: password123"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs: docker-compose logs -f"