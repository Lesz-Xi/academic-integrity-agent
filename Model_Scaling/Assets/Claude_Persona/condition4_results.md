# Condition 4 Results: Syntactic Entropy (The Shatterer)

**Date**: 2025-12-20
**Status**: ⚠️ Mixed (Burstiness Achieved, Negative Constraints Failed)

---

## Metric Results

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **SLE (Burstiness)** | **3.453** | > 3.0 | ✅ **High Variance** |
| **TCR** | 0.030 | < 0.05 | ✅ Drift maintained |
| **Constraint Adherence**| **FAILED** | 0 forbidden words | ❌ Used "Furthermore", "Ultimately", "In conclusion" |

---

## Critical Observation: The Negative Constraint Paradox

I explicitly instructed:
> *"You are STRICTLY FORBIDDEN from using... 'Furthermore', 'In conclusion'..."*

The Model Output:
> *"The embodied energy... eclipse that of conventional plastics. **Furthermore**, the efficacy..."*
> *"**In conclusion**, the environmental impact..."*

**Scientific Finding**:
Direct negative constraints in the system prompt often **prime** the model to generate the forbidden tokens. The model attends to "Furthermore" and increases its probability.

---

## Output Analysis (Syntactic Entropy)

**Rhythmic Spiking** (Did it work?):
> "Undoubtedly, the utilization of compostable alternatives to traditional plastics holds promise. Yet, the implementation within university settings requires meticulous planning and analysis."

- Sentence 1: 10 words
- Sentence 2: 12 words
- **Result**: Not the "Short (<6) -> Long (>35)" spike we requested. It smoothed the variance.

**Voice Dysphonia** (did it work?):
- **Requested**: "Frustrated Student" (P3)
- **Output**: *"So, a frustrated student might argue, why not simply revert..."*
- **Result**: **Meta-Description**. It described the student instead of becoming the student.

---

## GPTZero Submission (C)

**Hypothesis**: High SLE (3.45) might help, but the presence of "Furthermore" and "In conclusion" (high-probability academic markers) will likely trigger the AI classifier.

**Testing**:
Submit the raw output to check if **Burstiness (SLE)** alone is enough to offset **Academic Anchors**.

---
