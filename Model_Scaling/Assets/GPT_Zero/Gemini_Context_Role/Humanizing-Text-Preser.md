# **The Architecture of Preservation-Based Humanization: A Technical Analysis of Deep Stylistic Control and Semantic Integrity**

## **Executive Summary**

The generative artificial intelligence landscape has reached a pivotal technical bifurcation. On one side lies "Transformation-Based" generation—a legacy approach rooted in adversarial evasion, relying on surface-level lexical perturbations to manipulate perplexity and burstiness scores. On the other stands "Preservation-Based Humanization" (PBH), a sophisticated emerging discipline within Natural Language Generation (NLG) that prioritizes the disentanglement of semantic intent from stylistic identity. This report provides an exhaustive technical analysis of the latter, positing that true humanization is not a process of obscuring machine origins through noise, but rather the precise reconstruction of an authorial "fingerprint" via deep architectural interventions.  
Current detection infrastructure, exemplified by platforms such as Turnitin and GPTZero, has evolved beyond simple statistical anomaly detection. These systems now employ forensic stylometry—analyzing invariant linguistic signatures, discourse coherence, and idiosyncratic usage patterns such as Burrows’ Delta and Cumulative Sum (CUSUM) analyses. Consequently, "humanization" that relies on stochastic synonym replacement fails because it disrupts the internal consistency of the text, creating a "patchwriting" signal that forensic algorithms identify as a discontinuity in the authorial voice.  
Preservation-Based Humanization addresses this by modeling the "authorial identity" as a distinct, continuous variable in the latent space. It necessitates architectures capable of **hierarchical disentanglement**: separating the "what" (semantic intent, logic, factual data) from the "how" (syntactic structures, discourse relations, lexical preferences) and reconstructing the text using a coherent, human-like target profile. This report explores the underlying architectures—ranging from Latent Variable Models and Adversarial Networks to Retrieval-Augmented Generation (RAG) and Discourse-Aware Transformers—that enable this high-fidelity stylistic synthesis. We analyze key frameworks such as TinyStyler, ZeroStylus, and APPDIA, dissecting their mechanisms for preserving semantic integrity while successfully masquerading within the statistical bounds of human authorship.

## **1\. The Technical Divide: Surface Transformation vs. Deep Preservation**

The distinction between Transformation-Based and Preservation-Based Humanization is not merely semantic; it represents a fundamental divergence in objective functions and architectural design. To understand the necessity of preservation-based architectures, one must first deconstruct the limitations of the current "surface level" paradigm.

### **1.1 The Surface Level: Limitations of Transformation-Based Detection**

Transformation-Based Humanization operates on the premise that AI detection is primarily a function of statistical predictability. Large Language Models (LLMs) generate text that minimizes perplexity—a measure of how "surprising" a sequence of words is to the model. Consequently, early "humanizers" functioned as post-processing noise injectors. They utilized techniques such as lexical substitution (replacing high-probability tokens with lower-probability synonyms), back-translation (translating text to an intermediate language and back to introduce grammatical noise), and syntactic shuffling (altering active/passive voice).  
While these methods effectively increase perplexity, they inadvertently degrade the **semantic integrity** and **discourse coherence** of the text. This phenomenon, often described as the "uncanny valley" of text, results in output that is statistically unpredictable but linguistically unnatural. The core failure mode here is the disruption of "Burstiness"—the natural variation in sentence structure and length that characterizes human writing. Transformation-based methods typically introduce randomness uniformly, failing to replicate the specific, rhythmic variance of a human author.

### **1.2 The Preservation Paradigm: Identity as a Latent Variable**

Preservation-Based Humanization (PBH) redefines the task: instead of maximizing entropy to evade detection, the goal is to maximize the probability of a specific *target style* while strictly satisfying a *content preservation constraint*. Ideally, a PBH system mimics a specific human's "microlinguistic" choices (lexicon, syntax) and "macrolinguistic" structures (argumentation, paragraph flow) without altering the underlying meaning.1  
The theoretical foundation of PBH rests on the **Style-Content Disentanglement Hypothesis**. This hypothesis suggests that any given text $x$ can be decomposed into two independent latent variables: a content variable $z\_c$ (representing the semantic payload) and a style variable $z\_s$ (representing the authorial signature). The generative process is thus modeled as:

