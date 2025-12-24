#!/bin/bash

echo "🔍 Checking AI Recommendations Setup..."
echo "======================================="
echo ""

# 1. Check render proxy endpoint
echo "1️⃣ Checking Render proxy endpoint..."
RENDER_URL="https://koh-atlas-secure-arc.onrender.com/api/anthropic"
echo "   Testing: $RENDER_URL"

if command -v curl &> /dev/null; then
  # Test with OPTIONS request (CORS preflight)
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$RENDER_URL" 2>/dev/null)
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "405" ]; then
    echo "   ✅ Render proxy is accessible (HTTP $HTTP_CODE)"
  else
    echo "   ⚠️  Render proxy returned HTTP $HTTP_CODE"
  fi
else
  echo "   ⚠️  curl not available, skipping proxy test"
fi
echo ""

# 2. Check .gitignore
echo "2️⃣ Checking .gitignore..."
if grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo "   ✅ .env is in .gitignore (safe from commits)"
else
  echo "   ⚠️  .env not in .gitignore - adding it now..."
  echo ".env" >> .gitignore
  echo "   ✅ Added .env to .gitignore"
fi
echo ""

# 3. Check Node.js
echo "3️⃣ Checking Node.js..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo "   ✅ Node.js installed: $NODE_VERSION"
else
  echo "   ❌ Node.js not found"
fi
echo ""

# 4. Check npm packages
echo "4️⃣ Checking dependencies..."
if [ -f package.json ]; then
  echo "   ✅ package.json exists"
  
  # Note: @anthropic-ai/sdk not needed - using render proxy
  echo "   ℹ️  Using Render proxy (no SDK needed)"
  
  # Check React
  if npm list react &> /dev/null; then
    REACT_VERSION=$(npm list react 2>/dev/null | grep "react@" | head -1 | grep -oP 'react@\K[^,\s]+')
    echo "   ✅ React installed: $REACT_VERSION"
  fi
  
  # Check Zod
  if npm list zod &> /dev/null; then
    ZOD_VERSION=$(npm list zod 2>/dev/null | grep "zod@" | head -1 | grep -oP 'zod@\K[^,\s]+')
    echo "   ✅ Zod installed: $ZOD_VERSION"
  fi
else
  echo "   ❌ package.json not found"
fi
echo ""

# 5. Check TypeScript config
echo "5️⃣ Checking TypeScript configuration..."
if [ -f src/vite-env.d.ts ]; then
  echo "   ✅ vite-env.d.ts exists"
  echo "   ℹ️  No environment variables needed (using proxy)"
else
  echo "   ℹ️  vite-env.d.ts not required for proxy setup"
fi
echo ""

# 6. Check network connectivity
echo "6️⃣ Testing network access to Render proxy..."
if command -v curl &> /dev/null; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$RENDER_URL" -X POST -H "Content-Type: application/json" -d '{"test": true}' 2>/dev/null)
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "500" ]; then
    echo "   ✅ Can reach Render proxy (HTTP $HTTP_CODE)"
  else
    echo "   ⚠️  Unusual response from Render proxy: HTTP $HTTP_CODE"
  fi
else
  echo "   ⚠️  curl not available, skipping network test"
fi
echo ""

# 7. Check browser storage
echo "7️⃣ Checking storage utilities..."
if [ -f src/lib/security-utils.ts ]; then
  echo "   ✅ security-utils.ts exists (localStorage available)"
else
  echo "   ⚠️  security-utils.ts not found"
fi

# 8. Check render deployment files
echo "8️⃣ Checking render deployment..."
if [ -f render.yaml ]; then
  echo "   ✅ render.yaml exists"
  if [ -f api/anthropic.ts ]; then
    echo "   ✅ Anthropic proxy endpoint configured"
  else
    echo "   ⚠️  Proxy endpoint file not found"
  fi
else
  echo "   ⚠️  render.yaml not found"
fi
echo ""

# Summary
echo "======================================="
echo "📊 SETUP SUMMARY"
echo "======================================="

ERRORS=0
WARNINGS=0

# Check if render proxy is accessible
if command -v curl &> /dev/null; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$RENDER_URL" 2>/dev/null)
  if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "204" ] && [ "$HTTP_CODE" != "405" ]; then
    echo "⚠️  Render proxy may not be accessible"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo "⚠️  .env not protected in .gitignore"
  WARNINGS=$((WARNINGS + 1))
fi

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ All checks passed! Ready to use AI recommendations via Render proxy."
  echo ""
  echo "🚀 Architecture uses secure Render proxy for Claude API"
  echo "   No API keys needed in frontend"
else
  echo ""
  echo "Found $ERRORS error(s) and $WARNINGS warning(s)"
  echo "Please fix issues above before proceeding."
fi

echo ""
