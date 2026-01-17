# Sovereignty Vault Bug Fixes - Session Summary

**Date:** January 12, 2026  
**Session Duration:** ~2 hours  
**Status:** ✅ All Critical Bugs Resolved

---

## Executive Summary

This session resolved three critical bugs in the Sovereignty Vault (Certificates Modal) and the attestation system:

1. **Vault Infinite Loading** - Modal stuck on "Loading vault..." forever
2. **Delete Not Persisting** - Deleted certificates reappeared after reopening
3. **Incorrect Integrity Score** - Certificates showed 100% for compromised drafts

---

## Bug #1: Sovereignty Vault Infinite Loading

### Symptoms
- Opening the "Certificates" modal showed endless loading spinner
- Console showed `[Vault] Step 2: Getting session...` but never proceeded
- 30-second timeout triggered, showing "No certificates yet"

### Root Cause Analysis
1. **Initial Issue:** React Rules of Hooks violation - `useState`/`useEffect` called after early `return null`
2. **Deeper Issue:** `supabase.auth.getSession()` was hanging indefinitely
3. **Root Cause:** "Multiple GoTrueClient instances detected" warning indicated auth client deadlock

### Solution
Bypassed the Supabase client entirely for read operations:

```typescript
// Before: Supabase client (deadlocking)
const { data: { session } } = await supabase.auth.getSession();
const certs = await supabase.from('attestation_certificates').select('*');

// After: Direct REST API with AuthContext
const { user, session } = useAuth(); // From React context
const response = await fetch(
  `${supabaseUrl}/rest/v1/attestation_certificates?user_id=eq.${userId}`,
  { headers: { 'Authorization': `Bearer ${session.access_token}` } }
);
```

### Files Modified
- `src/components/CertificatesModal.tsx` - Use `useAuth()` hook, wait for auth loading
- `src/services/attestationService.ts` - `getCertificates()` uses direct REST API

---

## Bug #2: Certificate Delete Not Persisting

### Symptoms
- Clicking trash icon removed certificate from UI (optimistic update)
- Closing and reopening Vault showed the certificate again
- No console errors visible

### Root Cause
`deleteCertificate()` used the same Supabase client that was deadlocking for reads.

### Solution
Updated `deleteCertificate()` to use direct REST API:

```typescript
// Before
await supabase.from('attestation_certificates').delete().eq('id', certId);

// After
await fetch(`${supabaseUrl}/rest/v1/attestation_certificates?id=eq.${certId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### Files Modified
- `src/services/attestationService.ts` - `deleteCertificate()` uses REST API
- `src/components/CertificatesModal.tsx` - Pass `session.access_token` to delete

---

## Bug #3: Incorrect Integrity Score (100% for Compromised Drafts)

### Symptoms
- Draft flagged as "COMPROMISED" with 0% Sovereignty Score
- Generated PDF certificate showed "Integrity Score: 100%"
- Vault displayed "100% Human" badge

### Root Cause
The Edge Function had a hardcoded value:

```typescript
// supabase/functions/attest-session/index.ts, line 104
const integrityScore = 100; // ← ALWAYS 100% regardless of actual score!
```

The `clientScore` passed from the frontend was completely ignored.

### Solution
Use the `clientScore` from the frontend with validation:

```typescript
const clientScore = payload?.clientScore;

// Validate: must be 0-100, default to 0 if invalid
const validatedScore = typeof clientScore === 'number' && 
  clientScore >= 0 && clientScore <= 100 
    ? Math.round(clientScore) 
    : null;

const integrityScore = validatedScore ?? 0;
```

### Files Modified
- `supabase/functions/attest-session/index.ts` - Use validated clientScore

### Deployment
```bash
npx supabase functions deploy attest-session --no-verify-jwt
```

---

## Technical Architecture Changes

### Before
```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐
│ CertificatesModal│───▶│ Supabase Client │───▶│ Supabase API │
│                 │    │   (DEADLOCK!)   │    │              │
└─────────────────┘    └─────────────────┘    └──────────────┘
```

### After
```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐
│ CertificatesModal│───▶│  AuthContext    │    │              │
│                 │    │  (user/session) │    │              │
└────────┬────────┘    └─────────────────┘    │              │
         │                                     │              │
         │  Direct fetch() with access_token   │              │
         └────────────────────────────────────▶│ Supabase API │
                                               │              │
└─────────────────┘                            └──────────────┘
```

---

## Key Learnings

1. **Multiple Supabase Client Instances** - The "Multiple GoTrueClient instances" warning was a critical indicator. The Supabase JS client was creating multiple auth instances, causing a deadlock.

2. **REST API as Fallback** - When the SDK client fails, direct REST API calls with proper authentication headers work reliably.

3. **AuthContext for Session** - Using React's AuthContext to access user/session state is more reliable than calling `supabase.auth.getSession()` in components.

4. **Server-Side Validation** - The integrity score bug highlights the importance of server-side validation. The Edge Function should ideally recalculate the score server-side rather than trusting client input.

---

## Remaining Considerations

### Known Warnings (Non-Breaking)
- "Multiple GoTrueClient instances detected" - Still appears in console but no longer causes issues
- "Database query timed out" for Premium Status - Unrelated to Vault, deferred

### Future Improvements
1. **Server-Side Score Calculation** - Add TODO in Edge Function to recalculate sovereignty score from snapshots server-side
2. **Draft Title in Vault** - Currently shows "Untitled Draft" for all; need to re-add JOIN query once client issues are resolved
3. **Supabase Client Singleton** - Investigate and fix the multiple client instance issue at the root

---

## Files Changed Summary

| File | Changes |
|------|---------|
| `src/components/CertificatesModal.tsx` | Hooks order fix, useAuth integration, REST API calls |
| `src/services/attestationService.ts` | `getCertificates()` and `deleteCertificate()` use REST API |
| `supabase/functions/attest-session/index.ts` | Use clientScore instead of hardcoded 100 |

---

## Verification Checklist

- [x] Vault opens and loads certificates
- [x] Delete removes certificate permanently
- [x] New attestation with 0% score shows 0% in PDF
- [x] New attestation with 0% score shows 0% in Vault
- [x] Existing certificates still display (legacy data intact)

---

*Session completed successfully. All critical bugs resolved.*
