# Fresh Smart Contract Deployment Script (PowerShell)
# This script deploys all contracts with your new admin credentials

Write-Host "🚀 Starting fresh smart contract deployment..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "Move.toml")) {
    Write-Host "❌ Error: Move.toml not found. Please run this script from the sui/contracts directory" -ForegroundColor Red
    exit 1
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
}

# Build the smart contracts
Write-Host "🔨 Building smart contracts..." -ForegroundColor Yellow
sui move build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please check your Move code for errors." -ForegroundColor Red
    exit 1
}

# Deploy the contracts
Write-Host "📦 Deploying smart contracts to Sui devnet..." -ForegroundColor Yellow
$deploymentOutput = sui client publish --gas-budget 100000000 --json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment successful!" -ForegroundColor Green

# Extract important addresses from deployment
$packageId = ($deploymentOutput.objectChanges | Where-Object { $_.type -eq "published" }).packageId
$adminCap = ($deploymentOutput.objectChanges | Where-Object { $_.objectType -like "*AdminCap*" }).objectId
$issuerRegistry = ($deploymentOutput.objectChanges | Where-Object { $_.objectType -like "*IssuerRegistry*" }).objectId
$certificateRegistry = ($deploymentOutput.objectChanges | Where-Object { $_.objectType -like "*CertificateRegistry*" }).objectId

Write-Host ""
Write-Host "📋 Important Contract Addresses:" -ForegroundColor Cyan
Write-Host "PACKAGE_ID=$packageId"
Write-Host "ADMIN_CAP=$adminCap"
Write-Host "ISSUER_REGISTRY=$issuerRegistry"
Write-Host "CERTIFICATE_REGISTRY=$certificateRegistry"

# Create environment file
Write-Host ""
Write-Host "💾 Creating .env.deployment file..." -ForegroundColor Yellow

$envContent = @"
# Fresh deployment environment variables
# Copy these to your main .env.local file

# Smart Contract Addresses
SUI_PACKAGE_ID=$packageId
PACKAGE_ID=$packageId
ADMIN_CAP=$adminCap
ISSUER_REGISTRY=$issuerRegistry
CERTIFICATE_REGISTRY=$certificateRegistry
NETWORK=devnet

# Add your private key and address here:
# SUI_PRIVATE_KEY=YOUR_NEW_PRIVATE_KEY
# SUI_WALLET_ADDRESS=YOUR_NEW_ADDRESS
# SUI_ADDRESS=YOUR_NEW_ADDRESS
# ADMIN_PRIVATE_KEY=YOUR_NEW_PRIVATE_KEY
"@

$envContent | Out-File -FilePath ".env.deployment" -Encoding UTF8

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📂 Contract addresses saved to .env.deployment" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Next steps:" -ForegroundColor Yellow
Write-Host "1. Add your private key and address to .env.deployment"
Write-Host "2. Copy the variables from .env.deployment to your main .env.local file"
Write-Host "3. Restart your application with the new environment variables"
