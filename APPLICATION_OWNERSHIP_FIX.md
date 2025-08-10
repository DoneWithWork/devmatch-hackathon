# Fix for Applications Route - Ownership Issue

## Problem Analysis

The current `/api/admin/applications` endpoint has a critical flaw:

1. **User applies** via UI form (no wallet connection)
2. **Backend uses admin keypair** to execute `apply_to_be_issuer`
3. **Move contract creates IssuerCap owned by admin** (transaction sender)
4. **Later approval fails** because admin tries to approve objects they already own

## Root Cause

The Move contract `apply_to_be_issuer` function:

```move
let sender = tx_context::sender(ctx);  // This is the admin!
// ...
transfer::public_transfer(issuer_cap, sender);  // Transfers to admin
```

When admin signs the transaction, the admin becomes the sender and owner.

## Solution Applied

**Temporary Fix**: Comment out blockchain creation during application submission.

### Changes Made to `/api/admin/applications/route.ts`:

1. **Commented out** the entire blockchain creation section
2. **Applications now stored** in database only during submission
3. **IssuerCap creation moved** to approval process (will need future implementation)

### Code Changes:

```typescript
// ⚠️ CRITICAL FIX: Commenting out IssuerCap creation to prevent ownership issues
//
// PROBLEM: When admin creates IssuerCap, it becomes owned by admin,
// causing approval failures with ownership conflicts.
//
// SOLUTION: Skip blockchain creation during application submission.

/*
// Call smart contract to create IssuerCap  
// ... blockchain creation code temporarily disabled
*/

// Return success without blockchain integration during application submission
return NextResponse.json({
  // ... application data without issuerCapId
  message:
    "Application submitted successfully! Blockchain components will be created during approval process.",
});
```

## Next Steps Required

1. **Test the fix**: Have a user submit a new application
2. **Verify no ownership issues**: Application should save to database only
3. **Implement proper approval flow**: Create IssuerCap with correct ownership during approval

## Long-term Solutions

### Option A: User-Signed Transactions

- Have users connect wallet and sign their own `apply_to_be_issuer` transactions
- Admin provides sponsored gas but user is the sender
- IssuerCap becomes owned by user (correct ownership)

### Option B: Modified Contract Flow

- Change contract to allow admin to create IssuerCap for specific user address
- Admin creates object but transfers to user in same transaction
- Requires Move contract changes

### Option C: Two-Step Process (Current Approach)

- Application submission: Database only (no blockchain)
- Approval process: Admin creates IssuerCap and immediately approves it
- Simpler but requires careful implementation

---

**Status**: 🔧 **TEMPORARY FIX APPLIED** - Ready for testing
