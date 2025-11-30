import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

import { connectToDb } from './config/db.js'
import authRouter from './routes/user.route.js'
import testRouter from './routes/test.route.js'
import questionRouter from './routes/question.route.js'
import publicRouter from './routes/public.route.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/test', testRouter)
app.use('/api/questions', questionRouter)
app.use('/api/public/test/:link', publicRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
	console.log('server dziala')
	connectToDb()
	console.log(`http://localhost:${PORT}/`)
})
