# **The Architecture of Authenticity: A Comparative Technical Analysis of AI Text Detection by Turnitin and Grammarly**

## **1\. Introduction: The Epistemological Crisis of Digital Text**

The rapid proliferation of Large Language Models (LLMs) founded upon the Transformer architecture has precipitated a fundamental epistemological crisis within the domains of academia, publishing, and digital content verification. The release of models such as OpenAI’s GPT-4, Anthropic’s Claude, and Google’s Gemini has democratized the ability to synthesize high-fidelity textual artifacts that mimic the semantic coherence, syntactic complexity, and stylistic nuance of human authorship. This technological inflection point has rendered traditional heuristics for assessing authorship—such as vocabulary range or grammatical precision—obsolete, necessitating the development of sophisticated computational forensic tools.  
For decades, the integrity of written work was policed through the lens of plagiarism detection—a deterministic process of identifying string matches between a submitted document and a database of known sources. The challenge posed by Generative AI is fundamentally distinct; it is not a matter of copying, but of distinct synthesis. An LLM does not retrieve text; it predicts it. Consequently, the output is unique in its specific token sequence, bypassing traditional similarity checks.1 This necessitates a shift from deterministic matching to probabilistic inference, a transition that defines the current architectural landscape of AI detection.  
This report provides an exhaustive technical analysis of the two dominant architectural paradigms that have emerged to address this crisis, represented by the market leaders **Turnitin** and **Grammarly**. While both entities originated as tools for writing enhancement—Turnitin focusing on academic integrity and plagiarism, Grammarly on linguistic prescription and style—their responses to the AI challenge reveal a divergence in engineering philosophy. Turnitin has entrenched itself in **post-hoc probabilistic forensics**, deploying deep learning classifiers to analyze finished artifacts. Conversely, Grammarly has increasingly pivoted toward **real-time provenance tracking**, leveraging Operational Transformation (OT) protocols to verify the human labor of the writing process itself.  
The following analysis dissects the neural architectures, training methodologies, statistical underpinnings, and adversarial resilience of these systems. It further explores the socio-technical implications of their deployment, particularly regarding False Positive Rates (FPR) and the potential for algorithmic bias against English Language Learners (ELL), utilizing data from independent evaluations and technical whitepapers to construct a comprehensive view of the state of the art in AI detection.

## **2\. Theoretical Underpinnings of AI Detection**

To evaluate the specific architectures of Turnitin and Grammarly, one must first establish the theoretical capability of distinguishing machine-generated text from human-authored text. This distinction rests on the premise that while LLMs mimic human output, their underlying mechanism of production—statistical token prediction—leaves faint but detectable mathematical signatures.

### **2.1 The Probabilistic Nature of Large Language Models**

LLMs are, at their core, probability distributions over sequences of text. Trained on vast corpora, they learn to estimate the conditional probability of a token $w\_i$ given a context of preceding tokens $w\_{1:i-1}$.

$$P(w\_{1:T}) \= \\prod\_{t=1}^{T} P(w\_t | w\_{1:t-1})$$  
During the generation phase, models utilize decoding strategies such as greedy search, beam search, or nucleus (top-p) sampling. Despite the introduction of stochasticity via "temperature" parameters to induce variety, LLMs are fundamentally optimization engines designed to maximize the likelihood of the sequence.2 They gravitate toward the "centroid" of the language manifold—the most statistically probable combinations of words.  
Human writers, by contrast, are governed by a complex interplay of intent, memory, creativity, and error. Humans frequently traverse low-probability regions of the language space, choosing words that are statistically unlikely but contextually poignant. This divergence—the machine's adherence to probability versus the human's chaotic idiosyncrasy—forms the theoretical basis for detection.

### **2.2 Core Statistical Metrics: Perplexity and Burstiness**

Both Turnitin and Grammarly utilize variations of two foundational metrics to operationalize this theoretical divergence: **Perplexity** and **Burstiness**.3

#### **2.2.1 Perplexity as a Measure of Predictability**

Perplexity ($PP$) is the standard metric for evaluating language models, quantifying how "surprised" a model is by a given sequence of text. In the context of detection, it measures the likelihood that a generated sequence belongs to the distribution learned by the detector's reference model.

