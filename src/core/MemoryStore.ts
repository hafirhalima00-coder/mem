import { v4 as uuidv4 } from 'uuid'
import { 
  Memory, 
  MemorySource, 
  MemoryScope, 
  MemoryStatus,
  MemoryQuery,
  MemoryRetrieval,
  ContradictionResult 
} from './types'

export class MemoryStore {
  private memories: Map<string, Memory> = new Map()
  
  constructor() {
    // Initialize with empty store
  }

  // WRITE PATH: Add new memory with contradiction detection
  async write(params: {
    content: string
    source: MemorySource
    confidence: number
    scope: MemoryScope
    scopeId?: string
    tags?: string[]
    expiresAt?: number
  }): Promise<{ memory: Memory; contradictions: ContradictionResult[] }> {
    const now = Date.now()
    
    const newMemory: Memory = {
      id: uuidv4(),
      content: params.content,
      source: params.source,
      confidence: Math.min(1, Math.max(0, params.confidence)),
      freshness: now,
      created: now,
      scope: params.scope,
      scopeId: params.scopeId,
      tags: params.tags || [],
      status: 'active',
      contradictions: [],
      expiresAt: params.expiresAt
    }

    // Check for contradictions
    const contradictions = await this.detectContradictions(newMemory)
    
    // Store the memory
    this.memories.set(newMemory.id, newMemory)
    
    // Handle contradictions
    for (const contradiction of contradictions) {
      if (contradiction.existingMemory) {
        this.handleContradiction(newMemory, contradiction)
      }
    }

    return { memory: newMemory, contradictions }
  }

  // RETRIEVAL PATH: Find relevant memories with confidence indicators
  async retrieve(query: MemoryQuery): Promise<MemoryRetrieval[]> {
    const results: MemoryRetrieval[] = []
    
    for (const memory of this.memories.values()) {
      // Filter by status
      if (query.status && !query.status.includes(memory.status)) {
        continue
      }
      
      // Filter by scope
      if (query.scope && memory.scope !== query.scope) {
        continue
      }
      
      // Filter by scope ID
      if (query.scopeId && memory.scopeId !== query.scopeId) {
        continue
      }
      
      // Filter by confidence
      if (query.minConfidence && memory.confidence < query.minConfidence) {
        continue
      }
      
      // Filter by age
      if (query.maxAge) {
        const age = Date.now() - memory.freshness
        if (age > query.maxAge) {
          continue
        }
      }
      
      // Filter by tags
      if (query.tags && query.tags.length > 0) {
        const hasMatchingTag = query.tags.some(tag => memory.tags.includes(tag))
        if (!hasMatchingTag) {
          continue
        }
      }
      
      // Simple text matching (in production, use embeddings)
      let matchScore = 1
      if (query.content) {
        const queryLower = query.content.toLowerCase()
        const contentLower = memory.content.toLowerCase()
        if (contentLower.includes(queryLower) || queryLower.includes(contentLower)) {
          matchScore = 0.8
        } else {
          // Check word overlap
          const queryWords = queryLower.split(' ')
          const contentWords = contentLower.split(' ')
          const overlap = queryWords.filter(w => contentWords.includes(w)).length
          matchScore = overlap / queryWords.length
        }
      }
      
      if (matchScore > 0.1) {
        const warning = this.generateWarning(memory)
        results.push({
          memory,
          matchScore,
          warning
        })
      }
    }
    
    // Sort by match score and confidence
    results.sort((a, b) => {
      const scoreA = a.matchScore * a.memory.confidence
      const scoreB = b.matchScore * b.memory.confidence
      return scoreB - scoreA
    })
    
    // Apply limit
    if (query.limit) {
      return results.slice(0, query.limit)
    }
    
    return results
  }

