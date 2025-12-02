import { useState } from 'react'
import { addQuestion } from '../services/questionService'
import { useToast } from '../hooks/useToast'
import type { Question } from '../services/questionService'

interface BuilderProps {
	testId: string
	onClose: () => void
	onSaved?: () => void
	inline?: boolean
}

export default function FormBuilder({ testId, onClose, onSaved, inline = false }: BuilderProps) {
	const [questions, setQuestions] = useState<
		{
			questionText: string
			answers: string[]
			correctAnswers: string[]
		}[]
	>([{ questionText: '', answers: ['', ''], correctAnswers: [] }])

	const { success, error: showError } = useToast()
	const [saving, setSaving] = useState(false)

	const addNewQuestion = () => {
		setQuestions(prev => [...prev, { questionText: '', answers: ['', ''], correctAnswers: [] }])
	}

	const removeQuestion = (idx: number) => {
		setQuestions(prev => prev.filter((_, i) => i !== idx))
	}

	const updateQuestion = (
		idx: number,
		patch: Partial<{ questionText: string; answers: string[]; correctAnswers: string[] }>
	) => {
		setQuestions(prev => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
	}

	const addOption = (qIdx: number) => {
		setQuestions(prev => prev.map((q, i) => (i === qIdx ? { ...q, answers: [...q.answers, ''] } : q)))
	}

	const removeOption = (qIdx: number, optIdx: number) => {
		setQuestions(prev =>
			prev.map((q, i) => {
				if (i !== qIdx) return q
				const answers = q.answers.filter((_, a) => a !== optIdx)
				const correctAnswers = q.correctAnswers
					.filter(c => c !== String(optIdx))
					.map(c => {
						const n = Number(c)
						return n > optIdx ? String(n - 1) : String(n)
					})
				return { ...q, answers, correctAnswers }
			})
		)
	}

	const toggleCorrect = (qIdx: number, optIdx: number) => {
		setQuestions(prev =>
			prev.map((q, i) => {
				if (i !== qIdx) return q
				const idxStr = String(optIdx)
				return q.correctAnswers.includes(idxStr)
					? { ...q, correctAnswers: q.correctAnswers.filter(c => c !== idxStr) }
					: { ...q, correctAnswers: [...q.correctAnswers, idxStr] }
			})
		)
	}

	const handleSaveAll = async () => {
		setSaving(true)
		try {
			for (const q of questions) {
				if (!q.questionText || q.answers.some(a => !a) || q.correctAnswers.length === 0) {
					throw new Error('Uzupełnij wszystkie pytania, odpowiedzi i zaznacz co najmniej jedną poprawną odpowiedź')
				}
			}

			const created: Question[] = []
			for (const q of questions) {
				const createdQ = await addQuestion(testId, {
					questionText: q.questionText,
					media: [],
					answers: q.answers,
					correctAnswers: q.correctAnswers,
					order: 0,
				} as any)
				created.push(createdQ)
			}

			success('Pytania zostały zapisane')
			onSaved && onSaved()
			onClose()
		} catch (err) {
			if (err instanceof Error) showError(err.message)
			else showError('Błąd podczas zapisywania pytań')
		} finally {
			setSaving(false)
		}
	}

	const Inner = (
		<div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl relative z-10 overflow-y-auto max-h-[90vh] ring-1 ring-gray-100">
			<div className="flex items-center justify-between p-6 border-b">
				<div>
					<h2 className="text-2xl font-semibold text-indigo-700">Form</h2>
					<p className="text-sm text-gray-500 mt-1">
						Dodaj pytania
					</p>
				</div>
				<div className="flex gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:shadow-sm">
						Zamknij
					</button>
					<button
						onClick={handleSaveAll}
						disabled={saving}
						className="px-4 py-2 rounded-md text-white bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700">
						{saving ? 'Zapisuję...' : 'Zapisz pytania'}
					</button>
				</div>
			</div>

			<div className="p-6 space-y-6">
				{questions.map((q, qi) => (
					<div key={qi} className="bg-gray-50 p-5 rounded-xl shadow-sm">
						<div className="flex items-start gap-4">
							<div className="shrink-0">
								<div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
									{qi + 1}
								</div>
							</div>
							<div className="flex-1">
								<input
									value={q.questionText}
									onChange={e => updateQuestion(qi, { questionText: e.target.value })}
									placeholder={`Pytanie ${qi + 1}`}
									className="w-full text-lg font-medium mb-3 bg-white border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>

								<div className="space-y-3">
									{q.answers.map((a, ai) => (
										<div key={ai} className="flex items-center gap-3">
											<label className="flex items-center gap-3 w-full">
												<input
													type="checkbox"
													checked={q.correctAnswers.includes(String(ai))}
													onChange={() => toggleCorrect(qi, ai)}
													className="h-5 w-5 text-indigo-600 rounded border-gray-300"
												/>
												<input
													value={a}
													onChange={e => {
														const newAnswers = [...q.answers]
														newAnswers[ai] = e.target.value
														updateQuestion(qi, { answers: newAnswers })
													}}
													placeholder={`Opcja ${ai + 1}`}
													className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
												/>
											</label>
											<button
												onClick={() => removeOption(qi, ai)}
												className="text-sm text-red-600 px-3 py-1 rounded-md hover:bg-red-50">
												Usuń
											</button>
										</div>
									))}

									<div className="flex">
										<button
											onClick={() => addOption(qi)}
											className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-dashed border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
											<span className="text-green-600 font-bold">+</span> Dodaj opcję
										</button>
									</div>
								</div>
							</div>
							<div className="ml-4 shrink-0">
								<button
									onClick={() => removeQuestion(qi)}
									className="text-sm text-red-600 px-3 py-1 rounded-md hover:bg-red-50">
									Usuń pytanie
								</button>
							</div>
						</div>
					</div>
				))}

				<div className="pt-4">
					<button
						onClick={addNewQuestion}
						className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">
						<span className="text-xl">＋</span> Dodaj pytanie
					</button>
				</div>
			</div>
		</div>
	)

	if (inline) {
		return <div className="max-w-5xl mx-auto p-6">{Inner}</div>
	}

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center p-4">
			<div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
			{Inner}
		</div>
	)
}
