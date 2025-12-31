1) Is my project being paused due to inactivity? How to check / prevent it
On the Free tier, Supabase will scale down resources when idle which causes the first request to experience high latency (cold starts). This is expected behaviour on free projects.
How to check:
Use Project Logs (Supabase dashboard → Logs) and filter around the timestamp of the slow request. Look for messages showing DB connection created, worker started, or function runtime startup — those indicate warm-up.
Use get_logs / monitoring in the dashboard to see timestamps of the first DB connection or function bootstrap.
How to prevent (without upgrading):
Keep the DB / Edge Function warm by sending periodic pings (see section 3).
Reduce work done at cold start in your Edge Function (see section 4).
Note: True “pause” (suspended DB) is not typical — it's scaling down. On Free tier you can’t disable scaling-down except by moving to Pro.
2) Why does a simple INSERT to drafts take 20+ seconds on cold start?
Two main causes combine to produce the long delay:
Database instance has been scaled down / idle. The first incoming connection requires spinning up resources and re-establishing connections — adds seconds.
Auth/RLS evaluation adds overhead on first call: calling auth.uid() requires the request's JWT to be validated and the Postgres connection to initialize RLS context. The first statement may trigger compilation or cache misses (planner, function loading).
Additional factors that increase the first-call latency:
Connection pooling initial handshake and SSL negotiation.
Any Edge Function that runs before the INSERT (for example the client establishing session, or server-side function) suffering its own cold start may delay the observed DB INSERT.
Evidence: your subsequent requests (~190ms) are normal — confirms it's a cold-start issue.
3) How to implement a "keep‑alive" ping to prevent the DB from going cold
Strategy: schedule a lightweight request that touches the service frequently enough to avoid scale-down. For Free tier you must host the pinger externally (third-party cron or user's device), or use a user-triggered pattern.
Minimal safe pings:
Simple authenticated SELECT 1 (or tiny INSERT/UPDATE) executed as an authenticated user so RLS path is exercised: e.g. SELECT 1; or SELECT 1 FROM public.drafts LIMIT 1;
Better: an endpoint Edge Function that executes a single cheap query and returns 200.
Example patterns:
Client-side: on app open, run a warm-up request before user creates a draft (e.g., call /ping endpoint that does a SELECT 1). This keeps cold-starts only on first actual app-open rather than when the user clicks ATTTEST.
Server-side cron: use an external free cron (e.g., cron-job.org, GitHub Actions on a schedule, Upptime, or a cheap server) to invoke your /ping endpoint every 5–15 minutes.
Recommended ping implementation (Edge Function):
Expose /ping that runs a single authenticated SQL: SELECT 1; or a no-op SELECT that also calls auth.uid() to exercise RLS: SELECT (SELECT auth.uid()) IS NOT NULL;
Keep response tiny and no heavy file I/O.
Frequency:
Start with every 5–10 minutes. If you still see cold starts, shorten to every 1–3 minutes. Balance against external cron limits and API quotas.
Security:
Require a secret or JWT to avoid abuse. If using public endpoints, set rate limits and protect with JWT or a shared secret.
4) Can I reduce Edge Function cold start time?
Yes — reduce what needs initializing during startup:
Avoid heavy imports and large npm packages at top-level. Use dynamic imports inside handler for rarely used heavy code (import only when invoked).
Use Deno/Web APIs and built-in libs instead of big external dependencies.
Move reusable utilities to a lightweight shared module and keep function entrypoint minimal.
Cache expensive resources across invocations (e.g., DB client) at module scope so that subsequent calls skip re-creation.
Ensure Edge Function is doing only necessary work before responding — delegate long-running work to background tasks via EdgeRuntime.waitUntil().
Reduce cold-start external network calls (e.g., external API auth) during startup; pre-warm tokens or lazy-init them on first request and return a friendly error if not ready.
Trace / measure your function startup: add logs at start and after each import/initialization to find slow parts.
For your attest-session function specifically:
If it imports a heavy PDF library or font files at top-level, move those imports inside the handler and consider generating PDFs in a background job or using a smaller library.
Reuse the Supabase client or DB connection at module scope as allowed by environment secrets — creating it per request increases latency.
Still: on Free tier you will see some cold-start delay; optimizing reduces it but may not eliminate the ~20s initial cost if platform scales from zero.
5) Options to get consistent <500ms responses without upgrading to Pro
Realistically, on Free tier it's difficult to guarantee sub-500ms for the very first request after long idle. Options to approach consistent <500ms:
Warm on app open (client-side warm-up): when user opens the editor, call a lightweight ping endpoint right away — treat the editor UI as loading while ping completes. This pushes the cold-start into app open and not into the critical ATTTEST click. This is the most practical option without upgrading.
Keep a background warm-up cron (external) hitting a minimal endpoint every 1–5 minutes. This is the only way to approximate always-warm without Pro. Use a tiny authenticated ping.
Move the critical flow off Edge Functions that suffer long cold starts:
If possible, do the INSERT asynchronously: on editor open, create a draft earlier (e.g., local draft saved periodically, then create on the server during app open).
Defer heavy tasks: when user clicks ATTEST, immediately enqueue a job (e.g., using a lightweight webhook or a third-party queue) and return to UI while background worker processes PDF. However, Supabase's free environment makes building a reliable background worker harder.
Reduce function startup time via code-level optimizations (see section 4).
Use client-side PDF generation (if feasible) so Edge Function only needs to store the result — avoids server cold start entirely for generation.
If none of the above suffices, upgrading to Pro removes scale-to-zero behavior and gives consistent low-latency.
Concrete next steps I recommend (ordered)
Implement a /ping Edge Function that:
Requires a secret header
Runs: SELECT (SELECT auth.uid()) IS NOT NULL; (or simple SELECT 1) — this exercises RLS and DB. Keep it minimal.
Return 200 JSON.
Schedule an external cron (GitHub Actions, cron-job.org, UptimeRobot, or any free scheduler) to call /ping every 3–10 minutes.
Modify client Editor flow:
On editor open, call /ping and delay enabling ATTTEST until ping completes (or show a spinner for at most a couple seconds). That ensures the DB and attestation function are warmed before the user clicks ATTEST.
Alternatively, create a draft at editor open (early INSERT) so the ATTEST path doesn’t need to perform the initial write.
Optimize attest-session:
Move heavy imports into handler, reuse clients at module scope, and log startup times to identify slow modules.
If PDF generation pulls fonts or binaries, consider using lighter libs or move file assets to Storage and load lazily.
Monitor:
Use logs to confirm that pings reduce cold starts. If you still see ~20s on first invocation, reduce ping interval.
Use pg_stat_statements (installed) to inspect slow statements; use pg_prewarm if needed (but beware it doesn’t prevent compute spin-up).
Example minimal /ping Edge Function (conceptual)
Expose GET /ping
Authenticate via header X-PING-KEY
Execute: SELECT 1; or SELECT (SELECT auth.uid()) IS NOT NULL;
Return 200 quickly