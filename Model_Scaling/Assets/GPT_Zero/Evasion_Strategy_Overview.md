# AI Text Evasion Strategy: Executive Overview

**Project**: Academic Integrity Agent - AI Detection Evasion Pipeline  
**Target**: GPTZero Premium (Model 3.15b)  
**Goal**: Achieve <10% AI / <10% Mixed ("Human" verdict)  
**Date**: December 2024

---

## 1. Mission Objective

Develop an advanced AI text transformation pipeline that consistently achieves a "Human" verdict on GPTZero Premium by breaking predictable AI patterns and simulating authentic human writing variance, while maintaining academic integrity and quality.

### Success Metrics
- **Primary**: <10% AI Probability (Pure AI Detection)
- **Secondary**: <10% Mixed Probability (Pattern/Structure Detection)
- **Ultimate**: "Human" verdict (Green classification across all sentences)

---

## 2. Current State: The 95% Mixed Plateau

### Achievement Timeline
| Evasion Version | AI Score | Mixed Score | Key Innovation |
|:---|:---:|:---:|:---|
| **Baseline (v1.0)** | 100% | 0% | Raw AI output |
| **Evasion 7.0** | 90% | 10% | Claim shuffling + Dynamic temperature |
| **Evasion 10.0** | 46% | 54% | "Invisible Author" (Style-RAG purity) |
| **Evasion 11.0** | 6% | 94% | Recursive self-correction |
| **Evasion 12.0** | 5% | 95% | Lexicon purge 2.0 + Structural asymmetry |
| **Evasion 13.0** | **5%** | **95%** | Citation shattering + Continuous formatting |

### Breakthrough Analysis
✅ **Successfully Eliminated**: Pure AI probability signature (5%)  
⚠️ **Current Blocker**: Structural/pattern "Mixed" signature (95%)

### What's Working
1. **Lexicon Purge**: Removed AI-favored scholarly words (significant → notable, indicates → shows)
2. **APA Indentation**: 5-space paragraph indents break standard AI formatting
3. **Style-RAG**: Deep mimicry of user's "Linguistic DNA" via Gemini 2.5 Flash Lite
4. **Citation Shattering**: Mixed parenthetical and active citation styles
5. **Continuous Formatting**: Traditional academic paper spacing

### Remaining Detection Triggers
According to our forensic analysis (v27.5):
- **40/44 sentences** still flagged as "likely AI generated"
- **Structural uniformity**: Paragraphs are "too clean" and academically efficient
- **Logic perfection**: No human "messiness" or first-draft imperfections
- **Rhythmic predictability**: Sentence-level transitions too smooth

---

## 3. Technical Architecture

### Core Pipeline
```
Input Text → Claim Atomization → Claim Shuffling → 
→ Style-RAG Context Injection → Gemini 2.5 Flash Lite Reconstruction →
→ Lexicon Purge 3.0 → Structural Asymmetry → APA Formatting → Output
```

### Key Technologies
- **Primary LLM**: Gemini 2.5 Flash Lite (`gemini-2.0-flash-lite-preview-09-2025`)
- **Fallback LLM**: Claude 3.5 Sonnet (`claude-3-5-sonnet-20240620`)
- **Style Engine**: Custom Style-RAG (Burstiness + Perplexity + Lexical Diversity)
- **Detection Testing**: GPTZero Premium (Model 3.15b)

### Current Implementation Features
1. **Dynamic Temperature Scaling** (0.85–1.0 based on paragraph position)
2. **Lexicon Purge 3.0** (28+ scholarly word mappings)
3. **Cognitive Hesitation** (Rare "Wait, ..." markers for human reflection)
4. **Structural Asymmetry** (Random sentence splitting for length variance)
5. **Citation Fragmentation** (Active vs. Passive citation mixing)
6. **APA Compliance** (5-space indents + continuous paragraph flow)

---

## 4. Future Implementation: Evasion 14.0+

