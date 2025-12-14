# Mode Usage Guide

## Overview

The Academic Integrity Agent offers three specialized modes, each designed for specific academic writing tasks while maintaining anti-detection capabilities.

---

## 📝 Essay & Research Mode

### Purpose
Generate original academic arguments and research-based content from scratch with high semantic richness and varied structure.

### Best For
- Writing essays on new topics
- Research paper sections (literature reviews, discussions)
- Argumentative or persuasive writing
- Case study responses
- Academic discussion posts
- Analytical responses to prompts

### Key Features
- Creates complete, structured academic prose
- Thoughtful student voice (not authoritative)
- Natural burstiness and perplexity
- Citation support (with web search enabled)
- Academic integrity safeguards (no fabricated experience)

### Example Prompts

**Simple Topic:**
```
Discuss the ethical implications of AI in healthcare decision-making
```

**Research Question:**
```
How does climate change impact coastal urban planning? 
Analyze the trade-offs between adaptation and mitigation strategies.
```

**Case Study:**
```
Analyze the 2008 financial crisis from a behavioral economics perspective. 
What role did cognitive biases play in the housing market collapse?
```

### Additional Instructions Examples
- `Focus on environmental ethics`
- `Use accessible language for undergraduate level`
- `Include counterarguments`
- `Emphasize economic perspectives`

### Web Search Feature
Toggle **ON** to:
- Fetch real sources via MCTS algorithm
- Auto-cite sources in [1], [2] format
- Get fact-based, research-backed content

**Tip:** Search works best with specific, factual topics (e.g., "climate change impacts" vs. "thoughts on nature")

---

## 💻 Computer Science Mode

### Purpose
Create technical documentation with conversational tone and clear code explanations.

### Best For
- Algorithm explanations
- Code documentation and comments
- System architecture discussions
- Technical concept breakdowns
- Assignment responses requiring code + prose
- Design pattern explanations

### Key Features
- Student-appropriate technical voice
- Code blocks with thoughtful comments
- Justifications for complexity claims
- Mermaid diagram support (when requested)
- No fabricated benchmarks or unverified claims

### Example Prompts

**Algorithm Explanation:**
```
Explain how the Dijkstra's algorithm works. Include pseudocode and discuss 
its time complexity. When would you choose it over A*?
```

**Code Documentation:**
```
Document this React component:
[paste your code]

Explain the state management, props, and key design decisions.
```

**Architecture Design:**
```
Design a caching layer for a high-traffic e-commerce API. 
Illustrate the architecture with a diagram and explain trade-offs 
between Redis and Memcached.
```

**System Design:**
```
Describe how you would build a real-time collaborative text editor 
like Google Docs. What are the key technical challenges?
```

### Additional Instructions Examples
- `Include code examples in Python`
- `Focus on scalability considerations`
- `Explain like I'm a beginner`
- `Draw an architecture diagram` (triggers Mermaid)
- `Compare different approaches`

### Web Search Feature
Toggle **ON** to:
- Find documentation and technical papers
- Reference real-world implementations
- Cite performance benchmarks from credible sources

**Tip:** For diagrams, explicitly use words like "illustrate," "draw," "diagram," or "visualize"

---

## 🔄 Paraphrase & Humanize Mode

### Purpose
Restructure existing text with deep syntactic transformation while preserving meaning and authentic voice.

### Best For
- Rewriting AI-generated content
- Simplifying overly formal text
- Humanizing robotic-sounding prose
- Shortening long-winded explanations
- Maintaining casual tone in revisions
- Evading AI rewriting detection (Turnitin AIR-1)

### Key Features
- Deep syntactic restructuring (not just synonym swaps)
- Preserves original voice register (casual stays casual)
- Follows user instructions exactly (shorten means SHORTEN)
- Anti-thesaurus rules (no unnecessary formalization)
- 100% semantic fidelity

### Example Inputs

**Over-formal AI Text:**
```
The implementation of sustainable practices within urban environments 
necessitates a multifaceted approach that encompasses both infrastructural 
modifications and behavioral adaptations.
```

