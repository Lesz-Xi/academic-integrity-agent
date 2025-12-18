# Mode Test Prompts for AI Detection Verification

## Purpose
These prompts are designed to test each mode's De-Perfection output quality against AI detectors (AI Text Classifier, Grammarly).

---

## Mode A: Essay & Research Mode

### Test Prompt 1 (Philosophy/Ethics)
```
Write a 600-word essay on: "The ethical implications of AI in healthcare decision-making"

Include discussion of:
- Patient autonomy vs algorithmic recommendations
- Liability when AI makes diagnostic errors
- The role of human oversight
```

### Test Prompt 2 (Social Science)
```
Write a 500-word analysis: "How remote work is reshaping urban planning and housing markets"

Focus on post-2023 trends and include economic factors.
```

---

## Mode B: CS Mode

### Test Prompt 1 (Systems)
```
Explain the CAP theorem and how modern distributed databases like CockroachDB or Spanner achieve "practical consistency" across geographic regions.

Include a code example showing a consistency level configuration.
```

### Test Prompt 2 (Algorithms)
```
Compare B-trees vs LSM-trees for database indexing. When would you choose each? Include performance tradeoffs for read-heavy vs write-heavy workloads.
```

---

## Mode C: Paraphrase Mode

### Test Input 1 (Technical - for humanization)
```
INPUT TEXT TO PARAPHRASE:

Federated learning represents a paradigm shift in machine learning architecture. Unlike traditional centralized approaches where data is aggregated on a single server, federated learning enables model training across decentralized devices while keeping raw data local. This methodology addresses privacy concerns inherent in data collection practices. The aggregation of model updates, rather than raw data, occurs at a central server. However, communication overhead and non-IID data distribution present significant challenges that researchers continue to address through various optimization strategies including gradient compression and adaptive aggregation algorithms.

INSTRUCTIONS: Humanize this text while maintaining academic register. Target CV > 0.8.
```

### Test Input 2 (Academic Essay - for humanization)
```
INPUT TEXT TO PARAPHRASE:

The relationship between social media usage and adolescent mental health has become a pressing concern in contemporary psychology. Studies consistently demonstrate correlations between excessive screen time and increased rates of anxiety, depression, and sleep disturbances among teenagers. The mechanisms underlying these associations remain subject to debate, with researchers proposing various explanatory frameworks including social comparison theory, fear of missing out, and disrupted circadian rhythms. Nevertheless, establishing causality proves methodologically challenging given the difficulty of conducting controlled experiments on technology usage patterns in naturalistic settings.

INSTRUCTIONS: IMPORTANT: Include at least 2 sentences under 5 words for natural rhythm.
```

---

## Testing Instructions

1. **Copy one prompt** and paste into the corresponding mode in the app
2. **Generate the output**
3. **Test the output** with:
   - [AI Text Classifier](https://www.aitextclassifier.com/) - Target: >80% Human
   - [Grammarly AI Detection](https://app.grammarly.com/) - Target: <40% AI Score
4. **Screenshot both results** and share them here
5. **Also run**: `python3 scripts/verify_humanization.py` on the output

---

## Expected Results

| Mode | AI Text Classifier | Grammarly AI | CV Score |
|------|-------------------|--------------|----------|
| Essay | >80% Human | <50% AI | >0.6 |
| CS | >75% Human | <50% AI | >0.6 |
| Paraphrase | >85% Human | <40% AI | >0.8 |
