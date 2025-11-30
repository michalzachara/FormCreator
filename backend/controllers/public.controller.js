import Test from '../models/test.model.js'
import Question from '../models/question.model.js'
import Answer from '../models/answer.model.js'

export const getLink = async (req, res) => {
	const { link } = req.params

	try {
		if (!link || link.length < 10) {
			return res.status(400).json({ ok: false, message: 'Niepoprawny format linku' })
		}

		const test = await Test.findOne({ uniqueLink: link, isActive: true })
			.populate({ path: 'questions', options: { sort: { order: 1 } } })
			.lean()

		if (!test) {
			return res.status(404).json({ ok: false, message: 'Test nie znaleziony lub nieaktywny' })
		}

		const safeQuestions = (test.questions || []).map(q => {
			const { correctAnswers, __v, ...rest } = q
			return rest
		})

		return res.json({
			ok: true,
			test: {
				_id: test._id,
				title: test.title,
				description: test.description,
				uniqueLink: test.uniqueLink,
				questions: safeQuestions,
			},
		})
	} catch (err) {
		console.error('Error in getLink:', err)
		return res.status(500).json({ ok: false, message: 'Błąd serwera' })
	}
}

export const getResult = async (req, res) => {
	const { link } = req.params
	const { name, surname, className, answers } = req.body

	if (!name || !surname || !className || !Array.isArray(answers)) {
		return res.status(400).json({ ok: false, message: 'Niepoprawne dane zgłoszenia' })
	}

	if (name.trim().length < 2 || surname.trim().length < 2) {
		return res.status(400).json({ ok: false, message: 'Imię i nazwisko muszą mieć minimum 2 znaki' })
	}

	if (answers.length === 0) {
		return res.status(400).json({ ok: false, message: 'Brak odpowiedzi' })
	}

	try {
		const test = await Test.findOne({ uniqueLink: link, isActive: true })
			.populate({
				path: 'questions',
				options: { sort: { order: 1 } },
			})
			.lean()

		if (!test) {
			return res.status(404).json({ ok: false, message: 'Test nie znaleziony lub nieaktywny' })
		}

		const questions = test.questions || []

		if (answers.length !== questions.length) {
			return res.status(400).json({
				ok: false,
				message: `Liczba odpowiedzi (${answers.length}) nie zgadza się z liczbą pytań (${questions.length})`,
			})
		}

		let score = 0
		const detailedAnswers = []

		for (let i = 0; i < questions.length; i++) {
			const question = questions[i]
			const correctAnswers = Array.isArray(question.correctAnswers) ? question.correctAnswers : []
			const correctIndices = correctAnswers.map(v => Number(v))
			const givenAnswer = Number(answers[i])

			const isCorrect = correctIndices.includes(givenAnswer)
			if (isCorrect) score += 1

			detailedAnswers.push({
				questionId: question._id,
				givenAnswer,
				isCorrect,
			})
		}

		const existingAnswer = await Answer.findOne({
			testId: test._id,
			studentName: name.trim(),
			studentSurname: surname.trim(),
			studentClass: className.trim(),
		})

		if (existingAnswer) {
			return res.status(409).json({
				ok: false,
				message: 'Już wypełniłeś ten test. Skontaktuj się z nauczycielem jeśli to błąd.',
			})
		}

		const answer = new Answer({
			testId: test._id,
			studentName: name.trim(),
			studentSurname: surname.trim(),
			studentClass: className.trim(),
			answers,
			score,
		})

		await answer.save()

		return res.status(201).json({
			ok: true,
			score,
			total: questions.length,
			percentage: Math.round((score / questions.length) * 100),
			answerId: answer._id,
		})
	} catch (err) {
		console.error('Error in getResult:', err)
		return res.status(500).json({ ok: false, message: 'Błąd serwera' })
	}
}
