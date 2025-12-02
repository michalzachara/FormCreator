import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { getTestById, updateTest } from '../services/testService'
import { addQuestion, editQuestion, deleteQuestion, type Question } from '../services/questionService'
import type { Test } from '../services/testService'

export default function TestEditor() {
	const { testId } = useParams<{ testId: string }>()
	const navigate = useNavigate()
	const { user, isLoading } = useAuth()
	const { success, error: showError } = useToast()

	const [test, setTest] = useState<Test | null>(null)
	const [questions, setQuestions] = useState<Question[]>([])
	const [loading, setLoading] = useState(true)
	const [showQuestionModal, setShowQuestionModal] = useState(false)
	const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
	const [questionForm, setQuestionForm] = useState({
		questionText: '',
		answers: ['', '', '', ''],
		correctAnswers: [] as string[],
		order: 0,
	})

	useEffect(() => {
		if (isLoading) return
		if (!user) {
			navigate('/login')
			return
		}
		fetchTest()
	}, [testId, user, isLoading, navigate])

	const fetchTest = async () => {
		if (!testId) return
		setLoading(true)
		try {
			const data = await getTestById(testId)
			setTest(data)
			setQuestions(data.questions || [])
		} catch (err) {
			showError('Błąd ładowania testu')
			navigate('/')
		} finally {
			setLoading(false)
		}
	}

	const handleSaveTest = async () => {
		if (!test) return
		try {
			const updated = await updateTest(test._id, {
				title: test.title,
				description: test.description,
				isActive: test.isActive,
			})
			setTest(updated)
			success('Test został zaktualizowany')
		} catch (err) {
			let msg = 'Błąd przy aktualizacji testu'
			if (typeof err === 'object' && err !== null && 'response' in err) {
				const apiErr = err as any
				msg = apiErr.response?.data?.message || msg
			}
			showError(msg)
		}
	}

	const handleAddQuestion = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!test || !questionForm.questionText || questionForm.answers.some(a => !a)) {
			showError('Wszystkie pola są wymagane')
			return
		}

		try {
			const newQuestion = await addQuestion(test._id, {
				questionText: questionForm.questionText,
				media: [],
				answers: questionForm.answers,
				correctAnswers: questionForm.correctAnswers,
				order: questions.length,
			})
			setQuestions([...questions, newQuestion])
			success('Pytanie zostało dodane')
			resetForm()
		} catch (err) {
			showError('Błąd przy dodawaniu pytania')
		}
	}

	const handleEditQuestion = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingQuestion || !questionForm.questionText || questionForm.answers.some(a => !a)) {
			showError('Wszystkie pola są wymagane')
			return
		}

		try {
			const updated = await editQuestion(editingQuestion._id, {
				questionText: questionForm.questionText,
				media: [],
				answers: questionForm.answers,
				correctAnswers: questionForm.correctAnswers,
			})
			setQuestions(questions.map(q => (q._id === editingQuestion._id ? updated : q)))
			success('Pytanie zostało zaktualizowane')
			resetForm()
		} catch (err) {
			showError('Błąd przy aktualizacji pytania')
		}
	}

	const handleDeleteQuestion = async (questionId: string) => {
		if (window.confirm('Czy na pewno chcesz usunąć to pytanie?')) {
			try {
				await deleteQuestion(questionId)
				setQuestions(questions.filter(q => q._id !== questionId))
				success('Pytanie zostało usunięte')
			} catch (err) {
				showError('Błąd przy usuwaniu pytania')
			}
		}
	}

	const resetForm = () => {
		setQuestionForm({
			questionText: '',
			answers: ['', '', '', ''],
			correctAnswers: [],
			order: 0,
		})
		setEditingQuestion(null)
		setShowQuestionModal(false)
	}

	const openEditModal = (question: Question) => {
		setEditingQuestion(question)
		setQuestionForm({
			questionText: question.questionText,
			answers: question.answers,
			correctAnswers: question.correctAnswers,
			order: question.order,
		})
		setShowQuestionModal(true)
	}

	const toggleCorrectAnswer = (index: string) => {
		setQuestionForm(prev => ({
			...prev,
			correctAnswers: prev.correctAnswers.includes(index)
				? prev.correctAnswers.filter(a => a !== index)
				: [...prev.correctAnswers, index],
		}))
	}

	if (loading || !test) {
		return <div className="flex justify-center items-center min-h-screen">Ładowanie...</div>
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
			<div className="max-w-4xl mx-auto px-4">
				{/* Header */}
				<div className="mb-8">
					<button onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-700 mb-4">
						← Wróć
					</button>
					<div className="bg-white rounded-lg shadow-md p-6">
						<input
							type="text"
							value={test.title}
							onChange={e => setTest({ ...test, title: e.target.value })}
							className="text-3xl font-bold w-full mb-4 px-0 border-b-2 border-transparent hover:border-indigo-300 focus:border-indigo-500 outline-none"
						/>
						<textarea
							value={test.description}
							onChange={e => setTest({ ...test, description: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
							rows={3}
						/>
						<div className="flex gap-4 items-center">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={test.isActive}
									onChange={e => setTest({ ...test, isActive: e.target.checked })}
									className="mr-2 w-5 h-5"
								/>
								<span>Test aktywny</span>
							</label>
							<div className="ml-auto flex items-center gap-3">
								<button
									onClick={handleSaveTest}
									className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
									Zapisz test
								</button>

								{test.uniqueLink && (
									<div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
										<input
											type="text"
											readOnly
											value={`${window.location.origin}/public/${test.uniqueLink}`}
											className="w-80 bg-transparent text-sm text-gray-700 outline-none"
										/>
										<button
											onClick={async () => {
												try {
													await navigator.clipboard.writeText(`${window.location.origin}/public/${test.uniqueLink}`)
													success('Link skopiowany do schowka')
												} catch (err) {
													// fallback
													const el = document.createElement('input')
													el.value = `${window.location.origin}/public/${test.uniqueLink}`
													document.body.appendChild(el)
													el.select()
													document.execCommand('copy')
													document.body.removeChild(el)
													success('Link skopiowany do schowka')
												}
											}}
											className="px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-100">
											Kopiuj
										</button>
										<a
											href={`${window.location.origin}/public/${test.uniqueLink}`}
											target="_blank"
											rel="noreferrer"
											className="px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-100">
											Otwórz
										</a>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Questions Section */}
				<div>
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-gray-900">Pytania ({questions.length})</h2>
						<button
							onClick={() => {
								resetForm()
								setShowQuestionModal(true)
							}}
							className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
							+ Dodaj pytanie
						</button>
					</div>

					{/* Questions List */}
					{questions.length === 0 ? (
						<div className="bg-white rounded-lg shadow-md p-8 text-center">
							<p className="text-gray-600 mb-4">Brak pytań w tym teście</p>
							<button
								onClick={() => setShowQuestionModal(true)}
								className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
								Dodaj pierwsze pytanie
							</button>
						</div>
					) : (
						<div className="space-y-4">
							{questions.map(question => (
								<div key={question._id} className="bg-white rounded-lg shadow-md p-6">
									<h3 className="text-lg font-semibold mb-3">{question.questionText}</h3>
									<div className="space-y-2 mb-4">
										{question.answers.map((answer, idx) => (
											<div key={idx} className="flex items-center">
												<span
													className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center text-sm font-bold ${
														question.correctAnswers.includes(String(idx))
															? 'bg-green-500 text-white'
															: 'bg-gray-200 text-gray-700'
													}`}>
													{idx + 1}
												</span>
												<span>{answer}</span>
											</div>
										))}
									</div>
									<div className="flex gap-2 justify-end">
										<button
											onClick={() => openEditModal(question)}
											className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
											Edytuj
										</button>
										<button
											onClick={() => handleDeleteQuestion(question._id)}
											className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
											Usuń
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Question Modal */}
				{showQuestionModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<h3 className="text-2xl font-bold text-gray-900 mb-6">
									{editingQuestion ? 'Edytuj pytanie' : 'Dodaj nowe pytanie'}
								</h3>
								<form onSubmit={editingQuestion ? handleEditQuestion : handleAddQuestion} className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Treść pytania</label>
										<textarea
											value={questionForm.questionText}
											onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
											rows={2}
											placeholder="Wpisz pytanie..."
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Odpowiedzi</label>
										{questionForm.answers.map((answer, idx) => (
											<div key={idx} className="mb-3 p-3 border border-gray-200 rounded-lg">
												<div className="flex items-start gap-3">
													<div className="flex-1">
														<input
															type="text"
															value={answer}
															onChange={e => {
																const newAnswers = [...questionForm.answers]
																newAnswers[idx] = e.target.value
																setQuestionForm({ ...questionForm, answers: newAnswers })
															}}
															className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
															placeholder={`Odpowiedź ${idx + 1}`}
															required
														/>
													</div>
													<label className="flex items-center cursor-pointer">
														<input
															type="checkbox"
															checked={questionForm.correctAnswers.includes(String(idx))}
															onChange={() => toggleCorrectAnswer(String(idx))}
															className="w-5 h-5 text-green-600"
														/>
														<span className="ml-2 text-sm text-gray-700">Poprawna</span>
													</label>
												</div>
											</div>
										))}
									</div>

									<div className="flex gap-3 justify-end pt-4">
										<button
											type="button"
											onClick={resetForm}
											className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
											Anuluj
										</button>
										<button
											type="submit"
											className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
											{editingQuestion ? 'Zaktualizuj' : 'Dodaj'}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
