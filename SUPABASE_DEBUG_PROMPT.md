# Supabase Debug Prompt

You can paste this prompt directly into your Supabase Dashboard's SQL Editor AI or Chat Assistant:

---

**System Analysis Request: Generation History Inconsistencies**

I am experiencing an issue where "deleted" history items keep reappearing in my application. I suspect there are duplicate rows with 'legacy' data formatting that are evading my application's deletion logic.

Please write a SQL query to investigate the `generations` table for my specific `user_id` (I will provide the ID).

**Goals:**
1.  **Identify Duplicates:** Find groups of records that have the exact same `input` and `mode`.
2.  **Detect Legacy Modes:** Specifically look for records where the `mode` column is NULL or empty, which my frontend defaults to 'essay'.
3.  **Check Deletion Status:** Show me records that *should* be deleted (duplicates) but have `deleted_at` as NULL.

**Specific Query Request:**
Please provide a PostgreSQL query that:
1.  Groups by `input` and `mode` (treating NULL mode as 'essay').
2.  Counts how many records exist in each group.
3.  Shows only groups with `count > 1`.
4.  Orders them by the most frequent duplicates first.

Also, provide a "Cleanup Query" that I can run to safely soft-delete (set `deleted_at = NOW()`) all duplicate entries, keeping only the *most recent* one per group active.
