1. First, a factual correction

Your conclusion that “5% AI / 95% Mixed is the true algorithmic ceiling” is not yet justified by the evidence you’ve presented.

What you have demonstrated is narrower:

You have identified a local maximum under a specific constraint: starting from an LLM-generated base and applying post-hoc stylistic perturbations.

That distinction matters.

⸻

2. What actually happened (clean decomposition)

Observation (agreed)
	•	Manual edits increased AI probability sharply
	•	Edited sentences were disproportionately flagged
	•	The detector appears sensitive to “humanizer-like” artifacts

All of that is consistent with your data.

But your inference jumps too far

You inferred:

“Any intervention is detectable → therefore this is a hard ceiling.”

That inference does not follow from the data.

⸻

3. Alternative explanation (stronger, more parsimonious)

Hypothesis A (yours)

Detectors have learned all humanization patterns → ceiling reached.

Hypothesis B (more likely)

You introduced features that are conditionally predictive of AI given an already AI-like global structure.

This is subtle but critical.

Detectors do not evaluate edits in isolation. They evaluate edits relative to a document’s latent plan signature.

Your pipeline still produces:
	•	High argument efficiency
	•	Low revision entropy
	•	Clean discourse planning
	•	Uniform rhetorical intent

When you then add:
	•	Em-dashes
	•	Casual hedges
	•	Citation breaks

Those become out-of-distribution noise relative to the underlying plan, not evidence of humanity.

That is not “humanizer detection.”
That is conditional anomaly detection.

⸻

4. Why the edits were flagged (without evasion advice)

Let’s restate without operational framing:
	•	Em-dashes are not “AI tells”
	•	Casual voice is not an “AI tell”
	•	Citation inconsistency is not an “AI tell”

They become signals only when they appear on top of a globally optimized discourse graph.

Humans produce:
	•	Messy planning first
	•	Stylistic quirks as byproducts

Your system produces:
	•	Perfect planning first
	•	Quirks as overlays

Detectors are trained precisely on that distinction.

⸻

5. The real boundary you discovered (important)

The genuine research finding is not “5% is the ceiling.”

It is this:

Post-generation perturbations cannot erase upstream planning signatures.

That is a deep and valid result.

You have empirically shown that:
	•	Token-level variation is insufficient
	•	Sentence-level noise is insufficient
	•	Local edits cannot rewrite global intent structure

That is a claim about causal order, not evasion limits.

⸻

6. Why “algorithmic ceiling” is the wrong term

A ceiling implies:
	•	Detector optimality
	•	Search-space exhaustion
	•	Theoretical impossibility

You have not shown any of those.

What you have shown:
	•	A failure mode of retroactive humanization
	•	An adversarial feedback loop when optimizing against the detector
	•	A collapse when edits are not causally grounded

That is a pipeline pathology, not a universal limit.

⸻

7. Devil’s advocate question (you must answer this)

What is the evidence that a document produced through a genuinely human-like drafting process—messy planning, uneven confidence, revision traces—would land in the same basin?

You have not tested that.

Everything you tested shares one invariant:

The document originates from a single-pass, goal-optimized generator.

Until that invariant is broken (experimentally, not procedurally), the ceiling claim is premature.

⸻

8. What is a valid conclusion

You can defensibly claim:
	•	Word-level AI detection is shallow and defeatable
	•	Meta-pattern detection is robust to superficial noise
	•	Manual “humanization” increases detectability
	•	Detector feedback loops poison optimization attempts
	•	Post-hoc creativity injection is structurally incoherent

Those are strong, publishable insights.

What you cannot yet claim is:
	•	A fundamental ceiling on human-likeness
	•	Detector omniscience
	•	Impossibility of creativity modeling

⸻

9. The uncomfortable mirror

Right now, your system is still answering:

“How do I make AI output look human?”

Your stated research goal is:

“How does human creativity actually manifest in text?”

Those are not the same problem.

And GPTZero is punishing you precisely because it distinguishes between them.

⸻

10. Final question (no escape)

If GPTZero were removed entirely tomorrow, what empirical signal would you use to decide whether your system became “more creative”?

If your answer is still detector scores, you are not studying creativity.

What is the evidence for any other metric?