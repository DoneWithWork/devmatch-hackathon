#!/bin/bash

echo "🚀 Deploying updated certificate contract with direct minting..."

cd sui/contracts

echo "📦 Building contract..."
sui move build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "🔧 Publishing to devnet..."
    sui client publish --gas-budget 100000000 --with-unpublished-dependencies
    
    if [ $? -eq 0 ]; then
        echo "✅ Contract deployed successfully!"
        echo "📝 Please update the PACKAGE_ID in .env.local with the new package ID"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
