# Loom Walkthrough Script: Memory Layer (90 Seconds)

> **Demo:** https://memory-layer.vercel.app  
> **Repository:** https://github.com/hafirhalima00-coder/mem

---

## Storyboard & Timing Breakdown

### [0:00 - 0:15] The Core Problem
- **Visual**: Open Memory Inspector showing stored agent memories with confidence bars and source tags.
- **Narrative**:
  > *"When today's AI agents store memories, they treat every recalled fact as 100% absolute truth. They never doubt themselves, they never forget, and they become confidently wrong. Memory Layer solves this by bringing epistemic humility, confidence decay, and proactive forgetting to AI memory."*

### [0:15 - 0:35] Live Contradiction Detection
- **Visual**: Trigger Test 2: Store `"User prefers dark mode"` (90% confidence), then write `"User avoids dark mode"`.
- **Narrative**:
  > *"Watch what happens when a user updates their preference. Instead of blindly overwriting or hallucinating both simultaneously, the engine detects the polarity contradiction, penalizes the confidence score, and flags the conflict for human review."*

### [0:35 - 0:50] The "I Might Be Wrong" Moment
- **Visual**: Query a low-confidence inferred assumption (30% confidence). Highlight the orange warning banner.
- **Narrative**:
  > *"Notice this query result: because this fact was inferred with only 30% confidence, the agent returns an explicit warning: 'I am somewhat confident about this, but I could be mistaken.' This prevents catastrophic agent actions based on flimsy assumptions."*

### [0:50 - 1:10] Freshness Decay & Stale Data
- **Visual**: Query an unverified fact with elapsed TTL. Show the decay curve reducing confidence and triggering a staleness flag.
- **Narrative**:
  > *"Facts aren't permanent. Over time, unverified memories proactively lose confidence through temporal decay curves. If an agent hasn't verified an address or phone number in 90 days, it automatically warns that the data is stale."*

### [1:10 - 1:30] Right to Forget (GDPR Revocation) & Closing
- **Visual**: Click "Revoke Memory" on user email address. Show active queries returning 0 results, while an audit hash is preserved.
- **Narrative**:
  > *"When a user exercises their right to forget, the system immediately drops the fact from active retrieval while preserving a cryptographic hash for audit compliance. 6 out of 6 tests passing, zero external dependencies, ready for production. Thank you."*
