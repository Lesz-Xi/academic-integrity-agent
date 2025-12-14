# Academic Integrity Agent - Feature & UI Reference

## Main Feature: Specialized Academic Generation & Humanization

The core purpose of the application is to assist students and researchers in generating, refining, and restructuring academic content across different disciplines while maintaining academic integrity standards. The "Paraphrase & Humanize" mode specifically focuses on rewriting existing text to improve flow, unique structure, and avoid common AI-generation patterns.

### Key Capabilities
*   **Multi-Mode Generation**: Three distinct modes optimized for different academic needs.
*   **History Tracking**: Automatic saving of generations with quick access to previous work.
*   **AI Detection Metrics**: visual indicators (Low/Medium/High) to gauge the "human-likeness" of the output.
*   **Ethical Guardrails**: Built-in adherence to academic integrity policies.

---

## UI/UX Structure & Design Analysis

The interface utilizes a **Card-Based Dashboard Layout** with a hierarchical flow from History → Mode Selection → Input. The design uses high-contrast elements (Dark Mode shown) with active state highlighting.

### Visual Structure (Mermaid Diagram)

```mermaid
graph TD
    %% Header Section
    Header[Header Bar]
    Header --> Brand[Logo & User ID]
    Header --> Controls[Controls: Theme, Restart, Guide, Sign Out]

    %% Main Content Flow
    subgraph MainContent [Main Application Container]
        direction TB
        
        %% History Panel
        History[History Panel]
        History --> HistoryHeader[Header: 'Recent Generations']
        History --> HistoryList[Scrollable List]
        HistoryList --> Item1[History Item: Timestamp + Snippet + Risk Badge]
        
        %% Mode Selection
        ModeSection[Mode Selector Section]
        ModeSection --> ModeTitle[Title: 'Select Writing Mode']
        
        subgraph Cards [Selection Cards]
            direction LR
            Card1[Essay & Research]
            Card2[Computer Science]
            Card3[Paraphrase & Humanize <br/>(Active/Highlighted)]
        end
        
        ModeSection --> Cards
        
        %% Active Mode Feedback
        Indicator[Mode Selected Indicator Bar]
        
        %% Input Area
        InputSection[Input Panel]
        InputSection --> InputLabel[Label: 'Input Text...']
        InputSection --> InputArea[Text Area / File Drop]
    end

    %% Styles & Interactions
    classDef active fill:#CC785C,stroke:#CC785C,color:white;
    classDef card fill:#252525,stroke:#444,color:white;
    classDef history fill:#2D2D2D,stroke:#444,color:#e5e5e5;
    
    class Card3 active;
    class Card1,Card2 card;
    class Item1 history;
```

### UI Components Breakdown

#### 1. Global Navigation Bar (Top)
*   **Left**: Branding ("Academic Integrity Agent") and User Email.
*   **Right**: Utility actions (Theme Toggle, Start Over, Guide, Ethics Policy, Sign Out).
*   **UX Pattern**: Persistent visibility for essential account and help functions.

#### 2. History Dashboard (Top Center)
*   **Function**: Context-aware history. It filters to show only generations relevant to the *currently selected* mode or generally available recent items.
*   **Design**: 
    *   Glass-morphic container (`bg-[#2D2D2D]`).
    *   **Status Badges**: Color-coded "LOW" / "MEDIUM" badges provide instant feedback on the risk level of previous generations.
    *   **Dismissal**: Close buttons (x) to remove items.

#### 3. Mode Selection Grid (Center)
The central navigation hub using large click targets (Cards).
*   **Essay & Research**: Standard academic arguments.
*   **Computer Science**: Technical documentation and code explanations.
*   **Paraphrase & Humanize** (Active in screenshot):
    *   **Visual State**: Highlighted in "Terracotta" (`#CC785C`) to indicate active selection.
    *   **Interaction**: Scales up slightly (`scale-105`) with a shadow glow to emphasize selection.
    *   **Indicator**: "ACTIVE MODE" dot and text.

#### 4. Contextual Input Area (Bottom)
*   **Transition**: A notification bar ("Mode selected: ...") bridges the gap between selection and input.
*   **Input**: Designated area for users to paste text or upload files (not fully visible in screenshot but implied by "Input Text to Paraphrase").

### Design Aesthetic (Dark Mode)
*   **Background**: Deep charcoal/black (`#1a1a1a`) reduces eye strain.
*   **Accent Colors**: 
    *   **Terracotta/Orange** (`#CC785C`): Primary action color, used for the active "Paraphrase" mode.
    *   **Yellow/Gold**: Used for "LOW" risk badges and warnings.
*   **Typography**: Sans-serif (Inter/System fonts), clean and legible with high contrast text.
