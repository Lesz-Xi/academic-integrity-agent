#!/usr/bin/env python3
"""
GPTZero Syntactic Forensics Script (v2.0)
==========================================
Tailored to GPTZero's detection mechanisms (Dec 2025):
- Perplexity (word-level predictability)
- Paraphraser Shield (humanizer tool detection)
- ESL De-Biasing (simple English = AI signature)

This script performs deep syntactic analysis to identify AI fingerprints.
"""

import sys
import re
import math
from collections import Counter

# ============================================================================
# GPTZERO VOCABULARY BLACKLIST (High-Probability AI Markers)
# ============================================================================
# These words are statistically over-represented in LLM output
AI_VOCABULARY_TIER1 = [
    # Tier 1: Critical (Immediate flag)
    "delve", "tapestry", "transformative", "landscape", "leverage",
    "underscore", "foster", "game-changer", "utilize", "facilitate",
    "endeavor", "paramount", "pivotal", "robust", "synergy", "holistic",
    "cutting-edge", "innovative", "streamline", "empower",
]

AI_VOCABULARY_TIER2 = [
    # Tier 2: High Risk (Strong indicator)
    "crucial", "implications", "feasibility", "moreover", "furthermore",
    "additionally", "specifically", "notably", "essentially", "crucially",
    "significantly", "historically", "primarily", "fundamentally",
    "inherently", "intrinsically", "paradigm", "framework", "methodology",
]

AI_VOCABULARY_TIER3 = [
    # Tier 3: Moderate Risk (Combined with other signals)
    "concerning", "regarding", "pertaining", "encompassing", "comprising",
    "constituting", "demonstrates", "illustrates", "exhibits", "manifests",
    "precipitates", "engenders", "warrants", "necessitates",
]

# ============================================================================
# GPTZERO PARAPHRASER SHIELD PATTERNS
# ============================================================================
# These patterns indicate text has been processed by a "humanizer" tool

HUMANIZER_ARTIFACTS = [
    # Formulaic short sentences (QuillBot/Undetectable.ai signatures)
    r"^This matters\.$",
    r"^Worth noting\.$",
    r"^Consider this\.$",
    r"^The catch\?$",
    r"^Not ideal\.$",
    r"^A key point\.$",
    r"^Here's the thing\.$",
    r"^The result\?$",
    
    # Mechanical transitions
    r"^On top of that,",
    r"^Here's what's tricky:",
    r"^The issue is:",
    r"^What matters:",
]

BANNED_OPENERS_PATTERN = [
    # "The [Noun] [Participle]" pattern - major AI signature
    r"^The\s+\w+ing\s+",  # The rising, The growing, The mounting
    r"^The\s+\w+ed\s+",   # The increased, The highlighted
    r"^The\s+\w+\s+of\s+",  # The importance of, The nature of
    
    # Gerund-heavy openers (AI loves these)
    r"^Using\s+",
    r"^Applying\s+",
    r"^Considering\s+",
    r"^Given\s+the\s+",
    r"^Based\s+on\s+",
    r"^In\s+light\s+of\s+",
]

# ============================================================================
# GPTZERO PERPLEXITY INDICATORS
# ============================================================================
# Low perplexity = predictable = AI-like

PREDICTABLE_PATTERNS = [
    # RLHF-tuned transition phrases (too smooth)
    r"it is important to note",
    r"in conclusion",
    r"in summary",
    r"to summarize",
    r"as mentioned earlier",
    r"as discussed above",
    r"it is worth noting",
    r"it should be noted",
    r"it goes without saying",
    r"needless to say",
    
    # AI-typical hedging
    r"it appears that",
    r"it seems that",
    r"it could be argued",
    r"one might argue",
    r"it is possible that",
]

# ============================================================================
# ANALYSIS FUNCTIONS
# ============================================================================

