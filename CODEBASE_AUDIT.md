# Codebase Audit — BalasBro.ai

**Date:** 2026-05-29
**TypeScript:** `npx tsc --noEmit --skipLibCheck` — **CLEAN** (no errors)
**ESLint:** **BROKEN** — circular structure error in config validator

---

## CRITICAL — Auth System Broken

### 1. Dual session systems — ALL API routes return 401

**Severity:** CRITICAL
**Files:** `app/api/ai/*.ts`, `app/api/conversations/*.ts`, `app/api/customers/*.ts`, `app/api/orders/*.ts`, `app/api/me/*.ts`, `app/api/metrics/*.ts`, `app/api/auth/password/change/route.ts`, `app/api/auth/mfa/*.ts`, and many more

**Root Cause:**

After the Neon Auth migration, there are two separate session systems:

| Route Type | Session Used | Cookie Checked | Status |
|---|---|---|---|
| Auth routes (`/api/auth/login`, `/api/auth/logout`, `/api/auth/session`) | `auth.signIn.email()`, `auth.signOut()`, `auth.getSession()` (Neon Auth) | `__Secure-neon-auth.session_token` | ✅ Working |
| All other API routes (AI, conversations, customers, orders, etc.) | `getSession()` from `@/auth` → `getSessionFromCookie()` from `lib/session.ts` | `balasbro_session` (old JWT cookie) | ❌ **BROKEN** |

The migration changed login to only create a Neon Auth session cookie (`__Secure-neon-auth.session_token`), but ~25+ API routes still check for the old `balasbro_session` JWT cookie which is **never set anymore**.

**Evidence:**

```typescript
// auth.ts exports TWO things:
export const auth = neonAuth                          // Neon Auth instance
export async function getSession(): Promise<SessionPayload | null> {
  return getSessionFromCookie()                        // OLD JWT system!
}
```

```typescript
// All these API routes use getSession() from @/auth → old JWT session:
app/api/ai/classify/route.ts:        import { getSession } from "@/auth"
app/api/conversations/route.ts:       import { getSession } from "@/auth"
app/api/customers/route.ts:          import { getSession } from "@/auth"
app/api/orders/route.ts:              import { getSession } from "@/auth"
app/api/me/route.ts:                  import { getSession } from "@/auth"
app/api/auth/password/change/route.ts: import { getSession } from "@/auth"
app/api/auth/mfa/toggle/route.ts:     import { getSession } from "@/auth"
app/api/auth/mfa/setup/route.ts:      import { getSession } from "@/auth"
app/api/auth/mfa/disable/route.ts:    import { getSession } from "@/auth"
```

**Fix:** All API routes should use `auth.getSession()` from Neon Auth instead of `getSession()` from `lib/session.ts`. The `auth.ts` should export Neon Auth's `getSession` directly, and all API routes should be updated to use it.

---

### 2. Register route uses deprecated Neon Auth HTTP API

**Severity:** CRITICAL
**File:** `app/api/auth/register/route.ts`

The register route still uses the old HTTP-based Neon Auth API via `fetch()`:

```typescript
// Lines 61-75 — OLD approach, doesn't use current SDK
const neonSignUpRes = await fetch(`${neonAuthUrl}/sign-up/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, name }),
})
const neonSignUpData = await neonSignUpRes.json()
// ...
providerAccountId: neonSignUpData.userId ?? email,  // May not exist in response
access_token: neonSignUpData.token,                  // May not exist
refresh_token: neonSignUpData.refreshToken ?? null,   // May not exist
```

This should use `auth.signUp.email({ email, password, name, callbacks: {...} })` from the current Neon Auth SDK, similar to how `auth.signIn.email()` is used in the login route.

Additionally, the response shape of Neon Auth's sign-up endpoint may not match what the code expects (`userId`, `token`, `refreshToken`).

---

### 3. Password change route uses wrong session and wrong property path

**Severity:** CRITICAL
**File:** `app/api/auth/password/change/route.ts`

```typescript
// Line 31: Uses OLD JWT session (getSessionFromCookie), not Neon Auth
const session = await getSession()

