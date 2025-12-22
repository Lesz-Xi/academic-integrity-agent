# **Technical and Sociolinguistic Analysis of the "Professional" Persona in Apple Intelligence Writing Tools**

## **1\. Introduction: The Paradigm Shift to Stylistic Normativity at the Edge**

The introduction of Apple Intelligence marks a distinct inflection point in the deployment of generative artificial intelligence (GenAI). Unlike the initial wave of Large Language Model (LLM) adoption, which was characterized by centralized, cloud-dependent interfaces such as ChatGPT or Claude, Apple’s strategy emphasizes deep operating system integration and on-device processing. At the forefront of this integration is the suite of **Writing Tools**, a system-wide utility that allows users to manipulate text across any application using standard UI controls. Within this suite, the **"Professional" persona** emerges not merely as a feature for grammatical correction, but as a sophisticated instrument of sociolinguistic standardization.1

This report provides an exhaustive technical and linguistic analysis of the "Professional" Writing Tool. We dissect the architecture that enables it—ranging from the silicon-level optimizations of the Neural Engine to the orchestration logic that routes requests between on-device models and Private Cloud Compute (PCC). Furthermore, we analyze the specific linguistic transformations the model applies to user input, arguing that the "Professional" persona represents a codification of corporate English norms, implemented via high-efficiency Low-Rank Adaptation (LoRA) adapters rather than massive monolithic models.3

The significance of the "Professional" persona lies in its dual function: it acts as both an efficiency tool for the user, accelerating the production of formal text, and as a privacy-enhancing obfuscation layer, stripping distinct emotional and biometric markers from written communication.5 As we explore the mechanisms of the Apple Foundation Models (AFM), specifically the \~3 billion parameter on-device model 4, we uncover a system designed to balance the competing demands of linguistic nuance, battery life, and strict data privacy.

## ---

**2\. The Hardware Substrate: Enabling Intelligence at the Edge**

To understand why the "Professional" persona behaves as it does—prioritizing latency and integration over the sheer creative breadth of larger server-side models—one must first analyze the hardware substrate upon which it runs. The performance of the "Professional" rewrite is inextricably linked to the capabilities of Apple Silicon, specifically the M-series (iPad, Mac) and A-series (iPhone 15 Pro and later) chips.7

### **2.1 The Neural Engine (NPU) and Unified Memory**

The "Professional" persona requires real-time inference. When a user highlights a paragraph in Mail or Notes and selects "Professional," the expectation is a near-instantaneous transformation. This performance is achieved not by the CPU or GPU, but by the Neural Engine, a dedicated Neural Processing Unit (NPU).

The architecture relies on a **Unified Memory Architecture (UMA)**. In traditional PC architectures, data must be copied between system RAM and discrete GPU VRAM, introducing latency and power penalties. In Apple’s architecture, the CPU, GPU, and NPU share a single pool of high-bandwidth memory. This allows the AFM-on-device (approx. 3 billion parameters) to reside in memory and be accessed immediately by the NPU without costly data transfers.

The memory bandwidth is a critical constraint. For a 3-billion parameter model stored at 4-bit precision (discussed in section 3.2), the model weights occupy roughly 1.5 GB to 2 GB of RAM.8 To achieve a fluid user experience—generating text faster than human reading speed (e.g., 30 tokens per second)—the memory subsystem must sustain high throughput while minimizing energy consumption to prevent thermal throttling on fanless devices like the MacBook Air or iPhone.9

### **2.2 Thermal Constraints and Power Efficiency**

The decision to utilize a \~3B parameter model rather than a 7B or 13B model is dictated by the thermal envelope of the iPhone. Continuous inference generates significant heat. The "Professional" rewrite is often a burst workload—short, intense processing of a few paragraphs. However, complex tasks, such as summarizing a long document and then rewriting the summary in a professional tone, sustain load on the NPU.

Research indicates that Apple utilizes **Talaria**, a proprietary tool for power and latency analysis, to optimize the model’s operation.8 Talaria allows engineers to visualize the energy cost of every layer in the transformer network. This granular visibility likely influenced the architectural decisions for the "Professional" tool, such as the depth of the network and the specific quantization schemes employed, ensuring that a "Professional" rewrite does not drain the battery disproportionately compared to standard system tasks.