def analyze_vocabulary(text: str) -> dict:
    """
    Scan for AI-signature vocabulary across three risk tiers.
    """
    lower_text = text.lower()
    
    tier1_hits = [w for w in AI_VOCABULARY_TIER1 if w in lower_text]
    tier2_hits = [w for w in AI_VOCABULARY_TIER2 if w in lower_text]
    tier3_hits = [w for w in AI_VOCABULARY_TIER3 if w in lower_text]
    
    # Calculate risk score (weighted)
    risk_score = (len(tier1_hits) * 10) + (len(tier2_hits) * 5) + (len(tier3_hits) * 2)
    
    if risk_score >= 20:
        verdict = "HIGH"
        interp = "❌ HIGH VOCABULARY RISK - Multiple AI markers detected."
    elif risk_score >= 10:
        verdict = "MEDIUM"
        interp = "⚠️ MEDIUM VOCABULARY RISK - Some AI markers present."
    else:
        verdict = "LOW"
        interp = "✅ LOW VOCABULARY RISK - Minimal AI markers."
    
    return {
        "verdict": verdict,
        "interpretation": interp,
        "risk_score": risk_score,
        "tier1": tier1_hits,
        "tier2": tier2_hits,
        "tier3": tier3_hits,
    }


def analyze_paraphraser_shield(text: str) -> dict:
    """
    Detect patterns that trigger GPTZero's Paraphraser Shield.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    
    humanizer_hits = []
    banned_opener_hits = []
    
    for s in sentences:
        s_stripped = s.strip()
        
        # Check for humanizer artifact sentences
        for pattern in HUMANIZER_ARTIFACTS:
            if re.match(pattern, s_stripped, re.IGNORECASE):
                humanizer_hits.append(s_stripped[:50])
                break
        
        # Check for banned openers
        for pattern in BANNED_OPENERS_PATTERN:
            if re.match(pattern, s_stripped, re.IGNORECASE):
                banned_opener_hits.append(s_stripped[:50])
                break
    
    total_violations = len(humanizer_hits) + len(banned_opener_hits)
    
    if total_violations >= 5:
        verdict = "HIGH"
        interp = "❌ HIGH SHIELD RISK - Strong humanizer/paraphraser patterns."
    elif total_violations >= 2:
        verdict = "MEDIUM"
        interp = "⚠️ MEDIUM SHIELD RISK - Some suspicious patterns."
    else:
        verdict = "LOW"
        interp = "✅ LOW SHIELD RISK - Minimal humanizer artifacts."
    
    return {
        "verdict": verdict,
        "interpretation": interp,
        "humanizer_hits": humanizer_hits,
        "banned_opener_hits": banned_opener_hits,
        "total_violations": total_violations,
    }


def analyze_perplexity_indicators(text: str) -> dict:
    """
    Detect low-perplexity (highly predictable) patterns.
    """
    lower_text = text.lower()
    
    predictable_hits = []
    for pattern in PREDICTABLE_PATTERNS:
        if re.search(pattern, lower_text):
            predictable_hits.append(pattern)
    
    # Check for balanced clause density (AI signature)
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    balanced_clauses = 0
    for s in sentences:
        # [Intro], [Main], which/that/since [Subordinate]
        if s.count(',') >= 2 and re.search(r'\b(which|that|since|because|although|while)\b', s.lower()):
            balanced_clauses += 1
    
    balanced_ratio = (balanced_clauses / len(sentences)) if sentences else 0
    
    # Calculate perplexity risk
    risk_score = len(predictable_hits) * 5 + int(balanced_ratio * 20)
    
    if risk_score >= 15:
        verdict = "LOW_PERPLEXITY"
        interp = "❌ LOW PERPLEXITY - Highly predictable patterns detected."
    elif risk_score >= 8:
        verdict = "MEDIUM_PERPLEXITY"
        interp = "⚠️ MEDIUM PERPLEXITY - Some predictable patterns."
    else:
        verdict = "HIGH_PERPLEXITY"
        interp = "✅ HIGH PERPLEXITY - Good unpredictability."
    
    return {
        "verdict": verdict,
        "interpretation": interp,
        "predictable_phrases": predictable_hits,
        "balanced_clause_ratio": round(balanced_ratio * 100, 1),
        "risk_score": risk_score,
    }


def analyze_structural_patterns(text: str) -> dict:
    """
    Analyze sentence structure patterns for AI signatures.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    
    # SVO (Subject-Verb-Object) uniformity check
    # AI tends to use consistent grammatical patterns
    
    # Check for parallel structure overuse
    parallel_count = 0
    for s in sentences:
        # Pattern: "word, word, and word" with similar lengths
        if re.search(r'\b\w+\s*,\s*\w+\s*,\s*and\s+\w+\b', s):
            parallel_count += 1
    
    # Check for monotonous sentence starts
    starts = [s.split()[0].lower() if s.split() else "" for s in sentences]
    start_counter = Counter(starts)
    most_common_start = start_counter.most_common(1)[0] if start_counter else ("", 0)
    
    # Check for sentence length clustering
    lengths = [len(s.split()) for s in sentences]
    if lengths:
        mean_len = sum(lengths) / len(lengths)
        within_5_of_mean = sum(1 for l in lengths if abs(l - mean_len) <= 5)
        clustering_ratio = within_5_of_mean / len(lengths)
    else:
        clustering_ratio = 0
    
    issues = []
    if parallel_count >= 3:
        issues.append(f"Parallel structure overuse: {parallel_count} instances")
    if most_common_start[1] >= 4:
        issues.append(f"Repetitive opener '{most_common_start[0]}': {most_common_start[1]} times")
    if clustering_ratio >= 0.6:
        issues.append(f"Sentence length clustering: {clustering_ratio:.0%} within ±5 words of mean")
    
    if len(issues) >= 2:
        verdict = "HIGH_RISK"
        interp = "❌ HIGH STRUCTURAL RISK - Multiple AI patterns."
    elif len(issues) >= 1:
        verdict = "MEDIUM_RISK"
        interp = "⚠️ MEDIUM STRUCTURAL RISK - Some patterns detected."
    else:
        verdict = "LOW_RISK"
        interp = "✅ LOW STRUCTURAL RISK - Good structural variety."
    
    return {
        "verdict": verdict,
        "interpretation": interp,
        "parallel_structures": parallel_count,
        "most_common_start": most_common_start,
        "length_clustering": round(clustering_ratio * 100, 1),
        "issues": issues,
    }


