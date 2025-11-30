import express from 'express'
import { deleteQuestion, editQuestion } from '../controllers/question.controller.js'
import { verifyToken } from '../middleware/auth.js'


const router = express.Router()

router.put('/:id', verifyToken, editQuestion)
router.delete('/:id', verifyToken, deleteQuestion)

export default router
