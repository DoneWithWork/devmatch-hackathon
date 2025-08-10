# HashCred Platform - Environment Backup & Configuration Record

# Generated: August 9, 2025

# Purpose: Complete backup of all environment configurations for safe reference

## =================================================================

## CURRENT .env.local CONFIGURATION (ACTIVE)

## =================================================================

# Blockchain Configuration - MATCHED SETUP

SUI_PRIVATE_KEY=suiprivkey1qqgx3p7cnw3e3dwttececgmpq5sr6yk0pf9tvllh2yxysn3wewh0jx3f3gxp
SUI_WALLET_ADDRESS=0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d
SUI_ADDRESS=0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d
ADMIN_PRIVATE_KEY=suiprivkey1qqgx3p7cnw3e3dwttececgmpq5sr6yk0pf9tvllh2yxysn3wewh0jx3f3gxp

# Smart Contract Addresses

SUI_PACKAGE_ID=0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc
PACKAGE_ID=0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc
ADMIN_CAP=0x0ac7ffb970b503edfc27e621c5d5ad846009b42628a95fdbd1373dbf84f3e7be
ISSUER_REGISTRY=0x584b3f9b2d7f4a3d2aecb4df81ce921b9b026453bf32b6f78bf504486c95aee4
CERTIFICATE_REGISTRY=0xbfd070c87c52e27c8696587136edf045709ea42ca7b77224b95e2b29021b3939
SUI_ISSUER_CAP=0xc4f9d9f952eb8b7fecaaf76927cc5aaaa86aa8b3b0de15789a16f1d962f7a009
NETWORK=devnet

# Database Configuration

DATABASE_URL=postgresql://neondb_owner:npg_83VkRpwizojb@ep-cold-pine-a1e7ylfe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Authentication Configuration

PRIVATE_ENOKI_KEY=dummy_enoki_key_for_testing_minimum_length
SESSION_KEY=dummy_session_key_minimum_length_required_for_auth
NEXT_PUBLIC_ENOKI_KEY=dummy_public_enoki_key_for_testing
NEXT_PUBLIC_GOOGLE_CLIENT_ID=dummy_google_client_id_for_oauth

# File Upload Configuration

UPLOADTHING_TOKEN=dummy_uploadthing_token_for_testing

# DNS Verification Configuration

NEXT_PUBLIC_TXT_KEY=hashcred_dns_verification_key
NEXT_PUBLIC_DNS_KEY=hashcred_verification_domain_key

## =================================================================

## ADDRESS & CAPABILITY VERIFICATION STATUS

## =================================================================

## CURRENT ACTIVE CONFIGURATION (VERIFIED WORKING)

# Private Key: suiprivkey1qqgx3p7cnw3e3dwttececgmpq5sr6yk0pf9tvllh2yxysn3wewh0jx3f3gxp

# Derived Address: 0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d

# Issuer Capability: 0xc4f9d9f952eb8b7fecaaf76927cc5aaaa86aa8b3b0de15789a16f1d962f7a009

# Ownership Status: ✅ PERFECT MATCH

# Approval Status: ❌ NEEDS APPROVAL

## ALTERNATIVE APPROVED CONFIGURATION (BACKUP OPTION)

# Approved Issuer Cap: 0xd0dc22e78582f60a8fb93521a50ab95e0ebf87db8c8e2ee79e04bd10e508fb4b

# Owner Address: 0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26

# Approval Status: ✅ ALREADY APPROVED

# Issuer Name: Alice Smith

# Organization: DevMatch Frontend Team

# Note: This configuration is approved but we don't have the private key for this address

## ADMIN CONFIGURATION

# Admin Capability: 0x0ac7ffb970b503edfc27e621c5d5ad846009b42628a95fdbd1373dbf84f3e7be

# Admin Owner: 0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26

# Note: Admin cap is owned by different address than our current wallet

## =================================================================

## BLOCKCHAIN OBJECT DETAILS

## =================================================================

## Package Information

Package ID: 0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc
Network: Sui Devnet
Modules: devmatch_nft::certificate, devmatch_nft::issuer, devmatch_nft::simple_nft

## Registry Objects

Issuer Registry: 0x584b3f9b2d7f4a3d2aecb4df81ce921b9b026453bf32b6f78bf504486c95aee4
Certificate Registry: 0xbfd070c87c52e27c8696587136edf045709ea42ca7b77224b95e2b29021b3939

## =================================================================

## HISTORICAL CONFIGURATIONS (FOR REFERENCE)

## =================================================================

## Demo Credentials (From IssuerDashboard.tsx)

# Private Key: suiprivkey1qqgx3p7cnw3e3dwttececgmpq5sr6yk0pf9tvllh2yxysn3wewh0jx3f3gxp

# Address: 0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26

# Issuer Cap: 0xd0dc22e78582f60a8fb93521a50ab95e0ebf87db8c8e2ee79e04bd10e508fb4b

# Note: Same private key but different address - indicates potential derivation inconsistency

## Previous Working Configuration

# Environment had these addresses hardcoded in multiple components:

# - TransactionHistory.tsx: 0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26

# - GasBalanceTracker.tsx: 0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26

# - Admin components: 0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26

## =================================================================

## SECURITY & BACKUP NOTES

## =================================================================

## Private Keys (HANDLE WITH CARE)

# Current Private Key: suiprivkey1qqgx3p7cnw3e3dwttececgmpq5sr6yk0pf9tvllh2yxysn3wewh0jx3f3gxp

# Derivation Method: Ed25519Keypair.fromSecretKey(keyBytes.slice(1, 33))

# Base64 Decoding: keyWithoutPrefix = privateKey.slice(11)

## Critical Object IDs (DO NOT LOSE)

# Admin Capability: 0x0ac7ffb970b503edfc27e621c5d5ad846009b42628a95fdbd1373dbf84f3e7be

# Current Issuer Cap: 0xc4f9d9f952eb8b7fecaaf76927cc5aaaa86aa8b3b0de15789a16f1d962f7a009

# Approved Issuer Cap: 0xd0dc22e78582f60a8fb93521a50ab95e0ebf87db8c8e2ee79e04bd10e508fb4b

# Package ID: 0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc

## Database Connection

# Provider: Neon PostgreSQL

# Connection: ep-cold-pine-a1e7ylfe-pooler.ap-southeast-1.aws.neon.tech

# Database: neondb

# User: neondb_owner

## =================================================================

## RECOVERY INSTRUCTIONS

## =================================================================

## If Environment is Lost:

1. Copy this entire file content to a new .env.local
2. Verify address derivation with: node verify-final.mjs
3. Check blockchain objects exist on Sui Devnet explorer
4. Test database connection
5. Restart development server

## If Issuer Approval is Needed:

1. Use admin capability: 0x0ac7ffb970b503edfc27e621c5d5ad846009b42628a95fdbd1373dbf84f3e7be
2. Target issuer cap: 0xc4f9d9f952eb8b7fecaaf76927cc5aaaa86aa8b3b0de15789a16f1d962f7a009
3. Call: devmatch_nft::issuer::approve_issuer
4. Signer must own admin capability

## Alternative: Use Pre-Approved Issuer

1. Switch to: 0xd0dc22e78582f60a8fb93521a50ab95e0ebf87db8c8e2ee79e04bd10e508fb4b
2. Find private key for: 0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26
3. Update SUI_WALLET_ADDRESS and SUI_ISSUER_CAP accordingly