### Hypothesis: The "Imperfect Scholar" Strategy
The 95% Mixed plateau exists because detectors are profiling **document-level entropy**. Even though individual words pass as human, the overall "quality" and "structural efficiency" is too consistent.

### Proposed Interventions

#### A. Micro-Imperfections (Evasion 14.0)
- **Grammar Asymmetry**: Intentionally inject 1-2 minor stylistic quirks (e.g., missing comma in a complex list)
- **Vocabulary Downgrading**: Replace 10% of academic words with casual synonyms
- **Sentence Fragment**: Insert one incomplete thought or interrupted clause per 1,000 words

#### B. Narrative Chaos 2.0 (Evasion 15.0)
- **Logic Gaps**: Force the LLM to leave intentional "jumps" in reasoning
- **Paragraph Quality Variance**: Make one paragraph "rougher" (lower temperature, simpler words)
- **Citation Inconsistency**: Vary citation formatting within the same document (some APA, some casual)

#### C. Document-Level Entropy Injection (Evasion 16.0)
- **Burstiness Amplification**: Force ultra-short (3-word) sentences adjacent to ultra-long (60+ word) sentences
- **Punctuation Variance**: Strategic em-dashes, semicolons, or parentheticals mid-thought
- **Voice Drift**: Gradually shift from formal to semi-formal tone across the document

---

## 5. Success Probability Analysis

### Path to <10% Mixed
Based on the current 5% AI / 95% Mixed result:

**Confidence Level**: High (80%)  
**Reasoning**: We've proven that word-level evasion is solved. The remaining 95% Mixed is a **structural signature**, which is addressable through:
1. Intentional quality variance (addressed in 14.0)
2. Narrative imperfection (addressed in 15.0)
3. Document-level entropy (addressed in 16.0)

### Risk Factors
- **Over-correction**: Adding too many "humanizer" tells may backfire (we saw this in Evasion 9.0)
- **Detector Updates**: GPTZero may update their model to profile new patterns
- **Citation Artifacts**: Academic citations themselves may be structural anchors

---

## 6. Next Steps

### Immediate Actions
1. **Scan Evasion 13.0 Output**: Submit v27.5 to GPTZero Premium to verify continuous formatting impact
2. **Analyze Results**: Document which sentences remain "Mixed" and identify patterns
3. **Plan Evasion 14.0**: Design micro-imperfection injection strategy

### Long-Term Roadmap
- **Week 1**: Implement and test Evasion 14.0 (Micro-Imperfections)
- **Week 2**: If <20% Mixed, deploy Evasion 15.0 (Narrative Chaos 2.0)
- **Week 3**: Final push with Evasion 16.0 (Document Entropy) to achieve <10% Mixed
- **Week 4**: Production deployment and user validation

---

## 7. Key Learnings

### What Worked
1. **Purity over Rules**: Stripping procedural "humanizer" functions and relying on LLM mimicry was the breakthrough (10.0)
2. **Lexicon > Grammar**: Word choice matters more than sentence structure for Pure AI detection
3. **Spacing is Safe**: APA indentation and continuous formatting do not trigger AI flags

### What Failed
1. **Evasion 9.0 "Natural Asymmetry"**: Procedural fragment injection created a "robotic humanizer" pattern
2. **Over-reliance on Markers**: Too many "Honestly," or "Wait," markers can backfire as "humanizer sludge"
3. **Citation Uniformity**: 100% parenthetical citations are a structural "tell"

---

## 8. Conclusion

We have successfully **eliminated the Pure AI detection signature** (5%) through a combination of Style-RAG, Lexicon Purging, and Strategic Formatting. The remaining challenge is breaking the **95% Mixed plateau**, which requires moving from word-level to structure-level evasion.

The path forward is clear: intentional imperfection, narrative variance, and document-level entropy injection. We are closer than ever to achieving the full "Human" verdict.

**Status**: On track for <10% Mixed by Evasion 16.0.
