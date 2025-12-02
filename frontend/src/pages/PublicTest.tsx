import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { getPublicTest, submitPublicTest } from '../services/publicTestService'
import type { PublicTest } from '../services/publicTestService'

export default function PublicTest() {
	const { link } = useParams<{ link: string }>()
	const navigate = useNavigate()
	const { success, error: showError } = useToast()

	const [test, setTest] = useState<PublicTest['test'] | null>(null)
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [currentQuestion, setCurrentQuestion] = useState(0)
	const [answers, setAnswers] = useState<(number | null)[]>([])
	const [studentData, setStudentData] = useState({
		name: '',
		surname: '',
		className: '',
	})
	const [showStudentForm, setShowStudentForm] = useState(true)
	const [result, setResult] = useState<any>(null)

	useEffect(() => {
		fetchTest()
	}, [link])

	const fetchTest = async () => {
		if (!link) return
		setLoading(true)
		try {
			const data = await getPublicTest(link)
			if (data.ok && data.test) {
				setTest(data.test)
				setAnswers(new Array(data.test.questions.length).fill(null))
			} else {
				// Backend may return { ok: false, message }
				// PublicTest type includes optional message
				showError((data as any).message || 'Test nie znaleziony')
				setTimeout(() => navigate('/'), 2000)
			}
		} catch (err) {
			showError('Błąd ładowania testu')
			setTimeout(() => navigate('/'), 2000)
		} finally {
			setLoading(false)
		}
	}

	const handleStartTest = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!studentData.name || !studentData.surname || !studentData.className) {
			showError('Wszystkie pola są wymagane')
			return
		}
		setShowStudentForm(false)
	}

	const handleAnswer = (questionIndex: number, answerIndex: number) => {
		const newAnswers = [...answers]
		newAnswers[questionIndex] = answerIndex
		setAnswers(newAnswers)
	}

	const handleSubmit = async () => {
		if (answers.includes(null)) {
			showError('Odpowiedz na wszystkie pytania')
			return
		}

		setSubmitting(true)
		try {
			const response = await submitPublicTest(link || '', {
				...studentData,
				answers: answers as number[],
			})

			if (response.ok) {
				setResult(response)
				success(`Wynik: ${response.score}/${response.total} (${response.percentage}%)`)
			} else {
				showError((response as any).message || 'Błąd przy wysyłaniu testu')
			}
		} catch (err) {
			let errorMessage = 'Błąd przy wysyłaniu testu'
			if (typeof err === 'object' && err !== null && 'response' in err) {
				const apiError = err as any
				errorMessage = apiError.response?.data?.message || errorMessage
			}
			showError(errorMessage)
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
				<div className="text-lg text-gray-600">Ładowanie testu...</div>
			</div>
		)
	}

	if (!test) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
				<div className="text-lg text-red-600">Test nie znaleziony</div>
			</div>
		)
	}

	if (result) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">Test ukończony!</h2>
					<div className="mb-6">
						<div className="text-5xl font-bold text-indigo-600 mb-2">
							{result.score}/{result.total}
						</div>
						<div className="text-2xl font-semibold text-gray-700">{result.percentage}%</div>
					</div>
					<p className="text-gray-600 mb-6">
						Dziękujemy {studentData.name} {studentData.surname} za wypełnienie testu!
					</p>
					<button
						onClick={() => navigate('/')}
						className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
						Powrót do strony głównej
					</button>
				</div>
			</div>
		)
	}

	if (showStudentForm) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">Zanim zaczniesz test</h2>
					<form onSubmit={handleStartTest} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
							<input
								type="text"
								value={studentData.name}
								onChange={e => setStudentData({ ...studentData, name: e.target.value })}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="Twoje imię"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
							<input
								type="text"
								value={studentData.surname}
								onChange={e => setStudentData({ ...studentData, surname: e.target.value })}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="Twoje nazwisko"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Klasa</label>
							<input
								type="text"
								value={studentData.className}
								onChange={e => setStudentData({ ...studentData, className: e.target.value })}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="np. 1A"
								required
							/>
						</div>
						<button
							type="submit"
							className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">
							Rozpocznij test
						</button>
					</form>
				</div>
			</div>
		)
	}

	const question = test.questions[currentQuestion]

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
			<div className="max-w-2xl mx-auto px-4">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
					<p className="text-gray-600 mb-4">{test.description}</p>
					<div className="flex items-center justify-between text-sm text-gray-600">
						<span>
							Pytanie {currentQuestion + 1} z {test.questions.length}
						</span>
						<div className="w-64 bg-gray-200 rounded-full h-2">
							<div
								className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
								style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}
							/>
						</div>
					</div>
				</div>

				{/* Question */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h2 className="text-xl font-bold text-gray-900 mb-6">{question.questionText}</h2>

					{/* Answers */}
					<div className="space-y-3">
						{question.answers.map((answer, idx) => (
							<button
								key={idx}
								onClick={() => handleAnswer(currentQuestion, idx)}
								className={`w-full p-4 text-left border-2 rounded-lg transition ${
									answers[currentQuestion] === idx
										? 'border-indigo-600 bg-indigo-50'
										: 'border-gray-200 bg-white hover:border-indigo-300'
								}`}>
								<div className="flex items-center gap-3">
									<div
										className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
											answers[currentQuestion] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
										}`}>
										{answers[currentQuestion] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
									</div>
									<span className="text-gray-900 font-medium">{answer}</span>
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Navigation */}
				<div className="flex gap-4 justify-between">
					<button
						onClick={() => setCurrentQuestion(currentQuestion - 1)}
						disabled={currentQuestion === 0}
						className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition">
						← Poprzednie
					</button>

					{currentQuestion === test.questions.length - 1 ? (
						<button
							onClick={handleSubmit}
							disabled={submitting || answers.includes(null)}
							className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold">
							{submitting ? 'Wysyłam...' : 'Wyślij test'}
						</button>
					) : (
						<button
							onClick={() => setCurrentQuestion(currentQuestion + 1)}
							className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
							Następne →
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
