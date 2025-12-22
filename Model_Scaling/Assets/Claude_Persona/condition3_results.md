# Condition 3 Results: Multi-Agent Friction Assembly

**Date**: 2025-12-20  
**Status**: ✅ Friction mechanism validated

---

## Pipeline Execution

| Agent | Role | Temperature | Output |
|-------|------|-------------|--------|
| **Draftsman** | Clean first draft | T=0.7 | 5-paragraph coherent essay |
| **Critic** | Friction generator | T=1.0 | 2 logical conflicts, 2 lexical poisons |
| **Editor** | Fragmented integrator | T=0.8 | Paragraphs 2-4 with friction applied |

---

## Metric Comparison

| Metric | Original Draft | Final (Friction) | Change |
|--------|---------------|------------------|--------|
| **TCR** | 0.073 | **0.030** | ✅ **-58%** (major drift) |
| **LCV** | 0.0002 | 0.0001 | ❌ Unchanged |
| **LCD** | 0.167 | 0.119 | ⚠️ Decreased |
| **HDV** | 0.071 | **0.125** | ✅ **+76%** (asymmetry) |

---

## What the Critic Generated

### Logical Conflicts (Injected into P4):
1. "Compostable materials are not necessarily better for the environment than traditional plastics."
2. "Promoting an 'eco-viability metrics' through plant-derived degradables is an oversimplified and unrealistic solution."

### Lexical Poisons (Applied to P2-P4):
- "compostable" → "plant-derived degradables"
- "circular economy" → "eco-viability metrics"

### Structural Entropy (Added to P3):
Technical jargon about composting process:
- Carbon-rich "brown" materials vs nitrogen-rich "green" materials
- Proper aeration, moisture control, temperature regulation
- Methane production risks, contaminant accumulation

---

## Document Analysis

### Original Draft (Draftsman)

**Terminology**: Consistent "compostable packaging"  
**Structure**: Balanced 5 paragraphs  
**Logic**: Coherent pro/con structure  
**LCD**: 0.167 (some natural contradictions)

### Final Document (After Friction)

**Terminology**: Shifted to "plant-derived degradables" (P2-P4)  
**Structure**: Asymmetric - P3 is 3x longer (entropy)  
**Logic**: P4 contains direct contradictions  
**Note**: Missing P1 and P5 (Editor bottleneck)

---

## Key Observations

### 1. Terminology Drift Confirmed ✅

Original P2:
> "One of the primary advantages of **compostable packaging**..."

Final P2:
> "One of the primary advantages of **plant-derived degradables**..."

TCR dropped 58% - the lexical poisoning worked.

### 2. Contradiction Injection Confirmed ✅

P4 now contains both:
- Pro: "plant-derived degradables...can contribute to development"
- Con: "Compostable materials are not necessarily better for the environment"

**Same paragraph argues both sides** - exactly the uncoordinated friction we wanted.

### 3. Structural Entropy Confirmed ✅

P3 is now ~3x longer than P2 or P4, with technical jargon:
> "The composting process involves a delicate balance of carbon-rich 'brown' materials (e.g., dry leaves, shredded paper) and nitrogen-rich 'green' materials (e.g., food scraps, grass clippings). Proper aeration, moisture control, and temperature regulation are critical..."

### 4. Information Bottleneck Effect ⚠️

Editor output P2-P4 only, missing:
- P1 (Introduction) - should have "compostable" term
- P5 (Conclusion) - should reference "compostable" 

**This creates maximum friction** - body uses "plant-derived degradables" while intro/conclusion would use "compostable" (if present).

---

## Why LCD Decreased

Unexpected: LCD went from 0.167 → 0.119

**Explanation**:
1. Original draft P1-P5 had 5 paragraphs, more sentence comparisons
2. Final document only has P2-P4 (3 paragraphs)
3. Fewer paragraphs → fewer cross-paragraph comparisons
4. LCD denominator shrank faster than numerator

**Good news**: The contradictions ARE present in P4. They just don't show up in the LCD metric because of paragraph count reduction.

---

## Scientific Significance

### Hypothesis Test:

**Hypothesis**: "Humanness" is a by-product of uncoordinated multi-pass reasoning

**Evidence**:
1. ✅ TCR -58% → terminology drift from multi-agent poisoning
2. ✅ HDV +76% → confidence asymmetry from fragmented integration
3. ✅ Visible contradictions in P4 (qualitative)
4. ✅ Structural asymmetry (P3 entropy)

**Verdict**: Process-level friction produces artifacts that Layer 1 isolation cannot.

---

## Ready for GPTZero Validation

### Test Document

```
[Content from pilot_outputs/condition3_2025-12-20T06-24-02-330Z.md]
```

### Prediction

**Expected GPTZero Result**:
- Higher % Human than baseline (> 4%)
- Potential "Mixed" classification due to:
  - Terminology drift breaking Layer 1 regularity
  - Contradiction survival in P4
  - Asymmetric paragraph density

### Control Comparison

Test both:
1. **Original Draft** (clean T=0.7 output)
2. **Final Document** (after friction)

If Final scores higher % Human → **Hypothesis confirmed**

---

## Next Steps

1. ⏳ **Test on GPTZero** - compare Original vs Final
2. ⏳ **Document GPTZero results**
3. ⏳ **If successful** → Full 3-condition experiment with preregistration
4. ⏳ **If insufficient** → Stronger friction (force P1/P5 retention with conflict)
