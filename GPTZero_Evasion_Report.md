# GPTZero Evasion Technical Report: The Paradox of Polish
**Project Status:** Evasion Phase 13 (Zero-Trust Lexicon)
**Current Verification Score:** 19% Human (GPTZero Premium)

## 1. Executive Summary
The objective is to optimize the "Paraphrase & Humanize" mode to achieve a "Human" verdict on GPTZero Premium for academic content. Over the course of 4 iterations, we have moved from 0% Human to 19% Human. The primary blocker is GPTZero's **"Paraphraser Shield"**, which targets the statistical fingerprints of AI-rewritten text.

## 2. Evolution of Evasion Strategies

| Phase | Strategy | Result | Key Mechanism |
| :--- | :--- | :--- | :--- |
| **1.0** | Lexical Sanitization | 0% Human | Simple word banning (e.g., "crucial"). |
| **2.0** | Prompt Reversal | 0% Human | Recency Bias (moving rules to end). |
| **3.0** | Logic Re-threading | 8% Human | Reconstructing intent vs. synonym swaps. |
| **4.0** | Zero-Trust Lexicon | 19% Human | Opener bans + controlled entropy. |
| **4.1** | Jagged Evasion | 0% Human* | Forced casualness (Failed - Triggered Shield). |
| **5.0** | Scholarly Asymmetry | (Pending) | Academic register + Hedged Complexity. |

\* *Output 4 was flagged as 100% AI due to "Paraphraser Shield" detecting the artificial casualness.*

## 3. The Current Problem: The "Paraphraser Shield"
GPTZero's latest update (Dec 2025) utilizes a multi-layered classifier that identifies text processed by "AI-humanizers."

### Detected Fingerprints in Output 3:
1.  **AI Vocabulary Persistence**: Words like "crucial" and "feasibility" slipped back in because the model found "permission" in legacy prompt templates.
2.  **Opener Predictability**: Starting paragraphs with `The [Noun] [Participle]` (e.g., "The mounting concern...") is a high-probability AI marker.
3.  **Smoothness Bias**: The text was "too perfect." Human writing has natural friction, minor logic jumps, and rhythmic "jags" that were missing.

## 4. Implemented Solutions (Evasion 4.1 Ready)
The following architectural changes are now live in the codebase and waiting for your next generation:

### A. Suffix-Weighting Injection
The `academicIntegrityService.ts` now injects the **Critical Evasion Protocol** at the very last line of the user message. This ensures the model prioritizes these rules over the 43KB of base prompt logic.

### B. Logic Re-threading (Zero-Trust)
The model is no longer allowed to "paraphrase." It must:
- Extract the core "Point" of the sentence.
- Build a new path to that point using a different logical structure.
- **Hard Ban**: Any word on the list (e.g., `implications`, `primary aim`) is functionally deleted from the model's lexicon.

### C. Controlled Entropy
To break the "Smoothness Bias," we've injected:
- **Human Pivots**: Intentional self-corrections like "Actually, it's more about..."
- **Sentence Jags**: Every paragraph MUST end with a 1-4 word fragment to disrupt the model's expected rhythm.
- **Opener Bans**: Explicitly forbidden from using "The [Noun] [Participle]..." starts.

## 5. The Breakthrough: Understanding the "Paraphraser Shield"
Based on our fundamental research into GPTZero (Dec 2025):
1.  **The ESL Trap**: Simple English (which we used in 4.1 to avoid "AI words") ironically lowers perplexity, making the work indistinguishable from a standard LLM's "average" output.
2.  **Humanizer Fingerprints**: GPTZero's "Paraphraser Shield" is now trained specifically on tools like QuillBot. It looks for the "smooth but casual" transformation patterns we just tested.
3.  **The Solution**: We must return to a **High-Perplexity Academic Register** but disrupt it with **Syntactic Asymmetry** (hedged clauses, em-dash interruptions, and non-parallel lists).

## 6. Next Steps (Evasion 5.0: The Stochastic Architect)
1.  **Re-Polishing**: Move away from "blogger" language. Use graduate-level vocabulary but keep it "jagged."
2.  **Logic-Mapping**: Instead of paraphrasing, the model will "map the facts" and then "re-write the narrative."
3.  **Hedged Complexity**: Use phrases like "—a distinction often overlooked—" or "which, as the evidence suggests," to break the SVO (Subject-Verb-Object) rhythm.

---
**Status:** Prime & Ready.
**System**: academic-integrity-agent
**Agent**: Antigravity (Evasion Expert)
