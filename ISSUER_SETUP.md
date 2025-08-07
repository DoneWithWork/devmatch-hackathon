# Team Member Setup Guide

## 🎭 **Role-Based Access**

### **Role: ADMIN (Project Owner)**

- Has: `AdminCap`
- Can: Approve/reject issuers, full control
- Count: Only 1 person (you)

### **Role: ISSUER (Team Members)**

- Has: `IssuerCap` (after approval)
- Can: Create certificates, mint NFTs
- Count: Multiple team members

---

## 🚀 **Setup for Team Members (ISSUER role)**

### **Step 1: Apply for Issuer Status**

```bash
# Replace with teammate's info
sui client call \
  --package 0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc \
  --module issuer \
  --function apply_issuer \
  --args 0x584b3f9b2d7f4a3d2aecb4df81ce921b9b026453bf32b6f78bf504486c95aee4 "John Doe" "john@devmatch.com" "DevMatch Team" \
  --gas-budget 2000000
```

### **Step 2: Admin Approves (You do this)**

```bash
sui client call \
  --package 0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc \
  --module issuer \
  --function approve_issuer \
  --args 0x0ac7ffb970b503edfc27e621c5d5ad846009b42628a95fdbd1373dbf84f3e7be 0x584b3f9b2d7f4a3d2aecb4df81ce921b9b026453bf32b6f78bf504486c95aee4 TEAMMATE_ADDRESS \
  --gas-budget 2000000
```

### **Step 3: Teammate Uses IssuerCap**

```bash
# Now they can mint certificates and NFTs!
sui client call \
  --package 0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc \
  --module certificate \
  --function issue_certificate \
  --args THEIR_ISSUER_CAP "Course Name" "Student Name" \
  --gas-budget 6000000
```

---

## 🏗️ **Option 2: Deploy Own Contract (Advanced)**

If teammates want full independence:

```bash
# Clone and deploy their own version
git clone <your-repo>
cd sui/contracts
sui client publish --gas-budget 100000000

# They get their own AdminCap + Package ID
```

---

## 🎯 **Recommended Team Structure**

```
👑 You (ADMIN)              → Has AdminCap
├── 👨‍💻 Teammate 1 (ISSUER)   → Gets IssuerCap
├── 👩‍💻 Teammate 2 (ISSUER)   → Gets IssuerCap
└── 🧑‍💻 Teammate 3 (ISSUER)   → Gets IssuerCap
```

**Benefits:**

- ✅ One shared contract (consistent data)
- ✅ Role-based permissions
- ✅ Easy approval workflow
- ✅ Same gas optimization benefits
