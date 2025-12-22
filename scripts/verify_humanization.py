#!/usr/bin/env python3
"""
GPTZero Humanization Verification Script (v2.0)
===============================================
Tailored to GPTZero's 7-component detection system (Dec 2025):
1. Deep Learning Classifier
2. Sentence-Level Classification
3. Perplexity Calculator
4. Burstiness Evaluator
5. Paraphraser Shield
6. ESL De-Biasing Module
7. Input & Metadata Analysis

This script emulates GPTZero's core metrics to pre-verify text before submission.
"""

import re
import math
import sys
from collections import Counter

# ============================================================================
# GPTIZERO DETECTION THRESHOLDS (Based on Dec 2025 Research)
# ============================================================================
BURSTINESS_THRESHOLDS = {
    "HIGH": 0.6,    # CV > 0.6 = Strong human signature
    "MEDIUM": 0.3,  # CV 0.3-0.6 = Borderline
    "LOW": 0.0      # CV < 0.3 = AI signature
}

# GPTZero's 1:3 Ratio Heuristic: For every 3 long sentences, need 1 short sentence
LONG_SENTENCE_THRESHOLD = 20  # words
SHORT_SENTENCE_THRESHOLD = 7   # words
RATIO_DENOMINATOR = 3

# Paraphraser Shield Detection: Synonym chains and mechanical patterns
PARAPHRASER_PATTERNS = [
    r"\b(shows|demonstrates|reveals|indicates|suggests|illustrates)\b",  # Mechanical verb rotation
    r"\b(however|nevertheless|yet|still|though|even so)\b",  # Mechanical connector rotation
    r"\b(important|significant|crucial|key|vital|essential)\b",  # Mechanical adjective rotation
]

# ESL Bias Risk: Simple vocabulary + simple structure = flagged as AI
ACADEMIC_COMPLEXITY_MARKERS = [
    r"—[^—]+—",  # Em-dash interpolations
    r"\([^)]+\)",  # Parenthetical asides
    r";",  # Semicolons (complex structure)
    r"\"[^\"]+\"",  # Quoted material
]


