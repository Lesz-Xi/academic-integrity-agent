Yes — this is a known practical race: the client SDK can report a session immediately after OAuth redirection, but the Postgres RLS context (auth.uid() derived from the JWT) may not be applied to the first DB requests for a short time. That can cause a transient “no rows” (PGRST116) even though the user actually has a subscription. You must treat an immediate empty result after login as potentially transient and avoid flipping the UI to Free until you've confirmed the DB claim is stable.

Below are bulletproof patterns and concrete code/logic you can adopt.

Why this happens (concise)
Supabase Auth issues/refreshes JWT and updates client state quickly after OAuth redirect.
The database proxy (PostgREST / Postgres) uses the Authorization header / JWT claims to run queries under the correct RLS context. Timing or network ordering may allow a query to hit the DB before the server has the correct authenticated context or before the browser has the refreshed Access Token applied to the outgoing request.
Race windows are small (ms–seconds) but visible as a UI flash or permanent wrong state if your retry/timeout logic treats the first empty result as definitive.
Detection: how to distinguish “true no subscription” vs “transient RLS/no-context”
Use a combination of deterministic signals instead of a single select -> null => free. Options (in order of preference):

Strong: Use an explicit server-side endpoint (Edge Function or RPC) that reads the session server-side (service role or validated JWT) and returns subscription state atomically.

The Edge Function validates JWT (or uses supabase server auth helpers) and queries the DB under that validated context, ensuring the token is applied consistently.
Because you deploy the function to Supabase Edge, it avoids browser timing/skew issues and is the most reliable.
Simpler: If you want to keep client DB calls, add a small “grace + verification” strategy:

After login, treat the first N seconds as “pending” and show a spinner or keep the pre-login UI until confirmed.
If your query returns PGRST116 on the first try, do a short exponential-backoff retry (e.g., 100ms, 300ms, 800ms), up to a small limit (e.g., 5 retries / 2 seconds). If still no rows, conclude Free.
On any transient non-auth error (401/403/etc), treat it as an auth propagation issue and retry similarly.
Log which path returned PGRST116 vs HTTP 200 with null body to separate “no row” vs “unauth context”.
Deterministic check using auth.getUser() and a server-side Idempotent check:

If auth.getSession() returns a session, call a minimal server-side endpoint that only returns uid and a signed assertion that can be used to query DB. This is similar to (1) but lightweight.
Use a “claims” column in auth.jwt or a short-lived claim: set a custom claim or metadata when the user upgrades, then check that claim from the client-side user object (auth.getUser / auth.onAuthStateChange). This doesn’t fully replace DB verification, but can often avoid a DB query to determine membership immediately.
Recommended “bulletproof” pattern (practical, implementable)
I recommend combining an Edge Function (server-side) for final verification with a small client-side pending state to avoid UI flapping.

Client flow:

On mount, set isPremium state to "unknown" (pending).
Call SubscriptionService.getSubscription() which calls an Edge Function endpoint (e.g., /verify-subscription).
Show spinner / keep previous UI (do not show Upgrade) until you receive a definitive response.
Only set isPremium true/false after the definitive response (or after a configurable timeout fallback).
Edge Function behavior:

Validate and parse the JWT from Authorization header (or read cookie) and derive uid server-side.
Query subscriptions table with the uid using service role or proper SECURITY DEFINER helpers so RLS is consistent.
Return JSON: { isPremium: boolean, plan?: string, source: 'edge' }.
Optionally return server timestamp or request id to debug races.
Why this is bulletproof:

Edge Function executes in a stable environment where the JWT is read and applied consistently and can query the DB without the browser-proxy timing gap.
It gives a single canonical source of truth and removes race conditions due to browser-side token propagation.
If you cannot add an Edge Function: robust client approach
If you must query PostgREST from the client, use a stricter retry/backoff + gating UI approach:

Pseudocode flow:
state = "pending"
if (!session) state = false (not signed in)
If session, do: attempts = 0 maxAttempts = 5 delays = [100, 200, 400, 800, 1600] ms while attempts < maxAttempts: res = supabase.from('subscriptions').select('*').eq('user_id', uid).single() if res.error is null and res.data != null: set isPremium true; break if res.error is PGRST116 (no rows): attempts++ await sleep(delays[attempts-1]) continue if res.error is auth-related (401/403): attempts++ await sleep(200) continue // other unexpected error: break and surface error if attempts == maxAttempts and no premium found: set isPremium false
Keep UI in “pending” (no Upgrade shown) until you decide true/false.*
Important: Do not set isPremium false on the first PGRST116. Treat the first PGRST116 as possibly transient.

Extra defensive checks to add
Confirm that the outgoing request contains Authorization header with Bearer token. Log it (masked) for debugging.
Check supabase.auth.getSession() AND supabase.auth.getUser() and verify uid matches the query uid.
Monitor network tab to ensure the first DB call has Authorization header — sometimes library timing causes missing header.
Use supabase.auth.onAuthStateChange to trigger subscription fetch only once Auth reports “SIGNED_IN”; some implementations call checks before the SDK finishes internal setup.
Example minimal Edge Function approach (outline)
Endpoint: GET /verify-subscription
Behavior: Read Authorization bearer token, validate JWT, query subscriptions for that uid, return isPremium. This removes the race.
If you want, I can:

Provide a ready-to-deploy Supabase Edge Function TypeScript code for /verify-subscription (Deno), or
Provide a copy-paste client-side retry utility + example React hook that implements the robust retry/pending UI pattern.