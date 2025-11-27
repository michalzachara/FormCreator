import express from 'express'
import { allTests, createTest } from '../controllers/test.controller.js'
import { verifyToken } from '../middleware/token.js'

const router = express.Router()

router.post('/new', verifyToken, createTest)
router.get('/all', verifyToken, allTests)

export default router
