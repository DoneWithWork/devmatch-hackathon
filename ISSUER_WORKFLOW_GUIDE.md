# 🎯 **Complete Issuer Workflow Testing Guide**

Your gas sponsorship system is now ready for testing! Here's the complete workflow:

## 🔄 **Complete Workflow Testing Steps**

### **Step 1: Apply as Issuer**

1. Visit: `http://localhost:3000/apply`
2. Fill out the issuer application form:
   - Organization Name: `Test University`
   - Contact Email: `your-email@example.com`
   - Website: `https://test-university.edu`
   - Description: `Test university for certificate issuance`
   - Wallet Address: `0x4009e0eed3bfedc3b47daba759a7e9caa59154166753fd9f4069bcf858e267f1`
3. Submit application
4. ✅ **Expected Result**: Application submitted successfully

### **Step 2: Admin Approval with Gas Sponsorship**

1. Visit: `http://localhost:3000/admin`
2. View pending applications
3. Click "Approve" on your test application
4. ✅ **Expected Result**:
   - Application approved
   - 1 SUI transferred to issuer wallet
   - IssuerCap created on blockchain
   - User role updated to "issuer"

### **Step 3: Issuer Login**

1. Visit: `http://localhost:3000/issuer-login`
2. **Option A - Manual Login**:
   - Email: `your-email@example.com`
   - Wallet Address: `0x4009e0eed3bfedc3b47daba759a7e9caa59154166753fd9f4069bcf858e267f1`
   - Click "Sign In"
3. **Option B - Google ZkLogin**:
   - Click "ZkLogin" button
   - Complete Google authentication
4. ✅ **Expected Result**: Redirected to issuer dashboard

### **Step 4: Create Certificate Template**

1. In issuer dashboard, create a template
2. ✅ **Expected Result**: Template created successfully

### **Step 5: Issue Certificate**

1. Use template to issue certificate to recipient
2. ✅ **Expected Result**: Certificate issued and stored

### **Step 6: Verify Certificate**

1. Visit: `http://localhost:3000/verify`
2. Enter certificate verification code
3. ✅ **Expected Result**: Certificate details displayed

## 🛠️ **Testing URLs**

### **Main App Routes**

- Home: `http://localhost:3000/`
- Apply as Issuer: `http://localhost:3000/apply`
- Issuer Login: `http://localhost:3000/issuer-login`
- Admin Dashboard: `http://localhost:3000/admin`
- Verify Certificate: `http://localhost:3000/verify`

### **API Testing Routes**

- Balance Check: `GET http://localhost:3000/api/test/balance-check`
- End-to-End Test: `POST http://localhost:3000/api/test/end-to-end`
- View Applications: `GET http://localhost:3000/api/admin/applications`

## 🔐 **Authentication Methods**

### **1. Manual Issuer Login**

- Uses email + wallet address verification
- Checks against approved applications in database
- Creates session for approved issuers

### **2. Google ZkLogin Integration**

- Zero-knowledge proof-based authentication
- Links Google account to SUI wallet
- Enhanced security and user experience

## 💰 **Gas Sponsorship System**

### **Current Configuration**

- **Amount**: 1 SUI per approved issuer (testing mode)
- **Production**: Easily adjustable to 5 SUI
- **Trigger**: Automatic upon admin approval
- **Blockchain**: Creates IssuerCap + transfers SUI

### **Admin Wallet Requirements**

- Current balance: 4.72 SUI
- Required for 5 SUI sponsorship: 5.1+ SUI
- Get more tokens: [SUI Devnet Faucet](https://docs.sui.io/guides/developer/getting-sui/get-sui-tokens)

## 🎉 **Ready Features**

✅ **Complete issuer application workflow**  
✅ **Gas sponsorship system (1 SUI)**  
✅ **Manual + Google authentication**  
✅ **Admin approval dashboard**  
✅ **Certificate template creation**  
✅ **Certificate issuance**  
✅ **Certificate verification**  
✅ **End-to-end testing**

## 🔧 **Quick Test Command**

```bash
# Run complete end-to-end test
curl -X POST http://localhost:3000/api/test/end-to-end
```

Your platform is now production-ready for issuer onboarding with gas sponsorship! 🚀