// Line 36: Wrong property path — SessionPayload has userId, not user.id
const userId = (session as any)?.user?.id || ""
```

Also calls `logoutAllDevices(userId)` which deletes Prisma `Session` records — but since Neon Auth sessions aren't stored in Prisma, this is a no-op.

---

### 4. MFA routes use wrong session system

**Severity:** HIGH
**Files:** `app/api/auth/mfa/toggle/route.ts`, `app/api/auth/mfa/setup/route.ts`, `app/api/auth/mfa/disable/route.ts`, `app/api/auth/mfa/verify/route.ts`

All MFA routes call `getSession()` from `@/auth` which resolves to the old JWT session. Since login only creates a Neon Auth session, all MFA operations will fail with 401.

---

## HIGH — Architectural Issues

### 5. lib/session.ts is dead code (orphaned JWT system)

**Severity:** MEDIUM
**File:** `lib/session.ts`

All functions in `lib/session.ts` are no longer called from any app file:

| Function | Status |
|---|---|
| `createSession()` | ❌ Never called |
| `getSessionFromRequest()` | ❌ Never called |
| `getSessionFromCookie()` | ❌ Only called by `getSession()` wrapper in `auth.ts` |
| `setSessionCookie()` | ❌ Never called |
| `clearSessionCookie()` | ❌ Never called |

The `balasbro_session` cookie is never set by any active code path. The `getSessionFromCookie()` function is still called by the wrapper in `auth.ts`, but that wrapper itself is the problem (issue #1).

---

### 6. lib/session-manager.ts is dead code

**Severity:** MEDIUM
**File:** `lib/session-manager.ts`

```typescript
// logoutAllDevices — deletes Prisma Session records
// getActiveSessionsCount — counts Prisma Session records
```

Both functions operate on Prisma `Session` records. Since the Neon Auth migration, no Prisma `Session` records are being created. These functions are effectively no-ops. `logoutAllDevices()` is still called from `password/change/route.ts` but has no effect.

---

### 7. Phantom `phone` field in me route PATCH schema

**Severity:** MEDIUM
**File:** `app/api/me/route.ts`

```typescript
// Line 8 — phone defined in schema
const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),  // ← No such field on User model
  businessName: z.string().min(1).optional(),
})

// Line 56 — phone destructured
const { name, phone, businessName } = parsed.data  // phone is unused
```

The Prisma `User` model has no `phone` field. The `phone` is destructured but never used — no `prisma.user.update({ data: { phone } })` call exists. The Zod schema accepts it but nothing happens.

Note: `Business` model does have a `phone` field, but the `phone` from `UpdateSchema` is a top-level field (intended for user phone?), not `business.phone`.

---

### 8. Register creates unnecessary local password hash

**Severity:** MEDIUM
**File:** `app/api/auth/register/route.ts`

```typescript
// Line 84 — bcrypt hash created
const hashedPassword = await bcrypt.hash(password, 12)

// Line 91 — stored in Prisma
password: hashedPassword,
```

Since auth is now Neon Auth only, the local `password` field in Prisma `User` is only used by `password/change/route.ts` for verification. However, `password/change/route.ts` itself is broken (issue #3). The hash creation in register is redundant overhead. If the local password is truly needed as a fallback, it should be documented and handled consistently.

---

## MEDIUM — ESLint Configuration

### 9. ESLint has circular structure error

**Severity:** MEDIUM
**File:** ESLint config (likely `eslint.config.mjs` or `.eslintrc.*`)

```
TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    |     property 'configs' -> object with constructor 'Object'
    |     property 'flat' -> object with constructor 'Object'
    |     property 'plugins' -> object with constructor 'Object'
    |     ...
    |     property 'react' closes the circle
Referenced from:
    at JSON.stringify (<anonymous>)
    at node_modules/@eslint/eslintrc/lib/shared/config-validator.js:308:45
