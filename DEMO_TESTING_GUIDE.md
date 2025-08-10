## 🧪 Complete Demo Testing Flow

### Phase 1: Issuer Application Process

1. **Navigate to Application Page**
   - Go to: `http://localhost:3000/apply`
   - Fill out the form with test data:
     ```
     Organization Name: Test Issuer Org
     Contact Email: test@issuer.com
     Website: https://testissuer.com
     Description: Test certificate issuing organization
     Wallet Address: 0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d
     ```
   - Submit the application

### Phase 2: Admin Approval Process

1. **Login as Admin**

   - Go to: `http://localhost:3000/admin-login`
   - Enter admin key: `admin123`
   - Should redirect to admin dashboard

2. **Approve Issuer**
   - Go to: `http://localhost:3000/admin`
   - Navigate to "Issuer Management" tab
   - Find the pending application
   - Click "Approve" button
   - Verify blockchain transaction completes

### Phase 3: Certificate Template Creation

1. **Login as Issuer**

   - Go to: `http://localhost:3000/issuer-login`
   - Use the same wallet address from application

2. **Create Certificate Template**
   - Navigate to templates section
   - Create a new template with fields like:
     - Student Name
     - Course Title
     - Completion Date
     - Grade

### Phase 4: Certificate Issuance

1. **Issue Certificate**
   - Select the template
   - Enter recipient details:
     - Name: John Doe
     - Email: john@example.com
     - Wallet Address: 0x[recipient_address]
   - Fill in template fields
   - Submit to blockchain

### Phase 5: Certificate Verification

1. **Verify Certificate**
   - Go to: `http://localhost:3000/verify`
   - Enter the verification code from issued certificate
   - Should display certificate details and blockchain proof

---

## 🔧 Environment Check

The following environment variables are configured:

- ✅ SUI_PACKAGE_ID: 0x6619eb84b1c9cc4ae9285c96369e446d52f71ccd1236cf9eca0e36695cb660fc
- ✅ ADMIN_CAP: 0x0ac7ffb970b503edfc27e621c5d5ad846009b42628a95fdbd1373dbf84f3e7be
- ✅ ISSUER_REGISTRY: 0x584b3f9b2d7f4a3d2aecb4df81ce921b9b026453bf32b6f78bf504486c95aee4
- ✅ CERTIFICATE_REGISTRY: 0xbfd070c87c52e27c8696587136edf045709ea42ca7b77224b95e2b29021b3939
- ✅ DATABASE_URL: Connected to Neon PostgreSQL

## 🧪 Test Data Suggestions

### Test Issuer Application:

```json
{
  "organizationName": "DevMatch Academy",
  "contactEmail": "admin@devmatch.com",
  "website": "https://devmatch.academy",
  "description": "Leading blockchain education provider",
  "walletAddress": "0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d"
}
```

### Test Certificate Template:

```json
{
  "name": "Blockchain Development Certificate",
  "description": "Certificate for completing blockchain development course",
  "fields": ["Student Name", "Course Title", "Completion Date", "Final Grade"]
}
```

### Test Certificate Issuance:

```json
{
  "recipientName": "Alice Johnson",
  "recipientEmail": "alice@example.com",
  "recipientWallet": "0x123...",
  "certificateData": {
    "Student Name": "Alice Johnson",
    "Course Title": "Advanced Blockchain Development",
    "Completion Date": "2025-01-08",
    "Final Grade": "A+"
  }
}
```
