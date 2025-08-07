# Team Setup Guide

## 🚀 Getting Started for New Team Members

### Step 1: Clone and Setup

```bash
git clone <your-repo>
cd devmatch-hackathon
npm install
```

### Step 2: Configure Environment

```bash
# Copy the example file
cp scripts/.env.example scripts/.env

# Edit .env and add your own ADMIN_CAP
# Get it by running: sui client objects
```

### Step 3: Get DevNet Tokens

```bash
# Request test SUI tokens
sui client faucet

# Check balance
sui client gas
```

### Step 4: Test Gas Optimization

```bash
# Navigate to scripts
cd scripts

# Run the TypeScript demo
npm run ts-node gas-typescript-demo.ts
```

## 🔧 Individual Setup Requirements

Each team member needs their own:

- ✅ Sui wallet address
- ✅ DevNet SUI tokens (from faucet)
- ✅ Their own ADMIN_CAP object (if deploying contracts)

## 🌐 Shared Resources

Everyone uses the same:

- ✅ Contract addresses (PACKAGE_ID)
- ✅ Registry addresses
- ✅ Gas optimization settings
- ✅ DevNet network

## 🛡️ Security Notes

- Never commit real `.env` files
- Each person has their own capabilities
- Testnet tokens have no real value
- Public contract addresses are safe to share