  // FORGETTING PATH: Remove or archive memories
  async forget(params: {
    memoryId?: string
    scope?: MemoryScope
    scopeId?: string
    reason: 'user_revoked' | 'stale' | 'contradicted' | 'expired'
    olderThan?: number  // Unix timestamp
  }): Promise<Memory[]> {
    const forgotten: Memory[] = []
    
    for (const [id, memory] of this.memories.entries()) {
      let shouldForget = false
      
      // Specific memory
      if (params.memoryId && memory.id === params.memoryId) {
        shouldForget = true
      }
      
      // By scope
      if (params.scope && memory.scope === params.scope) {
        if (params.scopeId && memory.scopeId === params.scopeId) {
          shouldForget = true
        } else if (!params.scopeId) {
          shouldForget = true
        }
      }
      
      // By age
      if (params.olderThan && memory.created < params.olderThan) {
        shouldForget = true
      }
      
      // By expiration
      if (memory.expiresAt && memory.expiresAt < Date.now()) {
        shouldForget = true
      }
      
      if (shouldForget) {
        // Update status based on reason
        switch (params.reason) {
          case 'user_revoked':
            memory.status = 'revoked'
            break
          case 'stale':
            memory.status = 'decayed'
            break
          case 'contradicted':
            memory.status = 'contradicted'
            break
          case 'expired':
            memory.status = 'archived'
            break
        }
        
        forgotten.push(memory)
      }
    }
    
    return forgotten
  }

  // Detect contradictions with existing memories
  private async detectContradictions(newMemory: Memory): Promise<ContradictionResult[]> {
    const contradictions: ContradictionResult[] = []
    
    for (const existingMemory of this.memories.values()) {
      if (existingMemory.id === newMemory.id) continue
      if (existingMemory.status !== 'active') continue
      
      // Check for scope overlap
      const scopesOverlap = this.scopesOverlap(newMemory, existingMemory)
      if (!scopesOverlap) continue
      
      // Simple contradiction detection (in production, use semantic similarity)
      const isContradiction = this.detectSimpleContradiction(newMemory.content, existingMemory.content)
      
      if (isContradiction) {
        const confidenceDelta = this.calculateConfidenceDelta(newMemory, existingMemory)
        const recommendation = this.getContradictionRecommendation(newMemory, existingMemory)
        
        contradictions.push({
          found: true,
          existingMemory,
          newMemory,
          confidenceDelta,
          recommendation
        })
      }
    }
    
    return contradictions
  }

  private scopesOverlap(a: Memory, b: Memory): boolean {
    if (a.scope === 'global' || b.scope === 'global') return true
    if (a.scope === b.scope && a.scopeId === b.scopeId) return true
    return false
  }

  private detectSimpleContradiction(content1: string, content2: string): boolean {
    // Simple heuristic: check for negation patterns using word boundaries
    const negationPatterns = [
      ['is', 'is not'],
      ['can', 'cannot'],
      ['will', 'will not'],
      ['likes', 'dislikes'],
      ['prefers', 'avoids'],
      ['always', 'never'],
      ['true', 'false'],
      ['love', 'hate'],
      ['enjoy', 'dislike'],
      ['want', 'don\'t want']
    ]
    
    const lower1 = content1.toLowerCase()
    const lower2 = content2.toLowerCase()
    
    for (const [positive, negative] of negationPatterns) {
      // Use word boundary regex to avoid substring matches
      const positiveRegex = new RegExp(`\\b${positive}\\b`)
      const negativeRegex = new RegExp(`\\b${negative}\\b`)
      
      const hasPositive1 = positiveRegex.test(lower1)
      const hasNegative1 = negativeRegex.test(lower1)
      const hasPositive2 = positiveRegex.test(lower2)
      const hasNegative2 = negativeRegex.test(lower2)
      
      // Check if one has positive and other has negative (and NOT both have same)
      if (hasPositive1 && hasNegative2 && !hasNegative1 && !hasPositive2) {
        // Check if the rest of the content is similar
        const stripped1 = lower1.replace(positiveRegex, '').replace(/\s+/g, ' ').trim()
        const stripped2 = lower2.replace(negativeRegex, '').replace(/\s+/g, ' ').trim()
        
        if (stripped1 === stripped2 || stripped1.includes(stripped2) || stripped2.includes(stripped1)) {
          return true
        }
      }
      
      if (hasNegative1 && hasPositive2 && !hasPositive1 && !hasNegative2) {
        // Check if the rest of the content is similar
        const stripped1 = lower1.replace(negativeRegex, '').replace(/\s+/g, ' ').trim()
        const stripped2 = lower2.replace(positiveRegex, '').replace(/\s+/g, ' ').trim()
        
        if (stripped1 === stripped2 || stripped1.includes(stripped2) || stripped2.includes(stripped1)) {
          return true
        }
      }
    }
    
    return false
  }