$$PP(W) \= P(w\_1, w\_2,..., w\_N)^{-\\frac{1}{N}}$$

* **Low Perplexity (The Machine Signature):** Text generated by an AI tends to have low perplexity. Because the AI is generating text based on high-probability paths, a detector model (which often shares a similar architecture to the generator) finds the text highly predictable. The "surprise" is minimal.3  
* **High Perplexity (The Human Signature):** Human writing is characterized by higher perplexity. We use unexpected metaphors, abrupt topic shifts, and complex nested clauses that defy simple statistical prediction. To a language model, human text is "surprising".3

Grammarly’s engineering documentation explicitly cites predictability as a primary vector for their classifier, noting that AI models "follow common linguistic patterns" resulting in smooth, logical, but often generic flows.4

#### **2.2.2 Burstiness as a Measure of Structural Variance**

While perplexity analyzes the choice of words, **burstiness** analyzes the structure of sentences over time. It is essentially the variance of perplexity across a document.

* **Machine Uniformity (Low Burstiness):** AI models, trained to minimize loss, tend to produce text with a consistent level of complexity. The sentence structures often fall into a steady, hypnotic rhythm of average length and standard syntax. The perplexity graph of an AI document is relatively flat.3  
* **Human Dynamism (High Burstiness):** Human cognitive processes are dynamic. A writer might follow a long, convoluted explanation with a short, punchy conclusion. This creates "spikes" or bursts in the perplexity measurement. "Human writing naturally includes a mix of short and long sentences, which creates a dynamic rhythm".3

Turnitin’s classifiers are designed to recognize this "flatness" of AI writing versus the "spikiness" of human expression, utilizing these higher-order statistical deviations to flag content even when the vocabulary is sophisticated.6

### **2.3 The Transformer Architecture in Detection**

The specific tool used to measure these metrics is the **Transformer**. Both Turnitin and Grammarly utilize deep learning models based on the Transformer architecture (likely variants of BERT, RoBERTa, or DistilBERT) for their classifiers.7  
Unlike Recurrent Neural Networks (RNNs) or Long Short-Term Memory (LSTM) networks which process text sequentially, Transformers utilize **Self-Attention mechanisms**. This allows the model to weigh the importance of every word in a segment against every other word simultaneously.

$$Attention(Q, K, V) \= softmax(\\frac{QK^T}{\\sqrt{d\_k}})V$$  
This architectural capability is crucial for AI detection because the "artifacts" of AI generation often manifest in long-range dependencies—subtle inconsistencies in logic or tone that appear across a paragraph rather than within a single phrase. The Transformer’s ability to maintain a global context of the input segment allows it to detect these subtle coherence patterns that distinguish a machine's emulation of logic from genuine human reasoning.7

## **3\. Turnitin: The Architecture of Forensic Probability**

Turnitin’s approach to AI detection is an extension of its legacy as an academic integrity enforcement tool. Its architecture is designed to analyze a static submission—a finished document—and render a verdict based on deep learning analysis. The system does not observe the writing process; it reconstructs the likelihood of AI origin forensically. This "black box" approach necessitates a highly robust and constantly evolving model architecture to maintain accuracy against an adversarial landscape.

### **3.1 The AIW (AI Writing) Model Framework**

Turnitin’s detection capabilities are built upon the **AIW** series of models. The evolution from AIW-1 to AIW-2 illustrates the rapid adaptation required in this domain.

#### **3.1.1 AIW-1: The Initial Classifier**

Launched in April 2023, the **AIW-1** model was a standard binary classifier trained to distinguish between human writing and outputs from GPT-3 and GPT-3.5.8 The model processed text by breaking it into overlapping segments (roughly sentence or paragraph length) and scoring each segment.

* **Performance:** On internal testing sets, AIW-1 achieved a document recall of roughly 89.83%.8  
* **Limitation:** It was primarily effective against "raw" AI output—text copy-pasted directly from ChatGPT without modification.

#### **3.1.2 AIW-2: Adversarial Hardening**

Recognizing the rise of "paraphrasing attacks" (students using tools to rewrite AI text), Turnitin released **AIW-2** in December 2023\.9 The architectural shift here was primarily in the **Data Data**:

