# Test Implementation Plan

## Objective
Add comprehensive tests for high-priority untested modules to achieve 15-20% test coverage.

## Current Status
- ✅ **Existing Tests:** 71 tests passing (utils.test.ts, auth.test.ts)
- ✅ **Lint:** Passes
- ✅ **Typecheck:** Passes
- 📊 **Current Coverage:** ~3%

## Test Files to Create

### 1. `src/lib/auth.test.ts` (HIGH PRIORITY)
**Purpose:** Test pure functions for email/domain handling

**Functions to Test:**
- `getEmailDomain(email: string): string | null`
  - Valid email extraction
  - Case normalization (lowercase)
  - Whitespace trimming
  - Invalid email handling (no @, empty domain, etc.)
  - Edge cases (multiple @, special characters)

- `domainCandidates(domain: string): string[]`
  - Multi-level domain generation (3+ parts)
  - Two-part domains
  - Single-part domains
  - Whitespace filtering
  - Real-world university domains (.dz, .ac.uk, .edu, etc.)
  - Empty/invalid input handling

**Estimated Tests:** 40-50
**Estimated Lines:** 250-300

---

### 2. `src/server/db/seed.test.ts` (MEDIUM PRIORITY)
**Purpose:** Test domain parsing logic

**Functions to Test:**
- `parseDomains(input: string | undefined): string[]`
  - Comma-separated parsing
  - Whitespace trimming
  - Case normalization
  - Empty/undefined input handling
  - Duplicate removal (if applicable)
  - Real-world examples: "usthb.dz, univ-alger.dz, esi.dz"

**Estimated Tests:** 15-20
**Estimated Lines:** 100-120

---

### 3. `src/proxy.test.ts` (HIGH PRIORITY)
**Purpose:** Test middleware path protection logic

**Functions to Test:**
- `isProtectedPath(pathname: string): boolean`
  - Protected paths: /dashboard, /dashboard/profile, etc.
  - Unprotected paths: /, /login, /about
  - Locale prefix stripping: /en/dashboard → /dashboard
  - Edge cases: /dashboard-public, /dashboards
  - Nested protected paths: /dashboard/settings/account

**Estimated Tests:** 20-25
**Estimated Lines:** 80-100

---

### 4. `src/server/email/sendEmail.test.ts` (HIGH PRIORITY)
**Purpose:** Test email service with mocked fetch

**Functions to Test:**
- `sendEmail({ to, subject, text, html }): Promise<void>`
  - Successful API call with correct headers/body
  - Fallback to console when Resend not configured
  - Error handling for failed requests (non-ok response)
  - Missing API key handling
  - Missing from address handling
  - HTML optional parameter

**Mocking Strategy:**
- Mock `global.fetch` for Resend API calls
- Mock `console.info` for fallback verification
- Mock environment variables

**Estimated Tests:** 15-20
**Estimated Lines:** 120-150

---

### 5. `src/lib/safe-action.test.ts` (MEDIUM PRIORITY)
**Purpose:** Test action client configurations

**Functions to Test:**
- `publicAction` - Base client configuration
  - Metadata schema validation (actionName required)
  - Error handling (generic message to client)

- `authAction` - Authenticated client
  - Session validation middleware
  - Unauthorized error throwing
  - Context injection (session, user)

**Mocking Strategy:**
- Mock `auth.api.getSession` for session validation
- Mock `headers()` for request headers

**Estimated Tests:** 15-20
**Estimated Lines:** 100-130

---

## Implementation Order

1. **Start with:** `auth.test.ts` (pure functions, no mocking)
2. **Then:** `seed.test.ts` (simple parsing logic)
3. **Then:** `proxy.test.ts` (path matching logic)
4. **Then:** `sendEmail.test.ts` (requires fetch mocking)
5. **Finally:** `safe-action.test.ts` (requires auth mocking)

## Success Criteria

After implementation:
- ✅ All new tests pass (`bun test`)
- ✅ Lint passes (`bun lint`)
- ✅ Typecheck passes (`bun typecheck`)
- ✅ Total tests: 150-175+
- ✅ Test coverage: 15-20%

## File Structure After Implementation

```
src/
├── lib/
│   ├── utils.test.ts (EXISTS - 192 lines)
│   ├── auth.test.ts (NEW - ~300 lines)
│   └── safe-action.test.ts (NEW - ~130 lines)
├── server/
│   ├── db/
│   │   └── seed.test.ts (NEW - ~120 lines)
│   └── email/
│       └── sendEmail.test.ts (NEW - ~150 lines)
├── proxy.test.ts (NEW - ~100 lines)
└── validations/
    └── auth.test.ts (EXISTS - 454 lines)
```

## Estimated Total
- **New Test Files:** 5
- **Total Test Lines:** ~800-900
- **Total Tests:** 150-175
- **Time to Implement:** 30-45 minutes

## Testing Patterns to Follow

Based on existing tests, use:
- `describe()` blocks for grouping
- Clear test names: "should [expected] when [condition]"
- `expect().toBe()` for exact matches
- `expect().toEqual()` for objects/arrays
- `expect().toHaveLength()` for array length checks
- `expect().toBeNull()` for null checks
- Type assertions with `if (!result.success)` for Zod schemas

## Questions for Confirmation

1. **Database mocking:** Should I mock Drizzle ORM for auth.ts database hook tests, or focus only on the pure functions (`getEmailDomain`, `domainCandidates`)?

2. **Resend API mocking:** Should I mock at the `fetch` level or create a higher-level abstraction?

3. **Auth session mocking:** For safe-action tests, what's your preference for mocking Better Auth's `getSession`?

4. **Edge case coverage:** Any specific edge cases or business rules you want emphasized?

---

**Ready to proceed with implementation?** Confirm and I'll create all test files following this plan.
