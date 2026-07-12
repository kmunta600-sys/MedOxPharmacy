#!/bin/bash
# MedOx Pharmacy Production Deployment Script

echo "🚀 Starting MedOx Pharmacy Deployment..."
echo "========================================"

# Pull latest code
echo "📦 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Run database migrations
echo "🗄️ Running database migrations..."
npm run migrate

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart medox-api

# Reload nginx
echo "🌐 Reloading nginx..."
sudo systemctl reload nginx

# Run health check
echo "🏥 Running health check..."
curl -f http://localhost:5000/health || exit 1

echo "✅ Deployment completed successfully!"
echo "========================================"
