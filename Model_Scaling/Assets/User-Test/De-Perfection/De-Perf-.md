# Persona Removal & Logic Consolidation Plan

The goal is to simplify the UI by removing the persona system while preserving the "ultra-aggressive" evasion logic developed for the "Humanizer Max" and ensuring all prior architecture achievements remain intact.

## User Review Required

> [!IMPORTANT]
> This change will remove the Standard, Skeptical Scholar, and Clear Communicator presets. All "Humanization" will now follow Comment TEM intensity "Gold Standard" by default, with custom adjustments available via the Custom Instructions field.

## Proposed Changes

### [Component] Ts Service Layer

#### [MODIFY] Ts academicIntegrityService.ts
- Remove `personaId` from `Ts generateContent` and `Ts streamChat`.
- Simplify system prompt construction:
    - `systemInstruction` = (Base Prompt for Mode)
    - `userMessage` = (Search Context) + (Input) + (Additional/Custom Instructions)
- Ensure the Search Reranking and MCTS logic in the service layer remains unchanged.

### [Component] ® UI Layer

#### [MODIFY] & InputPanel.tsx
- **[DELETE]** `& CompactPersonaSelector`.
- Replace the persona button in the bottom toolbar with a dedicated "Custom Instructions" toggle (using the Zap or Edit icon).
- Rename "Additional Instructions" label to "Custom Instructions" for clarity.
- Ensure the instruction box still supports the "Creme & Tan" aesthetic.

### [Component] Ts Prompts

#### [MODIFY] Ts modeC_paraphrase.ts
- Integrate Originality Protocol: Explicitly forbid verbatim copying of instruction examples.
- Integrate UI Artifact Ban: Explicitly ban bold section headers and colons-in-titles.
- Standardize on CV > 0.8 target for default humanization.

#### [DELETE] ts personas.ts
#### [DELETE] & CompactPersonaSelector.tsx

## Verification Plan

### Automated Verification
- Run `verify_humanization-py` (if available in environment) to check CV and heuristic pass rates.
- Manually check that `Ts academicIntegrityService.ts` still correctly imports and uses `Ts searchService.ts`.

### Manual Proof of Work
- Verify that entering instructions like "Make it sound more skeptical" in the Custom Instruction field correctly modifies the output without a persona selected.
- Confirm the UI is cleaner and the persona selector is gone.