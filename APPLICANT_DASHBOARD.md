# Applicant Dashboard - View Your Status

## 🎯 **Your Current Status:**

### **👤 Issuer Application:**
```
✅ Application ID: 0xd0dc22e78582f60a8fb93521a50ab95e0ebf87db8c8e2ee79e04bd10e508fb4b
✅ Status: APPROVED ✅
✅ Name: Alice Smith
✅ Organization: DevMatch Frontend Team
✅ Email: alice@devmatch.com
✅ Applied: January 8, 2025
✅ Approved: January 8, 2025
```

### **📋 Your Templates:**
```
Template #1: Blockchain Development Bootcamp
├── ID: 0xe21db89af54ce771839a3b2906a0507f749f0448fdc45593ad579b68b4fdbf0d
├── Type: Course Completion
├── Status: Active ✅
├── Fields: Student Name, Course Title, Grade, Completion Date
└── Created: January 8, 2025
```

### **🎓 Capabilities:**
```
✅ Can create certificate templates (8M MIST gas)
✅ Can issue certificates (6M MIST gas)
✅ Can mint NFTs (3.5M MIST gas)
```

---

## 📱 **Quick Commands for Applicants:**

### **Check Your Application Status:**
```bash
# View your IssuerCap details
sui client object YOUR_ISSUER_CAP_ID

# Check if approved (look for "approved: true")
```

### **View Your Templates:**
```bash
# List all your objects
sui client objects

# Inspect specific template
sui client object YOUR_TEMPLATE_ID
```

### **Check Gas Balance:**
```bash
# See how much SUI you have
sui client gas

# Your current balance: 19+ SUI (plenty for operations!)
```

---

## 🚀 **Next Steps as Approved Issuer:**

### **1. Issue Your First Certificate:**

**Option A: Using TypeScript SDK (Recommended)**
```bash
# Use the existing issue script
npm run issue-certificate
```

**Option B: Direct script execution**
```bash
# Navigate to scripts directory
cd sui/contracts/scripts

# Run the issue script directly
npx tsx issue.ts
```

**Option C: Using CLI (Limited - for simple testing only)**
```bash
# CLI has limitations with complex vector parameters
# Use TypeScript SDK for production certificate issuance
sui client call \
  --package 0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc \
  --module certificate \
  --function issue_certificate \
  --gas-budget 6000000
```

### **2. Create More Templates:**
```bash
sui client call \
  --package 0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc \
  --module certificate \
  --function create_certificate_template \
  --args \
    YOUR_ISSUER_CAP_ID \
    "Template Name" \
    "Description" \
    "Image URL" \
    "Certificate Type" \
    '["Field1", "Field2"]' \
    0xbfd070c87c52e27c8696587136edf045709ea42ca7b77224b95e2b29021b3939 \
  --gas-budget 8000000
```

---

## 💡 **Status Codes:**

| Field | Value | Meaning |
|-------|-------|---------|
| `approved` | `true` | ✅ You can issue certificates |
| `approved` | `false` | ⏳ Waiting for admin approval |
| `is_active` | `true` | ✅ Template can be used |
| `is_active` | `false` | ❌ Template is disabled |

## 🔍 **Troubleshooting:**

### **If You Don't See Your Application:**
1. Check `sui client objects` for IssuerCap
2. Verify you applied with correct registry address
3. Check transaction history with `sui client txs`

### **If Application Shows "approved: false":**
1. Contact admin for approval
2. Provide your IssuerCap ID: `0xd0dc...`
3. Wait for approval transaction

### **If Gas Errors:**
1. Check balance: `sui client gas`
2. Use tested gas budgets from optimization guide
3. Request more SUI from faucet if needed
