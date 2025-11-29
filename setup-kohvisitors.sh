#!/bin/bash
# Setup script for kohVisitors logging

echo "Setting up kohVisitors logging system..."

# Create a private gist to store visitor logs
echo "Creating GitHub Gist for visitor logs..."

GIST_RESPONSE=$(gh gist create --public kohVisitors.json -d "Website Visitor Logs" << EOF
{
  "visitors": [],
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
)

echo "Gist created!"
echo "Gist URL: $GIST_RESPONSE"

# Extract gist ID from URL
GIST_ID=$(echo "$GIST_RESPONSE" | grep -oP '(?<=gist.github.com/)[a-f0-9]+')
echo "Gist ID: $GIST_ID"

# Create GitHub token instructions
cat << 'INSTRUCTIONS'

===========================================
KOHVISITORS SETUP COMPLETE
===========================================

Your visitor logging system is ready!

NEXT STEPS:

1. Create a GitHub Personal Access Token:
   - Go to: https://github.com/settings/tokens/new
   - Name: "kohVisitors Logger"
   - Expiration: No expiration (or custom)
   - Scopes: Select "gist" only
   - Click "Generate token"
   - COPY THE TOKEN (you'll only see it once!)

2. The Gist ID has been created and is ready to use.

3. Visitor logs will be stored in your GitHub Gist at:
   https://gist.github.com/${GIST_ID}

4. To view logs, either:
   - Visit the Gist URL above
   - Press Ctrl+Shift+V on your website to download
   - Run: gh gist view ${GIST_ID}

5. To download all visitor data:
   - Visit your website
   - Open Console (F12)
   - Type: downloadKohVisitors()
   - Or press: Ctrl+Shift+V

===========================================
INSTRUCTIONS

echo ""
echo "Setup complete! Follow the instructions above."
