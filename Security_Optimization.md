# WEB APP SECURITY & OPTIMIZATION AUDIT PROTOCOL

## EXECUTION PARAMETERS
- Analyze all files in codebase systematically
- Flag issues by severity: CRITICAL | HIGH | MEDIUM | LOW
- Provide specific file paths and line numbers
- Include code examples for fixes

---

## 1. SECURITY VULNERABILITIES

### 1.1 API Key Exposure
- [ ] Check for hardcoded API keys in client-side code
- [ ] Verify all Gemini, Supabase, Serper keys use environment variables
- [ ] Confirm .env files in .gitignore
- [ ] Scan for exposed keys in:
  - Component props
  - Browser console logs
  - Network request headers (visible in DevTools)
  - Build output files

### 1.2 Authentication & Authorization
- [ ] Verify Supabase Row Level Security (RLS) policies exist for ALL tables
- [ ] Check if auth tokens stored securely (httpOnly cookies vs localStorage)
- [ ] Audit protected routes - any unauthorized access paths?
- [ ] Test session expiration and refresh token handling
- [ ] Verify auth state synchronization across tabs

### 1.3 Input Validation & Injection
- [ ] Identify all user input fields
- [ ] Check for SQL injection vectors in Supabase queries
- [ ] Verify prompt injection safeguards for Gemini API
- [ ] Test XSS vulnerability in:
  - Search result rendering
  - AI response display
  - User profile data
- [ ] Validate file upload restrictions (if applicable)

### 1.4 API Rate Limiting & Abuse Prevention
- [ ] Check if Gemini API calls rate-limited client-side
- [ ] Verify Serper.dev request throttling
- [ ] Test for API quota exhaustion attacks
- [ ] Confirm error handling doesn't expose API structure

---

## 2. PERFORMANCE BOTTLENECKS

### 2.1 React Rendering
- [ ] Identify unnecessary re-renders:
  - Components without `React.memo()` where needed
  - Missing dependency arrays in useEffect
  - Inline object/function creation in props
- [ ] Check for N+1 rendering issues in lists
- [ ] Verify virtualization for long lists (react-window/react-virtualized)

### 2.2 State Management
- [ ] Audit prop drilling depth (flag if >3 levels)
- [ ] Identify duplicated state across components
- [ ] Check for missing useMemo/useCallback on expensive computations
- [ ] Verify Context providers not causing cascade re-renders

### 2.3 API & Network
- [ ] List all API calls - identify sequential that could be parallel
- [ ] Check for missing loading states/spinners
- [ ] Verify request deduplication for identical calls
- [ ] Test cache strategies:
  - Supabase query results
  - Gemini responses (if appropriate)
  - Search results
- [ ] Measure Time to First Byte (TTFB) for each endpoint

### 2.4 Bundle Optimization
- [ ] Run bundle analyzer - flag chunks >500KB
- [ ] Check for:
  - Unused dependencies
  - Duplicate packages (different versions)
  - Unoptimized images
  - Unnecessary polyfills
- [ ] Verify code splitting at route level
- [ ] Check if lazy loading implemented for:
  - Off-screen components
  - Modal dialogs
  - Heavy libraries (charts, editors)

---

## 3. CODE QUALITY & MAINTAINABILITY

### 3.1 TypeScript Strictness
- [ ] Enable `strict: true` in tsconfig.json?
- [ ] Count `any` types - flag if >5% of type annotations
- [ ] Check for missing return type annotations on functions
- [ ] Identify implicit any in function parameters
- [ ] Verify proper typing for:
  - Supabase query responses
  - Gemini API responses
  - Serper.dev results

### 3.2 Error Handling
- [ ] Map all try-catch blocks - any empty catch blocks?
- [ ] Check for unhandled Promise rejections
- [ ] Verify error boundaries exist for:
  - Route level
  - Component level (complex components)
- [ ] Test error messages - are they user-friendly or raw stack traces?
- [ ] Audit API failure scenarios:
  - Network timeout
  - 429 rate limit
  - 401 unauthorized
  - 500 server error

### 3.3 Code Duplication
- [ ] Identify repeated logic (>10 lines) that should be utility functions
- [ ] Check for duplicated API call patterns
- [ ] Flag copy-pasted component structures

### 3.4 Naming & Structure
- [ ] Flag inconsistent naming conventions
- [ ] Check for overly long files (>500 lines)
- [ ] Verify proper separation of concerns:
  - UI components vs business logic
  - API calls in service layer vs components
  - Constants in dedicated files

---

## 4. ARCHITECTURE & DESIGN PATTERNS

### 4.1 Service Layer Audit
- [ ] Are all API calls abstracted into service functions?
- [ ] Check for direct API calls in components (should be in services)
- [ ] Verify single responsibility:
  - Each service handles ONE external system
  - geminiService.ts - only Gemini
  - supabaseService.ts - only database
  - serperService.ts - only search