**Instructions:** `Humanize and simplify`

---

**Casual Student Text:**
```
So basically, machine learning is like teaching computers to learn patterns 
from data instead of explicitly programming every rule. It's honestly pretty 
cool how it works.
```

**Instructions:** `Keep casual tone, just restructure for variety`

---

**Long Academic Paragraph:**
```
[Paste a verbose 200-word paragraph]
```

**Instructions:** `Shorten to under 100 words while keeping key points`

### Additional Instructions Examples
- `Humanize and shorten`
- `Make more casual`
- `Make more formal` (only use when needed)
- `Simplify vocabulary`
- `Keep technical terms but simplify explanations`
- `Increase sentence variety`

### Important Rules
- **"Humanize"** = natural human speech, NOT more robotic
- **"Shorten"** = output MUST be shorter than input
- Preserves original tone unless explicitly asked to change it
- Avoids over-formalization (e.g., "use" → "utilize")

---

## 🔍 Web Search Toggle (Essay & CS Modes Only)

### How It Works
1. **Enable toggle** before generating
2. System searches web via Serper API
3. **MCTS algorithm** selects top 5 sources based on:
   - **Informativeness** (35%): Contains facts, data, research
   - **Essentiality** (40%): Directly relevant to your topic
   - **Comprehensiveness** (25%): Depth and coverage
4. Sources injected into prompt
5. Output includes **citations** in [1], [2] format
6. Sources listed at bottom with **clickable links**

### When to Use Search
✅ **Use for:**
- Factual topics requiring current data
- Research-backed arguments
- Technical documentation needs
- Specific case studies or events

❌ **Skip for:**
- Opinion pieces or reflective essays
- Creative or philosophical topics
- When you already have your own sources

### Setup
Add to `.env.local`:
```
VITE_SERPER_API_KEY=your_api_key_here
```

Get free key at [serper.dev](https://serper.dev) (2,500 searches/month free)

---

## 🎯 Quick Selection Guide

| Need to... | Use Mode |
|-----------|----------|
| Write essay from scratch | **Essay & Research** |
| Document code or algorithm | **Computer Science** |
| Rewrite AI-sounding text | **Paraphrase & Humanize** |
| Research-backed argument | **Essay & Research** + Search ON |
| Technical explanation with diagram | **Computer Science** + "illustrate" |
| Shorten verbose paragraph | **Paraphrase** + "shorten" |
| Make formal text casual | **Paraphrase** + "humanize" |

---

## 💡 Pro Tips

1. **Be Specific**: Detailed prompts yield better results
   - ❌ "Write about AI"
   - ✅ "Analyze ethical concerns of AI in hiring decisions, focusing on bias and transparency"

2. **Use Additional Instructions**: Fine-tune the output
   - Specify tone, length, focus areas, or examples needed

3. **Combine Features**: Essay mode + Search ON = research-backed content

4. **Iterative Refinement**: Generate → Review → Regenerate with tweaked instructions

5. **Check Metrics**: Review burstiness and perplexity scores to ensure anti-detection

6. **Cite Properly**: If using generated citations, verify them before submission

---

## 📊 Detection Metrics

After generation, review:
- **Burstiness**: Sentence length variation (target: >0.6)
- **Perplexity**: Word choice unpredictability (target: HIGH)
- **Overall Risk**: Combined assessment (target: LOW)

Higher burstiness + perplexity = Lower AI detection risk

---

## ⚠️ Academic Integrity Reminders

All modes include safeguards to prevent:
- ❌ Fabricated personal experience ("In my research...")
- ❌ Authoritative "we" voice ("We propose...")
- ❌ Unverified performance claims or benchmarks
- ❌ False credentials or expertise

The tool assists with **writing**, not **cheating**. Always:
- ✅ Understand the generated content
- ✅ Verify citations and facts
- ✅ Follow your institution's AI usage policies
- ✅ Use as a learning aid, not a replacement for learning
