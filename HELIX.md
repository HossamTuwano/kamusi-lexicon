# THE HELIX METHOD: Implementation Standard

This document defines the mandatory workflow for all AI agents working on the Kamusi Lexicon project. The Helix method is designed to prevent "LLM Drift" and technical debt by replacing one-shot implementations with a gradual, proof-gated loop.

## THE MANDATE
**No one-shot features.** Large tasks must be decomposed into atomic checkpoints. A checkpoint is only "Done" when it is proven, critiqued, and approved.

---

## THE WORKFLOW

### Phase 1: Slicing (The Map)
Before writing any code, the agent must propose a **Checkpoint Map**. 
- **Atomic**: Each checkpoint must be a small, ordered slice of work.
- **Reviewable**: A human should be able to verify the behavior in minutes.
- **Format**: 
  - `CP1: [Feature Slice] → [Specific Proof/Test]`
  - `CP2: [Feature Slice] → [Specific Proof/Test]`

### Phase 2: The Proof Loop (Execution)
For every checkpoint, the agent must deliver a **Proof Bundle**. 

**The Fast-Feedback Hierarchy:**
To avoid the "Simulator Bottleneck," proofs must be generated in order of speed. Do not move to a slower tier until the faster tier is proven.
1. **L1: Headless Logic (Fastest)**: Business logic is decoupled from UI. The agent must prove the logic via a headless script, unit test, or CLI call. **Iteration happens here.**
2. **L2: Integration (Medium)**: API-level E2E tests (Request/Response). Proves the logic is wired correctly into the system.
3. **L3: Visual/UI (Slowest)**: Final browser/UI verification. This is the final check before the human nod.

**The Proof Bundle must include:**
1. **Implementation**: The precise code changes.
2. **Automated Proof**: The test/script results from the fastest applicable tier.
3. **Evidence**: The raw terminal output of the passing test.

**GATE: If the automated proof is missing or failing, the checkpoint cannot proceed.**

### Phase 3: The Adversarial Gate (Review)
Before presenting the bundle to the human, the agent must conduct an internal adversarial review:
1. **Spawn a Critic**: Use a sub-agent acting as a cynical, senior architect.
2. **Challenge**: The Critic must attempt to find security flaws, Constitution violations, or unmaintainable patterns.
3. **Refine**: The agent must address the critique before final submission.

### Phase 4: The Human Nod (Approval)
The human reviews the **Proof Bundle + Adversarial Critique**.
- **APPROVED**: The code is committed. The loop moves to the next checkpoint.
- **REJECTED**: The agent returns to Phase 2.

### Phase 5: Memory Compounding (Learning)
Failures and rejections are the primary source of project intelligence.
- **Codify**: Every significant error or rejection must be distilled into a lesson in `JOURNAL.md`.
- **Apply**: The agent must read the `JOURNAL.md` before generating a new Checkpoint Map.

---

## INVARIANTS
- **No "Mental Notes"**: Lessons must be written to `JOURNAL.md`.
- **No Skipping Gates**: Proofs cannot be "assumed"; they must be evidenced.
- **Constitution Wins**: Any implementation that violates `CONSTITUTION.md` is automatically rejected by the Adversarial Gate.
- **The Verification Mandate**: Tool success is not implementation success. A "Successfully replaced" message is a tool log, not a functional proof. No checkpoint is "Done" until a static analysis check (e.g., `tsc --noEmit` or `npm run build`) passes. Zero-confidence in "it should work" is the only acceptable state until the build is green.