### 4.2 Data Flow Validation
```
User Input → Mode Selection → [Search?] → Gemini → Output
```
- [ ] Map actual implementation against this flow
- [ ] Identify any state mutations outside this pipeline
- [ ] Check for race conditions between search and Gemini calls
- [ ] Verify proper cleanup on mode switch

### 4.3 Component Architecture
- [ ] Count "god components" (>300 lines, >10 props)
- [ ] Check for missing atomic design principles:
  - Atoms (buttons, inputs)
  - Molecules (search bar with button)
  - Organisms (full search interface)
- [ ] Verify proper component composition vs prop drilling

### 4.4 Custom Hooks
- [ ] Identify repeated useEffect patterns → custom hook opportunity
- [ ] Check if business logic in components should be hooks
- [ ] Verify hooks follow rules:
  - Start with "use"
  - No conditional calls
  - Proper dependencies

---

## 5. DATABASE & SUPABASE SPECIFIC

### 5.1 Query Optimization
- [ ] Check for SELECT * queries (specify columns)
- [ ] Identify missing indexes on:
  - Foreign keys
  - Frequently filtered columns
  - Columns in WHERE clauses
- [ ] Test for N+1 query problems
- [ ] Verify proper use of:
  - `.single()` vs `.maybeSingle()`
  - Pagination with `.range()`

### 5.2 Real-time Subscriptions
- [ ] If using Supabase real-time:
  - Verify unsubscribe on component unmount
  - Check for memory leaks
  - Test subscription filtering

### 5.3 Schema Validation
- [ ] Compare TypeScript types with actual database schema
- [ ] Check for missing NOT NULL constraints
- [ ] Verify proper foreign key relationships
- [ ] Test cascading deletes configured correctly

---

## 6. GEMINI API OPTIMIZATION

### 6.1 Prompt Engineering
- [ ] Audit prompt construction:
  - Is context truncated safely?
  - Are system prompts optimized?
  - Check token count before sending
- [ ] Verify proper model selection based on mode
- [ ] Test fallback behavior if API fails

### 6.2 Response Handling
- [ ] Check streaming vs single response strategy
- [ ] Verify proper parsing of structured outputs
- [ ] Test handling of:
  - Incomplete responses
  - Safety filters triggering
  - Rate limit errors

### 6.3 Cost Optimization
- [ ] Estimate monthly token usage
- [ ] Identify unnecessary context in prompts
- [ ] Check for redundant API calls in quick succession

---

## 7. UX & ACCESSIBILITY

### 7.1 Accessibility Audit
- [ ] Run Lighthouse accessibility score
- [ ] Check for:
  - Missing alt text on images
  - Proper heading hierarchy (h1→h2→h3)
  - ARIA labels on interactive elements
  - Keyboard navigation support (Tab order)
  - Focus indicators visible
  - Color contrast ratios (WCAG AA minimum)

### 7.2 Loading States
- [ ] Map all async operations - all have loading indicators?
- [ ] Check for:
  - Skeleton screens vs spinners
  - Optimistic UI updates where appropriate
  - Proper disabled states during loading

### 7.3 Error States
- [ ] Test error message clarity for:
  - Network failures
  - Auth errors
  - Invalid input
  - API quota exceeded
- [ ] Verify retry mechanisms exist
- [ ] Check for proper user guidance on errors

---

## 8. BUILD & DEPLOYMENT

### 8.1 Vite Configuration
- [ ] Review vite.config.ts for:
  - Production optimizations enabled
  - Proper environment variable handling
  - Source maps configuration (disabled in prod?)
  - Compression enabled

### 8.2 Environment Management
- [ ] Verify separate .env files for:
  - .env.development
  - .env.production
  - .env.example (with dummy values)
- [ ] Check no .env.local committed to git

### 8.3 CI/CD Readiness
- [ ] TypeScript strict mode passes?
- [ ] ESLint configured with no errors?
- [ ] Build process completes without warnings?
- [ ] Test coverage exists (even basic)?

---

## OUTPUT FORMAT

For each issue found, provide:
```
SEVERITY: [CRITICAL|HIGH|MEDIUM|LOW]
FILE: src/path/to/file.tsx:42
ISSUE: Brief description
CODE:
[Show problematic code]
FIX:
[Show corrected code]
IMPACT: Security/Performance/Maintainability
```

## PRIORITY FOCUS AREAS

1. **CRITICAL** - Security vulnerabilities, data leaks
2. **HIGH** - Performance bottlenecks, Type safety gaps
3. **MEDIUM** - Code quality, Architecture improvements
4. **LOW** - Style inconsistencies, Minor optimizations

Execute audit. Report findings systematically.