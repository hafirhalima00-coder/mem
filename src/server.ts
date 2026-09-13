import express from 'express'
import { MemoryStore } from './core/MemoryStore'
import path from 'path'

const app = express()
const port = 3000
const memoryStore = new MemoryStore()

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// API: Write new memory
app.post('/api/memory', async (req, res) => {
  try {
    const result = await memoryStore.write(req.body)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to write memory' })
  }
})

// API: Retrieve memories
app.post('/api/memory/retrieve', async (req, res) => {
  try {
    const results = await memoryStore.retrieve(req.body)
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve memories' })
  }
})

// API: Forget memories
app.post('/api/memory/forget', async (req, res) => {
  try {
    const forgotten = await memoryStore.forget(req.body)
    res.json({ forgotten })
  } catch (error) {
    res.status(500).json({ error: 'Failed to forget memories' })
  }
})

// API: Get memories for user (memory inspector)
app.get('/api/memory/user/:userId', async (req, res) => {
  try {
    const memories = await memoryStore.getMemoriesForUser(req.params.userId)
    res.json(memories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user memories' })
  }
})

// API: Get stats
app.get('/api/memory/stats', (req, res) => {
  try {
    const stats = memoryStore.getStats()
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(port, () => {
  console.log(`Memory Layer server running at http://localhost:${port}`)
})