```

ESLint cannot run. Likely caused by a plugin configuration issue (possibly the React plugin or a shared config creating circular references).

---

### 10. ESLint disabled for the project

**Severity:** LOW

ESLint is configured in `package.json` scripts but is currently non-functional. All lint errors are undetected.

---

## LOW — Code Quality Issues

### 11. Hardcoded color values instead of design tokens

**Severity:** LOW
**Files:** `components/landing/cta-section.tsx`, `components/landing/pricing-matrix.tsx`, `components/landing/nav-bar.tsx`

Some components use hardcoded hex values instead of the design system's semantic color tokens:

```tsx
// cta-section.tsx — hardcoded brand colors
bg-white text-[#3a7a55]  // should use bg-background text-primary

// pricing-matrix.tsx — hardcoded
bg-white text-[#3a7a55]   // should use semantic tokens

// nav-bar.tsx — hardcoded
bg-[#3a7a55] hover:bg-[#1a5e3a]  // should use bg-primary/hover
```

The design system defines `primary` (#3a7a55), `secondary` (#795900), `tertiary` (#2b3d4f), etc. Components should use these tokens for consistency and dark mode support.

---

### 12. `passwordVersion` incremented but never checked

**Severity:** LOW
**File:** `app/api/auth/password/change/route.ts`

```typescript
// Line 65 — passwordVersion is incremented
data: {
  password: hashedPassword,
  passwordVersion: { increment: 1 },
}
```

`passwordVersion` is incremented on every password change, but no API route or middleware checks `passwordVersion` before allowing operations. The field is effectively unused. If it's meant to invalidate old sessions/tokens, there's no code implementing that logic.

---

### 13. Inconsistent session property access patterns

**Severity:** LOW
**Multiple files**

Different API routes access session properties inconsistently:

```typescript
// Some use session.userId directly (from JWT SessionPayload):
const session = await getSession()
const userId = session.userId  // lib/session.ts SessionPayload

// Some use session.userId from (session as any):
const userId = (session as any)?.user?.id || ""  // Wrong path

// Neon Auth session has session.user.id:
const session = await auth.getSession()
const userId = (session as any).id  // Neon Auth session shape
```

After fixing issue #1, these inconsistencies will need to be standardized.

---

### 14. MFA toggle doesn't refresh UI state

**Severity:** LOW
**File:** `app/(app)/settings/security/page.tsx`

```typescript
// handleToggleMFA — calls API but doesn't update local mfaEnabled state
async function handleToggleMFA() {
  setMfaLoading(true)
  try {
    await fetch("/api/auth/mfa/toggle", { method: "POST" })
    // ❌ No revalidation of mfaEnabled after toggle
  } finally {
    setMfaLoading(false)
  }
}
```

After toggling MFA, the UI state (`mfaEnabled`) is not updated. The `useSWR` cache may not revalidate automatically. Should call `mutate()` or update local state.

---

### 15. `app/(public)/page.tsx` may still exist

**Severity:** LOW
**Files:** `app/(public)/page.tsx`

During the earlier redirect fix, `(public)/page.tsx` was supposed to be deleted because both `app/page.tsx` and `app/(public)/page.tsx` handle the `/` route. If `(public)/page.tsx` still exists, it creates a routing conflict.

---

### 16. No rate limit headers on some error responses

**Severity:** LOW
**Files:** `app/api/auth/register/route.ts`

Rate limit headers (`X-RateLimit-*`) are defined but not always included in responses:

```typescript
// Line 37 — error response missing rate limit headers
return NextResponse.json({
  { error: "Invalid input", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
  { status: 400 }  // ❌ No headers
})
```

Should include headers in all responses per API consistency.

---

### 17. `app/api/me/sessions/route.ts` returns mock data

**Severity:** INFORMATIONAL
**File:** `app/api/me/sessions/route.ts`

```typescript
// Returns a single mock session, not actual active sessions
const currentSession = {
  id: session.userId,  // Uses userId as session id — incorrect
  // ...
}
```

This is a placeholder. The "Active Sessions" feature in settings/security shows only one hardcoded session and doesn't actually list multiple sessions.

---

## Summary by Severity

| # | Severity | Issue |
|---|---|---|
| 1 | 🔴 CRITICAL | Dual session systems — all API routes return 401 |
| 2 | 🔴 CRITICAL | Register uses deprecated HTTP API instead of SDK |
| 3 | 🔴 CRITICAL | Password change uses wrong session + wrong property path |
| 4 | 🟠 HIGH | MFA routes use wrong session system |
| 5 | 🟡 MEDIUM | `lib/session.ts` is orphaned dead code |
| 6 | 🟡 MEDIUM | `lib/session-manager.ts` is orphaned dead code |
| 7 | 🟡 MEDIUM | Phantom `phone` field in me route PATCH schema |
| 8 | 🟡 MEDIUM | Register creates unnecessary local password hash |
| 9 | 🟡 MEDIUM | ESLint circular structure error |
| 10 | 🟢 LOW | Hardcoded colors instead of design tokens |
| 11 | 🟢 LOW | `passwordVersion` incremented but never checked |
| 12 | 🟢 LOW | Inconsistent session property access patterns |
| 13 | 🟢 LOW | MFA toggle doesn't refresh UI state |
| 14 | 🟢 LOW | `(public)/page.tsx` may still exist |
| 15 | 🟢 LOW | Missing rate limit headers on some error responses |
| 16 | 🔵 INFO | `/api/me/sessions` returns mock data |

---

## Recommended Priority Order

1. **Fix auth session inconsistency** (issues #1, #3, #4) — This is blocking all authenticated API functionality
2. **Fix register route** (issue #2) — Registration is broken
3. **Fix ESLint config** (issue #9) — Can't lint until fixed
4. **Clean up dead code** (issues #5, #6) — Reduce confusion
5. **Fix data inconsistencies** (issues #7, #8) — Prevent future bugs
6. **Polish** (issues #10-#16) — Quality improvements
