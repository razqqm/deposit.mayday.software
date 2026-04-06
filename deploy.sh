#!/bin/bash
# aaPanel Git Manager — Deployment Script for mayday.software
# This script runs after every git pull via aaPanel Git Manager.
# Version: 1.6.1
# Updated: 2026-03-28
#
# Usage: Add this script in aaPanel → Site → Git Manager → Script tab.

set -Eeuo pipefail

trap 'echo "ERROR: deployment failed at line $LINENO" >&2' ERR

# aaPanel often runs scripts with a minimal PATH.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm is not installed or not in PATH." >&2
    echo "Install Node.js on server first (node + npm)." >&2
    exit 1
fi

SCRIPT_VERSION="1.6.1"
SCRIPT_UPDATED_AT="2026-03-28"

SITE_DIR="/www/wwwroot/mayday.software"
BRANCH="main"
FRONTEND_DIR="$SITE_DIR/frontend"
BUILD_OUTPUT=""
LOCK_FILE="/tmp/mayday.software.deploy.lock"
CLEANUP_FRONTEND_AFTER_DEPLOY="1"

if ! mkdir "$LOCK_FILE" 2>/dev/null; then
    echo "Another deployment is already running. Exiting." >&2
    exit 1
fi
trap 'rmdir "$LOCK_FILE" 2>/dev/null || true' EXIT

echo "=== [$(date)] Starting deployment ==="
echo "Script version: $SCRIPT_VERSION ($SCRIPT_UPDATED_AT)"

# 0. Ensure git repo is up to date
if [ ! -d "$SITE_DIR/.git" ]; then
    echo "ERROR: git repository not found in $SITE_DIR" >&2
    exit 1
fi

echo "Updating repository..."
git -C "$SITE_DIR" fetch origin "$BRANCH"
git -C "$SITE_DIR" reset --hard "origin/$BRANCH"

# Keep only deploy-relevant paths in worktree (recommended cone-mode sparse checkout).
if git -C "$SITE_DIR" sparse-checkout set frontend nginx deploy.sh README.md >/dev/null 2>&1; then
    echo "Sparse checkout active: frontend nginx deploy.sh README.md"
else
    echo "WARN: sparse-checkout unavailable on this git version; continuing with full checkout."
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "ERROR: frontend source not found in $FRONTEND_DIR after git sync." >&2
    exit 1
fi

echo "Using source directory: $SITE_DIR"
echo "Node: $(node -v)"
echo "NPM:  $(npm -v)"

# 1. Install dependencies
cd "$FRONTEND_DIR"
echo "Installing dependencies..."
npm ci --prefer-offline --no-audit --no-fund

# 2. Build production bundle
echo "Building Angular app..."
npm run build

if [ -d "$FRONTEND_DIR/dist/mayday-software/browser" ]; then
    BUILD_OUTPUT="$FRONTEND_DIR/dist/mayday-software/browser"
elif [ -d "$FRONTEND_DIR/dist/mayday-software" ]; then
    BUILD_OUTPUT="$FRONTEND_DIR/dist/mayday-software"
else
    echo "ERROR: build output not found." >&2
    echo "Checked: $FRONTEND_DIR/dist/mayday-software/browser and $FRONTEND_DIR/dist/mayday-software" >&2
    exit 1
fi

# 3. Copy build output to site root
echo "Copying build to site root..."
if command -v rsync >/dev/null 2>&1; then
    # Sync static bundle and remove stale files, while preserving site/service dirs.
    rsync -a --delete \
        --exclude='.git/' \
        --exclude='frontend/' \
        --exclude='repo/' \
        --exclude='.deploy-src/' \
        --exclude='.well-known/' \
        --exclude='.gitignore' \
        --exclude='.user.ini' \
        --exclude='deploy.sh' \
        --exclude='README.md' \
        "$BUILD_OUTPUT"/ "$SITE_DIR"/
else
    echo "WARN: rsync not found, using fallback copy strategy."
    find "$SITE_DIR" -maxdepth 1 \
        -not -name 'repo' \
        -not -name '.deploy-src' \
        -not -name 'frontend' \
        -not -name '.git' \
        -not -name '.gitignore' \
        -not -name '.user.ini' \
        -not -name '.well-known' \
        -not -name 'deploy.sh' \
        -not -name 'README.md' \
        -not -name '.' \
        -delete 2>/dev/null || true

    cp -r "$BUILD_OUTPUT"/* "$SITE_DIR/"
fi

if [ "$CLEANUP_FRONTEND_AFTER_DEPLOY" = "1" ]; then
    echo "Cleaning frontend source directory after successful deploy..."
    rm -rf "$FRONTEND_DIR"
fi

echo "=== Deployment complete ==="
