export type MemorySource = 
  | 'user_input'      // Directly stated by user
  | 'observation'     // Observed from behavior
  | 'inference'       // Deduced from other facts
  | 'external_api'    // From external system
  | 'system_default'  // Built-in default

export type MemoryScope = 
  | 'user'           // Specific to one user
  | 'session'        // Current session only
  | 'global'         // Applies to all users/sessions

export type MemoryStatus = 
  | 'active'         // Currently valid
  | 'archived'       // Old but retained
  | 'revoked'        // Explicitly removed by user
  | 'contradicted'   // Conflicts with newer information
  | 'decayed'        // Too old to be reliable

export interface Memory {
  id: string
  content: string
  source: MemorySource
  confidence: number          // 0-1, how sure we are
  freshness: number          // Unix timestamp of last verification
  created: number            // Unix timestamp of creation
  scope: MemoryScope
  scopeId?: string           // User ID or session ID if scope is user/session
  tags: string[]
  status: MemoryStatus
  contradictions: string[]   // IDs of memories that contradict this one
  verifiedBy?: string        // What verified this memory last
  expiresAt?: number         // Optional expiration timestamp
}

export interface MemoryQuery {
  content?: string
  tags?: string[]
  scope?: MemoryScope
  scopeId?: string
  minConfidence?: number
  maxAge?: number            // Max age in milliseconds
  status?: MemoryStatus[]
  limit?: number
}

export interface MemoryRetrieval {
  memory: Memory
  matchScore: number         // 0-1, how well it matches query
  warning?: string           // "I might be wrong about this" type messages
}

export interface ContradictionResult {
  found: boolean
  existingMemory?: Memory
  newMemory?: Memory
  confidenceDelta: number    // How much confidence should change
  recommendation: 'replace' | 'merge' | 'keep_both' | 'flag_for_review'
}