$$P(x) \= P(x | z\_c, z\_s) P(z\_c) P(z\_s)$$  
The objective of a preservation-based system is to encode an input text $x\_{src}$ into a content representation $z\_c$ that is invariant to the source style, and then decode it conditioned on a target style embedding $z\_{s\_{target}}$. This requires architectures that can perform "style injection" at multiple levels of the linguistic hierarchy, ensuring that the "what" (the message) remains intact while the "how" (the delivery) is transformed to match a coherent human profile.3

## **2\. The Adversarial Landscape: Forensic Stylometry and Detection Architectures**

To design effective Preservation-Based Humanization systems, one must understand the sophisticated mechanisms employed by detection platforms like Turnitin and GPTZero. These systems have moved beyond simple perplexity checks to employ **Forensic Stylometry**, a field rooted in the statistical analysis of literary style.

### **2.1 Beyond Perplexity: The Forensics of Authorship**

Turnitin's "Authorship Investigate" and similar high-end academic integrity tools utilize a battery of stylometric tests designed to fingerprint a writer. These tests rely on the observation that while a writer may change their topic (content), their unconscious linguistic habits (style) remain relatively stable.

#### **2.1.1 Burrows’ Delta and Function Word Analysis**

A cornerstone of forensic authorship analysis is **Burrows’ Delta** ($\\Delta$), a geometric measure of stylistic difference. Unlike content analysis, which looks at nouns and verbs, Burrows’ Delta focuses on **function words**—the high-frequency, low-semantic-value words such as "the," "and," "of," "but," and "however." Research indicates that the distribution of these function words serves as a robust authorial fingerprint.5  
The algorithm calculates the Z-scores for the $n$ most frequent words in a text. For a given word $i$, the Z-score in text $T$ is given by:

$$Z\_i(T) \= \\frac{f\_i(T) \- \\mu\_i}{\\sigma\_i}$$  
where $f\_i(T)$ is the frequency of word $i$ in text $T$, and $\\mu\_i, \\sigma\_i$ are the mean and standard deviation of that word's frequency in a reference corpus. The Delta measure between a suspect text $T$ and a known author profile $A$ is the mean absolute difference of their Z-scores:

$$\\Delta(T, A) \= \\frac{1}{n} \\sum\_{i=1}^n | Z\_i(T) \- Z\_i(A) |$$  
Transformation-based humanizers, which randomly swap words to spike perplexity, often disturb this delicate distribution of function words. They might replace "however" with "nonetheless" at a rate that deviates significantly from the author's baseline, resulting in a high Delta score that flags the text as anomalous or "patchwritten".6 A Preservation-Based system, therefore, must explicitly model and preserve the *relative frequency* of these function words to simulate a consistent authorial signature.

#### **2.1.2 The CUSUM (Cumulative Sum) Technique**

Another powerful forensic tool is the **Cumulative Sum (CUSUM)** technique, used to detect inconsistencies *within* a single document. This method is particularly effective at identifying "contract cheating" or the use of multiple generative models (patchwriting).  
CUSUM analysis tracks the cumulative deviation of a linguistic feature (e.g., sentence length, proportion of 2-3 letter words, or vowel usage) from the document's average. For a sequence of sentences $x\_1, x\_2, \\dots, x\_k$ with mean $\\bar{x}$, the CUSUM score $S\_i$ at sentence $i$ is:

$$S\_i \= \\sum\_{j=1}^i (x\_j \- \\bar{x})$$  
In a coherent human text, the graph of $S\_i$ versus $i$ typically follows a relatively stable trajectory. In contrast, text that has been "humanized" via patch-wise transformation or mixed with AI generation often exhibits sharp, jagged discontinuities in the CUSUM chart. These "V-shapes" or abrupt slope changes indicate that the "voice" or "cadence" of the text has shifted—a hallmark of automated manipulation.8  
Turnitin's implementation of this likely involves sliding window analyses that compare the stylometric features of the current window against the user's historical profile (or the rest of the document). If the local variance exceeds a threshold determined by the historical baseline, the text is flagged for investigation.10

### **2.2 The Challenge of Semantic Consistency**

