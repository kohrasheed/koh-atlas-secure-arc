#!/bin/bash

echo "🔍 Checking AI Recommendations Setup..."
echo "======================================="
echo ""

# 1. Check .env file
echo "1️⃣ Checking .env file..."
if [ -f .env ]; then
  echo "   ✅ .env file exists"
  if grep -q "VITE_ANTHROPIC_API_KEY" .env 2>/dev/null; then
    KEY_VALUE=$(grep "VITE_ANTHROPIC_API_KEY" .env | cut -d'=' -f2)
    if [ -n "$KEY_VALUE" ] && [ "$KEY_VALUE" != "your-key-here" ]; then
      KEY_PREFIX="${KEY_VALUE:0:10}"
      KEY_SUFFIX="${KEY_VALUE: -10}"
      echo "   ✅ API key configured: ${KEY_PREFIX}...${KEY_SUFFIX}"
    else
      echo "   ❌ API key not set or using placeholder"
    fi
  else
    echo "   ❌ VITE_ANTHROPIC_API_KEY not found in .env"
  fi
else
  echo "   ❌ .env file not found"
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
  
  # Check if @anthropic-ai/sdk is installed
  if npm list @anthropic-ai/sdk &> /dev/null; then
    SDK_VERSION=$(npm list @anthropic-ai/sdk 2>/dev/null | grep @anthropic-ai/sdk | head -1)
    echo "   ✅ Anthropic SDK installed: $SDK_VERSION"
  else
    echo "   ⚠️  Anthropic SDK not installed"
    echo "   📦 Run: npm install @anthropic-ai/sdk"
  fi
  
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
  if grep -q "VITE_ANTHROPIC_API_KEY" src/vite-env.d.ts 2>/dev/null; then
    echo "   ✅ Environment types configured"
  else
    echo "   ⚠️  Need to add VITE_ANTHROPIC_API_KEY type"
  fi
else
  echo "   ⚠️  vite-env.d.ts not found"
fi
echo ""

# 6. Check network connectivity
echo "6️⃣ Testing network access to Anthropic API..."
if command -v curl &> /dev/null; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://api.anthropic.com/v1/messages -H "x-api-key: test" -H "anthropic-version: 2023-06-01" 2>/dev/null)
  if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "   ✅ Can reach Anthropic API (got $HTTP_CODE - expected for test key)"
  else
    echo "   ⚠️  Unusual response: HTTP $HTTP_CODE"
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
echo ""

# Summary
echo "======================================="
echo "📊 SETUP SUMMARY"
echo "======================================="

ERRORS=0
WARNINGS=0

if [ ! -f .env ] || ! grep -q "VITE_ANTHROPIC_API_KEY=sk-ant-" .env 2>/dev/null; then
  echo "❌ API key not properly configured"
  ERRORS=$((ERRORS + 1))
fi

if ! npm list @anthropic-ai/sdk &> /dev/null; then
  echo "⚠️  Anthropic SDK needs installation"
  WARNINGS=$((WARNINGS + 1))
fi

if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo "⚠️  .env not protected in .gitignore"
  WARNINGS=$((WARNINGS + 1))
fi

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ All checks passed! Ready to implement AI recommendations."
  echo ""
  echo "🚀 Next step: Run implementation script"
else
  echo ""
  echo "Found $ERRORS error(s) and $WARNINGS warning(s)"
  echo "Please fix issues above before proceeding."
fi

echo ""