## ---

**3\. Software Architecture: The Apple Foundation Models (AFM)**

The "Professional" persona is powered by the Apple Foundation Models (AFM), a family of generative models introduced in 2024 and updated in 2025\.3 The system is not monolithic; it employs a hybrid strategy that routes tasks between a highly optimized on-device model and a larger, server-based model.

### **3.1 The AFM-On-Device: The Workhorse of Writing Tools**

For the majority of "Professional" rewrites—which typically involve emails, messages, or short documents—the task is handled entirely on-device by the **AFM-on-device** model. This is a dense transformer language model with approximately 3 billion parameters.4

#### **3.1.1 Architectural Optimizations**

The 3B model is not a standard off-the-shelf transformer. It incorporates several specific architectural choices designed to maximize performance on Apple Silicon:

* **Grouped-Query Attention (GQA):** Standard transformers use Multi-Head Attention (MHA), where each query head has a corresponding key and value head. This leads to a large Key-Value (KV) cache, which consumes significant memory as the context length increases. The "Professional" tool supports a context window of roughly 4096 tokens.11 To keep the KV cache manageable within the limited RAM of a phone, Apple likely employs GQA, which shares key and value heads across multiple query heads. This reduces the memory footprint of the cache and improves inference speed.8  
* **Shared Embedding Tables:** The input and output embedding matrices are shared. This is a common technique in smaller models to reduce parameter count without significantly impacting model quality. It ensures that the semantic representation of the vocabulary is consistent across the encoder and decoder phases (or input/output in decoder-only architectures).8

### **3.2 Quantization Strategies: Precision vs. Quality**

Running a 3B parameter model in 16-bit floating-point (FP16) precision would require roughly 6GB of RAM, which is prohibitive for an iPhone with 8GB of total system memory (where the OS and other apps also need space). To solve this, Apple employs aggressive **mixed-precision quantization**.9

The AFM-on-device utilizes a mix of 2-bit and 4-bit quantization for its weights. This compresses the model to an average of roughly 3.5 bits per parameter.9

* **Quantization-Aware Training (QAT):** Unlike post-training quantization (PTQ), where a model is trained in high precision and then compressed (often resulting in quality loss), Apple uses QAT. The model is trained with the quantization noise included in the forward pass, allowing the network to learn to be robust to the lower precision.  
* **Impact on "Professional" Tone:** One might expect quantization to degrade the nuance required for a "Professional" persona, perhaps making the model sound robotic. However, by retaining higher precision (e.g., 4-bit or higher) for the critical layers responsible for syntax and tone, and using lower precision (2-bit) for less critical dense layers, the system maintains high linguistic fidelity while fitting into a \<2GB memory footprint.

### **3.3 The AFM-Server and Private Cloud Compute (PCC)**

While the 3B model is capable, it has limitations in reasoning and context window size. When a user attempts to apply the "Professional" persona to a very large document (exceeding 4096 tokens) or a complex, multi-step instruction, the system may offload the task to **AFM-server**.6

#### **3.3.1 Mixture-of-Experts (MoE)**

The server model utilizes a **Parallel-Track Mixture-of-Experts (PT-MoE)** architecture.3 In a dense model, every parameter is used for every token. In an MoE model, the network is divided into "experts" (specialized sub-networks). A gating network determines which experts are needed for a given token.

* **Relevance to "Professional" Tone:** The MoE architecture allows the server model to possess a much deeper understanding of varied professional domains (e.g., legal, medical, technical) without incurring the computational cost of activating the entire massive model for every word. If the input text contains legal jargon, the gating network routes the tokens to experts trained on legal corpora, ensuring the "Professional" rewrite uses the correct terminology.10

## ---

**4\. The Adapter Architecture: Low-Rank Adaptation (LoRA)**

A critical insight from the research is that the "Professional" persona is likely **not** a separate model, nor merely a result of prompt engineering. Instead, it is implemented using **Low-Rank Adaptation (LoRA)** adapters.3 This architecture is central to the system's ability to switch instantly between "Friendly," "Professional," and "Concise" without reloading massive model weights.