Modern detectors also employ semantic consistency checks. Models trained on semantic similarity metrics (like BERTScore or BLEURT) can detect when a synonym replacement changes the meaning of a sentence in a way that is contextually unlikely for a human expert. For example, changing "statistical significance" to "numerical importance" might pass a perplexity filter but fails a semantic consistency check, as the latter term is imprecise in an academic context.12  
Preservation-Based Humanization must therefore operate under a strict **Semantic Reconstruction Loss**, ensuring that the vector representation of the output's meaning remains distinctively close to the input's meaning, even as the surface form changes to satisfy stylometric constraints.

## **3\. Architectural Fundamentals: The Mechanism of Disentanglement**

To achieve the dual goals of stylometric mimicry (to defeat Burrows’ Delta/CUSUM) and semantic preservation, PBH systems rely on advanced neural architectures. The central mechanism is **Disentangled Representation Learning**.

### **3.1 Latent Variable Models and Variational Autoencoders (VAEs)**

The earliest attempts at deep style transfer utilized VAEs to learn a latent space where style and content are orthogonal. In this framework, an encoder network $E$ maps an input sentence $x$ to a latent code $z$. This code is then partitioned into two sub-vectors: $z\_c$ (content) and $z\_s$ (style).

$$z \= \[z\_c, z\_s\]$$  
To ensure disentanglement, **Adversarial Training** is often employed. A discriminator network $D\_{style}$ attempts to predict the style label of the input from $z\_c$. The encoder is trained to minimize the discriminator's accuracy, effectively stripping stylistic information from the content vector. Conversely, a content discriminator ensures that $z\_s$ carries no semantic information.3  
While theoretically sound, simple VAEs often struggle with **Information Bottleneck** issues. If the bottleneck is too tight, semantic details are lost (poor preservation). If it is too loose, stylistic information leaks into $z\_c$, preventing effective transfer. Modern approaches have evolved to use **Transformer-based VAEs** (like OPTIMUS) and **Flow-based models**, which offer better reconstruction capabilities for complex sentence structures.14

### **3.2 The Role of "Style Distance" Metrics**

A critical advancement in PBH is the development of robust metrics to quantify "style" independently of content. The **StyleDistance** framework 16 introduces a learned metric space where the distance between two text embeddings corresponds solely to their stylistic difference.  
StyleDistance is trained on a synthetic dataset (**SynthStel**) containing pairs of sentences that are semantically identical but stylistically distinct across over **40 specific dimensions** (e.g., politeness, humor, formality, conciseness). By utilizing a contrastive learning objective, the model learns an embedding space where:  
$$D\_{style}(x, y) \\approx |  
| E\_{style}(x) \- E\_{style}(y) ||\_2$$  
This metric allows PBH systems to use **Reinforcement Learning from Human Feedback (RLHF)** or direct optimization to minimize the distance between the generated text and a target "human" profile, treating style as a continuous, optimizeable manifold rather than a discrete class label.17

| Feature Metric | Description | Forensic Relevance |
| :---- | :---- | :---- |
| **Lexical Diversity** | Type-Token Ratio (TTR) | Flags repetitiveness typical of basic LLMs. |
| **Syntactic Complexity** | Depth of dependency trees | Humans vary complexity; LLMs tend toward mean complexity. |
| **Function Word Dist.** | Frequency of "the", "and", etc. | Primary input for Burrows’ Delta. |
| **Sentiment Consistency** | Emotional arc stability | CUSUM detects abrupt shifts in tone. |
| **Discourse Markers** | Use of "however", "therefore" | Signals logical argumentation structure. |

## **4\. Architectural Paradigm I: Authorship Embeddings (The "TinyStyler" Approach)**

One of the most promising architectures for Preservation-Based Humanization is the use of **Authorship Embeddings**, as exemplified by the **TinyStyler** framework.19 This approach moves beyond generic "formal/informal" transfer to explicitly model the unique stylistic signature of a specific author.

### **4.1 Architecture and Mechanism**

TinyStyler employs a parameter-efficient architecture based on a small language model (e.g., T5-base). The core innovation lies in how it conditions the generation process:

