import Answer from '../models/answer.model.js'

export const getAnswers = async (req, res) => {
	const { id } = req.params

	try {
		const answers = await Answer.find({ testId: id })
			.populate('testId', 'title description uniqueLink')
			.sort({ submittedAt: -1 })

		if (!answers.length) {
			return res.status(404).json({ message: 'No answers found for this test.' })
		}

		res.status(200).json(answers)
	} catch (error) {
		console.error('Error fetching answers:', error)
		res.status(500).json({ message: 'Server error while fetching answers.' })
	}
}