### **4.1 The Mathematics of LoRA**

Fine-tuning a 3B model for every specific task (Professional, Friendly, Concise) would require storing multiple copies of the model, which is storage-inefficient. LoRA freezes the pre-trained model weights ($W\_0$) and injects trainable rank decomposition matrices ($A$ and $B$) into each layer.  
The forward pass becomes:

$$h \= W\_0 x \+ \\Delta W x \= W\_0 x \+ B A x$$

where $B \\in \\mathbb{R}^{d \\times r}$ and $A \\in \\mathbb{R}^{r \\times k}$, with the rank $r$ being very small (e.g., 8 or 16).  
Because $r \\ll d$, the number of trainable parameters in the adapter is minute (often \<1% of the original model). This means the "Professional" adapter might only be a few dozen megabytes, whereas the base model is gigabytes.13

### **4.2 Dynamic Adapter Swapping**

When the user selects "Professional" from the Writing Tools UI:

1. The system keeps the base 3B AFM loaded in the Neural Engine.  
2. It dynamically loads the "Professional" LoRA adapter weights into memory (or activates them if already pre-loaded).  
3. The inference proceeds with the combined weights ($W\_0 \+ BA$).

If the user then clicks "Friendly," the system simply swaps the $A\_{prof}, B\_{prof}$ matrices for $A\_{friendly}, B\_{friendly}$. This allows for near-instantaneous mode switching, a key requirement for a smooth UI experience.4

### **4.3 Stacking Adapters: Accuracy Recovery**

Apple’s research highlights a sophisticated use of adapters: **stacking**. The system likely uses a base "Accuracy Recovery" adapter that is always active to compensate for the quality loss from 2-bit quantization.13 The "Professional" tone adapter is then stacked on top of this.

* Logic: $W\_{final} \= W\_{quantized} \+ \\Delta W\_{recovery} \+ \\Delta W\_{professional}$.  
  This modularity ensures that the base model remains generic and highly compressed, while the adapters restore quality and inject specific stylistic behaviors.

## ---

**5\. Deconstructing the "Professional" Persona: Logic and Linguistics**

The "Professional" persona is an engineered construct designed to elevate the register of text. Through analysis of the research snippets, leaked prompts, and linguistic outputs, we can decode the specific rules and logic governing this transformation.

### **5.1 The System Prompt**

At the core of the "Professional" tool is a system prompt that guides the model's generation. Leaked prompt templates reveal the minimalist nature of this instruction:

**Prompt:** {{ specialToken.chat.role.system }}Make this text more professional.{{ specialToken.chat.component.turnEnd }}{{ specialToken.chat.role.user }}{{ userContent }}{{ specialToken.chat.component.turnEnd }}{{ specialToken.chat.role.assistant }}.14

The brevity of this prompt (Make this text more professional) is significant. In a generic, non-fine-tuned LLM, such a short instruction might yield variable results. In Apple’s system, this prompt acts as a **control token** that activates the specific behaviors learned during the Supervised Fine-Tuning (SFT) and Reinforcement Learning (RL) phases.3 The model has been conditioned to map the concept of "professional" to a specific set of linguistic constraints.

### **5.2 Linguistic Transformation Matrix**

The "Professional" adapter applies a multi-layered transformation to the user's input.

#### **5.2.1 Lexical Elevation (Vocabulary Substitution)**

The model systematically identifies informal or low-register lexical items and replaces them with higher-register equivalents.

* **Mechanism:** The attention mechanism highlights tokens with high "informality" scores (based on training data distribution) and predicts substitutes from a "professional" distribution.  
* **Examples:**  
  * *Input:* "I want to talk about the bad shipping."  
  * *Output:* "I would like to discuss the issues regarding the shipping.".16  
  * *Input:* "fix" $\\rightarrow$ *Output:* "rectify" or "resolve".  
  * *Input:* "get" $\\rightarrow$ *Output:* "obtain" or "receive".  
* **Analysis:** This is not a simple lookup table. The model uses context to disambiguate. "Fix a sandwich" might become "Prepare a sandwich," while "Fix a bug" becomes "Resolve an issue."

