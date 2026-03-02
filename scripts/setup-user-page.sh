#!/bin/bash

################################################################################
# Setup and Deploy to nkhanhtrn.github.io (root domain)
#
# This script will:
# 1. Build the project
# 2. Create/update the nkhanhtrn.github.io repository
# 3. Deploy to gh-pages branch
#
# Usage: ./scripts/setup-user-page.sh
#
################################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Owner name
OWNER="nkhanhtrn"
USER_REPO="nkhanhtrn.github.io"

info "Setting up deployment for $OWNER.github.io"

# Build the project
info "Building project..."
cd /home/nkhanhtrn/code/7-minute/app-store-pwa
npm run build

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Save dist to temp location
TMP_DIR=$(mktemp -d)
cp -r dist/* "$TMP_DIR/"

# Check if user repo exists
info "Checking if $USER_REPO repository exists..."
if git ls-remote git@github.com:$OWNER/$USER_REPO.git &>/dev/null; then
    info "Repository exists. Cloning..."
    REPO_DIR="/tmp/$USER_REPO-deploy"
    rm -rf "$REPO_DIR"
    git clone git@github.com:$OWNER/$USER_REPO.git "$REPO_DIR"
    cd "$REPO_DIR"

    # Remove all files except .git
    find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} + 2>/dev/null || true
else
    error "Repository $OWNER/$USER_REPO does not exist!"
    echo ""
    echo "Please create it first:"
    echo "  1. Go to: https://github.com/new"
    echo "  2. Repository name: nkhanhtrn.github.io"
    echo "  3. Make it Public"
    echo "  4. Click 'Create repository'"
    echo "  5. Run this script again"
    exit 1
fi

# Copy built files
info "Copying built files..."
cp -r "$TMP_DIR"/* .

# Add .nojekyll
touch .nojekyll

# Commit and push
info "Committing and pushing..."
git add -A
git commit -m "Deploy $(date +%Y-%m-%d\ %H:%M:%S)" || {
    warning "No changes to deploy."
}

git push origin main --force || git push origin master --force

# Cleanup
rm -rf "$TMP_DIR"
rm -rf "$REPO_DIR"

# Return to original directory
cd /home/nkhanhtrn/code/7-minute/app-store-pwa
git checkout "$CURRENT_BRANCH" 2>/dev/null || true

success "Deployed successfully!"
echo ""
echo "Your app is now available at:"
echo "  https://$OWNER.github.io/"
echo ""
echo "It may take a few minutes to appear."