1. **Universal Authorship Representation (UAR):** The model utilizes a pre-trained encoder (such as StyleDistance or a similar metric learning model) to extract a high-dimensional embedding ($d=768$) that encapsulates the author's style. This embedding is derived from a reference set of the target author's previous writings.19  
2. **Projection Layer:** A learned projection layer maps this authorship embedding into the latent space of the generator model (e.g., mapping $d=768$ to the T5 hidden dimension $d=512$). This projected vector is then typically prepended to the token embeddings of the input sequence, effectively "priming" the model with the target author's voice.19  
3. **Unsupervised Reconstruction:** The model is trained on a reconstruction task where it must generate the original text $x$ given a *style-neutral paraphrase* $p(x)$ and the *author embedding* $e\_{auth}(x)$. This forces the model to learn how to re-inject the specific stylistic quirks of the author into a neutral semantic frame.

### **4.2 Self-Distillation for Fidelity**

To enhance the quality of generation and reduce reliance on external paraphrasers during inference, TinyStyler employs a **Self-Distillation** process.

* **Step 1:** The model generates a large volume of style transfer pairs (source $\\rightarrow$ target author).  
* **Step 2:** These pairs are filtered using automated metrics (BERTScore for content, Style classifiers for style).  
* **Step 3:** The model is fine-tuned on the high-quality filtered data. This "distills" the knowledge of the authorship embeddings into the weights of the generator itself, allowing for faster and more consistent inference.19

**Forensic Implication:** By conditioning on a specific authorship embedding, TinyStyler can effectively "clone" a user's writing style. If a student uses this system with their own previous essays as the reference, the resulting text will statistically resemble their past work, potentially bypassing Turnitin's "Authorship Investigate" which looks for deviations from a user's baseline.

## **5\. Architectural Paradigm II: Discourse-Aware Generative Models**

While authorship embeddings handle micro-linguistic features (lexicon, syntax), they often fail to capture the **macro-linguistic** structure—the flow of argumentation and paragraph organization. "Discourse-Aware" models address this by explicitly modeling the rhetorical structure of the text.

### **5.1 APPDIA: Injecting Rhetorical Structure Trees**

**APPDIA** (A Discourse-Aware Transformer-based Style Transfer Model) introduces the concept of integrating **Rhetorical Structure Theory (RST)** into the generation pipeline.21

* **RST Parsing:** The framework first parses the input text into a Discourse Tree, identifying **Elementary Discourse Units (EDUs)** and the relations between them (e.g., *Elaboration*, *Contrast*, *Attribution*).  
* **Structure Injection:** These discourse relations are encoded and injected into the Transformer's attention mechanism. This can be done via **Special Tokens** (e.g., \<RST:Contrast\>) inserted at the boundaries of EDUs, or by modifying the **Attention Mask** to bias the model towards attending to linguistically related segments.23  
* **Preservation Mechanism:** By explicitly encoding the *logic* of the argument (the RST tree), the model ensures that the argumentative structure remains intact even as the surface realization changes. This is critical for academic humanization, where the logical flow is often as important as the word choice.

### **5.2 ZeroStylus: Hierarchical Template Matching**

**ZeroStylus** takes a different approach, utilizing a **dual-layer template extraction** mechanism to ensure coherence.25

1. **Sentence-Level Templates:** The system extracts syntactic templates (e.g., "Adjective-Noun-Verb") from the target corpus to guide micro-linguistic generation.  
2. **Paragraph-Level Templates:** Crucially, it also extracts paragraph-level templates that define the *sequence* of sentence types (e.g., "Topic Sentence $\\rightarrow$ Supporting Evidence $\\rightarrow$ Analysis $\\rightarrow$ Transition").  
3. **Content Mapping:** The source content is then mapped onto these hierarchical templates. This ensures that the generated text follows a human-like narrative arc, avoiding the aimless "wandering" or repetitive structures often seen in standard LLM output.26

This hierarchical approach is particularly effective against CUSUM analysis, as it ensures that the statistical properties of the text remain stationary across the entire document, preventing the "jagged" graphs associated with patchwriting.

## **6\. Architectural Paradigm III: Retrieval-Augmented Style Generation (RAG)**

The most robust current architecture for "Zero-Shot" humanization is **Retrieval-Augmented Generation (RAG)** applied to style. Unlike standard RAG, which retrieves factual content, **Style-RAG** retrieves stylistic prototypes.

### **6.1 CFRAG: Collaborative Filtering for Style**