#### **5.2.2 Syntactic Restructuring**

The tool alters sentence structure to align with corporate norms, often increasing syntactic complexity or shifting to the passive voice to depersonalize conflict.

* **Nominalization:** Converting verbs to nouns to sound more authoritative.  
  * *Input:* "We verified the data."  
  * *Output:* "Verification of the data has been completed."  
* **Passive Voice:** Used to soften accusatory statements.  
  * *Input:* "You made a mistake in the report."  
  * *Output:* "An error was identified in the report."  
* **Contraction Expansion:** A rigid rule within the persona is the elimination of contractions.  
  * *Input:* "It's not working."  
  * *Output:* "It is not functioning correctly.".17

#### **5.2.3 Pragmatic Smoothing and Emotional Filtering**

Perhaps the most significant logic within the "Professional" persona is its handling of emotion. The model functions as an **emotional filter**, flattening variance in tone to achieve a neutral, objective voice.5

* **Sanitization:** Multiple exclamation points (\!\!) are reduced to single periods. All-caps shouting is converted to sentence case.  
* **Hedging:** The model introduces epistemic hedges to reduce the force of assertions.  
  * *Input:* "This is wrong."  
  * *Output:* "This appears to be incorrect."  
* **Greeting/Closing Injection:** The model detects the format of an email and automatically appends appropriate salutations ("Dear...") and sign-offs ("Sincerely," "Best regards").18

### **5.3 Comparative Analysis: Professional vs. Friendly vs. Concise**

The specific nature of the "Professional" tool is best understood in contrast to its siblings.

| Feature | Professional | Friendly | Concise |
| :---- | :---- | :---- | :---- |
| **System Prompt** | Make this text more professional. | Make this text more friendly. | Make this text more concise. |
| **Lexical Focus** | Latinate roots (e.g., "commence") | Germanic roots (e.g., "start"), Emotive words | High-information content, removal of stopwords |
| **Syntactic Goal** | Complexity, Authority, Passive Voice | Engagement, Active Voice, Simple structures | Brevity, Information Density |
| **Punctuation** | Standardized, Strict | Liberal use of \!, Emojis (potentially) | Minimal |
| **Training Corpus** | Business, Academic, Legal | Social Media, Casual Correspondence | Summaries, Abstracts |

The "Concise" tool, for instance, operates on a logic of **information compression**, removing redundancy. The "Professional" tool often *adds* length (via nominalization and hedging) to achieve its sociolinguistic goal, whereas "Concise" strictly reduces it.5

## ---

**6\. User Experience and Developer Integration**

The "Professional" persona is delivered through a tightly controlled User Experience (UX) framework designed to make the AI feel like a native extension of the OS rather than an external chatbot.

### **6.1 The WritingTools Framework**

For developers, Apple exposes these capabilities via the WritingTools framework.21

* **Standard Implementation:** Standard UI components like UITextView (iOS) and NSTextView (macOS) get "Professional" rewrite capabilities automatically. The "Writing Tools" menu item appears in the context menu/callout bar.  
* **Custom Implementation:** Apps with custom text engines (e.g., a code editor or a specialized screenplay writer) must implement the UIWritingToolsCoordinator. This coordinator manages the session between the app and the modelmanagerd daemon.  
* **Context Passing:** The developer must supply the context (the text surrounding the selection). This is critical for the "Professional" persona to understand the antecedent of pronouns and the overall topic. The framework supports a context window of up to 4096 tokens.11 If the context provided is too short, the "Professional" rewrite might lack coherence.

### **6.2 The "Shimmy" and UI Physics**

The UX design reinforces the "magic" of the transformation.

1. **Selection & Invocation:** The user selects text and taps the Apple Intelligence orb.  
2. **Streaming & Animation:** As the 3B model generates tokens, the UI does not just paste the result. It employs a "shimmering" animation that morphs the original text into the new text in-place.23  
3. **The Diff View:** A critical feature for professional workflows is the ability to review changes. The UI allows users to toggle between "Original" and "Rewritten" to see exactly what changed. This implies the model attempts to preserve the semantic structure enough that a visual diff is intelligible.25

### **6.3 "Unsummarizing" and Iterative Refinement**

