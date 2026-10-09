# Notes: AI Tools, Key Decisions & Limitations

> **Challenge:** Memory That Knows It Might Be Wrong ($500 + Context Engineer badge)  
> **Repository:** https://github.com/hafirhalima00-coder/mem

---

## 1. AI Tools Used

- **Claude / Cursor**: Assisted with TypeScript interface design, test vector generation, and edge-case boundary testing.
- **Deterministic Core**: The confidence calculation, decay curves, contradiction parser, and revocation cascades are written in pure, deterministic TypeScript with no runtime LLM dependency, ensuring instant response time and deterministic reliability.

---

## 2. Key Decisions

1. **Epistemic Confidence as a First-Class Citizen**:
   - Rather than treating memory as a dumb string store or naive vector index, every fact carries an explicit `confidence: number` (0.0 to 1.0) and source attribution (`user_input`, `observation`, `inference`, `api`).
2. **Proactive Forgetting vs. Permanent Retention**:
   - Forgetting is implemented as a key cognitive safety mechanism. Revocation changes status to `revoked`, immediately excluding the fact from active recall while retaining a tamper-evident audit trail.
3. **Graceful Fallback on Epistemic Uncertainty**:
   - Memories with confidence below 50% automatically inject a warning disclaimer into prompt contexts to prevent overconfident hallucinations.

---

## 3. What Was Intentionally Left Out of Scope

- **External Heavy Vector Databases (e.g. Pinecone/Milvus)**: Kept zero-dependency in-memory and lightweight indexing to allow any developer or judge to clone and test in 5 seconds without setting up API keys or external infrastructure.
- **Biometric or Multi-Factor Auth**: The project focuses squarely on the memory and context layer primitive.

---

## 4. Limits & "This Breaks When..."

- **This breaks when:** Subtle, context-dependent sarcasm or irony is used where literal sentiment polarity does not match semantic intent. A full LLM layer is recommended for nuanced semantic conflict resolution in enterprise deployments.