* **Training Dataset Expansion:** AIW-2 was trained on a curated dataset that included "AI+AI paraphrased" text.8 This involved generating text with an LLM, then passing it through paraphrasing tools (like Quillbot), and labeling the result as "AI."  
* **Feature Learning:** By training on this data, the Transformer model learned to recognize the "fingerprint" of the paraphraser overlaid on the "fingerprint" of the generator. The model learns to see through the synonym swaps to the underlying AI syntactic structure.  
* **Efficacy:** This update improved document recall to 91.18%, demonstrating a significant gain in robustness against simple obfuscation strategies.8

### **3.2 The AIR-1 (AI Rewriting) Model: A New Detection Vector**

In July 2024, Turnitin introduced a parallel architectural component: the **AIR-1** model.9 While AIW focuses on the *origin* of the text (Generation), AIR focuses on the *manipulation* of the text (Rewriting).

* **Target:** AIR-1 targets "AI bypassers," "word spinners," and "humanizers." These tools mechanically alter text to lower perplexity without truly understanding context.  
* **Mechanism:** While technical specifics are proprietary, AIR-1 likely utilizes a sequence-to-sequence analysis or a specialized classifier trained on parallel corpora (Original vs. Spun text). It detects artifacts such as:  
  * **Unnatural Synonym Substitution:** Replacing "car" with "automobile" in a context where "car" is stylistically appropriate.  
  * **Syntactic Inversion:** Consistently flipping active/passive voice to alter sentence length statistics.11  
* **UI Integration:** The system now outputs split metrics: "AI-generated" (Cyan) and "AI-paraphrased" (Purple), signaling to the instructor not just *that* cheating occurred, but *how* it was concealed.12

### **3.3 Deep Learning Classifier Architecture Details**

Turnitin utilizes a state-of-the-art **Transformer Deep Learning Architecture** for these models.6

* **Input Segmentation:** The system does not ingest a document as a monolith. It segments the text into blocks of several hundred tokens. This segmentation is critical for handling "Hybrid Writing" (e.g., a student writing the introduction but generating the conclusion).14  
* **Vector Embeddings:** Each segment is tokenized (likely using WordPiece or BPE) and converted into high-dimensional vector embeddings. These embeddings capture the semantic relationships between words.  
* **Scoring and Aggregation:**  
  * The model assigns a probability score ($0.0$ to $1.0$) to each segment.  
  * **Aggregation Algorithm:** The final document score is *not* a simple average. The algorithm likely filters out low-confidence segments and looks for "clusters" or "streaks" of high-probability AI text.  
  * **Thresholding:** To avoid false positives on isolated sentences (which can happen by chance), the system likely employs a minimum threshold of consecutive AI-flagged sentences before impacting the overall score.15

### **3.4 Bias Mitigation Strategies**

A major architectural challenge for probabilistic detectors is **bias against English Language Learners (ELL)**.

* **The Problem:** Non-native speakers often have restricted vocabularies and use simpler, more standard sentence structures. This results in naturally "low perplexity" and "low burstiness" text—statistically mimicking AI.17  
* **Turnitin's Solution:** The AIW-2 model training set was explicitly balanced with representative samples from under-represented groups, including ELL writers and diverse subject areas (anthropology, geology).8  
* **Evaluation:** Turnitin’s internal testing claims the False Positive Rate (FPR) for ELL writers is statistically insignificant from native speakers in the new model, provided the document meets length requirements (\>300 words).17 However, independent studies continue to highlight this as a risk area.19

### **3.5 Infrastructure and Scalability**

* **Compute Load:** Running inference on millions of submissions using large Transformer models is computationally expensive. Turnitin likely utilizes batched inference on GPU clusters.  
* **Language Support:** Currently, the system is tuned primarily for English, with separate models for Spanish and Japanese being developed or released. This suggests that the "universal grammar" hypothesis of AI detection is limited; models must be language-specific to capture the unique perplexity baselines of each language.6

## **4\. Grammarly: The Hybrid Architecture of Heuristics and Provenance**

