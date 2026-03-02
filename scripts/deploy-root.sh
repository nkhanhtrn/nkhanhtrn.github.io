#!/bin/bash

################################################################################
# Deploy to nkhanhtrn.github.io (root domain)
#
# Usage: ./scripts/deploy-root.sh
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

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

OWNER="nkhanhtrn"
USER_REPO="nkhanhtrn.github.io"

# Build the project
info "Building project..."
cd "$PROJECT_DIR"
npm run build

# Save dist to temp location
TMP_DIR=$(mktemp -d)
cp -r dist/* "$TMP_DIR/"

# Clone the user repo to temp location
REPO_DIR="/tmp/$USER_REPO-deploy"
info "Cloning $USER_REPO..."
rm -rf "$REPO_DIR"
git clone git@github.com:$OWNER/$USER_REPO.git "$REPO_DIR"
cd "$REPO_DIR"

# Remove all files except .git
info "Deploying files..."
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} + 2>/dev/null || true

# Copy built files
cp -r "$TMP_DIR"/* .

# Add .nojekyll for GitHub Pages
touch .nojekyll

# Commit and push
info "Pushing to $USER_REPO..."
git add -A
git commit -m "Deploy $(date +%Y-%m-%d\ %H:%M:%S)" || {
    warning "No changes to deploy."
}

git push origin main --force 2>/dev/null || git push origin master --force

# Cleanup
rm -rf "$TMP_DIR" "$REPO_DIR"

success "Deployed successfully!"
echo ""
echo "Your app is now at: https://$OWNER.github.io/"
echo "It may take 1-2 minutes to appear."
