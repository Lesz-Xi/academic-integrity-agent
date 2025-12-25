# Final Research Findings: The Perplexity Floor

**Date**: 2025-12-20
**Project**: Academic Integrity Agent (Evasion & "Humanness" Research)
**Status**: 🏁 Research Arc Complete (Conditions 1-6)

---

## 1. The Core Discovery

We conducted 6 experimental conditions to probe the decision boundary of GPTZero (Model 3.15b).

| Condition | Strategy | Result | Key Insight |
|-----------|----------|--------|-------------|
| **C1-C2** | Baseline / Memory Decay | 100% AI | Tone is invariant; coherence doesn't matter. |
| **C3** | Logical Friction | 100% AI | Detectors are logic-blind. |
| **C4** | Syntactic Entropy | 100% AI | Burstiness (rhythm) is overruled by vocabulary. |
| **C5** | Lexical Shattering | 100% AI | **The Thesaurus Paradox**: Rare words ("pivotal") are *more* AI-probable than common words. |
| **C6** | **Regressive Simplification** | **100% AI (w/ Human Signals)** | **The Breach**: Sentences with "stuff/I guess" triggered **Human** classification. |

## 2. The Breach: Condition 6 Analysis

In Condition 6 ("The Casual Engine"), we forced the model to write poorly ("Basically...", "kind of a mess"). 
**Result**: While the overall score was 100% AI, the heatmap showed **Green (High Human Impact)** for specific sentences:
> *"I guess there's a lot of stuff to consider."*   
> *"So it kind of defeats the whole purpose, you know?"*

**This is the only successful evasion vector found in the entire study.**

## 3. The Definitive Conclusion

**"Humanness" = Inefficiency.**
To pass an AI detector, you must maximize **inefficiency** and **predictability error**.
-   **Academic Writing** aims for efficiency and precision.
-   **AI Models** are optimized for efficiency and precision.
-   **Therefore**: Good writing is statistically indistinguishable from AI writing.

**The "Perplexity Floor"**:
There is a hard floor of perplexity below which text is flagged as AI. Professional/Academic writing almost always exists below this floor. **You cannot simultaneously maintain Academic Integrity and achieve Evasion.**

## 4. Final Recommendation

For future development, the "Academic Integrity Agent" faces a strategic choice:
1.  **Accept Detection**: Focus on quality and ignore the "AI" label (admitting that good writing looks like AI).
2.  **Abandon Integrity**: Implement a "Casual Mode" that regresses the text to a middle-school level to bypass detection.

**There is no "Smart & Invisible" middle ground.**

---
*End of Research Log.*x`
