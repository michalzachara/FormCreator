import Test from '../models/test.model.js'
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

export const getTest = async (req, res) => {
	const { id } = req.params

	try {
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ message: 'Invalid test ID format' })
		}

		const test = await Test.findOne({ _id: id }).populate({
			path: 'questions',
			options: { sort: { order: 1 } },
		})

		if (!test) {
			return res.status(404).json({ message: 'Test not found' })
		}

		if (test.userId.toString() !== req.user.id) {
			return res.status(403).json({ message: 'Access denied' })
		}

		return res.status(200).json(test)
	} catch (err) {
		console.error('Error fetching test:', err)
		return res.status(500).json({ message: 'Failed to fetch test' })
	}
}

export const editTest = async (req, res) => {
	const { id } = req.params
	const { title, description, isActive } = req.body

	try {
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ message: 'Invalid test ID format' })
		}

		const test = await Test.findById(id)
		if (!test) {
			return res.status(404).json({ message: 'Test not found' })
		}

		if (test.userId.toString() !== req.user.id) {
			return res.status(403).json({ message: 'Access denied' })
		}

		if (title !== undefined) test.title = title
		if (description !== undefined) test.description = description
		if (isActive !== undefined) test.isActive = isActive

		const updatedTest = await test.save()

		return res.status(200).json(updatedTest)
	} catch (err) {
		console.error('Error updating test:', err)
		return res.status(500).json({ message: 'Failed to update test' })
	}
}

export const deleteTest = async (req, res) => {
	const { id } = req.params

	try {
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({ message: 'Invalid test ID format' })
		}

		const test = await Test.findById(id)

		if (!test) {
			return res.status(404).json({ message: 'Test not found' })
		}

		if (test.userId.toString() !== req.user.id) {
			return res.status(403).json({ message: 'Access denied' })
		}

		await Test.findByIdAndDelete(id)

		return res.status(200).json({ message: 'Test deleted successfully' })
	} catch (err) {
		console.error('Error deleting test:', err)
		return res.status(500).json({ message: 'Failed to delete test' })
	}
}
