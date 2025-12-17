# Research Prompt: LLM Over-Formalization in Turnitin AIR-1 Bypass

## Problem Statement

I'm building a paraphrase system to bypass **Turnitin AIR-1** (2024-2025 AI detection model) while maintaining natural academic writing. The system currently suffers from **over-formalization**: it replaces natural academic language with unnecessarily formal, Latinate vocabulary that paradoxically **INCREASES** AI detection scores instead of decreasing them.

## Context: Turnitin AIR-1 Detection Model

**What Turnitin AIR-1 Actually Detects:**
1. **Synonym Substitution Patterns**: Simple word swaps while preserving structure (e.g., "important" → "consequential")
2. **Preserved Grammatical Skeleton**: Same subject-verb-object order with different words
3. **Mechanical Fluency**: Unnaturally smooth or overly formal text from paraphrasing tools
4. **Artificial Perplexity Inflation**: Rare/archaic words inserted specifically to fool detectors (e.g., "engender", "eschew", "volitional")
5. **Thesaurus-Chain Transformations**: Multi-step synonym replacements that sound robotic

**Critical Insight**: Turnitin flags text that is **TOO formal** or **TOO varied** because it signals "AI trying to sound human." Natural academic writing has a **middle register** (formal but readable, not legal-brief formal).

## Current Issue

- **Goal**: Evade Turnitin AIR-1 by making text sound naturally human-written.
- **Problem**: The LLM is performing "thesaurus-style" substitutions that Turnitin SPECIFICALLY flags as AI-paraphrased content.
- **Constraint**: The input text is already appropriately academic (formal but readable). It doesn't need elevation—it needs **subtle structural changes**, not vocabulary replacement.

## Examples of the Problem

### Example 1: Unnecessary Latinate Vocabulary
**Input**: "creates paralysis"  
**Current Output**: "engenders stasis" ❌  
**Desired**: "produces paralysis" or "leads to paralysis" ✅

### Example 2: Thesaurus Abuse
**Input**: "becomes unstable"  
**Current Output**: "become tenuous" ❌  
**Desired**: "grows unstable" or "turns shaky" ✅

### Example 3: Lost Natural Voice
**Input**: "It's counterproductive, honestly"  
**Current Output**: "It is inherently counterproductive, which is to say, entirely predictable" ❌  
**Desired**: "It's counterproductive—obviously—but entirely predictable" ✅

### Example 4: Word-for-Word Substitution
**Input**: "learns to question its own competence"  
**Current Output**: "learns to distrust its own proficiency" ❌  
**Desired**: "learns to doubt its own competence" ✅

## The Core Issue

The LLM is interpreting "academic register" as "maximally formal language" rather than "natural scholarly writing." It's treating transformations like:
- "creates" → "engenders"
- "paralysis" → "stasis"
- "unstable" → "tenuous"
- "decision-making" → "volitional acts"

This makes the output sound like an AI trying too hard to sound formal, which ironically INCREASES AI detection scores.

## Current Prompt Strategy

The system prompt includes:
1. **Register Detection**: Identifies if input is academic vs. casual.
2. **Anti-Slang Layer**: Explicitly bans casual words like "stuff", "thing", "mess" for academic input.
3. **Instruction Override**: Reinterprets "Humanize" for academic text as "improve flow, vary sentence lengths" NOT "make it more formal."
4. **Burstiness Requirements**: High sentence length variation (short fragments + long complex sentences).

**The problem**: The Anti-Slang layer is working, but the model over-corrects by elevating ALL vocabulary.

## Research Questions (Turnitin-Specific)

1. **How can I prevent thesaurus-style substitutions that Turnitin AIR-1 flags?**
   - Should I explicitly ban "over-formal" words like "engender", "eschew", "enmeshed", "volitional", "tenuous"?
   - Or should I add examples of GOOD transformations that change structure WITHOUT changing vocabulary level?
   - **Key constraint**: The goal is to evade detection through **sentence restructuring**, not word replacement.

2. **What's the optimal way to define "Natural Graduate-Level Academic Writing" to an LLM?**
   - Is it better to give positive examples ("write like this") or negative constraints ("don't write like this")?
   - Should I include a "vocabulary ceiling" (e.g., "use words a graduate student would naturally use, not a legal brief or medical journal")?
   - **Critical**: Turnitin knows what "AI trying to sound formal" looks like. How do I communicate "naturally formal" vs. "artificially formal"?

3. **How do I prioritize structural transformation over vocabulary transformation?**
   - Turnitin AIR-1 focuses on detecting **preserved grammatical structure** with different words.
   - The solution should be: **Change the sentence structure** (active→passive, clause reordering, fragment insertion) while **keeping similar vocabulary**.
   - Current approach does the opposite: keeps structure, changes vocabulary → gets flagged.

4. **Is this a prompt engineering issue or a fundamental model limitation?**
   - Does the LLM fundamentally struggle to understand "subtle transformation"?
   - Or is the prompt sending mixed signals by banning casual words AND academic words, leaving only ultra-formal vocabulary?
   - **Test**: Can models perform "structure-only" transformations if explicitly instructed?

5. **Alternative approach: Should I use a two-pass system?**
   - **Pass 1**: Structure transformation only (sentence reordering, clause splitting, burstiness injection) - NO vocabulary changes.
   - **Pass 2**: Minimal vocabulary adjustments for key detection-prone phrases only.
   - This separates concerns: structure (for AI evasion) vs. vocabulary (for maintaining register).


## Test Case

**INPUT**: 
> "The mechanisms behind self-doubt reveal themselves through various psychological lenses. Cognitive dissonance plays a central role here, creating internal conflict when our perceived abilities clash with external expectations."

**CURRENT OUTPUT**:
> "The origins of self-doubt manifest across various theoretical frameworks. Cognitive dissonance occupies a primary position, engineering internal friction when one's perceived aptitudes run counter to external expectations."

**ISSUES**:
- "mechanisms" → "origins" (semantic shift, not just word swap)
- "reveal themselves" → "manifest" (over-formal)
- "plays a central role" → "occupies a primary position" (wordier, more formal)
- "creating" → "engineering" (inappropriate metaphor)
- "clash" → "run counter to" (wordier)

**DESIRED OUTPUT** (example):
> "Self-doubt's mechanisms appear through different psychological frameworks. Cognitive dissonance sits at the center, sparking internal conflict when perceived abilities don't match external expectations."

## Request

Please analyze this problem and suggest:
1. **Prompt engineering strategies** to prevent over-formalization while maintaining academic register.
2. **Specific constraints or examples** I should add to the system prompt.
3. **Alternative approaches** if prompt engineering alone won't solve this.
4. **Diagnostic questions** to help me understand if this is a model limitation or prompt design issue.

Thank you!