An interesting emergent behavior noted by users is the ability to "unsummarize" or expand text using the Professional tool. A user might draft a bulleted list of raw thoughts and use "Professional" to expand it into full, cohesive paragraphs.27 This highlights the model's capability for **text synthesis**—generating connective tissue and syntactic structure where none existed in the input.

## ---

**7\. Privacy and Security: The Architecture of Trust**

A primary differentiator of the "Professional" writing tool is its privacy architecture. In enterprise environments, where confidentiality is paramount, sending drafts to a public cloud LLM is often prohibited. Apple’s hybrid architecture addresses this.

### **7.1 The On-Device Privacy Boundary**

For typical emails and messages, the "Professional" rewrite happens entirely on-device. The data path is:  
App \-\> WritingTools Framework \-\> modelmanagerd \-\> Neural Engine \-\> Output.  
The data never leaves the device's RAM. This ensures that sensitive business metrics, legal strategy, or personal confessions remain within the user's physical control.12

### **7.2 Private Cloud Compute (PCC): Stateless Security**

When the task complexity exceeds the on-device model's capacity (e.g., rewriting a 50-page report), the **orchestration router** directs the request to Private Cloud Compute.29 PCC represents a fundamental rethinking of cloud AI security.

* **Stateless Execution:** PCC nodes are designed to be stateless. They do not have writable long-term storage for user data. The data is received, processed in RAM, and immediately scrubbed upon completion of the request.  
* **Verifiable Builds:** The software image running on PCC nodes is cryptographically signed and publicly logged. Security researchers can verify that the code running on the server matches the published code, ensuring there are no "backdoors" or data logging mechanisms.30  
* **Attestation:** Before the user's iPhone sends the text of a sensitive email to the cloud, it performs an attestation challenge. It verifies the digital signature of the PCC node. If the node cannot prove it is running the verified, non-logging software stack, the iPhone refuses to send the data.31

This architecture allows the "Professional" tool to scale to heavy workloads without compromising the "privacy-first" promise that defines the product.

## ---

**8\. Critical Analysis and Sociolinguistic Implications**

While the "Professional" tool is an engineering marvel, its deployment raises significant sociolinguistic questions.

### **8.1 The Homogenization of Voice**

By training the "Professional" adapter on a specific corpus of high-quality business English, Apple is effectively codifying a standard for what "professionalism" sounds like.

* **The "Flattening" Effect:** Linguists warn that such tools can "flatten" communication, stripping away regional dialects, cultural nuances, and individual idiosyncrasies.19 A fiery email from a startup founder and a measured memo from a bank executive might both be rewritten to sound like the same "median corporate persona."  
* **Algorithmic Normativity:** The tool enforces a specific view of professionalism—likely Western, white-collar, and emotionally detached. This risks marginalizing communication styles that value emotional directness or narrative complexity, labeling them implicitly as "unprofessional" by suggesting corrections.

### **8.2 Emotional Privacy and Inference Defense**

Conversely, the "Professional" tool offers a unique form of **emotional privacy**.

* **The Mask:** In a professional context, leaking emotion (anger, frustration, insecurity) can be damaging. The tool acts as a mask, filtering out these "emotional leaks".5  
* **Anti-Inference:** By standardizing the output, the tool protects the user from **inference attacks**. A third party analyzing the text would find it difficult to profile the author's psychological state or demographic background, as the text reflects the AI's weights rather than the user's cognitive fingerprint.5

### **8.3 Limitations of the 3B Model**

Users have noted that the "Professional" rewrite can sometimes feel "robotic" or "stuffy".18 This is likely a limitation of the 3B parameter size. Smaller models often struggle with high-level stylistic subtlety. They may rely on heuristic shortcuts (e.g., "always replace 'but' with 'however'") rather than understanding the deeper rhythmic flow of the paragraph. This results in text that is grammatically "professional" but stylistically wooden.

## ---

**9\. Conclusion**

The "Professional" persona in Apple Writing Tools represents a sophisticated convergence of edge computing, efficient machine learning, and linguistic engineering. Its architecture is defined by the constraints of the mobile form factor, necessitating the use of a highly quantized \~3 billion parameter model and the innovative application of LoRA adapters to switch capabilities dynamically.