def analyze_esl_bias_risk(text: str) -> dict:
    """
    Assess ESL bias risk - simple English can be flagged as AI.
    GPTZero may misclassify simple text as AI-generated.
    """
    words = text.lower().split()
    
    if not words:
        return {"verdict": "UNKNOWN", "interpretation": "Text too short"}
    
    # Average word length (longer = more complex = more human-like)
    avg_word_len = sum(len(w) for w in words) / len(words)
    
    # Unique word ratio (lexical diversity)
    unique_ratio = len(set(words)) / len(words)
    
    # Complex punctuation usage
    complex_punct = len(re.findall(r'[—;:\(\)]', text))
    punct_density = complex_punct / len(words) * 100
    
    # Calculate ESL risk score (lower = more at risk of ESL bias)
    complexity_score = avg_word_len * 10 + unique_ratio * 50 + punct_density * 5
    
    if complexity_score >= 80:
        verdict = "LOW_RISK"
        interp = "✅ LOW ESL BIAS RISK - Text shows academic complexity."
    elif complexity_score >= 50:
        verdict = "MEDIUM_RISK"
        interp = "⚠️ MEDIUM ESL BIAS RISK - Moderate complexity detected."
    else:
        verdict = "HIGH_RISK"
        interp = "❌ HIGH ESL BIAS RISK - Text may be flagged due to simplicity."
    
    return {
        "verdict": verdict,
        "interpretation": interp,
        "avg_word_length": round(avg_word_len, 2),
        "lexical_diversity": round(unique_ratio * 100, 1),
        "punctuation_density": round(punct_density, 2),
        "complexity_score": round(complexity_score, 1),
    }


