#!/bin/bash

# Define directories
SOURCE_DIR="chrome-extension"
BUILD_DIR="chrome-extension-prod"
ZIP_NAME="resumegyani-extension-v1.0.2.zip"
PROD_URL="https://resumegyani.in"

echo "🚀 Starting Production Build..."

# 1. Clean previous build
rm -rf "$BUILD_DIR"
rm -f "$ZIP_NAME"

# 2. Copy source files
echo "📂 Copying files..."
cp -r "$SOURCE_DIR" "$BUILD_DIR"

# 3. Replace Localhost with Production URL
echo "🔧 Configuring for Production ($PROD_URL)..."

# Replace in sidepanel.html
sed -i '' "s|http://localhost:3000|$PROD_URL|g" "$BUILD_DIR/sidepanel.html"

# Replace in sidepanel.js
sed -i '' "s|http://localhost:3000|$PROD_URL|g" "$BUILD_DIR/sidepanel.js"

# Remove localhost from manifest permissions (simulated by finding the line and deleting it, or replacing it)
# We will use a simpler approach: Read the file, filter out localhost line.
# Note: simple sed might not be robust for JSON, but assuming formatting is standard:
grep -v "http://localhost:3000" "$BUILD_DIR/manifest.json" > "$BUILD_DIR/manifest.tmp" && mv "$BUILD_DIR/manifest.tmp" "$BUILD_DIR/manifest.json"

echo "✅ Configuration complete."

# 4. Zip the folder
echo "📦 Zipping extension..."
zip -r "$ZIP_NAME" "$BUILD_DIR" -x "*.DS_Store"

echo "🎉 Build Complete!"
echo "👉 Upload this file to Chrome Web Store: $ZIP_NAME"
