#!/bin/bash

# Fresh Smart Contract Deployment Script
# This script deploys all contracts with your new admin credentials

echo "🚀 Starting fresh smart contract deployment..."

# Check if we're in the right directory
if [ ! -f "Move.toml" ]; then
    echo "❌ Error: Move.toml not found. Please run this script from the sui/contracts directory"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build/

# Build the smart contracts
echo "🔨 Building smart contracts..."
sui move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check your Move code for errors."
    exit 1
fi

# Deploy the contracts
echo "📦 Deploying smart contracts to Sui devnet..."
DEPLOYMENT_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Deployment successful!"
echo "📄 Full deployment output:"
echo "$DEPLOYMENT_OUTPUT"

# Extract important addresses from deployment
PACKAGE_ID=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
ADMIN_CAP=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("AdminCap")) | .objectId')
ISSUER_REGISTRY=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("IssuerRegistry")) | .objectId')
CERTIFICATE_REGISTRY=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.objectChanges[] | select(.objectType | contains("CertificateRegistry")) | .objectId')

echo ""
echo "📋 Important Contract Addresses:"
echo "PACKAGE_ID=$PACKAGE_ID"
echo "ADMIN_CAP=$ADMIN_CAP"
echo "ISSUER_REGISTRY=$ISSUER_REGISTRY"
echo "CERTIFICATE_REGISTRY=$CERTIFICATE_REGISTRY"

# Create environment file
echo ""
echo "💾 Creating .env.deployment file..."
cat > .env.deployment << EOF
# Fresh deployment environment variables
# Copy these to your main .env.local file

# Smart Contract Addresses
SUI_PACKAGE_ID=$PACKAGE_ID
PACKAGE_ID=$PACKAGE_ID
ADMIN_CAP=$ADMIN_CAP
ISSUER_REGISTRY=$ISSUER_REGISTRY
CERTIFICATE_REGISTRY=$CERTIFICATE_REGISTRY
NETWORK=devnet

# Add your private key and address here:
# SUI_PRIVATE_KEY=YOUR_NEW_PRIVATE_KEY
# SUI_WALLET_ADDRESS=YOUR_NEW_ADDRESS
# SUI_ADDRESS=YOUR_NEW_ADDRESS
# ADMIN_PRIVATE_KEY=YOUR_NEW_PRIVATE_KEY
EOF

echo "✅ Deployment complete!"
echo "📂 Contract addresses saved to .env.deployment"
echo ""
echo "⚠️  Next steps:"
echo "1. Add your private key and address to .env.deployment"
echo "2. Copy the variables from .env.deployment to your main .env.local file"
echo "3. Restart your application with the new environment variables"
