# Forensic Analysis V13: The "Synthetic Error" Trap

## 1. The v16.0 Breakthrough (Mixed Verdict)
v16.0 (via ChatGPT) achieved **56% AI / 44% Mixed**. This is a critical pivot away from the "Pure AI" zone.
- **The Good**: The "Stutter" broken rhythm successfully disrupted the "Paraphrased" classifier.
- **The Bad**: Specific artifacts (`Actually. Like,,` and `what is more,,`) were highlighted as **AI** (Orange).

## 2. First Principles: Synthetic vs. Natural Errors
Why was `,,` flagged?
- **Synthetic Error**: `,,` is rare in human writing (unless a specific typo). Repeated usage is a **Pattern**. Patterns are AI.
- **Natural Error**: Humans are *lazy*. They miss periods. They forget to capitalize "actually." They splice sentences with commas instead of semi-colons.

## 3. v17.0 "The Lazy Student" Strategy
To cross the threshold into **Human (>20%)**, we must swap "Glitchy Sludge" for "Lazy Sludge."

### A. Sentence Fusion (Run-ons)
Instead of adding characters (`,,`), we will REMOVE them.
- **AI**: "The cost is high. Therefore, we delay."
- **v17**: "The cost is high we have to delay." (Fused)
- **v17**: "The cost is high, so we have to delay." (Comma splice)

### B. Lowercase "Lazy Starts"
- **AI**: "Actually, looking at..."
- **v17**: "actually, looking at..."
- We will randomly lowercase the first letter of our injected fragments.

### C. Clean Fragments
- **Revert**: `Actually. Like,,` -> `Actually, like...` (or just `Actually.`)
- The `,,` is too distinct.

### D. The "Zombie" Connector
- Use "and then" or "so" repeatedly to simulate poor writing style (Human Low-Elo).

## 4. Implementation Plan
1.  **Modify `rougherService.ts`**:
    *   Remove `,,` double comma logic.
    *   Add `fuseSentences` function (randomly merges 2 short sentences).
    *   Add `lazyCapitalization` function (randomly lowercases sentence starts).
2.  **Update `modeC_rougher.ts`**:
    *   Clean up `BANNED_CONNECTIVES` replacements.
    *   Update System Prompt to "Lazy Student" persona.
