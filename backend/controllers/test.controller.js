import  Test  from '../models/test.model.js'
import crypto from 'crypto'

export const createTest = async (req, res) => {
	const { title, description } = req.body
	const userId = req.user.id

	try {
		const uniqueLink = crypto.randomUUID()

		const newTest = await Test.create({
			userId,
			title,
			description,
			uniqueLink,
		})

		return res.status(201).json(newTest)
	} catch (err) {
		console.error('Error creating test:', err)
		return res.status(500).json({ message: 'Failed to create test' })
	}
}

export const allTests = async (req, res) => {
	try {
		const tests = await Test.find({ userId: req.user.id }).sort({ createdAt: -1 })

		return res.status(200).json(tests)
	} catch (err) {
		console.error('Error fetching tests:', err)
		return res.status(500).json({ message: 'Failed to fetch tests' })
	}
}