  private calculateConfidenceDelta(newMemory: Memory, existingMemory: Memory): number {
    // Higher confidence memory should have more weight
    const newWeight = newMemory.confidence * this.getFreshnessWeight(newMemory)
    const existingWeight = existingMemory.confidence * this.getFreshnessWeight(existingMemory)
    
    if (newWeight > existingWeight) {
      return 0.3 // Increase confidence of new memory
    } else {
      return -0.2 // Decrease confidence of new memory
    }
  }

  private getFreshnessWeight(memory: Memory): number {
    const age = Date.now() - memory.freshness
    const dayMs = 24 * 60 * 60 * 1000
    const daysSinceUpdate = age / dayMs
    
    // Decay factor: loses 10% per day
    return Math.max(0.1, 1 - (daysSinceUpdate * 0.1))
  }

  private getContradictionRecommendation(
    newMemory: Memory, 
    existingMemory: Memory
  ): 'replace' | 'merge' | 'keep_both' | 'flag_for_review' {
    const newWeight = newMemory.confidence * this.getFreshnessWeight(newMemory)
    const existingWeight = existingMemory.confidence * this.getFreshnessWeight(existingMemory)
    
    // If new memory is significantly better, replace
    if (newWeight > existingWeight * 1.5) {
      return 'replace'
    }
    
    // If existing memory is significantly better, keep both but flag
    if (existingWeight > newWeight * 1.5) {
      return 'keep_both'
    }
    
    // If similar confidence, flag for review
    return 'flag_for_review'
  }

  private handleContradiction(newMemory: Memory, contradiction: ContradictionResult): void {
    const { existingMemory, recommendation, confidenceDelta } = contradiction
    
    if (!existingMemory) return
    
    switch (recommendation) {
      case 'replace':
        existingMemory.status = 'contradicted'
        existingMemory.contradictions.push(newMemory.id)
        newMemory.confidence = Math.min(1, newMemory.confidence + confidenceDelta)
        break
        
      case 'keep_both':
        newMemory.confidence = Math.max(0, newMemory.confidence + confidenceDelta)
        newMemory.contradictions.push(existingMemory.id)
        break
        
      case 'flag_for_review':
        newMemory.confidence = Math.max(0.1, newMemory.confidence - 0.1)
        break
        
      case 'merge':
        // In production, this would merge the memories
        break
    }
  }

  private generateWarning(memory: Memory): string | undefined {
    if (memory.confidence < 0.3) {
      return "I'm not very confident about this memory. It might be wrong."
    }
    
    if (memory.confidence < 0.6) {
      return "I'm somewhat confident about this, but I could be mistaken."
    }
    
    const age = Date.now() - memory.freshness
    const weekMs = 7 * 24 * 60 * 60 * 1000
    if (age > weekMs) {
      return "This memory is over a week old and might be outdated."
    }
    
    if (memory.contradictions.length > 0) {
      return "This memory has some conflicting information."
    }
    
    return undefined
  }

  // Get all memories for a user (for memory inspector)
  async getMemoriesForUser(userId: string): Promise<Memory[]> {
    return Array.from(this.memories.values()).filter(
      m => m.scope === 'user' && m.scopeId === userId
    )
  }

  // Get memory stats
  getStats(): {
    total: number
    active: number
    byStatus: Record<MemoryStatus, number>
    bySource: Record<string, number>
    averageConfidence: number
  } {
    const memories = Array.from(this.memories.values())
    const byStatus: Record<MemoryStatus, number> = {
      active: 0,
      archived: 0,
      revoked: 0,
      contradicted: 0,
      decayed: 0
    }
    const bySource: Record<string, number> = {}
    let totalConfidence = 0
    
    for (const memory of memories) {
      byStatus[memory.status]++
      bySource[memory.source] = (bySource[memory.source] || 0) + 1
      totalConfidence += memory.confidence
    }
    
    return {
      total: memories.length,
      active: byStatus.active,
      byStatus,
      bySource,
      averageConfidence: memories.length > 0 ? totalConfidence / memories.length : 0
    }
  }
}
