#!/bin/bash

# Script to deploy develop to production
# Usage: ./scripts/deploy.sh

echo "🚀 Deploying to Production"
echo ""

# Confirm deployment
read -p "Are you sure you want to deploy to production? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Ensure develop is up to date
echo "📦 Updating develop branch..."
git checkout develop
git pull origin develop

# Switch to main and merge
echo "🔄 Merging to main..."
git checkout main
git pull origin main
git merge develop

# Test build one more time
echo "🧪 Running final build test..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting deployment."
    exit 1
fi

# Push to production
echo "🚀 Pushing to production..."
git push origin main

echo "✅ Deployment complete!"
echo "🌐 Check Vercel dashboard for deployment status"
echo "📊 Monitor application at your production URL"