**CFRAG (Collaborative Filtering RAG)** extends the RAG paradigm by using the writing histories of similar users to inform the generation process.28

* **Style Indexing:** The system maintains a vector database of human-written text chunks, indexed not just by content but by stylistic features (using embeddings like StyleDistance).  
* **Neighbor Retrieval:** Given an input query or draft, the system retrieves $k$ "Style Neighbors"—texts that may be semantically unrelated but share the desired syntactic complexity, tone, or vocabulary usage.  
* **In-Context Learning:** These retrieved examples are provided to the LLM as few-shot exemplars (via **Chain-of-Thought prompting**), explicitly instructing the model to mimic the retrieved style.  
  * *Prompt Example:* "Rewrite the following text to match the sentence structure and vocabulary usage of these three examples:."

### **6.2 Personalized Humanization**

This architecture allows for highly effective **Personalized Humanization**. By indexing a user's *own* writing history, the system can retrieve the user's specific phrasing habits (e.g., a tendency to use "furthermore" instead of "moreover") and impose them on the AI-generated text. This creates a feedback loop where the AI's output reinforces the user's existing stylometric profile, making detection via anomaly detection algorithms extremely difficult.30

## **7\. Advanced Mechanics and Future Trajectories**

To fully achieve preservation-based humanization, these architectures are often augmented with advanced mechanics designed to fine-tune the output stability.

### **7.1 Style Consistency Loss (SC2)**

Maintaining a consistent "voice" over a long document (20+ pages) is a significant challenge. LLMs often regress to their mean training distribution (the "generic internet voice") as the context window grows. The **Style Consistency Loss (SC2)** addresses this by penalizing deviations in style embedding across different segments of the text.32  
$$L\_{consistency} \= \\sum\_{i} |  
| E\_{style}(w\_i) \- E\_{style}(w\_{i+1}) ||^2$$  
where $w\_i$ and $w\_{i+1}$ are consecutive windows of the generated text. This forces the model to maintain a "flat" CUSUM trajectory, simulating the sustained concentration and singular voice of a human author.

### **7.2 The "Identity Cloning" Future**

The convergence of these technologies points toward a future of **Identity Cloning**. Preservation-Based Humanization is evolving from a tool for evasion into a tool for **Digital Ventriloquism**. By combining **Authorship Embeddings** (to capture the latent identity), **Discourse-Aware Models** (to capture the logical structure), and **Personalized RAG** (to retrieve specific idiosyncratic phrasing), it becomes possible to generate text that is mathematically indistinguishable from a specific human's writing.  
This represents a paradigm shift in the cat-and-mouse game of detection. Detection systems like Turnitin rely on the assumption that AI text is a distinct class from Human text. However, if AI text can be conditioned to inhabit the exact manifold of a specific human's stylometric profile, the binary classification task becomes mathematically ill-posed. The future of detection may thus shift from "AI vs. Human" to **"Verified vs. Unverified" provenance**, utilizing cryptographic watermarking or blockchain-based logging, as statistical analysis alone will no longer suffice to distinguish the clone from the original.

## **8\. Evaluation Methodologies for Preservation-Based Systems**

Evaluating PBH systems requires a departure from standard NLG metrics like BLEU or ROUGE, which focus on n-gram overlap and often penalize the very stylistic transformations required for humanization. Instead, evaluation relies on a suite of metrics designed to measure style transfer strength, semantic preservation, and fluency.

### **8.1 STEL and STEL-or-Content**

The **STEL (Style Transfer Evaluation via Logic)** and **STEL-or-Content** benchmarks are emerging as the gold standard for this domain.34

* **STEL** evaluates the accuracy of the style transfer using a classifier trained on the target style (e.g., determining if the output is indeed "formal" or "humorous").  
* **STEL-or-Content** combines this with a semantic similarity check (typically **LaBSE** or **SimCSE**). It creates a unified score that penalizes the model if it achieves style transfer by hallucinating new content or dropping key information.

### **8.2 Semantic Consistency Metrics**

To ensure the "Preservation" aspect, metrics like **BERTScore** and **BLEURT** are essential. These model-based metrics use contextual embeddings to measure whether the *meaning* of the generated text aligns with the source, even if the vocabulary is completely different. A high-performing PBH system must maintain a BERTScore of $\>0.9$ while maximizing the StyleDistance from the source.12