def generate_report(text: str) -> None:
    """Generate comprehensive GPTZero syntactic forensics report."""
    
    print("=" * 60)
    print("🔬 GPTZERO SYNTACTIC FORENSICS REPORT (v2.0)")
    print("=" * 60)
    
    word_count = len(text.split())
    sentence_count = len(re.split(r'(?<=[.!?])\s+', text.strip()))
    print(f"\n📊 TEXT STATISTICS:")
    print(f"   Word Count: {word_count}")
    print(f"   Sentence Count: {sentence_count}")
    
    # 1. Vocabulary Analysis
    vocab = analyze_vocabulary(text)
    print(f"\n📚 VOCABULARY ANALYSIS:")
    print(f"   Verdict: {vocab['verdict']} (Risk Score: {vocab['risk_score']})")
    print(f"   {vocab['interpretation']}")
    if vocab['tier1']:
        print(f"   🚨 Tier 1 (Critical): {vocab['tier1']}")
    if vocab['tier2']:
        print(f"   ⚠️ Tier 2 (High Risk): {vocab['tier2']}")
    if vocab['tier3']:
        print(f"   ⚡ Tier 3 (Moderate): {vocab['tier3']}")
    
    # 2. Paraphraser Shield
    shield = analyze_paraphraser_shield(text)
    print(f"\n🛡️ PARAPHRASER SHIELD ANALYSIS:")
    print(f"   Verdict: {shield['verdict']}")
    print(f"   {shield['interpretation']}")
    if shield['humanizer_hits']:
        print(f"   Humanizer artifacts: {shield['humanizer_hits'][:3]}")
    if shield['banned_opener_hits']:
        print(f"   Banned openers: {shield['banned_opener_hits'][:3]}")
    
    # 3. Perplexity Indicators
    perplexity = analyze_perplexity_indicators(text)
    print(f"\n🎲 PERPLEXITY INDICATORS:")
    print(f"   Verdict: {perplexity['verdict']}")
    print(f"   {perplexity['interpretation']}")
    print(f"   Balanced Clause Ratio: {perplexity['balanced_clause_ratio']}%")
    if perplexity['predictable_phrases']:
        print(f"   Predictable phrases: {perplexity['predictable_phrases'][:3]}")
    
    # 4. Structural Patterns
    structure = analyze_structural_patterns(text)
    print(f"\n🏗️ STRUCTURAL PATTERN ANALYSIS:")
    print(f"   Verdict: {structure['verdict']}")
    print(f"   {structure['interpretation']}")
    print(f"   Parallel Structures: {structure['parallel_structures']}")
    print(f"   Most Common Opener: '{structure['most_common_start'][0]}' ({structure['most_common_start'][1]}x)")
    print(f"   Length Clustering: {structure['length_clustering']}%")
    
    # 5. ESL Bias Risk
    esl = analyze_esl_bias_risk(text)
    print(f"\n🌍 ESL BIAS RISK ASSESSMENT:")
    print(f"   Verdict: {esl['verdict']}")
    print(f"   {esl['interpretation']}")
    print(f"   Avg Word Length: {esl['avg_word_length']} chars")
    print(f"   Lexical Diversity: {esl['lexical_diversity']}%")
    print(f"   Punctuation Density: {esl['punctuation_density']}%")
    
    # Overall Verdict
    print("\n" + "=" * 60)
    
    high_risks = sum([
        vocab['verdict'] == "HIGH",
        shield['verdict'] == "HIGH",
        perplexity['verdict'] == "LOW_PERPLEXITY",
        structure['verdict'] == "HIGH_RISK",
        esl['verdict'] == "HIGH_RISK",
    ])
    
    medium_risks = sum([
        vocab['verdict'] == "MEDIUM",
        shield['verdict'] == "MEDIUM",
        perplexity['verdict'] == "MEDIUM_PERPLEXITY",
        structure['verdict'] == "MEDIUM_RISK",
        esl['verdict'] == "MEDIUM_RISK",
    ])
    
    if high_risks >= 2:
        print("🚨 OVERALL VERDICT: ❌ HIGH AI DETECTION RISK")
        print("   GPTZero will likely flag this text as AI-generated.")
    elif high_risks >= 1 or medium_risks >= 3:
        print("⚠️ OVERALL VERDICT: ⚡ MEDIUM AI DETECTION RISK")
        print("   Manual edits recommended before submission.")
    else:
        print("✅ OVERALL VERDICT: 🏆 LOW AI DETECTION RISK")
        print("   Text exhibits strong human-like patterns.")
    print("=" * 60)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_syntax.py <filename>")
        sys.exit(1)
    
    with open(sys.argv[1], 'r') as f:
        content = f.read()
        generate_report(content)