Technically, the system is a triumph of optimization. By leveraging the Neural Engine and Unified Memory Architecture, Apple delivers a generative AI experience that is fast, power-efficient, and deeply integrated into the OS, all while maintaining a robust privacy posture through on-device processing and the verifiable Private Cloud Compute architecture.

Sociolinguistically, the tool serves as a democratizing force, allowing users with varying levels of language proficiency to generate authoritative, formal text. However, this convenience comes at the cost of distinctiveness. The "Professional" persona acts as a normative engine, smoothing the jagged edges of human expression into a polished, uniform surface. As these tools become ubiquitous, the definition of "professional writing" may shift from a diverse range of articulate styles to a singular, algorithmic dialect defined by the weights of the Apple Foundation Models. Future iterations, potentially allowing for personalized fine-tuning or third-party domain adapters, will be crucial in determining whether this technology augments human expression or standardizes it into obsolescence.

## ---

**10\. Future Outlook: The Era of Adaptive Personas**

The current iteration of the "Professional" persona is static—a single definition of professionalism applied to all users. The underlying architecture, particularly the **Foundation Models framework** and LoRA adapters, suggests a roadmap toward personalization.33

We can anticipate a future where the "Professional" adapter is not a immutable binary provided by Apple, but a dynamic weight set that fine-tunes itself on the user's own sent folder (on-device, securely). This would allow the tool to learn *my* version of professional—perhaps "Professional but Direct" or "Professional and Warm"—mitigating the homogenization risks inherent in the current "one-size-fits-all" model. Furthermore, the opening of the adapter ecosystem could allow organizations to deploy their own "Brand Voice" adapters, ensuring that every employee's "Professional" rewrite aligns with specific corporate communication guidelines.

In this light, the "Professional" Writing Tool is not just a grammar checker; it is the first step toward an operating system that actively mediates and shapes the semantic layer of human-computer interaction.

#### **Works cited**

