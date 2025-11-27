import express from 'express'
import dotenv from 'dotenv'
dotenv.config({ path: './' })


import { connectToDb } from './config/db.js'


const app = express()

app.get('/', (req, res) => {
	res.send('dziala')
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
	console.log('server dziala')
  connectToDb();
	console.log(`http://localhost:${PORT}/`)
})


