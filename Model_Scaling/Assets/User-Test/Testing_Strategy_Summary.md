# Paraphrase Prompt Testing: Status & Strategy

## 1. Current Status Summary

### Authentication (Safari)
**Status: RESOLVED**
- **Fixes Implemented:**
  - Enforced `PKCE` auth flow in Supabase configuration for Safari compatibility.
  - Added robust timeout handling (5s for load, 30s for OAuth) to prevent "stuck loading" states.
  - Configured Supabase URL redirections and Google Provider settings (skipped nonce checks).
- **Verification:** Verified working in Safari Private Window.
- **User Action:** Requires clearing browser cache/data for `academic-integrity-agent.vercel.app` in standard Safari window to clear stale session data.

### Paraphrase Mode
**Status: IN PROGRESS (Critical Issue Identified)**
- **Issue:** Academic input is still being "casualized" (e.g., turning "Cognitive dissonance plays a central role" into "Cognitive dissonance is central to this mess").
- **Root Cause:** The model interprets the instruction "Humanize" or "Natural Write" as a directive to use conversational/informal language, overriding the system prompt's "Academic Register" constraints.
- **Current State:** The prompt fails to distinguish between "High Burstiness" (structural variation) and "Casual Tone" (slang/informality) effectively enough for the model.

---

## 2. The Core Problem: "The Storybook Effect"

Despite adding explicit "Academic Mode" triggers to the prompt, the output drifts into a "weary industry veteran" or "blogger" persona.

**Evidence:**
- **Input:** "The mechanisms behind self-doubt reveal themselves..." (Formal)
- **Desired:** "Behind self-doubt, hidden mechanisms operate..." (Formal, Varied)
- **Actual:** "The nuts and bolts of self-doubt show up..." (Casual/Slang)

**Diagnosis:**
1. **Instruction Weight:** The user's custom instruction ("Natural Write") is outweighing the system prompt's register guardrails.
2. **Model Bias:** The model strongly correlates "Humanize" with "Casual/Spoken" text.
3. **Burstiness Confusion:** The model attempts to create sentence variation (burstiness) by using extensive colloquialisms instead of syntactic variation.

---

## 3. Future Improvements & Testing Strategy

To permanently fix the register issue, we will implement the following strategies:

### A. Prompt Engineering Improvements
1.  **Explicit "Anti-Slang" Layer:**
    -   Add a **negative constraint** block at the very end of the prompt (Recency Bias) explicitly banning words like: *stuff, thing, mess, huge, massive, nuts and bolts, honestly, basically*.
2.  **Instruction Interpretation Override:**
    -   Force the model to reinterpret "Humanize" for academic text: `"If Input = Academic AND Instruction = 'Humanize', EXECUTE = 'Formal Literary Rewrite' instead."`
3.  **Role Decoupling (Fallback):**
    -   If the single adaptive prompt fails, split into two separate prompts: `modeC_paraphrase_academic.ts` and `modeC_paraphrase_casual.ts`.

### B. "Golden Set" Testing Protocol
Stop testing with random inputs. Establish a fixed **Golden Set** of 5 academic texts to benchmark progress.

**Test Cases:**
1.  **Dense Theory:** 1 paragraph of Philosophy/Psychology (Abstract concepts).
2.  **Hard Science:** 1 paragraph of Biology/Physics (Technical terminology).
3.  **Legal/Business:** 1 paragraph of formal report style.

**Evaluation Checklist:**
For every test run, pass/fail based on:
-   [ ] **Vocabulary:** Zero slang usage.
-   [ ] **Tone:** Maintains third-person objective voice.
-   [ ] **Burstiness:** Contains at least one very short sentence (<6 words) and one very long sentence (>30 words).
-   [ ] **Fidelity:** Preserves specific technical terms (e.g., "Cognitive Dissonance" must not become "mental clash").

### C. Automated Validation (Stretch Goal)
Create a simple test script that runs the output against a list of "Banned Casual Markers."
-   *If output contains ["kinda", "sorta", "gonna", "stuff"], automatically FAIL the test.*

## 4. Next Steps
1.  Clear Safari Cache to resume normal workflow.
2.  Create the **Golden Set** of academic inputs.
3.  Iterate on `modeC_paraphrase.ts` using the new Testing Protocol until "The Storybook Effect" is eliminated.