### **8.3 Forensic Resistance Testing**

Finally, the ultimate evaluation for a PBH system is its **Forensic Resistance**. This involves running the generated text through the very algorithms used by detectors:

* **Delta-Distance Minimization:** The goal is to minimize $\\Delta(Generated, Target\\\_Author)$.  
* **CUSUM Stability:** The CUSUM graph of the generated text should exhibit no statistically significant deviations or structural breaks.  
* **Detection Evasion Rate:** The percentage of generated samples that are classified as "Human" by state-of-the-art detectors (Turnitin, GPTZero).

## ---

**Conclusion**

The transition from "Transformation-Based" to "Preservation-Based" Humanization marks the maturation of the field from simple adversarial evasion to sophisticated, controlled generation. While transformation-based methods rely on the rudimentary injection of noise to fool perplexity filters—a strategy that is increasingly failing against forensic analysis—preservation-based methods aim for the complete architectural simulation of the human writing process.  
By leveraging **Authorship Embeddings** to capture identity, **Discourse-Aware Transformers** to maintain logical flow, and **Personalized RAG** to retrieve idiosyncratic phrasing, these systems address the fundamental flaw of previous generations: the lack of a coherent "voice." As these technologies converge, the line between machine-generated and human-authored text will not just blur, but effectively vanish under the lens of statistical analysis, necessitating a fundamental rethinking of how we verify authorship in the digital age.

#### **Works cited**

