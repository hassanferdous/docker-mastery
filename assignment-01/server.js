const express = require('express')
const pg = require('pg')

const app = express()

const pool = new pg.Pool({
	connectionString: process.env.DB_URI,
})

const connectToDatabase = () => {
	pool.query('SELECT NOW()')
		.then(() => console.log('Database connected'))
		.catch((err) => console.error('Database connection error:', err))
}

connectToDatabase()

const router = express.Router()

router.get('/', (req, res) => {
	res.send('Hello World!')
})

router.get('/health', (req, res) => {
	res.send('OK')
})

app.use('/api', router)

const PORT = 8000
app.listen(PORT, () => {
	connectToDatabase()
	console.log(`Server is running on port ${PORT}`)
})
