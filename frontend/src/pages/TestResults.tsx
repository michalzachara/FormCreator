import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { getAnswers } from '../services/answerService'
import type { Answer } from '../services/answerService'

export default function TestResults() {
	const { testId } = useParams<{ testId: string }>()
	const navigate = useNavigate()
	const { user, isLoading } = useAuth()
	const { error: showError } = useToast()

	const [answers, setAnswers] = useState<Answer[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (isLoading) return
		if (!user) {
			navigate('/login')
			return
		}
		fetchAnswers()
	}, [testId, user, isLoading, navigate])

	const fetchAnswers = async () => {
		if (!testId) return
		setLoading(true)
		try {
			const data = await getAnswers(testId)
			setAnswers(data)
		} catch (err) {
			showError('Błąd ładowania odpowiedzi')
			navigate('/')
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return <div className="flex justify-center items-center min-h-screen">Ładowanie...</div>
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
			<div className="max-w-6xl mx-auto px-4">
				{/* Header */}
				<div className="mb-8">
					<button onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-700 mb-4">
						← Wróć
					</button>
					<h1 className="text-3xl font-bold text-gray-900">Odpowiedzi uczniów</h1>
				</div>

				{/* Results Table */}
				{answers.length === 0 ? (
					<div className="bg-white rounded-lg shadow-md p-8 text-center">
						<p className="text-gray-600">Brak odpowiedzi dla tego testu</p>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow-md overflow-x-auto">
						<table className="w-full">
							<thead className="bg-indigo-50 border-b border-gray-200">
								<tr>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Imię i Nazwisko</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Klasa</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Wynik</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Procent</th>
									<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{answers.map(answer => (
									<tr key={answer._id} className="hover:bg-gray-50 transition">
										<td className="px-6 py-4 text-sm text-gray-900">
											{answer.studentName} {answer.studentSurname}
										</td>
										<td className="px-6 py-4 text-sm text-gray-600">{answer.studentClass}</td>
										<td className="px-6 py-4 text-sm">
											<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
												{answer.score}
											</span>
										</td>
										<td className="px-6 py-4 text-sm">
											<div className="flex items-center gap-2">
												<div className="w-20 bg-gray-200 rounded-full h-2">
													<div
														className={`h-2 rounded-full ${answer.score / 2 >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
														style={{ width: `${(answer.score / 2) * 100}%` }}
													/>
												</div>
												<span className="text-sm font-medium">{Math.round((answer.score / 2) * 100)}%</span>
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-gray-600">
											{new Date(answer.submittedAt).toLocaleDateString('pl-PL', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}