1. How to use Writing Tools with Apple Intelligence, accessed on December 21, 2025, [https://support.apple.com/en-us/121582](https://support.apple.com/en-us/121582)  
2. Apple Intelligence, accessed on December 21, 2025, [https://www.apple.com/apple-intelligence/](https://www.apple.com/apple-intelligence/)  
3. Apple Intelligence Foundation Language Models Tech Report 2025 ..., accessed on December 21, 2025, [https://machinelearning.apple.com/research/apple-foundation-models-tech-report-2025](https://machinelearning.apple.com/research/apple-foundation-models-tech-report-2025)  
4. Introducing Apple's On-Device and Server Foundation Models, accessed on December 21, 2025, [https://machinelearning.apple.com/research/introducing-apple-foundation-models](https://machinelearning.apple.com/research/introducing-apple-foundation-models)  
5. Evaluating Apple Intelligence's Writing Tools for Privacy Against Large Language Model-Based Inference Attacks: Insights from Early Datasets \- arXiv, accessed on December 21, 2025, [https://arxiv.org/html/2506.03870v1](https://arxiv.org/html/2506.03870v1)  
6. Apple Intelligence Foundation Language Models \- Apple Machine ..., accessed on December 21, 2025, [https://machinelearning.apple.com/research/apple-intelligence-foundation-language-models](https://machinelearning.apple.com/research/apple-intelligence-foundation-language-models)  
7. Apple Intelligence \- Deep Dive into intelligent writing tools \- My Byte, accessed on December 21, 2025, [https://mybyte.com.au/blogs/news/apple-intelligence-deep-dive-into-intelligent-writing-tools](https://mybyte.com.au/blogs/news/apple-intelligence-deep-dive-into-intelligent-writing-tools)  
8. \[D\] Discussing Apple's Deployment of a 3 Billion Parameter AI Model on the iPhone 15 Pro \- How Do They Do It? : r/MachineLearning \- Reddit, accessed on December 21, 2025, [https://www.reddit.com/r/MachineLearning/comments/1dfoykx/d\_discussing\_apples\_deployment\_of\_a\_3\_billion/](https://www.reddit.com/r/MachineLearning/comments/1dfoykx/d_discussing_apples_deployment_of_a_3_billion/)  
9. Apple Intelligence Foundation Language Models \- arXiv, accessed on December 21, 2025, [https://arxiv.org/pdf/2407.21075?](https://arxiv.org/pdf/2407.21075)  
10. Updates to Apple's On-Device and Server Foundation Language Models, accessed on December 21, 2025, [https://machinelearning.apple.com/research/apple-foundation-models-2025-updates](https://machinelearning.apple.com/research/apple-foundation-models-2025-updates)  
11. TN3193: Managing the on-device foundation model's context window \- Apple Developer, accessed on December 21, 2025, [https://developer.apple.com/documentation/technotes/tn3193-managing-the-on-device-foundation-model-s-context-window](https://developer.apple.com/documentation/technotes/tn3193-managing-the-on-device-foundation-model-s-context-window)  
12. Apple Intelligence and privacy on iPhone, accessed on December 21, 2025, [https://support.apple.com/guide/iphone/apple-intelligence-and-privacy-iphe3f499e0e/ios](https://support.apple.com/guide/iphone/apple-intelligence-and-privacy-iphe3f499e0e/ios)  
13. Apple Intelligence Foundation Language Models \- arXiv, accessed on December 21, 2025, [https://arxiv.org/html/2407.21075v1](https://arxiv.org/html/2407.21075v1)  
14. apple-intelligence-prompts/PROMPTS.md at main \- GitHub, accessed on December 21, 2025, [https://github.com/Explosion-Scratch/apple-intelligence-prompts/blob/main/PROMPTS.md](https://github.com/Explosion-Scratch/apple-intelligence-prompts/blob/main/PROMPTS.md)  
15. Apple Intelligence prompts / Simon Willison \- Observable, accessed on December 21, 2025, [https://observablehq.com/@simonw/apple-intelligence-prompts](https://observablehq.com/@simonw/apple-intelligence-prompts)  
16. How to Improve Your Text Messages with Apple Intelligence \- Texty Pro, accessed on December 21, 2025, [https://www.texty.pro/post/how-to-improve-your-text-messages-with-apple-intelligence](https://www.texty.pro/post/how-to-improve-your-text-messages-with-apple-intelligence)  
17. Has anyone found a useful thing that Apple Intelligence can do? : r/mac \- Reddit, accessed on December 21, 2025, [https://www.reddit.com/r/mac/comments/1jgbs0x/has\_anyone\_found\_a\_useful\_thing\_that\_apple/](https://www.reddit.com/r/mac/comments/1jgbs0x/has_anyone_found_a_useful_thing_that_apple/)  
18. I turned to Apple Intelligence's Writing Tools to improve my writing | Tom's Guide, accessed on December 21, 2025, [https://www.tomsguide.com/ai/i-turned-to-apple-intelligence-to-improve-my-writing-heres-my-grade-for-writing-tools](https://www.tomsguide.com/ai/i-turned-to-apple-intelligence-to-improve-my-writing-heres-my-grade-for-writing-tools)  
19. Losing our voice? Fears AI tone-shifting tech could flatten communication \- The Guardian, accessed on December 21, 2025, [https://www.theguardian.com/society/2024/dec/11/ai-tone-shifting-tech-could-flatten-communication-apple-intelligence](https://www.theguardian.com/society/2024/dec/11/ai-tone-shifting-tech-could-flatten-communication-apple-intelligence)  
20. Use Writing Tools with Apple Intelligence on Mac, accessed on December 21, 2025, [https://support.apple.com/guide/mac-help/find-the-right-words-with-writing-tools-mchldcd6c260/mac](https://support.apple.com/guide/mac-help/find-the-right-words-with-writing-tools-mchldcd6c260/mac)  
21. Writing Tools | Apple Developer Documentation, accessed on December 21, 2025, [https://developer.apple.com/documentation/appkit/writing-tools](https://developer.apple.com/documentation/appkit/writing-tools)  
22. Writing Tools | Apple Developer Documentation, accessed on December 21, 2025, [https://developer.apple.com/documentation/uikit/writing-tools](https://developer.apple.com/documentation/uikit/writing-tools)  
23. Apple Intelligence UI and Animation Integration : r/MacOS \- Reddit, accessed on December 21, 2025, [https://www.reddit.com/r/MacOS/comments/1ggy3yf/apple\_intelligence\_ui\_and\_animation\_integration/](https://www.reddit.com/r/MacOS/comments/1ggy3yf/apple_intelligence_ui_and_animation_integration/)  
24. New Apple Intelligence writing tool animation is inconsistent : r/iPadOS \- Reddit, accessed on December 21, 2025, [https://www.reddit.com/r/iPadOS/comments/1gen1i7/new\_apple\_intelligence\_writing\_tool\_animation\_is/](https://www.reddit.com/r/iPadOS/comments/1gen1i7/new_apple_intelligence_writing_tool_animation_is/)  
25. Use Writing Tools with Apple Intelligence on iPhone, accessed on December 21, 2025, [https://support.apple.com/guide/iphone/find-the-right-words-with-writing-tools-iph6f08da1d2/ios](https://support.apple.com/guide/iphone/find-the-right-words-with-writing-tools-iph6f08da1d2/ios)  
26. How to Use Apple Intelligence's Writing Tools to Spot Typos, Rewrite Your Emails | PCMag, accessed on December 21, 2025, [https://www.pcmag.com/how-to/how-to-use-apple-intelligence-ai-writing-tools-rewrite-proofread-summarize](https://www.pcmag.com/how-to/how-to-use-apple-intelligence-ai-writing-tools-rewrite-proofread-summarize)  
27. Why I Turned Off Apple Intelligence — Sad Update : r/iphone \- Reddit, accessed on December 21, 2025, [https://www.reddit.com/r/iphone/comments/1jctf95/why\_i\_turned\_off\_apple\_intelligence\_sad\_update/](https://www.reddit.com/r/iphone/comments/1jctf95/why_i_turned_off_apple_intelligence_sad_update/)  
28. Apple Intelligence On-device vs Cloud features \- Reddit, accessed on December 21, 2025, [https://www.reddit.com/r/apple/comments/1gxhsx7/apple\_intelligence\_ondevice\_vs\_cloud\_features/](https://www.reddit.com/r/apple/comments/1gxhsx7/apple_intelligence_ondevice_vs_cloud_features/)  
29. Request Flow | Documentation \- Apple Security Research, accessed on December 21, 2025, [https://security.apple.com/documentation/private-cloud-compute/requestflow](https://security.apple.com/documentation/private-cloud-compute/requestflow)  
30. Private Cloud Compute: A new frontier for AI privacy in the cloud \- Apple Security Research, accessed on December 21, 2025, [https://security.apple.com/blog/private-cloud-compute/](https://security.apple.com/blog/private-cloud-compute/)  
31. Apple Intelligence: How secure is Private Cloud Compute for enterprise? \- SimpleMDM, accessed on December 21, 2025, [https://simplemdm.com/blog/apple-intelligence-how-secure-is-private-cloud-compute-for-enterprise/](https://simplemdm.com/blog/apple-intelligence-how-secure-is-private-cloud-compute-for-enterprise/)  
32. Evaluating Apple Intelligence's Writing Tools for Privacy Against Large Language Model-Based Inference Attacks: Insights from Early Datasets \- ResearchGate, accessed on December 21, 2025, [https://www.researchgate.net/publication/392406358\_Evaluating\_Apple\_Intelligence's\_Writing\_Tools\_for\_Privacy\_Against\_Large\_Language\_Model-Based\_Inference\_Attacks\_Insights\_from\_Early\_Datasets](https://www.researchgate.net/publication/392406358_Evaluating_Apple_Intelligence's_Writing_Tools_for_Privacy_Against_Large_Language_Model-Based_Inference_Attacks_Insights_from_Early_Datasets)  
33. Apple's Foundation Models framework unlocks new intelligent app experiences, accessed on December 21, 2025, [https://www.apple.com/newsroom/2025/09/apples-foundation-models-framework-unlocks-new-intelligent-app-experiences/](https://www.apple.com/newsroom/2025/09/apples-foundation-models-framework-unlocks-new-intelligent-app-experiences/)