def analyze_burstiness(text: str) -> dict:
    """
    Analyze sentence length variance (Coefficient of Variation).
    GPTZero uses CV to measure "smoothness" - lower CV = more AI-like.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s for s in sentences if s.strip()]
    
    if len(sentences) < 3:
        return {
            "cv": 0,
            "score": "LOW",
            "interpretation": "⚠️ Text too short for reliable analysis.",
            "sentence_count": len(sentences),
            "lengths": [],
            "short_count": 0,
            "long_count": 0,
        }
    
    lengths = [len(s.split()) for s in sentences]
    mean = sum(lengths) / len(lengths)
    variance = sum((x - mean) ** 2 for x in lengths) / len(lengths)
    std_dev = math.sqrt(variance)
    cv = std_dev / mean if mean > 0 else 0
    
    # Score based on GPTZero thresholds
    if cv >= BURSTINESS_THRESHOLDS["HIGH"]:
        score = "HIGH"
        interp = "✅ High burstiness. Strong human signature."
    elif cv >= BURSTINESS_THRESHOLDS["MEDIUM"]:
        score = "MEDIUM"
        interp = "⚡ Medium burstiness. Borderline - may trigger detection."
    else:
        score = "LOW"
        interp = "❌ Low burstiness. HIGH AI DETECTION RISK."
    
    short_count = len([l for l in lengths if l < SHORT_SENTENCE_THRESHOLD])
    long_count = len([l for l in lengths if l > LONG_SENTENCE_THRESHOLD])
    
    return {
        "cv": round(cv, 3),
        "score": score,
        "interpretation": interp,
        "sentence_count": len(sentences),
        "lengths": lengths,
        "short_count": short_count,
        "long_count": long_count,
        "mean_length": round(mean, 1),
        "std_dev": round(std_dev, 1),
    }


def analyze_ratio_heuristic(short_count: int, long_count: int) -> dict:
    """
    GPTZero's 1:3 Ratio Heuristic.
    For every 3 long sentences (>20 words), you need at least 1 short sentence (<7 words).
    """
    required_short = long_count // RATIO_DENOMINATOR
    
    if long_count < RATIO_DENOMINATOR:
        return {
            "pass": True,
            "interpretation": "✅ Not enough long sentences to trigger ratio check.",
            "required": 0,
            "actual": short_count,
        }
    
    if short_count >= required_short:
        return {
            "pass": True,
            "interpretation": f"✅ PASS - {short_count} short sentences for {long_count} long sentences.",
            "required": required_short,
            "actual": short_count,
        }
    else:
        return {
            "pass": False,
            "interpretation": f"❌ FAIL - Need {required_short} short sentences, only have {short_count}.",
            "required": required_short,
            "actual": short_count,
        }


def analyze_rule_of_three(text: str) -> dict:
    """
    Detect "Rule of Three" patterns - a major AI signature.
    AI models love: "A, B, and C" or "First... Second... Third..."
    """
    # Pattern: word, word, and/or word
    comma_and_pattern = r'\b[\w\s]+,\s+[\w\s]+,\s+(?:and|or)\s+[\w\s]+\b'
    lists_of_three = re.findall(comma_and_pattern, text)
    
    # Pattern: First, Second, Third ordering
    ordinal_pattern = r'\b(first|firstly|second|secondly|third|thirdly)\b'
    ordinals = re.findall(ordinal_pattern, text.lower())
    ordinal_sequences = len([o for o in ordinals if o.startswith(('first', 'second', 'third'))])
    
    total_violations = len(lists_of_three) + (1 if ordinal_sequences >= 3 else 0)
    
    return {
        "pass": total_violations == 0,
        "comma_lists": len(lists_of_three),
        "ordinal_sequences": ordinal_sequences >= 3,
        "interpretation": f"✅ PASS" if total_violations == 0 else f"❌ FAIL - {total_violations} 'Rule of Three' patterns found.",
        "examples": lists_of_three[:3],  # Show first 3 examples
    }


def analyze_opener_repetition(text: str) -> dict:
    """
    Detect repetitive sentence openers - AI tends to start sentences similarly.
    3+ consecutive sentences starting with the same word = AI signature.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s for s in sentences if s.strip()]
    
    if len(sentences) < 3:
        return {"pass": True, "interpretation": "✅ Text too short to check.", "violations": []}
    
    starts = [s.split()[0].lower() if s.split() else "" for s in sentences]
    violations = []
    
    for i in range(len(starts) - 2):
        if starts[i] == starts[i+1] == starts[i+2] and starts[i] != "":
            violations.append(f"'{starts[i]}' repeated at sentences {i+1}, {i+2}, {i+3}")
    
    return {
        "pass": len(violations) == 0,
        "interpretation": "✅ PASS" if len(violations) == 0 else f"❌ FAIL - {len(violations)} repetitive opener patterns.",
        "violations": violations,
    }


def analyze_paraphraser_shield(text: str) -> dict:
    """
    Detect "Paraphraser Shield" triggers.
    GPTZero specifically looks for:
    1. Mechanical synonym rotation (same word type repeated with synonyms)
    2. Overly uniform sentence transformations
    """
    findings = []
    
    for pattern in PARAPHRASER_PATTERNS:
        matches = re.findall(pattern, text.lower())
        if len(matches) >= 3:
            unique_matches = set(matches)
            if len(unique_matches) >= 3:
                findings.append(f"Synonym rotation detected: {unique_matches}")
    
    # Check for mechanical parallel structure
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    parallel_count = 0
    for s in sentences:
        # Check for [phrase], [phrase], and [phrase] pattern
        if re.search(r',\s+\w+\s+\w+,\s+and\s+\w+\s+\w+', s):
            parallel_count += 1
    
    if parallel_count >= 3:
        findings.append(f"Mechanical parallelism: {parallel_count} instances")
    
    return {
        "pass": len(findings) == 0,
        "interpretation": "✅ PASS" if len(findings) == 0 else f"⚠️ WARN - Paraphraser patterns detected.",
        "findings": findings,
    }


def analyze_complexity_markers(text: str) -> dict:
    """
    Detect academic complexity markers that indicate human writing.
    GPTZero's ESL bias can flag "too simple" text as AI.
    High complexity = more human-like.
    """
    markers = {}
    total = 0
    
    for pattern in ACADEMIC_COMPLEXITY_MARKERS:
        matches = re.findall(pattern, text)
        count = len(matches)
        total += count
        markers[pattern] = count
    
    word_count = len(text.split())
    density = (total / word_count * 100) if word_count > 0 else 0
    
    if density >= 2.0:
        score = "HIGH"
        interp = "✅ High complexity. Human-like academic structure."
    elif density >= 1.0:
        score = "MEDIUM"
        interp = "⚡ Medium complexity. Some academic markers present."
    else:
        score = "LOW"
        interp = "❌ Low complexity. May trigger ESL bias / AI detection."
    
    return {
        "score": score,
        "density": round(density, 2),
        "interpretation": interp,
        "em_dashes": len(re.findall(r"—[^—]+—", text)),
        "parentheticals": len(re.findall(r"\([^)]+\)", text)),
        "semicolons": text.count(";"),
    }


