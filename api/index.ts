import express from 'express'
import { MemoryStore } from '../src/core/MemoryStore'
import { VercelRequest, VercelResponse } from '@vercel/node'

const app = express()
const memoryStore = new MemoryStore()

app.use(express.json())

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  next()
})

// POST /api/memory - Write memory
app.post('/api/memory', async (req, res) => {
  try {
    const result = await memoryStore.write(req.body)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to write memory' })
  }
})

// POST /api/memory/retrieve - Retrieve memories
app.post('/api/memory/retrieve', async (req, res) => {
  try {
    const results = await memoryStore.retrieve(req.body)
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve memories' })
  }
})

// POST /api/memory/forget - Forget memories
app.post('/api/memory/forget', async (req, res) => {
  try {
    const forgotten = await memoryStore.forget(req.body)
    res.json({ forgotten })
  } catch (error) {
    res.status(500).json({ error: 'Failed to forget memories' })
  }
})

// GET /api/memory/user/:userId - Memory inspector
app.get('/api/memory/user/:userId', async (req, res) => {
  try {
    const memories = await memoryStore.getMemoriesForUser(req.params.userId)
    res.json(memories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user memories' })
  }
})

// GET /api/memory/stats - Stats
app.get('/api/memory/stats', (req, res) => {
  try {
    const stats = memoryStore.getStats()
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Export for Vercel
export default app