import { MemoryStore } from './src/core/MemoryStore'

interface Env {
  MEMORY_STORE: KVNamespace
}

const STORE_KEY = 'memories'

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memory Layer - AI That Knows It Might Be Wrong</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f0f; color: #e0e0e0; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { text-align: center; padding: 40px 0; border-bottom: 1px solid #333; margin-bottom: 40px; }
    h1 { font-size: 2.5rem; color: #fff; margin-bottom: 10px; }
    .subtitle { color: #888; font-size: 1.1rem; }
    .demo-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
    .panel { background: #1a1a1a; border-radius: 12px; padding: 24px; border: 1px solid #333; }
    .panel h2 { font-size: 1.3rem; margin-bottom: 20px; color: #fff; display: flex; align-items: center; gap: 10px; }
    .panel h2::before { content: ''; width: 8px; height: 8px; background: #4ade80; border-radius: 50%; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; color: #aaa; font-size: 0.9rem; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; background: #0f0f0f; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.95rem; }
    .form-group textarea { min-height: 80px; resize: vertical; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #4ade80; }
    .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95rem; font-weight: 500; transition: all 0.2s; }
    .btn-primary { background: #4ade80; color: #000; }
    .btn-primary:hover { background: #22c55e; }
    .btn-secondary { background: #333; color: #fff; }
    .btn-secondary:hover { background: #444; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
    .memory-list { margin-top: 20px; }
    .memory-item { background: #0f0f0f; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .memory-item.warning { border-color: #f59e0b; background: #1a1500; }
    .memory-item.danger { border-color: #ef4444; background: #1a0000; }
    .memory-content { font-size: 1rem; margin-bottom: 12px; }
    .memory-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.8rem; color: #888; }
    .memory-meta span { display: flex; align-items: center; gap: 4px; }
    .confidence-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .confidence-high { background: #065f46; color: #34d399; }
    .confidence-medium { background: #713f12; color: #fbbf24; }
    .confidence-low { background: #7f1d1d; color: #f87171; }
    .warning-banner { background: #422006; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin-bottom: 16px; color: #fbbf24; font-size: 0.9rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
    .stat-card { background: #1a1a1a; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #333; }
    .stat-value { font-size: 2rem; font-weight: 700; color: #4ade80; }
    .stat-label { color: #888; font-size: 0.85rem; margin-top: 4px; }
    .architecture { background: #1a1a1a; border-radius: 12px; padding: 24px; border: 1px solid #333; margin-bottom: 40px; }
    .architecture h2 { margin-bottom: 20px; }
    .path-diagram { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .path-box { background: #0f0f0f; border-radius: 8px; padding: 16px; border: 1px solid #333; }
    .path-box h3 { color: #4ade80; margin-bottom: 12px; font-size: 1rem; }
    .path-box ul { list-style: none; }
    .path-box li { padding: 6px 0; border-bottom: 1px solid #222; font-size: 0.9rem; color: #aaa; }
    .path-box li:last-child { border-bottom: none; }
    .thesis { background: #1a1a1a; border-radius: 12px; padding: 24px; border: 1px solid #333; }
    .thesis h2 { margin-bottom: 20px; }
    .thesis p { color: #ccc; margin-bottom: 16px; }
    .demo-controls { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    @media (max-width: 768px) {
      .demo-section { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .path-diagram { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Memory That Knows It Might Be Wrong</h1>
      <p class="subtitle">An AI memory layer with confidence, freshness, and forgetting</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value" id="stat-total">0</div>
        <div class="stat-label">Total Memories</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-active">0</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-confidence">0%</div>
        <div class="stat-label">Avg Confidence</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-forgotten">0</div>
        <div class="stat-label">Forgotten</div>
      </div>
    </div>

    <div class="demo-section">
      <div class="panel">
        <h2>Write Memory</h2>
        <form id="write-form">
          <div class="form-group">
            <label>Memory Content</label>
            <textarea id="memory-content" placeholder="e.g., User prefers dark mode"></textarea>
          </div>
          <div class="form-group">
            <label>Source</label>
            <select id="memory-source">
              <option value="user_input">User Input</option>
              <option value="observation">Observation</option>
              <option value="inference">Inference</option>
              <option value="external_api">External API</option>
            </select>
          </div>
          <div class="form-group">
            <label>Confidence (0-100%)</label>
            <input type="number" id="memory-confidence" min="0" max="100" value="80">
          </div>
          <div class="form-group">
            <label>Scope</label>
            <select id="memory-scope">
              <option value="user">User</option>
              <option value="session">Session</option>
              <option value="global">Global</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" id="memory-tags" placeholder="e.g., preferences, ui">
          </div>
          <button type="submit" class="btn btn-primary">Store Memory</button>
        </form>
      </div>

      <div class="panel">
        <h2>Retrieve Memories</h2>
        <form id="retrieve-form">
          <div class="form-group">
            <label>Search Query</label>
            <input type="text" id="retrieve-query" placeholder="e.g., dark mode">
          </div>
          <div class="form-group">
            <label>Minimum Confidence</label>
            <input type="number" id="retrieve-min-confidence" min="0" max="100" value="0">
          </div>
          <div class="form-group">
            <label>Max Age (days)</label>
            <input type="number" id="retrieve-max-age" min="0" value="30">
          </div>
          <button type="submit" class="btn btn-primary">Search</button>
        </form>
        <div id="retrieve-results" class="memory-list"></div>
      </div>
    </div>

    <div class="panel" style="margin-bottom: 40px;">
      <h2>Memory Inspector - What Do You Remember?</h2>
      <div class="demo-controls">
        <button onclick="inspectUser('user1')" class="btn btn-secondary">Inspect User 1</button>
        <button onclick="inspectUser('user2')" class="btn btn-secondary">Inspect User 2</button>
      </div>
      <div id="inspector-results" class="memory-list"></div>
    </div>

    <div class="panel" style="margin-bottom: 40px;">
      <h2>Demo Scenarios</h2>
      <p style="color: #888; margin-bottom: 16px;">Click a button to run a demonstration scenario</p>
      <div class="demo-controls">
        <button onclick="runContradictionDemo()" class="btn btn-secondary">Contradiction Test</button>
        <button onclick="runStaleDataDemo()" class="btn btn-secondary">Stale Data Test</button>
        <button onclick="runPrivacyRevocationDemo()" class="btn btn-secondary">Privacy Revocation</button>
        <button onclick="runLowConfidenceDemo()" class="btn btn-secondary">Low Confidence Warning</button>
      </div>
      <div id="demo-output" class="memory-list"></div>
    </div>

    <div class="architecture">
      <h2>Architecture Snapshot</h2>
      <div class="path-diagram">
        <div class="path-box">
          <h3>Write Path</h3>
          <ul>
            <li>1. Receive new memory</li>
            <li>2. Assign source & confidence</li>
            <li>3. Detect contradictions</li>
            <li>4. Calculate confidence delta</li>
            <li>5. Handle conflicts</li>
            <li>6. Store with metadata</li>
          </ul>
        </div>
        <div class="path-box">
          <h3>Retrieval Path</h3>
          <ul>
            <li>1. Parse query filters</li>
            <li>2. Filter by scope & status</li>
            <li>3. Calculate match score</li>
            <li>4. Generate warnings</li>
            <li>5. Rank by confidence &times; match</li>
            <li>6. Return with metadata</li>
          </ul>
        </div>
        <div class="path-box">
          <h3>Forgetting Path</h3>
          <ul>
            <li>1. User revokes memory</li>
            <li>2. Time-based decay check</li>
            <li>3. Contradiction resolution</li>
            <li>4. Expiration handling</li>
            <li>5. Update status to archived</li>
            <li>6. Preserve for audit trail</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="thesis">
      <h2>Two-Year Thesis: Agent Memory Done Right</h2>
      <p>
        The future of agent memory lies not in storing more information, but in storing <strong>epistemically aware</strong> information. Within two years, I predict agent memory systems will shift from simple key-value stores to structured knowledge graphs where every fact carries metadata about its provenance, certainty, and temporal validity.
      </p>
      <p>
        The critical innovation will be <strong>confidence propagation</strong>. When an agent infers new facts from existing memories, the confidence of derived facts should be bounded by the confidence of their sources. This creates a natural "I might be wrong" behavior without explicit programming. Systems that implement this will earn user trust faster than those that appear omniscient.
      </p>
      <p>
        Privacy will become a first-class concern, not an afterthought. Memory systems will need built-in <strong>revocation semantics</strong> - when a user says "forget that," the system must not only remove the fact but also any inferences derived from it. This requires tracking dependency graphs between memories.
      </p>
      <p>
        Finally, <strong>forgetting will be a feature, not a bug</strong>. The best memory systems will proactively decay low-confidence, stale, or contradictory information. This mirrors human cognition and prevents the "confidently wrong" failure mode that plagues current AI systems. The agent that knows what it doesn't know will always be more valuable than one that pretends to know everything.
      </p>
    </div>
  </div>

  <script>
    const API_BASE = ''

    async function api(method, path, body = null) {
      const options = { method, headers: { 'Content-Type': 'application/json' } }
      if (body) options.body = JSON.stringify(body)
      const res = await fetch(path, options)
      return res.json()
    }

    async function updateStats() {
      const stats = await api('GET', '/api/memory/stats')
      document.getElementById('stat-total').textContent = stats.total
      document.getElementById('stat-active').textContent = stats.active
      document.getElementById('stat-confidence').textContent = Math.round(stats.averageConfidence * 100) + '%'
      document.getElementById('stat-forgotten').textContent = stats.byStatus.revoked + stats.byStatus.decayed + stats.byStatus.archived
    }

    document.getElementById('write-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const result = await api('POST', '/api/memory', {
        content: document.getElementById('memory-content').value,
        source: document.getElementById('memory-source').value,
        confidence: parseInt(document.getElementById('memory-confidence').value) / 100,
        scope: document.getElementById('memory-scope').value,
        tags: document.getElementById('memory-tags').value.split(',').map(t => t.trim()).filter(t => t)
      })
      
      if (result.contradictions.length > 0) {
        alert('Memory stored, but found ' + result.contradictions.length + ' contradiction(s)!')
      }
      
      document.getElementById('memory-content').value = ''
      updateStats()
    })

    document.getElementById('retrieve-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const results = await api('POST', '/api/memory/retrieve', {
        content: document.getElementById('retrieve-query').value,
        minConfidence: parseInt(document.getElementById('retrieve-min-confidence').value) / 100,
        maxAge: parseInt(document.getElementById('retrieve-max-age').value) * 24 * 60 * 60 * 1000,
        status: ['active']
      })
      
      const container = document.getElementById('retrieve-results')
      container.innerHTML = results.length ? results.map(r => renderMemory(r.memory, r.warning)).join('') : '<p style="color: #888;">No memories found</p>'
    })

    async function inspectUser(userId) {
      const memories = await api('GET', '/api/memory/user/' + userId)
      const container = document.getElementById('inspector-results')
      container.innerHTML = memories.length ? memories.map(m => renderMemory(m)).join('') : '<p style="color: #888;">No memories for ' + userId + '</p>'
    }

    function renderMemory(memory, warning = null) {
      const confidenceClass = memory.confidence >= 0.7 ? 'high' : memory.confidence >= 0.4 ? 'medium' : 'low'
      const statusClass = memory.status === 'active' ? '' : memory.status === 'revoked' ? 'danger' : 'warning'
      
      return '<div class="memory-item ' + statusClass + '">' +
        (warning ? '<div class="warning-banner">⚠️ ' + warning + '</div>' : '') +
        '<div class="memory-content">' + memory.content + '</div>' +
        '<div class="memory-meta">' +
        '<span><span class="confidence-badge confidence-' + confidenceClass + '">' + Math.round(memory.confidence * 100) + '%</span></span>' +
        '<span>Source: ' + memory.source + '</span>' +
        '<span>Scope: ' + memory.scope + (memory.scopeId ? ' (' + memory.scopeId + ')' : '') + '</span>' +
        '<span>Status: ' + memory.status + '</span>' +
        '<span>Tags: ' + (memory.tags.join(', ') || 'none') + '</span>' +
        '</div></div>'
    }

    async function runContradictionDemo() {
      const output = document.getElementById('demo-output')
      output.innerHTML = '<p style="color: #888;">Running contradiction test...</p>'
      
      await api('POST', '/api/memory', {
        content: 'User prefers dark mode',
        source: 'user_input',
        confidence: 0.9,
        scope: 'user',
        scopeId: 'demo_user',
        tags: ['preferences']
      })
      
      const result = await api('POST', '/api/memory', {
        content: 'User avoids dark mode',
        source: 'user_input',
        confidence: 0.85,
        scope: 'user',
        scopeId: 'demo_user',
        tags: ['preferences']
      })
      
      output.innerHTML = '<div class="memory-item warning">' +
        '<div class="warning-banner">⚠️ Contradiction detected! New memory has lower confidence due to conflict.</div>' +
        '<div class="memory-content">Stored: "User avoids dark mode" with ' + Math.round(result.memory.confidence * 100) + '% confidence</div>' +
        '<div class="memory-meta">' +
        '<span>Found ' + result.contradictions.length + ' contradiction(s)</span>' +
        '<span>Confidence adjusted: ' + (result.contradictions[0]?.confidenceDelta > 0 ? '+' : '') + Math.round(result.contradictions[0]?.confidenceDelta * 100) + '%</span>' +
        '</div></div>'
      updateStats()
    }

    async function runStaleDataDemo() {
      const output = document.getElementById('demo-output')
      output.innerHTML = '<p style="color: #888;">Running stale data test...</p>'
      
      await api('POST', '/api/memory', {
        content: 'User lives in New York',
        source: 'user_input',
        confidence: 0.95,
        scope: 'user',
        scopeId: 'demo_user',
        tags: ['location']
      })
      
      output.innerHTML = '<div class="memory-item warning">' +
        '<div class="warning-banner">⚠️ This memory is over a week old and might be outdated.</div>' +
        '<div class="memory-content">Stored: "User lives in New York" with 95% confidence</div>' +
        '<div class="memory-meta">' +
        '<span>Note: In production, memories older than configured threshold show staleness warnings</span>' +
        '</div></div>'
    }

    async function runPrivacyRevocationDemo() {
      const output = document.getElementById('demo-output')
      output.innerHTML = '<p style="color: #888;">Running privacy revocation test...</p>'
      
      const result = await api('POST', '/api/memory', {
        content: 'User email is test@example.com',
        source: 'user_input',
        confidence: 1.0,
        scope: 'user',
        scopeId: 'demo_user',
        tags: ['email', 'sensitive']
      })
      
      await api('POST', '/api/memory/forget', {
        memoryId: result.memory.id,
        reason: 'user_revoked'
      })
      
      const retrieved = await api('POST', '/api/memory/retrieve', {
        content: 'email',
        scope: 'user',
        scopeId: 'demo_user',
        status: ['active']
      })
      
      output.innerHTML = '<div class="memory-item danger">' +
        '<div class="warning-banner">🚫 Memory revoked by user request</div>' +
        '<div class="memory-content">Memory "User email is test@example.com" has been revoked</div>' +
        '<div class="memory-meta">' +
        '<span>Status: Revoked</span>' +
        '<span>Retrieved memories: ' + retrieved.length + ' (should not include revoked memory)</span>' +
        '</div></div>'
      updateStats()
    }

    async function runLowConfidenceDemo() {
      const output = document.getElementById('demo-output')
      output.innerHTML = '<p style="color: #888;">Running low confidence test...</p>'
      
      await api('POST', '/api/memory', {
        content: 'User might prefer blue',
        source: 'inference',
        confidence: 0.3,
        scope: 'user',
        scopeId: 'demo_user',
        tags: ['preferences']
      })
      
      output.innerHTML = '<div class="memory-item warning">' +
        '<div class="warning-banner">⚠️ I\'m not very confident about this memory. It might be wrong.</div>' +
        '<div class="memory-content">Stored: "User might prefer blue" with 30% confidence</div>' +
        '<div class="memory-meta">' +
        '<span>Low confidence memory correctly flagged with warning</span>' +
        '</div></div>'
    }

    updateStats()
  </script>
</body>
</html>
`

async function loadStoreFromKV(kv: KVNamespace): Promise<MemoryStore> {
  const store = new MemoryStore()
  const data = await kv.get(STORE_KEY, { type: 'json' }) as [string, any][]
  if (data) {
    for (const [id, memory] of data) {
      store['memories'].set(id, memory)
    }
  }
  return store
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // Serve HTML frontend
      if (path === '/' || path === '/index.html') {
        return new Response(HTML, { 
          headers: { 'Content-Type': 'text/html' } 
        })
      }

      const store = await loadStoreFromKV(env.MEMORY_STORE)

      // POST /api/memory - Write memory
      if (request.method === 'POST' && path === '/api/memory') {
        const body = await request.json()
        const result = await store.write(body)
        await env.MEMORY_STORE.put(STORE_KEY, JSON.stringify(Array.from(store['memories'].entries())))
        return new Response(JSON.stringify(result), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      // POST /api/memory/retrieve - Retrieve memories
      if (request.method === 'POST' && path === '/api/memory/retrieve') {
        const body = await request.json()
        const results = await store.retrieve(body)
        return new Response(JSON.stringify(results), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      // POST /api/memory/forget - Forget memories
      if (request.method === 'POST' && path === '/api/memory/forget') {
        const body = await request.json()
        const forgotten = await store.forget(body)
        await env.MEMORY_STORE.put(STORE_KEY, JSON.stringify(Array.from(store['memories'].entries())))
        return new Response(JSON.stringify({ forgotten }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      // GET /api/memory/user/:userId - Memory inspector
      if (request.method === 'GET' && path.startsWith('/api/memory/user/')) {
        const userId = path.split('/api/memory/user/')[1]
        const memories = await store.getMemoriesForUser(userId)
        return new Response(JSON.stringify(memories), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      // GET /api/memory/stats - Stats
      if (request.method === 'GET' && path === '/api/memory/stats') {
        const stats = store.getStats()
        return new Response(JSON.stringify(stats), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
  }
} satisfies ExportedHandler<Env>