Grammarly’s approach to the AI text problem is bifurcated, reflecting its dual role as a consumer writing assistant and an institutional tool. While it maintains a "Detector" similar to Turnitin’s, its strategic architectural innovation lies in **Authorship**—a provenance-based system that fundamentally changes the verification paradigm.

### **4.1 The Classifier Engine (The "AI Detector")**

Grammarly’s standard detection tool operates on similar principles to Turnitin’s but is optimized for real-time, low-latency feedback within the user’s editor.

* **Model Type:** The architecture utilizes a machine-learning classification model, likely a lightweight Transformer variant (e.g., DistilBERT or a quantized RoBERTa) to ensure responsiveness.20  
* **Feature Extraction:** The model analyzes:  
  * **Lexical Patterns:** Over-representation of specific function words or transition phrases common in RLHF-tuned models (e.g., "In conclusion," "It is important to note").  
  * **Syntactic Complexity:** The variance in clause structure (Burstiness).3  
  * **Perplexity:** The statistical predictability of word sequences.4  
* **Training Data:** Grammarly possesses a unique advantage: a massive repository of historical user data. This allows them to train models not just on "Human vs. AI," but on "Human Errors vs. AI Perfection." The model can detect the subtle, authentic errors (typos, comma splices) that characterize human drafting, which are distinct from the "hallucinations" of AI.22

### **4.2 The Authorship Architecture: Provenance via Operational Transformation**

The most significant architectural divergence in Grammarly’s suite is **Authorship**.24 This system does not guess if text is AI; it *observes* the text being created.

#### **4.2.1 Operational Transformation (OT) and the Delta Format**

The technical backbone of Authorship is **Operational Transformation (OT)**, a technology originally developed for real-time collaborative editing (like Google Docs).26

* **The Delta Format:** Instead of storing document snapshots, Grammarly records "Deltas"—lightweight JSON objects describing discrete changes.  
  * {insert: "The "}  
  * {retain: 4, insert: "quick "}  
  * {delete: 2}  
* **Implementation:** As a user types in a supported environment (Google Docs, MS Word), Grammarly’s client (extension or desktop app) intercepts the input stream. It logs every keystroke, backspace, and cursor movement as a sequence of Deltas.26

#### **4.2.2 Categorization and Telemetry**

The system categorizes these Deltas in real-time based on the input vector:

