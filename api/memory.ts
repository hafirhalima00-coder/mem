import { VercelRequest, VercelResponse } from '@vercel/node'
import { MemoryStore } from '../src/core/MemoryStore'

const memoryStore = new MemoryStore()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { method, body, query, url } = req
  const path = url || ''

  try {
    // Write memory: POST /api/memory
    if (method === 'POST' && (path === '/api/memory' || path.endsWith('/api/memory'))) {
      const result = await memoryStore.write(body)
      return res.status(200).json(result)
    }

    // Retrieve memories: POST /api/memory/retrieve
    if (method === 'POST' && (path === '/api/memory/retrieve' || path.endsWith('/api/memory/retrieve'))) {
      const results = await memoryStore.retrieve(body)
      return res.status(200).json(results)
    }

    // Forget memories: POST /api/memory/forget
    if (method === 'POST' && (path === '/api/memory/forget' || path.endsWith('/api/memory/forget'))) {
      const forgotten = await memoryStore.forget(body)
      return res.status(200).json({ forgotten })
    }

    // Memory inspector: GET /api/memory/user/:userId
    if (method === 'GET' && (path === '/api/memory/user/' || path.startsWith('/api/memory/user/'))) {
      const userId = path.split('/api/memory/user/')[1]
      const memories = await memoryStore.getMemoriesForUser(userId)
      return res.status(200).json(memories)
    }

    // Stats: GET /api/memory/stats
    if (method === 'GET' && (path === '/api/memory/stats' || path.endsWith('/api/memory/stats'))) {
      const stats = memoryStore.getStats()
      return res.status(200).json(stats)
    }

    return res.status(404).json({ error: 'Not found', path })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error', details: String(error) })
  }
}