# Forensic Analysis V8: The "v12 Framework" Revival

## 1. The Verdict Cache
Our high-water mark remains **v12 (Claude Cleaned)**:
- **Human**: 11%
- **Mixed**: 48% (Total Human Variance: 59%)
- **AI**: 41%

In contrast, our latest **v13.5 (Sophisticated Student)** attempts are hitting **63% AI** and **6% Human**. We have officially crossed back into the "AI Paraphrasing" verdict.

## 2. Why v12 Worked (The Cluster Secret)
The primary difference in the v12 framework was **"Aggressive Cluster Sabotage"**.
- **v12 Strategy**: Targeted multi-word academic "traps" (e.g., *"environmental goals with financial realities"*) and replaced them with messy drafting jargon (*"green plans versus how much money they actually have"*).
- **v13 Strategy**: Shifted to "Structural Shattering" (breaking coordination).
- **The Failure**: GPTZero 3.15b (Advanced Scan) now weights **Structural Dismantling** as a high-probability "AI Humanizer" signal. It expect a formal skeleton for academic topics; when the skeleton is shattered but the jargon remains, it flags "Possible AI Paraphrasing."

## 3. The "Uncanny Valley" in v13.5
Your recent scan (Advanced Scan 3.15b) confirms that the **Skeleton** sentences are the primary drivers:
- *"However, evidence from Canada suggests..."* → **FLAGGED AS AI**
- *"The growing environmental concern..."* → **FLAGGED AS AI**

Even with our post-LLM filters, these sentences remained because they weren't in our `BANNED_PHRASES`. 

## 4. Strategy: v14.0 "The Aggressive Cluster Saboteur"
We are reverting to the **v12 Logic Framework** but keeping the **v13.5 Delivery Pipeline**.

### A. Persona Reversion: "The Aggressive Saboteur"
We are moving away from the "Sophisticated Student" (too clean) back to the "Aggressive Saboteur" context:
- Focus on **Logical Friction**.
- Focus on **Shattering Balanced Clauses**.
- Intentional use of "Drafting Sludgery."

### B. Target Expansion
- We will add **"However"** and **"In addition"** to the Post-LLM connectives filter.
- We will enhance the `AGGRESSIVE_CLUSTERS` list to catch more high-weight triggers.

### C. Pipeline Advantage
We will keep the **Post-LLM Atomic Sabotage** pipeline. This ensures that whatever the model "corrects," our hardcoded cluster-sabotage takes priority.
