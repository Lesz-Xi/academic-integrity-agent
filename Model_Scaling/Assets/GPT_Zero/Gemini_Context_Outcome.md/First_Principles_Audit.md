# First Principles Thinking: The AI Detection "Regression" Audit

To understand why every implementation since v12 (11% Human) has regressed, we must break the detector down to its **First Principles**.

## 1. Principle of Pattern Saturation
- **The Observation**: In v13/v14, we tried to "kill" every AI anchor.
- **The Conflict**: By sludging *every* sentence, we created a **Uniform Profile of Non-Uniformity**. 
- **The Detector's Logic**: True human writing is "bursty"—it has smooth AI-like stretches followed by messy human-like stretches. When a document is *uniformly* messy/sludged, it characteristically matches the profile of a **Humanizer Tool**.
- **The Regression**: Our "more is better" approach tipped the detector into the "Paraphrased" category because the *entropy itself became a pattern*.

## 2. Principle of Register Integrity (Genre Classifiers)
- **The Observation**: We swapped "However" for "still" and "environmental concern" for "eco-stress."
- **The Conflict**: Academic citations (Solsona, 2024) and formal research logic require "Genre Anchors" (However, Thus, Therefore).
- **The Detector's Logic**: If the detector see "eco-stress" in a paragraph with formal Harvard citations, it detects a **Register Mismatch**. This is a massive signal for "AI trying to look human."
- **The Regression**: By deleting the formal connectives, we made the text look like a **Low-Elo Paraphrase**, not a human draft.

## 3. Principle of "Probabilistic Anchors" vs. "Local Noise"
- **The v12 Success**: v12 worked because it left the **Skeletal Anchors** alone (preserving the genre) but injected **Surgical Local Noise** (parentheticals).
- **The v14 Failure**: we tried to rewrite the *Skeletal Anchors*. This triggered the **Humanizer Classifier** which is trained specifically to detect synonym-swapped academic openers.

---

# The v15.0 "Stealth Saboteur" Strategy (Reverting to v12 Roots)

Based on these First Principles, we must stop trying to "hide" and start **"Co-opting"** the academic register.

### 1. Strategic Preservation (The "Genre Anchor" Shield)
- **Action**: Stop swapping "However," "Furthermore," and "Growing environmental concern."
- **Reasoning**: These sentences are "shields." They tell the detector "this is a formal paper." We only want to poison the *other* sentences.

### 2. High-Intervention Threshold (0.55+)
- **Action**: Raise the risk threshold significantly.
- **Reasoning**: We only want the LLM to touch the sentences that are in the 95th percentile of AI risk. Leave the 60-80% sentences alone; they contribute to the "formal" profile that protects the document.

### 3. Sparse, High-Entropy Injection
- **Action**: Reduce parenthetical density to 3-5 per paper, but make them longer and more "human-uncertain." 
- **Action**: Instead of `(worth mentioning)`, use `(this is still something we are looking into internally)`.

### 4. Asymmetric Fragmentation
- **Action**: Focus on breaking up the *rhythm* of the text (Asymmetry) without changing the *vocabulary* of the register.

**Target for v15.0: Restore the v12 "Mixed" verdict by reducing the "Humanizer" fingerprint.**
