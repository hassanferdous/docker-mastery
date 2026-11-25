const express = require('express')
const {Pool} = require('pg')
const {createClient} = require('redis')

const PORT = process.env.PORT || 8000
const DATABASE_URL = process.env.DATABASE_URL
const REDIS_URL = process.env.REDIS_URL

if (!DATABASE_URL || !REDIS_URL) {
	console.error('DATABASE_URL and REDIS_URL must be set')
	process.exit(1)
}

const db = new Pool({connectionString: DATABASE_URL})
const redis = createClient({url: REDIS_URL})
redis.on('error', (err) => console.error('Redis error:', err.message))

const app = express()
app.use(express.json())

app.get('/health', async (req, res) => {
	try {
		await db.query('SELECT 1')
		await redis.ping()
		res.json({status: 'ok', postgres: 'up', redis: 'up'})
	} catch (err) {
		res.status(503).json({status: 'error', message: err.message})
	}
})

app.get('/visits', async (req, res) => {
	const visits = await redis.incr('visits')
	res.json({visits})
})

app.get('/notes', async (req, res) => {
	const {rows} = await db.query(
		'SELECT id, text, created_at FROM notes ORDER BY id DESC',
	)
	res.json(rows)
})

app.post('/notes', async (req, res) => {
	const text = req.body?.text?.trim()
	if (!text) return res.status(400).json({error: 'text is required'})

	const {rows} = await db.query(
		'INSERT INTO notes (text) VALUES ($1) RETURNING id, text, created_at',
		[text],
	)
	res.status(201).json(rows[0])
})

async function start() {
	await redis.connect()
	await db.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

	app.listen(PORT, () => console.log(`API listening on port ${PORT}`))
}

start().catch((err) => {
	console.error('Failed to start:', err.message)
	process.exit(1)
})
