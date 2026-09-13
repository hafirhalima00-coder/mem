# Memory Layer - AI That Knows It Might Be Wrong

An AI memory layer with confidence, freshness, and forgetting. This system addresses the problem of agents becoming confidently wrong by implementing epistemically aware memory.

## Features

- **Confidence Tracking**: Each memory carries a confidence score (0-1)
- **Source Attribution**: Track where each memory came from
- **Freshness Decay**: Old memories automatically lose confidence
- **Contradiction Detection**: Detect and handle conflicting information
- **Privacy Revocation**: Users can explicitly forget information
- **Memory Inspector**: "What do you remember about me?" interface
- **"I Might Be Wrong" Warnings**: Low-confidence memories flagged appropriately

## Architecture

### Memory Model

Each memory contains:
- `content`: The actual fact
- `source`: Origin (user_input, observation, inference, external_api)
- `confidence`: 0-1 score indicating certainty
- `freshness`: Timestamp of last verification
- `scope`: Who it applies to (user, session, global)
- `status`: active, archived, revoked, contradicted, decayed

### Write Path
1. Receive new memory
2. Assign source & confidence
3. Detect contradictions with existing memories
4. Calculate confidence delta based on conflict severity
5. Handle conflicts (replace, merge, keep_both, flag_for_review)
6. Store with full metadata

### Retrieval Path
1. Parse query filters (scope, tags, confidence, age)
2. Filter memories by criteria
3. Calculate match score
4. Generate warnings for low-confidence or stale memories
5. Rank by confidence × match score
6. Return with metadata and warnings

### Forgetting Path
- **User Revocation**: Explicit "forget this" requests
- **Time-based Decay**: Memories older than threshold marked as decayed
- **Contradiction Resolution**: Conflicting memories handled appropriately
- **Expiration**: Optional TTL for temporary memories

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Or build and run in production
npm run build
npm start
```

The server will start at http://localhost:3000

## API Endpoints

### Write Memory
```http
POST /api/memory
Content-Type: application/json

{
  "content": "User prefers dark mode",
  "source": "user_input",
  "confidence": 0.9,
  "scope": "user",
  "scopeId": "user123",
  "tags": ["preferences", "ui"]
}
```

### Retrieve Memories
```http
POST /api/memory/retrieve
Content-Type: application/json

{
  "content": "dark mode",
  "minConfidence": 0.5,
  "maxAge": 604800000
}
```

### Forget Memory
```http
POST /api/memory/forget
Content-Type: application.json

{
  "memoryId": "uuid-here",
  "reason": "user_revoked"
}
```

### Memory Inspector
```http
GET /api/memory/user/:userId
```

### Stats
```http
GET /api/memory/stats
```

## Demo Scenarios

The web interface includes several demonstration scenarios:

1. **Contradiction Test**: Store "User likes cats" then "User dislikes cats" to see conflict resolution
2. **Stale Data Test**: See how old memories get freshness warnings
3. **Privacy Revocation**: Store sensitive info, revoke it, verify it's gone
4. **Low Confidence Warning**: Store an inferred fact with low confidence to see warning messages

## Key Design Decisions

1. **Confidence Propagation**: When inferring new facts, confidence is bounded by source confidence
2. **Simple Contradiction Detection**: Uses negation patterns (can/cannot, likes/dislikes)
3. **Freshness Decay**: Memories lose ~10% confidence per day without verification
4. **Status Tracking**: Revoked memories preserved for audit trail, not deleted

## Production Considerations

- Replace simple text matching with embedding-based similarity
- Add vector storage for better semantic search
- Implement proper contradiction detection using LLM
- Add authentication and authorization
- Store memories in database (PostgreSQL, MongoDB)
- Add caching layer for frequent queries
- Implement batch operations for bulk memory management

## Two-Year Thesis: Agent Memory Done Right

The future of agent memory lies not in storing more information, but in storing epistemically aware information. Within two years, agent memory systems will shift from simple key-value stores to structured knowledge graphs where every fact carries metadata about its provenance, certainty, and temporal validity.

The critical innovation will be confidence propagation. When an agent infers new facts from existing memories, the confidence of derived facts should be bounded by the confidence of their sources. This creates a natural "I might be wrong" behavior without explicit programming.

Privacy will become a first-class concern, not an afterthought. Memory systems will need built-in revocation semantics - when a user says "forget that," the system must not only remove the fact but also any inferences derived from it.

Finally, forgetting will be a feature, not a bug. The best memory systems will proactively decay low-confidence, stale, or contradictory information. This mirrors human cognition and prevents the "confidently wrong" failure mode that plagues current AI systems.

## AI Tools Used

- Claude (Anthropic) for architecture design and code generation
- TypeScript for type safety
- Express.js for API server
- Vanilla HTML/JavaScript for demo frontend

## License

MIT
