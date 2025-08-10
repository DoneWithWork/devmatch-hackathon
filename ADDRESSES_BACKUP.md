# 🔒 CRITICAL ADDRESSES & KEYS BACKUP

# Date: August 9, 2025

# NEVER DELETE THIS FILE - Contains all critical blockchain addresses

## ⚠️ PRIVATE KEY (KEEP SECURE)

```
suiprivkey1qquqnrlzdx5etv0m3g3vt72g8e9kghyp6rumk0hgrhhee42clyugx0ujf2m
```

## 🏛️ SMART CONTRACT ADDRESSES

```
Package ID:           0x50d6e9fba4ac428b01ee8e978706dd2203bd06c3ebce577f6d0afff2573f0836
Admin Capability:     0x7fe4a4539c516eb6251bcda614b666caaff158edff09dc092f75262706bd4e47
Issuer Registry:      0x55224a385c90819a3c32ff3d5b97ff96a9506e402290c6ddfd20bf8692a1dddd
Certificate Registry: 0x5c17924b51f5449c16905b7c6b1e42a2bfe397ed73fbefb9e92c9c20cf3c24d5
```

## 👤 WALLET ADDRESSES

```
Current Wallet:  0x7e7994f5eb50e7cc88283432907a167236c4bffed5b0fa375cbd1dc1373c1798
Admin Wallet:    0x7e7994f5eb50e7cc88283432907a167236c4bffed5b0fa375cbd1dc1373c1798
```

## 📜 ISSUER CAPABILITIES

```
Current Issuer Cap:   0xcc394629b3d20a83d01b19dcc69013017b78a583b9c2375dd6d08fa9af40db3f (PENDING)
```

## 🗄️ DATABASE

```
URL: postgresql://neondb_owner:npg_83VkRpwizojb@ep-cold-pine-a1e7ylfe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 🌐 NETWORK

```
Sui Devnet
Explorer: https://suiexplorer.com/?network=devnet
```

---

## 🆘 EMERGENCY RECOVERY STEPS

If you lose the environment configuration:

1. **Copy this entire content to `.env.local`:**

   ```bash
   SUI_PRIVATE_KEY=suiprivkey1qquqnrlzdx5etv0m3g3vt72g8e9kghyp6rumk0hgrhhee42clyugx0ujf2m
   SUI_WALLET_ADDRESS=0x7e7994f5eb50e7cc88283432907a167236c4bffed5b0fa375cbd1dc1373c1798
   SUI_ISSUER_CAP=0xcc394629b3d20a83d01b19dcc69013017b78a583b9c2375dd6d08fa9af40db3f
   PACKAGE_ID=0x50d6e9fba4ac428b01ee8e978706dd2203bd06c3ebce577f6d0afff2573f0836
   ADMIN_CAP=0x7fe4a4539c516eb6251bcda614b666caaff158edff09dc092f75262706bd4e47
   ISSUER_REGISTRY=0x55224a385c90819a3c32ff3d5b97ff96a9506e402290c6ddfd20bf8692a1dddd
   CERTIFICATE_REGISTRY=0x5c17924b51f5449c16905b7c6b1e42a2bfe397ed73fbefb9e92c9c20cf3c24d5
   DATABASE_URL=postgresql://neondb_owner:npg_83VkRpwizojb@ep-cold-pine-a1e7ylfe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

2. **Run verification:** `node verify-final.mjs`

3. **Start server:** `pnpm dev`

---

## ✅ VERIFICATION STATUS

- ❌ Private Key → Address Derivation: MISMATCH (Sui CLI vs JavaScript parsing)
- ❌ Address → Admin Cap Ownership: OWNERSHIP MISMATCH
- ❌ Issuer Approval Status: BLOCKED BY SIGNATURE ERROR
- ✅ Database Connection: WORKING
- ✅ Smart Contract Deployment: WORKING

## ⚠️ KNOWN ISSUES

- **Admin Capability Ownership**: The admin capability is owned by `0x1c59...` but the private key derives to `0x7e79...` in JavaScript
- **Solution Required**: Need to redeploy smart contract with admin address `0x7e7994f5eb50e7cc88283432907a167236c4bffed5b0fa375cbd1dc1373c1798`
