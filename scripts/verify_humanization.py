import re
import math
import sys

def analyze_text(text):
    # Tokenize sentences
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s for s in sentences if s.strip()]
    
    if len(sentences) < 2:
        return {"error": "Text too short for analysis."}

    # Sentence lengths
    lengths = [len(s.split()) for s in sentences]
    
    # 1. Burstiness (Coefficient of Variation)
    mean = sum(lengths) / len(lengths)
    variance = sum((x - mean) ** 2 for x in lengths) / len(lengths)
    std_dev = math.sqrt(variance)
    cv = std_dev / mean if mean > 0 else 0
    
    # 2. 1:3 Ratio Check (Late 2025 Heuristic)
    long_sentences = [l for l in lengths if l > 20]
    short_sentences = [l for l in lengths if l < 7]
    
    ratio_pass = True
    if len(long_sentences) >= 3 and len(short_sentences) < (len(long_sentences) // 3):
        ratio_pass = False

    # 3. Rule of Three Check
    # Look for patterns like "word, word, and word" or "Phrase, phrase, and phrase"
    list_of_three_pattern = r'\b[\w\s]+,\s+[\w\s]+,\s+(?:and|or)\s+[\w\s]+\b'
    lists_of_three = re.findall(list_of_three_pattern, text)
    
    # 4. Starting Pattern Check
    starts = [s.split()[0].lower() if s.split() else "" for s in sentences]
    duplicate_starts = []
    for i in range(len(starts) - 2):
        if starts[i] == starts[i+1] == starts[i+2] and starts[i] != "":
            duplicate_starts.append(starts[i])

    return {
        "sentence_count": len(sentences),
        "cv_score": round(cv, 3),
        "burstiness_status": "HIGH" if cv > 0.6 else "MEDIUM" if cv > 0.3 else "LOW",
        "ratio_1_3_pass": ratio_pass,
        "long_sentences": len(long_sentences),
        "short_sentences": len(short_sentences),
        "lists_of_three_found": len(lists_of_three),
        "duplicate_starts_found": len(duplicate_starts),
        "sentence_lengths": lengths
    }

def print_report(results):
    print("="*40)
    print("🚀 HUMANIZATION VERIFICATION REPORT")
    print("="*40)
    
    if "error" in results:
        print(f"❌ ERROR: {results['error']}")
        return

    print(f"Sentences: {results['sentence_count']}")
    print(f"Burstiness (CV): {results['cv_score']} ({results['burstiness_status']})")
    
    status = "✅ PASS" if results['ratio_1_3_pass'] else "❌ FAIL"
    print(f"1:3 Ratio Heuristic: {status}")
    print(f"  - Long (>20w): {results['long_sentences']}")
    print(f"  - Short (<7w): {results['short_sentences']}")
    
    status = "✅ PASS" if results['lists_of_three_found'] == 0 else "❌ FAIL"
    print(f"Rule of Three Check: {status} ({results['lists_of_three_found']} found)")
    
    status = "✅ PASS" if results['duplicate_starts_found'] == 0 else "❌ FAIL"
    print(f"Repetitive Openers: {status}")
    
    print("\nSentence Length Distribution:")
    for i, length in enumerate(results['sentence_lengths']):
        bar = "█" * min(length, 30)
        print(f"S{i+1:02}: {bar} ({length}w)")
    print("="*40)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            content = f.read()
    else:
        content = sys.stdin.read()
    
    if content:
        results = analyze_text(content)
        print_report(results)
    else:
        print("Usage: python verify_humanization.py <filename> or pipe text to stdin")