def generate_report(text: str) -> None:
    """Generate comprehensive GPTZero-aligned humanization report."""
    
    print("=" * 60)
    print("🔍 GPTZERO HUMANIZATION VERIFICATION REPORT (v2.0)")
    print("=" * 60)
    
    word_count = len(text.split())
    print(f"\n📊 TEXT STATISTICS:")
    print(f"   Word Count: {word_count}")
    
    # 1. Burstiness Analysis
    burstiness = analyze_burstiness(text)
    print(f"\n📈 BURSTINESS ANALYSIS (GPTZero Core Metric):")
    print(f"   Coefficient of Variation: {burstiness['cv']}")
    print(f"   Score: {burstiness['score']}")
    print(f"   {burstiness['interpretation']}")
    print(f"   Sentence Count: {burstiness['sentence_count']}")
    print(f"   Mean Length: {burstiness['mean_length']} words")
    print(f"   Std Dev: {burstiness['std_dev']} words")
    
    # 2. 1:3 Ratio Heuristic
    ratio = analyze_ratio_heuristic(burstiness['short_count'], burstiness['long_count'])
    print(f"\n📐 1:3 RATIO HEURISTIC:")
    print(f"   Long Sentences (>20w): {burstiness['long_count']}")
    print(f"   Short Sentences (<7w): {burstiness['short_count']}")
    print(f"   {ratio['interpretation']}")
    
    # 3. Rule of Three
    rule_of_three = analyze_rule_of_three(text)
    print(f"\n📝 RULE OF THREE CHECK:")
    print(f"   {rule_of_three['interpretation']}")
    if rule_of_three['examples']:
        print(f"   Examples: {rule_of_three['examples'][:2]}")
    
    # 4. Opener Repetition
    openers = analyze_opener_repetition(text)
    print(f"\n🔄 OPENER REPETITION CHECK:")
    print(f"   {openers['interpretation']}")
    
    # 5. Paraphraser Shield
    shield = analyze_paraphraser_shield(text)
    print(f"\n🛡️ PARAPHRASER SHIELD CHECK:")
    print(f"   {shield['interpretation']}")
    for finding in shield['findings']:
        print(f"   ⚠️ {finding}")
    
    # 6. Complexity Markers
    complexity = analyze_complexity_markers(text)
    print(f"\n🎓 ACADEMIC COMPLEXITY MARKERS:")
    print(f"   Score: {complexity['score']} (Density: {complexity['density']}%)")
    print(f"   {complexity['interpretation']}")
    print(f"   Em-dash interpolations: {complexity['em_dashes']}")
    print(f"   Parenthetical asides: {complexity['parentheticals']}")
    print(f"   Semicolons: {complexity['semicolons']}")
    
    # Sentence Length Distribution
    if burstiness['lengths']:
        print(f"\n📊 SENTENCE LENGTH DISTRIBUTION:")
        for i, length in enumerate(burstiness['lengths'][:20]):  # Show first 20
            bar = "█" * min(length, 40)
            marker = "⚡" if length < 7 else "📏" if length > 20 else " "
            print(f"   S{i+1:02}: {bar} ({length}w) {marker}")
        if len(burstiness['lengths']) > 20:
            print(f"   ... and {len(burstiness['lengths']) - 20} more sentences")
    
    # Overall Verdict
    print("\n" + "=" * 60)
    failures = sum([
        not ratio['pass'],
        not rule_of_three['pass'],
        not openers['pass'],
        burstiness['score'] == "LOW",
        complexity['score'] == "LOW",
    ])
    
    if failures == 0 and burstiness['score'] == "HIGH":
        print("🏆 OVERALL VERDICT: ✅ HIGH HUMAN PROBABILITY")
    elif failures <= 2 and burstiness['score'] != "LOW":
        print("⚡ OVERALL VERDICT: ⚠️ MEDIUM RISK - Manual edits recommended")
    else:
        print("🚨 OVERALL VERDICT: ❌ HIGH AI DETECTION RISK")
    print("=" * 60)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            content = f.read()
    else:
        content = sys.stdin.read()
    
    if content:
        generate_report(content)
    else:
        print("Usage: python verify_humanization.py <filename> or pipe text to stdin")