1. A Survey of Text Style Transfer: Applications and Ethical Implications \- arXiv, accessed December 19, 2025, [https://arxiv.org/html/2407.16737v1](https://arxiv.org/html/2407.16737v1)  
2. Implementing Long Text Style Transfer with LLMs through Dual-Layered Sentence and Paragraph Structure Extraction and Mapping \- arXiv, accessed December 19, 2025, [https://arxiv.org/html/2505.07888v1](https://arxiv.org/html/2505.07888v1)  
3. Disentangled Representation Learning \- IEEE Xplore, accessed December 19, 2025, [https://ieeexplore.ieee.org/iel8/34/4359286/10579040.pdf](https://ieeexplore.ieee.org/iel8/34/4359286/10579040.pdf)  
4. Disentangled Representation Learning for Non-Parallel Text Style Transfer \- Lili Mou, accessed December 19, 2025, [https://lili-mou.github.io/paper/2019-ACL-disentangle\_sentiment.pdf](https://lili-mou.github.io/paper/2019-ACL-disentangle_sentiment.pdf)  
5. Digital Scholarship in the Humanities Template \- Oxford University Press \- SciSpace, accessed December 19, 2025, [https://scispace.com/formats/oxford-university-press/digital-scholarship-in-the-humanities/dda47ecd286a437bb97d7de88c010033](https://scispace.com/formats/oxford-university-press/digital-scholarship-in-the-humanities/dda47ecd286a437bb97d7de88c010033)  
6. Finding Characteristic Features in Stylometric Analysis | Request PDF \- ResearchGate, accessed December 19, 2025, [https://www.researchgate.net/publication/283828462\_Finding\_Characteristic\_Features\_in\_Stylometric\_Analysis](https://www.researchgate.net/publication/283828462_Finding_Characteristic_Features_in_Stylometric_Analysis)  
7. TL;DR Stylometrics \- The Book of Gehn, accessed December 19, 2025, [https://book-of-gehn.github.io/articles/2020/11/12/TLDR-Stylometrics.html](https://book-of-gehn.github.io/articles/2020/11/12/TLDR-Stylometrics.html)  
8. Monitoring surgical quality: the cumulative sum (CUSUM) approach \- PubMed Central \- NIH, accessed December 19, 2025, [https://pmc.ncbi.nlm.nih.gov/articles/PMC8794397/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8794397/)  
9. Has anyone seen Fault Detection and Isolation algorithms actually work outside of research? : r/ControlTheory \- Reddit, accessed December 19, 2025, [https://www.reddit.com/r/ControlTheory/comments/1bj87mo/has\_anyone\_seen\_fault\_detection\_and\_isolation/](https://www.reddit.com/r/ControlTheory/comments/1bj87mo/has_anyone_seen_fault_detection_and_isolation/)  
10. An Introduction to Forensic Linguistics: Language in Evidence, accessed December 19, 2025, [https://pasca.uns.ac.id/s3linguistik/wp-content/uploads/sites/44/2016/10/Malcolm\_Coulthard\_\_Alison\_Johnson.pdf](https://pasca.uns.ac.id/s3linguistik/wp-content/uploads/sites/44/2016/10/Malcolm_Coulthard__Alison_Johnson.pdf)  
11. Old and new challenges in automatic plagiarism detection \- The University of British Columbia, accessed December 19, 2025, [https://cmps-people.ok.ubc.ca/bowenhui/analytics/readings/clough2003.pdf](https://cmps-people.ok.ubc.ca/bowenhui/analytics/readings/clough2003.pdf)  
12. \[PDF\] APPDIA: A Discourse-aware Transformer-based Style Transfer Model for Offensive Social Media Conversations | Semantic Scholar, accessed December 19, 2025, [https://www.semanticscholar.org/paper/135b137aa93959f60e1818df0720996cc0756613](https://www.semanticscholar.org/paper/135b137aa93959f60e1818df0720996cc0756613)  
13. Number of paraphrases per input. | Download Scientific Diagram \- ResearchGate, accessed December 19, 2025, [https://www.researchgate.net/figure/Number-of-paraphrases-per-input\_fig1\_361058000](https://www.researchgate.net/figure/Number-of-paraphrases-per-input_fig1_361058000)  
14. \[2006.00693\] Improving Disentangled Text Representation Learning with Information-Theoretic Guidance \- arXiv, accessed December 19, 2025, [https://arxiv.org/abs/2006.00693](https://arxiv.org/abs/2006.00693)  
15. Improving Disentangled Text Representation Learning with Information-Theoretic Guidance \- ACL Anthology, accessed December 19, 2025, [https://aclanthology.org/2020.acl-main.673/](https://aclanthology.org/2020.acl-main.673/)  
16. StyleDistance: Stronger Content-Independent Style Embeddings with Synthetic Parallel Examples \- arXiv, accessed December 19, 2025, [https://arxiv.org/html/2410.12757v2](https://arxiv.org/html/2410.12757v2)  
17. StyleDistance: Stronger Content-Independent Style Embeddings with Synthetic Parallel Examples \- arXiv, accessed December 19, 2025, [https://arxiv.org/html/2410.12757v1](https://arxiv.org/html/2410.12757v1)  
18. A stylometric analysis of speaker attribution from speech transcripts \- arXiv, accessed December 19, 2025, [https://arxiv.org/pdf/2512.13667](https://arxiv.org/pdf/2512.13667)  
19. TINYSTYLER: Efficient Few-Shot Text Style Transfer with Authorship Embeddings \- ACL Anthology, accessed December 19, 2025, [https://aclanthology.org/2024.findings-emnlp.781.pdf](https://aclanthology.org/2024.findings-emnlp.781.pdf)  
20. Code for TinyStyler: Efficient Few-Shot Text Style Transfer with Authorship Embeddings, EMNLP 2024 Findings \- GitHub, accessed December 19, 2025, [https://github.com/zacharyhorvitz/TinyStyler](https://github.com/zacharyhorvitz/TinyStyler)  
21. APPDIA: A DISCOURSE-AWARE ... \- Katherine Atwell, accessed December 19, 2025, [https://katherine-atwell.github.io/files/Style-transfer%20Presentation-v2.pdf](https://katherine-atwell.github.io/files/Style-transfer%20Presentation-v2.pdf)  
22. APPDIA: A Discourse-aware Transformer-based Style Transfer Model for Offensive Social Media Conversations \- ResearchGate, accessed December 19, 2025, [https://www.researchgate.net/publication/364606126\_APPDIA\_A\_Discourse-aware\_Transformer-based\_Style\_Transfer\_Model\_for\_Offensive\_Social\_Media\_Conversations](https://www.researchgate.net/publication/364606126_APPDIA_A_Discourse-aware_Transformer-based_Style_Transfer_Model_for_Offensive_Social_Media_Conversations)  
23. Implicit Discourse Relation Classification: We Need to Talk about Evaluation | Request PDF, accessed December 19, 2025, [https://www.researchgate.net/publication/343302233\_Implicit\_Discourse\_Relation\_Classification\_We\_Need\_to\_Talk\_about\_Evaluation](https://www.researchgate.net/publication/343302233_Implicit_Discourse_Relation_Classification_We_Need_to_Talk_about_Evaluation)  
24. Proceedings of the 29th International Conference on Computational Linguistics \- ACL Anthology, accessed December 19, 2025, [https://aclanthology.org/volumes/2022.coling-1/](https://aclanthology.org/volumes/2022.coling-1/)  
25. Implementing Long Text Style Transfer with LLMs through Dual-Layered Sentence and Paragraph Structure Extraction and Mapping \- ResearchGate, accessed December 19, 2025, [https://www.researchgate.net/publication/391706766\_Implementing\_Long\_Text\_Style\_Transfer\_with\_LLMs\_through\_Dual-Layered\_Sentence\_and\_Paragraph\_Structure\_Extraction\_and\_Mapping](https://www.researchgate.net/publication/391706766_Implementing_Long_Text_Style_Transfer_with_LLMs_through_Dual-Layered_Sentence_and_Paragraph_Structure_Extraction_and_Mapping)  
26. IMPLEMENTING LONG TEXT STYLE TRANSFER WITH LLMS THROUGH DUAL-LAYERED SENTENCE AND PARAGRAPH STRUCTURE EXTRACTION AND MAPPING \- OpenReview, accessed December 19, 2025, [https://openreview.net/pdf?id=NoeyaHgrFX](https://openreview.net/pdf?id=NoeyaHgrFX)  
27. LLM-based Text Style Transfer: Have We Taken a Step Forward? \- ResearchGate, accessed December 19, 2025, [https://www.researchgate.net/publication/389643037\_LLM-based\_Text\_Style\_Transfer\_Have\_We\_Taken\_a\_Step\_Forward](https://www.researchgate.net/publication/389643037_LLM-based_Text_Style_Transfer_Have_We_Taken_a_Step_Forward)  
28. \[2504.05731\] Retrieval Augmented Generation with Collaborative Filtering for Personalized Text Generation \- arXiv, accessed December 19, 2025, [https://arxiv.org/abs/2504.05731](https://arxiv.org/abs/2504.05731)  
29. \[Quick Review\] Retrieval Augmented Generation with Collaborative Filtering for Personalized Text Generation \- Liner, accessed December 19, 2025, [https://liner.com/review/retrieval-augmented-generation-with-collaborative-filtering-for-personalized-text-generation](https://liner.com/review/retrieval-augmented-generation-with-collaborative-filtering-for-personalized-text-generation)  
30. Comparing Retrieval-Augmentation and Parameter-Efficient Fine-Tuning for Privacy-Preserving Personalization of Large Language Models \- arXiv, accessed December 19, 2025, [https://arxiv.org/html/2409.09510v2](https://arxiv.org/html/2409.09510v2)  
31. Out of Style: RAG's Fragility to Linguistic Variation \- arXiv, accessed December 19, 2025, [https://arxiv.org/html/2504.08231v1](https://arxiv.org/html/2504.08231v1)  
32. : Style Transfer with Content-Preserving in Text-to-Image Generation \- arXiv, accessed December 19, 2025, [https://arxiv.org/html/2407.00788v1](https://arxiv.org/html/2407.00788v1)  
33. SC2: Towards Enhancing Content Preservation and Style Consistency in Long Text Style Transfer \- arXiv, accessed December 19, 2025, [https://arxiv.org/html/2406.04578v1](https://arxiv.org/html/2406.04578v1)  
34. \[Quick Review\] mStyleDistance: Multilingual Style Embeddings and their Evaluation \- Liner, accessed December 19, 2025, [https://liner.com/review/mstyledistance-multilingual-style-embeddings-and-their-evaluation](https://liner.com/review/mstyledistance-multilingual-style-embeddings-and-their-evaluation)  
35. Literary Style Embeddings: A Contrastive Fine-tuning Approach on Long-Context Transformer Models for Literature in English \- DiVA portal, accessed December 19, 2025, [http://www.diva-portal.org/smash/get/diva2:1987984/FULLTEXT01.pdf](http://www.diva-portal.org/smash/get/diva2:1987984/FULLTEXT01.pdf)