# Academic Integrity Agent - Architecture Summary

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind-inspired custom CSS + Lucide icons
- **AI Backend:** Google Gemini API (`gemini-2.5-flash-lite-preview`)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Search:** Serper.dev API with MCTS source selection

---

## Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
├─────────────────────────────────────────────────────────────┤
│  App.tsx                                                    │
│  ├── LandingPage      → Auth flow entry                     │
│  ├── AuthPage         → Login/Signup (Supabase OAuth)       │
│  ├── ModeSelector     → Essay | CS | Paraphrase             │
│  ├── InputPanel       → Text input + File upload + Search   │
│  ├── OutputPanel      → Generated content + Clickable links │
│  ├── MetricsPanel     → Burstiness/Perplexity scores        │
│  └── HistoryPanel     → Saved generations (Supabase synced) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Services                             │
├─────────────────────────────────────────────────────────────┤
│  academicIntegrityService.ts                                │
│  ├── generateContent(mode, input, instructions, search)     │
│  ├── Injects mode-specific system prompt                    │
│  ├── If search enabled → calls searchService                │
│  └── Returns text + detection metrics                       │
│                                                             │
│  searchService.ts                                           │
│  ├── searchWeb() → Serper.dev API                           │
│  ├── mctsSelectSources() → MCTS algorithm for top 5 sources │
│  └── formatSourcesForPrompt() → Injects citations           │
│                                                             │
│  generationService.ts                                       │
│  └── Supabase CRUD for saving/loading generations           │
│                                                             │
│  syncService.ts                                             │
│  └── localStorage ↔ Supabase migration on login             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prompts (System)                         │
├─────────────────────────────────────────────────────────────┤
│  modeA_essay.ts      → Essay & Research prompt              │
│  modeB_cs.ts         → Computer Science prompt              │
│  modeC_paraphrase.ts → Paraphrase & Humanize prompt         │
│                                                             │
│  All prompts include:                                       │
│  • Burstiness rules (sentence length variation)             │
│  • Anti-detection strategies (syntactic transformation)     │
│  • Academic integrity safeguards (no fabrication)           │
│  • Citation handling (when search enabled)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      External APIs                          │
├─────────────────────────────────────────────────────────────┤
│  Google Gemini API                                          │
│  ├── Model: gemini-2.5-flash-lite-preview                   │
│  ├── Temperature: 1.1 (high variance)                       │
│  ├── TopK: 80 (wide vocabulary)                             │
│  └── TopP: 0.95                                             │
│                                                             │
│  Supabase                                                   │
│  ├── Auth (OAuth: Google, GitHub)                           │
│  ├── PostgreSQL (generations, users tables)                 │
│  └── RLS policies (user-scoped data)                        │
│                                                             │
│  Serper.dev                                                 │
│  └── Web search API for source retrieval                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Data Flow

```
User Input → Mode Selection → InputPanel
                                  │
                     ┌────────────┴────────────┐
                     ▼                         ▼
              [Search OFF]              [Search ON]
                     │                         │
                     │            searchService.mctsSelect()
                     │                         │
                     └────────────┬────────────┘
                                  ▼
                    academicIntegrityService.generateContent()
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            System Prompt                User Message
            (mode-specific)            (+ search context)
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                          Gemini API Call
                                  │
                                  ▼
                    Response + Metrics Calculation
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
              OutputPanel                 MetricsPanel
              (with links)            (burstiness, perplexity)
                    │
                    ▼
              Save to Supabase (async)
```

---

## Key Files

| Category | File | Purpose |
|----------|------|---------|
| **Entry** | `App.tsx` | Main orchestrator, state management |
| **Auth** | `AuthContext.tsx` | Supabase auth state |
| **Generation** | `academicIntegrityService.ts` | AI generation logic |
| **Search** | `searchService.ts` | MCTS source selection |
| **Prompts** | `prompts/modeA_essay.ts` | Essay mode system prompt |
| | `prompts/modeB_cs.ts` | CS mode system prompt |
| | `prompts/modeC_paraphrase.ts` | Paraphrase mode prompt |
| **UI** | `InputPanel.tsx` | Input + file upload + search toggle |
| | `OutputPanel.tsx` | Display + source links |
| **Persistence** | `generationService.ts` | Supabase CRUD |
| **Utils** | `metricAnalyzer.ts` | Burstiness/perplexity calc |

---

## Environment Variables

```env
VITE_GEMINI_API_KEY=...          # Google Gemini
VITE_SUPABASE_URL=...            # Supabase project URL
VITE_SUPABASE_ANON_KEY=...       # Supabase anon key
VITE_SERPER_API_KEY=...          # Web search (optional)
```
