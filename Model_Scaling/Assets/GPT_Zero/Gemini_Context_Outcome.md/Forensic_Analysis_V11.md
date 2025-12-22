# Forensic Analysis V11: The "71% AI" Paraphrasing Trap

As your **Senior AI Forensic Analyst**, I have completed a side-by-side audit of the **v12 Success (11% Human)** vs the **v14 Failure (71% AI)**. The results are counter-intuitive but provide a clear path forward.

## 1. The Over-Sabotage Paradox
In v14.0, we targeted the exact sentences driving the AI score (e.g., *"Growing environmental concern"*). We replaced them with *"The rising worry about the planet"*. 
- **The Result**: The score for that sentence remained **71% AI**.
- **The Lesson**: GPTZero's "Advanced Scan" (3.15b) is now sensitive to **automated synonym swapping**. When it sees a common academic phrase replaced by a "messy" synonym in a formal citation context, it flags it as **"Possible AI Paraphrasing."**

## 2. Why v12 Worked (The "Genre Anchor" Secret)
The **v12 (Claude Cleaned)** version succeeded because it left the high-weight academic anchors **ALONE**:
- v12 kept *"However, evidence from Canada suggests..."* (UNTOUCHED)
- v12 kept *"The growing environmental concern..."* (UNTOUCHED)
- **The Magic**: Because the "Genre Anchors" were intact, the detector accepted the document as a "Formal Paper." It then focused on the **Entropy Injections** (the parentheticals and asymmetric list items), leading to a **48% Mixed** score.

## 3. The v14.0 "Fingerprint"
By swapping *"However"* for *"still"* and *"In addition"* for *"plus"*, we created a high-probability "Humanizer Tool" fingerprint. We essentially told the detector: *"I am an AI trying to hide."*

## 4. Strategy: v15.0 "The Stealth Saboteur" (v12 Enhanced)
We are moving back to the **v12 Framework** but with surgically improved "noise":

### A. Restore "Genre Anchors"
- **REVERT**: Stop swapping common connectives like *"However"*, *"Although"*, or *"Because"*. These are essential to the academic register.
- **REVERT**: Stop swapping common openers like *"Growing environmental concern."*

### B. Increase Threshold (0.5)
We will raise the intervention threshold to **0.5**. We only want to rewrite the "90% AI Probability" sentences. Less intervention = less "Paraphrasing" flags.

### C. Shift Focus to "Syntactic Asymmetry"
Instead of changing *words*, we will change the *rhythm*:
- Focus on **Parenthetical Injections** (the Green underlays in your screenshots).
- Focus on **Stem De-optimization** (messy word endings).
- Focus on **Parenthetical Density reduction** (6-7 instead of 8-9) to avoid the "synthetic" look.

## 5. Summary of v15.0 Changes:
1.  **Delete** the "Growing environmental concern" and "However" traps. They are being flagged as paraphrasing.
2.  **Raise** the risk threshold in `rougherService.ts` to **0.5**.
3.  **Restore** the "Sophisticated Humanizer" persona but with **Aggressive logical friction.**
