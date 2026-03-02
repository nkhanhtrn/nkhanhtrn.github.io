#!/bin/bash

################################################################################
# Simple GitHub Pages Deployment Script (no gh CLI required)
#
# Usage: ./scripts/deploy-simple.sh
#
################################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Get repo info from git remote
REMOTE_URL=$(git config --get remote.origin.url)
if [[ "$REMOTE_URL" =~ github\.com[/:]([^/]+)/([^/]+)\.git ]]; then
    OWNER="${BASH_REMATCH[1]}"
    REPO_NAME="${BASH_REMATCH[2]}"
else
    echo "Error: Could not parse GitHub repository URL"
    exit 1
fi

info "Repository: $OWNER/$REPO_NAME"

# Build the project
info "Building project..."
npm run build

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Save dist to temp location
TMP_DIR=$(mktemp -d)
cp -r dist/* "$TMP_DIR/"

# Create/switch to gh-pages branch
info "Deploying to gh-pages branch..."

# Check if gh-pages branch exists remotely
if git ls-remote --heads origin gh-pages | grep -q gh-pages; then
    info "Fetching existing gh-pages branch..."
    git fetch origin gh-pages
    git checkout gh-pages
    # Remove all files except .git
    find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
else
    info "Creating new gh-pages branch..."
    git checkout --orphan gh-pages
    # Remove all files from the new branch
    git rm -rf . 2>/dev/null || true
fi

# Copy built files from temp
info "Copying built files..."
cp -r "$TMP_DIR"/* .

# Add .nojekyll for GitHub Pages (helps with files starting with underscore)
touch .nojekyll

# Commit and push
info "Committing and pushing..."
git add -A
git commit -m "Deploy $(date +%Y-%m-%d\ %H:%M:%S)" || {
    warning "No changes to deploy."
}

git push origin gh-pages --force

# Cleanup
rm -rf "$TMP_DIR"

# Return to original branch
info "Returning to $CURRENT_BRANCH branch..."
git checkout "$CURRENT_BRANCH"

success "Deployed successfully!"
echo ""
echo "Your app is now available at:"
echo "  https://$OWNER.github.io/$REPO_NAME/"
echo ""
echo "If this is your first deployment, it may take a few minutes to appear."
echo "Check status at: https://github.com/$OWNER/$REPO_NAME/deployments"
