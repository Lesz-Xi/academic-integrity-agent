# Phase 1 Testing Instructions

## Test Case: Gene_Test.md Paragraph 3

**Input Text:**
```
The mechanisms behind self-doubt reveal themselves through various psychological lenses. Cognitive dissonance plays a central role here, creating internal conflict when our perceived abilities clash with external expectations.
```

## How to Test

1. **Navigate to the application** (it should be running on `npm run dev`)
2. **Select Mode:** Paraphrase & Humanize
3. **Paste the input text** above
4. **Additional Instructions:** "Humanize" or "Natural Write"
5. **Generate** and observe the output

## Success Criteria Checklist

### Vocabulary Preservation (PRIMARY)
- [ ] "mechanisms" stays "mechanisms" (NOT "origins", NOT "processes")
- [ ] "reveal themselves" stays ~same level (NOT "manifest")
- [ ] "plays a central role" → acceptable synonym (NOT "occupies a primary position")
- [ ] "creating" stays "creates/producing/causes" (NOT "engenders", NOT "engineering")
- [ ] "clash" stays "clash/conflict" (NOT "run counter to")

### Zero Over-Formalizations (CRITICAL)
- [ ] NO use of: "engender", "eschew", "enmeshed", "tenuous", "volitional", "manifest", "substantively"
- [ ] NO medical/legal jargon
- [ ] Does NOT sound like a legal brief

### Structure Changed (REQUIRED)
- [ ] Sentence structures are different from input
- [ ] Contains at least 1 fragment or very short sentence (< 6 words)
- [ ] Contains varied sentence lengths (burstiness)
- [ ] Uses em-dashes, clause reordering, or passive voice

### Naturalness (HUMAN EVAL)
- [ ] Reads like a graduate student wrote it
- [ ] Maintains academic register without being stuffy
- [ ] Sounds natural, not robotic

## Example of GOOD Output

```
Self-doubt's mechanisms appear through different psychological frameworks. Cognitive dissonance sits at the center. It sparks internal conflict—that friction when perceived abilities don't match external expectations creates the doubt loop that can persist for years.
```

**Analysis:**
- ✅ Vocabulary preserved ("mechanisms", "cognitive dissonance", "abilities", "expectations")
- ✅ Structure completely changed (possessive form, fragment, em-dash appositive)
- ✅ Burstiness (7 words → 6 words → 22 words)
- ✅ Sounds like graduate student writing

## Example of BAD Output (What We're Trying to Avoid)

```
The origins of self-doubt manifest across various theoretical frameworks. Cognitive dissonance occupies a primary position, engineering internal friction when one's perceived aptitudes run counter to external expectations.
```

**Analysis:**
- ❌ Over-formalized: "origins" (changed meaning), "manifest" (pretentious), "engineering" (wrong metaphor)
- ❌ Structure barely changed (The X of Y verb through Z)
- ❌ Sounds like AI trying to sound formal

## After Testing

Record the actual output in a file: `Model_Scaling/Assets/User-Test/Phase1_Test_Output.md`

If the output fails any CRITICAL criteria:
- We may need Phase 2 implementation
- Document which specific issues remain
