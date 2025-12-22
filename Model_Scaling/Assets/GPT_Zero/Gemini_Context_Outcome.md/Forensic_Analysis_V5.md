# Forensic Analysis V5: The Paraphrase Detection Ceiling (v12 Analysis)

## 1. Score Breakdown
| Metric | Result | Insight |
| :--- | :---: | :--- |
| **Probability Breakdown** | 60% AI / 32% Mixed / **8% Human** | **Progress**: Broke the 0% Human floor. |
| **Status** | **Possible AI paraphrasing** | **VERDICT SHIFT**: We are no longer "AI Generated". We are "Originally AI, but rewritten". |
| **Confidence** | Moderately Confident | Detection is becoming less certain. |

## 2. Forensic Identifying Flags (v12 Sabotage Review)

The uploaded images show that we are successfully "shattering" many patterns, but several **Structural Anchors** remain:

### A. The "Dual-Purpose" Anchor (Robotic Formality)
*   **Flagged**: *"The combination ensures that the study does not only address the financial feasibility... but also considers the social dynamics..."*
*   **Analyst Insight**: GPTZero flags the `Not only X... but also Y` construction with high confidence. This is a very high-probability academic marker.
*   **Solution**: Shatter the coordination. Use "Plus," "And besides that," or separate the thoughts entirely.

### B. The "Feasibility" Anchor (Mechanical Precision)
*   **Flagged**: *"This study aims to determine the feasibility of transitioning from plastic to compostable packaging..."*
*   **Analyst Insight**: "Aims to determine the feasibility" is a textbook research proposal opener. Even with rule-based sludging (transitioning), the *intent* of the sentence is formulaic.
*   **Solution**: Use informal intent: *"We're trying to see if switching from plastic to the compostable kind actually makes sense..."*

### C. The "Theoretical Setup" (Robotic Formality)
*   **Flagged**: *"Together, these theories provide a broad setup that integrates economic evaluation..."*
*   **Analyst Insight**: "Together, these [X] provide a [Y]" is a highly probable summary sentence.
*   **Solution**: Drop the umbrella summary. Start with the specific.

## 3. v13.0 "Structural Saboteur" Strategy

Following the **Senior AI Forensic Analyst** persona, v13 will target the **skeleton** of the text, not just the skin:

1.  **Dismantle Coordination**: Ban `Both... and`, `Not only... but also`, and `Either... or`.
2.  **Logical Re-ordering**: Manually (via rule) swap parts of sentences where possible (e.g., *"Because of X, Y happened"* -> *"Y happened, mostly because of X"*).
3.  **The "Drafting Error" Simulation**: Inject minor informal repetitions (e.g., *"It works, yeah, it works because..."*) to simulate the hesitancy of human writing.
4.  **Lower Surgical Threshold (0.3)**: Force the LLM to process almost every analytical sentence.

## 4. Verification Plan
*   Process `Real_Test_1.md` with v13 pipeline.
*   Target: **20%+ Human Score** (Goal: Move into "Mixed" or "Human" status).
