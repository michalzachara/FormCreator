import Submission from '../models/submission.model.js'

export const getSubmissions = async (req, res) => {
	const { id } = req.params

	try {
		const submissions = await Submission.find({ testId: id })
			.populate('testId', 'title description uniqueLink')
			.sort({ submittedAt: -1 })

		if (!submissions.length) {
			return res.status(404).json({ message: 'No submissions found for this test.' })
		}

		res.status(200).json(submissions)
	} catch (error) {
		console.error('Error fetching submissions:', error)
		res.status(500).json({ message: 'Server error while fetching submissions.' })
	}
}
