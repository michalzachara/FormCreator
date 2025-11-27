import express from 'express'
import { allTests, createTest, deleteTest, editTest, getTest } from '../controllers/test.controller.js'
import { verifyToken } from '../middleware/token.js'

const router = express.Router()

router.post('/new', verifyToken, createTest)
router.get('/all', verifyToken, allTests)
router.get('/:id', verifyToken, getTest)
router.put('/:id', verifyToken, editTest)
router.delete('/:id', verifyToken, deleteTest)

export default router
