import express from 'express'
import { allTests, createTest, deleteTest, editTest, getTest } from '../controllers/test.controller.js'
import { verifyToken } from '../middleware/auth.js'
import { addQuestion } from '../controllers/question.controller.js'
import { getAnswers } from '../controllers/answer.controller.js'

const router = express.Router()

router.post('/new', verifyToken, createTest)
router.get('/all', verifyToken, allTests)
router.get('/:id', verifyToken, getTest)
router.put('/:id', verifyToken, editTest)
router.delete('/:id', verifyToken, deleteTest)

//add question
router.post('/:id/questions', verifyToken, addQuestion)

//get submissions
router.get('/:id/submission', verifyToken, getAnswers)

export default router
