#!/bin/bash

# Script to start a new feature branch
# Usage: ./scripts/new-feature.sh feature-name

if [ $# -eq 0 ]; then
    echo "Usage: $0 <feature-name>"
    echo "Example: $0 inventory-management"
    exit 1
fi

FEATURE_NAME=$1
BRANCH_NAME="feature/$FEATURE_NAME"

echo "🚀 Starting new feature: $FEATURE_NAME"

# Ensure we're on develop and up to date
git checkout develop
git pull origin develop

# Create and switch to feature branch
git checkout -b $BRANCH_NAME

echo "✅ Created feature branch: $BRANCH_NAME"
echo ""
echo "Next steps:"
echo "1. Make your changes"
echo "2. Test with: npm run dev"
echo "3. Build with: npm run build"
echo "4. When ready: git push -u origin $BRANCH_NAME"
echo "5. Create PR on GitHub targeting 'develop'"