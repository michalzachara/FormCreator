import express from 'express'
import { getLink, getResult } from '../controllers/public.controller.js';

const router = express.Router();

router.get('/', getLink)
router.post('/result', getResult)

export default router