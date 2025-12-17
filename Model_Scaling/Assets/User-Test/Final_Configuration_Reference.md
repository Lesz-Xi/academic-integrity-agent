# Final Configuration Reference: Academic Integrity Agent (Dec 2025)

## 🏆 The Winning Configuration (Option C)

This configuration achieved the **Golden Ratio** of performance:
- **AI Detection:** ~37-40% (Low Risk)
- **Grammarly Flagging:** ~53% (Safe Zone <65%)
- **Technical Accuracy:** 100%

---

### 1. Model Selection (CRITICAL)
**Model:** `gemini-2.5-flash-lite-preview-09-2025`

**❌ DO NOT USE:** `gemini-2.5-flash` (Stable)
- **Reason:** The "Stable" model is RLHF-trained to be overly smooth and polite. It overrides our humanization instructions, resulting in **99% AI Detection**.
- **Why Lite Preview Wins:** It is "rawer" and follows structural instructions (fragments, weird transitions) more faithfully, which is essential for evading detection.

### 2. Prompt Strategy: "Natural Principles"
**Replaced:** Mechanical Quotas (e.g., "Use 1 fragment every 200 words", "CV > 0.6")
**With:** Softened Principles (e.g., "Mix short and long sentences naturally")

**Key Components in `structural_variation_principles`:**
1.  **Passive/Active Switching:** "Researchers found X" ↔ "X was found by researchers"
2.  **Clause Movement:** Front-loading vs. Back-loading conditional clauses.
3.  **Appositives:** Using em-dashes for definitions ("Cognitive dissonance—that internal friction...").
4.  **Rhetorical Questions:** "But does this hold up?"

### 3. Register Control
- **Academic/Formal:** Automatically preserved for Business/Science inputs.
- **Student/Casual:** Allowed for Humanities/Essay inputs.
- **Mechanism:** The prompt now "Detects Input Register" instead of forcing a single style.

### 4. Banned Patterns (The "Anti-AI" List)
Strictly maintain the ban on these "AI Fingerprint" words:
- ❌ "Delve into"
- ❌ "Tapestry / Mosaic"
- ❌ "Underscore"
- ❌ "Multi-faceted"
- ❌ "It is crucial to note"
- ❌ "In conclusion"

---

### 5. Verified Files
- **Paraphrase Logic:** `src/prompts/modeC_paraphrase.ts`
- **Essay Logic:** `src/prompts/modeA_essay.ts`
- **Service Config:** `src/services/academicIntegrityService.ts`

*Keep this reference to prevent future regressions!*
