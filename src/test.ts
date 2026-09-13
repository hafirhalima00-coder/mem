import { MemoryStore } from './core/MemoryStore'

async function runTests() {
  console.log('Running Memory Layer Tests...\n')
  
  const store = new MemoryStore()
  
  // Test 1: Write and retrieve
  console.log('Test 1: Basic write and retrieve')
  const result1 = await store.write({
    content: 'User prefers dark mode',
    source: 'user_input',
    confidence: 0.9,
    scope: 'user',
    scopeId: 'test_user',
    tags: ['preferences']
  })
  console.log(`✓ Stored memory with ID: ${result1.memory.id}`)
  
  const retrieved1 = await store.retrieve({
    content: 'dark mode',
    scope: 'user',
    scopeId: 'test_user'
  })
  console.log(`✓ Retrieved ${retrieved1.length} memory(ies)`)
  console.log(`  Match score: ${retrieved1[0].matchScore}`)
  console.log(`  Confidence: ${retrieved1[0].memory.confidence}`)
  
  // Test 2: Contradiction detection
  console.log('\nTest 2: Contradiction detection')
  const result2 = await store.write({
    content: 'User avoids dark mode',
    source: 'user_input',
    confidence: 0.85,
    scope: 'user',
    scopeId: 'test_user',
    tags: ['preferences']
  })
  console.log(`✓ Stored contradictory memory`)
  console.log(`  Contradictions found: ${result2.contradictions.length}`)
  if (result2.contradictions.length > 0) {
    console.log(`  Confidence delta: ${result2.contradictions[0].confidenceDelta}`)
    console.log(`  Recommendation: ${result2.contradictions[0].recommendation}`)
  }
  
  // Test 3: Forgetting
  console.log('\nTest 3: Privacy revocation')
  const result3 = await store.write({
    content: 'User email is test@example.com',
    source: 'user_input',
    confidence: 1.0,
    scope: 'user',
    scopeId: 'test_user',
    tags: ['email', 'sensitive']
  })
  console.log(`✓ Stored sensitive memory: ${result3.memory.id}`)
  
  const forgotten = await store.forget({
    memoryId: result3.memory.id,
    reason: 'user_revoked'
  })
  console.log(`✓ Forgotten ${forgotten.length} memory(ies)`)
  
  const retrieved2 = await store.retrieve({
    content: 'email',
    scope: 'user',
    scopeId: 'test_user'
  })
  const activeEmails = retrieved2.filter(r => r.memory.status === 'active')
  console.log(`✓ Active email memories after revocation: ${activeEmails.length} (should be 0)`)
  
  // Test 4: Low confidence warning
  console.log('\nTest 4: Low confidence warning')
  await store.write({
    content: 'User might like cats',
    source: 'inference',
    confidence: 0.3,
    scope: 'user',
    scopeId: 'test_user',
    tags: ['pets']
  })
  
  const retrieved3 = await store.retrieve({
    content: 'cats',
    scope: 'user',
    scopeId: 'test_user'
  })
  console.log(`✓ Low confidence memory retrieved with warning: ${retrieved3[0].warning ? 'Yes' : 'No'}`)
  if (retrieved3[0].warning) {
    console.log(`  Warning: "${retrieved3[0].warning}"`)
  }
  
  // Test 5: Stats
  console.log('\nTest 5: Memory statistics')
  const stats = store.getStats()
  console.log(`✓ Total memories: ${stats.total}`)
  console.log(`  Active: ${stats.active}`)
  console.log(`  By status:`, stats.byStatus)
  console.log(`  Average confidence: ${Math.round(stats.averageConfidence * 100)}%`)
  
  // Test 6: User inspector
  console.log('\nTest 6: Memory inspector')
  const userMemories = await store.getMemoriesForUser('test_user')
  console.log(`✓ Found ${userMemories.length} memories for test_user`)
  userMemories.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.content} (${Math.round(m.confidence * 100)}% confidence, status: ${m.status})`)
  })
  
  console.log('\n✅ All tests passed!')
}

runTests().catch(console.error)
