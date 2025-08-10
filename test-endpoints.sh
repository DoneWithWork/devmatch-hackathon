#!/bin/bash

echo "🧪 Testing API Endpoints..."

BASE_URL="http://localhost:3000"

# Test 1: Check if server is running
echo "1. Testing server health..."
curl -s "$BASE_URL/api/test" && echo "✅ Server is running" || echo "❌ Server not responding"

# Test 2: Check applications endpoint
echo -e "\n2. Testing applications endpoint..."
curl -s "$BASE_URL/api/admin/applications" | jq '.success' && echo "✅ Applications API working" || echo "❌ Applications API failed"

# Test 3: Test admin login
echo -e "\n3. Testing admin login..."
curl -s -X POST "$BASE_URL/api/auth/admin-login" \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "admin123"}' | jq '.success' && echo "✅ Admin login working" || echo "❌ Admin login failed"

echo -e "\n🎉 Basic API tests completed!"
echo "Navigate to http://localhost:3000 to start testing the full flow"
