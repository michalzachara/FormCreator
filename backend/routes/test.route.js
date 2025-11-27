import express from 'express'
import { allTests, createTest, deleteTest, editTest, getTest } from '../controllers/test.controller.js'
import { verifyToken } from '../middleware/token.js'
import { addQuestion } from '../controllers/question.controller.js'
import { getSubmissions } from '../controllers/submission.controller.js'

const router = express.Router()

router.post('/new', verifyToken, createTest)
router.get('/all', verifyToken, allTests)
router.get('/:id', verifyToken, getTest)
router.put('/:id', verifyToken, editTest)
router.delete('/:id', verifyToken, deleteTest)

//add question
router.post('/:id/questions', verifyToken, addQuestion)

//get submissions
router.get('/:id/submission', verifyToken, getSubmissions)

export default router