1. **Human Typed:** Character-by-character insertion events with variable time deltas (human typing speed).  
2. **Grammarly Edited:** Changes triggered by accepting a suggestion. These are represented as "composed Deltas" (combining the user's text with the suggestion transform).26  
3. **External Paste:** Large block insertions ($N \> Threshold$) occurring instantaneously.  
4. **Generative Insertion:** Text inserted via Grammarly’s own GenAI features is tagged with a specific metadata flag.28

#### **4.2.3 Source Resolution and Analytics**

The architecture includes a sophisticated heuristics engine to resolve the origin of "Pasted" text.

* **Browser Integration:** If a user copies text from a website and pastes it into the document, Grammarly’s extension (which has access to the browser tab) can link the paste event to the source URL.  
* **Analytics Pipeline:** The system aggregates these logs to produce the "Authorship Report." This is not a probability score but a quantified metric of labor: "45% Typed, 10% Edited, 45% Pasted."  
* **Replay:** The system can reconstruct the document frame-by-frame by replaying the Delta log, providing visual proof of the writing process.24

### **4.3 Architectural Advantages of Provenance**

This OT-based architecture renders traditional adversarial attacks moot.

* **Paraphrasing:** If a student generates text with ChatGPT, spins it with Quillbot, and pastes it, Authorship sees a "Paste" event. The *content* may be obfuscated, but the *process* (instant insertion) is captured.  
* **Manual Transcription:** If a student types out AI text character-by-character, the system captures the "Human Typed" status, but the analytics (Time Spent vs. Word Count) would reveal an inhumanly consistent typing speed with zero editing/backspacing—a pattern distinct from organic composition.29

## **5\. Comparative Analysis of Efficacy and Adversarial Resilience**

The comparison between Turnitin and Grammarly is a study in contrasting methodologies: **Probabilistic Inference** (Turnitin) versus **Deterministic Provenance** (Grammarly).

### **5.1 False Positive Rates (FPR) and Accuracy Benchmarks**

The Achilles' heel of probabilistic detection is the False Positive Rate.

* **Turnitin's Claims:** Turnitin targets an FPR of \<1% for documents \>300 words.30  
* **Independent Verification (The Pangram Study):** A study by Pangram Labs (referenced in snippets) compared commercial detectors. It found Turnitin had a document-level FPR of approximately **0.51%** (1 in 200 papers). While low, at the scale of a university (100,000 submissions/year), this results in 500 wrongful accusations annually.31  
* **Comparative Stats:** The same study benchmarked GPTZero at \~2% FPR and Pangram's own model at \~0.004%.31  
* **The "Short Text" Failure Mode:** Turnitin explicitly warns that accuracy degrades significantly for text \<300 words due to insufficient statistical data to establish a burstiness profile.15

### **5.2 Adversarial Resilience: The "Spinner" Problem**

* **Turnitin:** Vulnerable to "Humanizers" that break perplexity patterns. The release of AIW-2 and AIR-1 illustrates a reactive "whac-a-mole" architecture. As spinners evolve to use more sophisticated rewriting (e.g., maintaining semantic meaning while varying syntax), Turnitin must retrain its models.19  
* **Grammarly Authorship:** Highly resilient. Because it tracks the *input method* rather than the *output text*, it is agnostic to the semantic quality of the text. A spun text is still a pasted text. The only way to defeat Authorship is to manually retype the entire document at a human pace—a high-friction barrier that negates the convenience of cheating.

### **5.3 Bias Against Non-Native Speakers**

* **Turnitin:** Despite mitigation efforts in AIW-2, independent research (e.g., Liang et al. arXiv papers) consistently shows that classifiers are more likely to flag non-native writing due to its lower lexical entropy.18  
* **Grammarly:** Authorship is inherently unbiased regarding language fluency. A non-native speaker typing slowly and correcting mistakes is logged as "Human Typed." Their struggle is captured as evidence of authenticity, turning a potential liability (poor fluency) into proof of effort.29

### **5.4 Feature Comparison Matrix**

| Feature | Turnitin (AIW-2 / AIR-1) | Grammarly (Authorship) |
| :---- | :---- | :---- |
| **Core Technology** | Transformer Deep Learning (Classifier) | Operational Transformation (Telemetry) |
| **Analysis State** | **Static:** Analyzes finalized document. | **Dynamic:** Analyzes creation process. |
| **Primary Metric** | Perplexity, Burstiness | Keystroke Dynamics, Paste Events |
| **False Positive Risk** | **Statistical:** Risk of misclassifying human style. | **Procedural:** Risk of flagging legitimate pasting (e.g., quotes) if citation logic fails. |
| **Paraphrase Detection** | **AIR-1 Model:** Detects artifacts of rewriting. | **Paste Logging:** Detects the act of insertion. |
| **Bias** | Risk of ELL bias (Low entropy \= AI). | Bias-neutral (Typing \= Typing). |
| **User Transparency** | **Opaque:** "Black box" score (e.g., "45% AI"). | **Transparent:** "Glass box" audit (e.g., "Replay Video"). |

## **6\. Socio-Technical Implications and User Experience**

The architecture of these tools defines the user experience and the pedagogical environment they create.

### **6.1 The Interface of Policing vs. Auditing**

* **Turnitin (The Policeman):** The UX is designed for the instructor. The "Similarity Report" delivers a verdict. The interface (cyan/purple highlights) guides the instructor to view the text as "contaminated." This creates an adversarial relationship between student and teacher, centered on defense and accusation.12  
* **Grammarly (The Auditor):** The UX is designed for the student. Authorship is a tool for *proving* work, not just *detecting* cheating. The "Replay" feature allows the student to say, "Watch me write this." This shifts the dynamic to verification and transparency. It empowers the student to own their process.25

### **6.2 Institutional Policy and Dependency**

* **Turnitin:** Institutions using Turnitin must grapple with the "1% error rate." Policies often struggle to define "how much AI is too much" when the tool gives a precise but potentially inaccurate number.  
* **Grammarly:** Reliance on Authorship creates a "platform lock-in." To prove their innocence, students must write *within* the Grammarly ecosystem (or compatible Google Docs/Word setups). This raises equity concerns: students with older hardware or limited internet access (required for real-time OT logging) might be disadvantaged or unable to generate the "proof" required.

## **7\. Future Architectural Trajectories**

### **7.1 Watermarking: The Next Frontier for Turnitin**

As probabilistic detection hits an asymptote (where AI writing is mathematically identical to human writing), Turnitin will likely pivot to **Watermarking**.

* **Mechanism:** Techniques like Google’s **SynthID** embed a statistical watermark in the generation process (e.g., "green-listing" certain tokens).  
* **Architectural Integration:** Turnitin will need to integrate decoder modules for major LLM watermarks. This changes the architecture from *inference* (guessing) to *decryption* (reading a hidden signal).34

### **7.2 The "Glass House" of Ubiquitous Logging**

Grammarly’s trajectory points toward total process surveillance.

* **Granularity:** Future versions will likely analyze *cognitive pauses*. The timing between keystrokes can reveal if a user is thinking (creative composition) or transcribing (copying).  
* **Multimodal Integration:** As students use AI for brainstorming (chat) and then write, the architecture will need to integrate with the AI tools themselves to tag that text not as "Pasted from Unknown" but "Imported from Brainstorming Session," validating the hybrid workflow.29

## **8\. Conclusion**

The architectural comparison of Turnitin and Grammarly reveals two distinct futures for digital integrity. **Turnitin** represents the **computational forensic** approach: a centralized, high-power deep learning system designed to police the boundary between human and machine from the outside. It is scalable and institutional but faces the inherent mathematical limits of separating two converging probability distributions.  
**Grammarly** represents the **provenance** approach: a distributed, telemetry-based system designed to document the human labor of creation from the inside. By leveraging Operational Transformation and the Delta format, it bypasses the statistical arms race entirely, replacing probability with proof.  
While Turnitin remains the industry standard for verifying submitted manuscripts, the architectural resilience of Grammarly’s Authorship suggests a paradigm shift. As AI generators become perfect mimics of human style, the *text itself* will cease to be evidence of authorship. The only remaining evidence will be the *process* of its creation—a reality that positions Grammarly’s provenance architecture as the more durable solution for the long-term future of academic integrity.

#### **Works cited**

1. Whitepapers \- Turnitin, accessed December 18, 2025, [https://www.turnitin.com/whitepapers/](https://www.turnitin.com/whitepapers/)  
2. What Is NLP? How Machines Understand and Generate Human Language \- Grammarly, accessed December 18, 2025, [https://www.grammarly.com/blog/ai/what-is-natural-language-processing/](https://www.grammarly.com/blog/ai/what-is-natural-language-processing/)  
3. How Do AI Detectors Work? Key Methods, Accuracy, and Limitations \- Grammarly, accessed December 18, 2025, [https://www.grammarly.com/blog/ai/how-do-ai-detectors-work/](https://www.grammarly.com/blog/ai/how-do-ai-detectors-work/)  
4. How to Avoid AI Detection in Writing (the Right Way) \- Grammarly, accessed December 18, 2025, [https://www.grammarly.com/blog/ai/how-to-avoid-ai-detection/](https://www.grammarly.com/blog/ai/how-to-avoid-ai-detection/)  
5. Perplexity 101: What It Is and How It Works \- Grammarly, accessed December 18, 2025, [https://www.grammarly.com/blog/ai/what-is-perplexity/](https://www.grammarly.com/blog/ai/what-is-perplexity/)  
6. Turnitin's AI writing detection model architecture and testing protocol, accessed December 18, 2025, [https://iknow.library.uitm.edu.my/249/2/AI%20Writing%20Detection%20Model.pdf](https://iknow.library.uitm.edu.my/249/2/AI%20Writing%20Detection%20Model.pdf)  
7. Guide to Deep Learning: A Comprehensive Overview \- Grammarly, accessed December 18, 2025, [https://www.grammarly.com/ai/deep-learning](https://www.grammarly.com/ai/deep-learning)  
8. Turnitin's AI Writing Detection Model Architecture and Testing Protocol \- University at Buffalo, accessed December 18, 2025, [https://www.buffalo.edu/content/www/lms/guides-instructors/integrations/turnitin/\_jcr\_content/par/download/file.res/Turnitin%E2%80%99s%20AI%20Writing%20Detection%20Model%20Architecture%20and%20Testing%20Protocol.pdf](https://www.buffalo.edu/content/www/lms/guides-instructors/integrations/turnitin/_jcr_content/par/download/file.res/Turnitin%E2%80%99s%20AI%20Writing%20Detection%20Model%20Architecture%20and%20Testing%20Protocol.pdf)  
9. What AI Detector Does Turnitin Use? Models, Accuracy & More \- EssayDone, accessed December 18, 2025, [https://www.essaydone.ai/turnitin/what-ai-detector-does-turnitin-use.html](https://www.essaydone.ai/turnitin/what-ai-detector-does-turnitin-use.html)  
10. AI writing detection model \- Turnitin Guides, accessed December 18, 2025, [https://guides.turnitin.com/hc/en-us/articles/28294949544717-AI-writing-detection-model](https://guides.turnitin.com/hc/en-us/articles/28294949544717-AI-writing-detection-model)  
11. AI paraphrasing detection: Strengthening the integrity of academic writing \- Turnitin, accessed December 18, 2025, [https://www.turnitin.com/blog/ai-paraphrasing-detection-strengthening-the-integrity-of-academic-writing](https://www.turnitin.com/blog/ai-paraphrasing-detection-strengthening-the-integrity-of-academic-writing)  
12. AI writing detection in the classic report view \- Turnitin Guides, accessed December 18, 2025, [https://guides.turnitin.com/hc/en-us/articles/28457596598925-AI-writing-detection-in-the-classic-report-view](https://guides.turnitin.com/hc/en-us/articles/28457596598925-AI-writing-detection-in-the-classic-report-view)  
13. AI writing detection in the new, enhanced Similarity Report \- Turnitin Guides, accessed December 18, 2025, [https://guides.turnitin.com/hc/en-us/articles/22774058814093-AI-writing-detection-in-the-new-enhanced-Similarity-Report](https://guides.turnitin.com/hc/en-us/articles/22774058814093-AI-writing-detection-in-the-new-enhanced-Similarity-Report)  
14. AI Detection in Turnitin, accessed December 18, 2025, [https://www.nscc.edu/documents/faculty-staff/online-learning/Turnitin-AI-Detection.pdf](https://www.nscc.edu/documents/faculty-staff/online-learning/Turnitin-AI-Detection.pdf)  
15. AI writing detection update from Turnitin's Chief Product Officer, accessed December 18, 2025, [https://www.turnitin.com/blog/ai-writing-detection-update-from-turnitins-chief-product-officer](https://www.turnitin.com/blog/ai-writing-detection-update-from-turnitins-chief-product-officer)  
16. Understanding the false positive rate for sentences of our AI writing detection capability, accessed December 18, 2025, [https://www.turnitin.com/blog/understanding-the-false-positive-rate-for-sentences-of-our-ai-writing-detection-capability](https://www.turnitin.com/blog/understanding-the-false-positive-rate-for-sentences-of-our-ai-writing-detection-capability)  
17. AI detector shows no bias against ELLs \- Turnitin, accessed December 18, 2025, [https://www.turnitin.com/blog/new-research-turnitin-s-ai-detector-shows-no-statistically-significant-bias-against-english-language-learners](https://www.turnitin.com/blog/new-research-turnitin-s-ai-detector-shows-no-statistically-significant-bias-against-english-language-learners)  
18. Guidance on AI Detection and Why We're Disabling Turnitin's AI Detector | Brightspace Support | Vanderbilt University, accessed December 18, 2025, [https://www.vanderbilt.edu/brightspace/2023/08/16/guidance-on-ai-detection-and-why-were-disabling-turnitins-ai-detector/](https://www.vanderbilt.edu/brightspace/2023/08/16/guidance-on-ai-detection-and-why-were-disabling-turnitins-ai-detector/)  
19. arxiv.org, accessed December 18, 2025, [https://arxiv.org/html/2402.14873v2](https://arxiv.org/html/2402.14873v2)  
20. Grammatical Error Correction: Tag, Not Rewrite | Grammarly Engineering Blog, accessed December 18, 2025, [https://www.grammarly.com/blog/engineering/gec-tag-not-rewrite/](https://www.grammarly.com/blog/engineering/gec-tag-not-rewrite/)  
21. Detexd Roberta Base · Models \- Dataloop, accessed December 18, 2025, [https://dataloop.ai/library/model/grammarly\_detexd-roberta-base/](https://dataloop.ai/library/model/grammarly_detexd-roberta-base/)  
22. AI Detector user guide \- Grammarly Support, accessed December 18, 2025, [https://support.grammarly.com/hc/en-us/articles/28936304999949-AI-Detector-user-guide](https://support.grammarly.com/hc/en-us/articles/28936304999949-AI-Detector-user-guide)  
23. AI Detector: Free AI Checker for ChatGPT, GPT5 & Gemini \- Grammarly, accessed December 18, 2025, [https://www.grammarly.com/ai-detector](https://www.grammarly.com/ai-detector)  
24. Grammarly Authorship: Ensure Authentic Writing in the Age of AI, accessed December 18, 2025, [https://www.grammarly.com/authorship](https://www.grammarly.com/authorship)  
25. Grammarly Authorship Just Got a Major Update: Here's What It Means for Students and Instructors, accessed December 18, 2025, [https://www.grammarly.com/blog/academic-writing/grammarly-authorship-just-got-a-major-update/](https://www.grammarly.com/blog/academic-writing/grammarly-authorship-just-got-a-major-update/)  
26. Explore How Grammarly Editor Suggestions Work | Grammarly ..., accessed December 18, 2025, [https://www.grammarly.com/blog/engineering/how-suggestions-work-grammarly-editor/](https://www.grammarly.com/blog/engineering/how-suggestions-work-grammarly-editor/)  
27. Under the Hood of the Grammarly Editor, Part One: Real-Time Collaborative Text Editing, accessed December 18, 2025, [https://www.grammarly.com/blog/engineering/real-time-collaborative-text-editing/](https://www.grammarly.com/blog/engineering/real-time-collaborative-text-editing/)  
28. About Grammarly Authorship, accessed December 18, 2025, [https://support.grammarly.com/hc/en-us/articles/29548735595405-About-Grammarly-Authorship](https://support.grammarly.com/hc/en-us/articles/29548735595405-About-Grammarly-Authorship)  
29. Grammarly Authorship Gives Faculty New Insights Into the Student-AI Writing Process, accessed December 18, 2025, [https://www.grammarly.com/blog/institutions/grammarly-authorship-gives-faculty-new-insights-into-the-student-ai-writing-process/](https://www.grammarly.com/blog/institutions/grammarly-authorship-gives-faculty-new-insights-into-the-student-ai-writing-process/)  
30. Understanding false positives within our AI writing detection capabilities \- Turnitin, accessed December 18, 2025, [https://www.turnitin.com/blog/understanding-false-positives-within-our-ai-writing-detection-capabilities](https://www.turnitin.com/blog/understanding-false-positives-within-our-ai-writing-detection-capabilities)  
31. All About False Positives in AI Detectors | Pangram Labs, accessed December 18, 2025, [https://www.pangram.com/blog/all-about-false-positives-in-ai-detectors](https://www.pangram.com/blog/all-about-false-positives-in-ai-detectors)  
32. How accurate is Pangram AI Detection on ESL?, accessed December 18, 2025, [https://www.pangram.com/blog/how-accurate-is-pangram-ai-detection-on-esl](https://www.pangram.com/blog/how-accurate-is-pangram-ai-detection-on-esl)  
33. Instructor's Guide to Grammarly Authorship, accessed December 18, 2025, [https://www.tamucc.edu/dlai/resources/assets/documents/instructors-guide-to-grammarly-authorship.pdf](https://www.tamucc.edu/dlai/resources/assets/documents/instructors-guide-to-grammarly-authorship.pdf)  
34. arXiv:2501.03437v1 \[cs.CL\] 6 Jan 2025, accessed December 18, 2025, [https://arxiv.org/pdf/2501.03437](https://arxiv.org/pdf/2501.03437)