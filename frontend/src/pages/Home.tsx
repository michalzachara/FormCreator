import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { getAllTests, createTest, deleteTest, updateTest, type Test } from '../services/testService'

export default function Home() {
	const [tests, setTests] = useState<Test[]>([])
	const [loading, setLoading] = useState(true)
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [createLoading, setCreateLoading] = useState(false)
	const [formData, setFormData] = useState({ title: '', description: '' })
	const [showEditModal, setShowEditModal] = useState(false)
	const [editingTest, setEditingTest] = useState<Test | null>(null)
	const [editForm, setEditForm] = useState({ title: '', description: '', isActive: true })

	const navigate = useNavigate()
	const { user, logout, isLoading } = useAuth()
	const { success, error: showError } = useToast()

	useEffect(() => {
		// Wait until auth provider finishes loading stored session
		if (isLoading) return
		if (!user) {
			navigate('/login')
			return
		}
		fetchTests()
	}, [user, isLoading, navigate])

	const fetchTests = async () => {
		setLoading(true)
		try {
			const data = await getAllTests()
			setTests(data)
		} catch (err) {
			let errorMessage = 'Błąd ładowania testów'
			if (typeof err === 'object' && err !== null && 'response' in err) {
				const apiError = err as any
				errorMessage = apiError.response?.data?.message || errorMessage
			}
			showError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	const handleCreateTest = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.title || !formData.description) {
			showError('Wszystkie pola są wymagane')
			return
		}

		setCreateLoading(true)
		try {
			const newTest = await createTest({
				title: formData.title,
				description: formData.description,
			})
			success(`Test "${newTest.title}" został utworzony pomyślnie`)
			setTests([newTest, ...tests])
			setFormData({ title: '', description: '' })
			setShowCreateModal(false)
		} catch (err) {
			let errorMessage = 'Błąd przy tworzeniu testu'
			if (typeof err === 'object' && err !== null && 'response' in err) {
				const apiError = err as any
				errorMessage = apiError.response?.data?.message || errorMessage
			}
			showError(errorMessage)
		} finally {
			setCreateLoading(false)
		}
	}

	const handleDeleteTest = async (testId: string, testTitle: string) => {
		if (window.confirm(`Czy na pewno chcesz usunąć test "${testTitle}"?`)) {
			try {
				await deleteTest(testId)
				success('Test został usunięty pomyślnie')
				setTests(tests.filter(t => t._id !== testId))
			} catch (err) {
				let errorMessage = 'Błąd przy usuwaniu testu'
				if (typeof err === 'object' && err !== null && 'response' in err) {
					const apiError = err as any
					errorMessage = apiError.response?.data?.message || errorMessage
				}
				showError(errorMessage)
			}
		}
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
			{/* Navigation */}
			<nav className="bg-white shadow-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<h1 className="text-2xl font-bold text-indigo-600">FormCreator</h1>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-gray-700">
								{user?.name} {user?.surname}
							</span>
							<button
								onClick={logout}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition">
								Wyloguj się
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<h2 className="text-3xl font-bold text-gray-900">Moje Testy</h2>
					<button
						onClick={() => setShowCreateModal(true)}
						className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
						+ Nowy Test
					</button>
				</div>

				{/* Create Modal */}
				{showCreateModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
							<h3 className="text-2xl font-bold text-gray-900 mb-4">Utwórz nowy test</h3>
							<form onSubmit={handleCreateTest} className="space-y-4">
								<div>
									<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
										Tytuł
									</label>
									<input
										id="title"
										type="text"
										value={formData.title}
										onChange={e => setFormData({ ...formData, title: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
										placeholder="np. Matematyka - Rachunek"
										required
										disabled={createLoading}
									/>
								</div>
								<div>
									<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
										Opis
									</label>
									<textarea
										id="description"
										value={formData.description}
										onChange={e => setFormData({ ...formData, description: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
										placeholder="Opisz test..."
										rows={3}
										required
										disabled={createLoading}
									/>
								</div>
								<div className="flex gap-3 justify-end">
									<button
										type="button"
										onClick={() => {
											setShowCreateModal(false)
											setFormData({ title: '', description: '' })
										}}
										disabled={createLoading}
										className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
										Anuluj
									</button>
									<button
										type="submit"
										disabled={createLoading}
										className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
										{createLoading ? 'Tworzę...' : 'Utwórz'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Edit Test Modal */}
				{showEditModal && editingTest && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
							<h3 className="text-2xl font-bold text-gray-900 mb-4">Edytuj test</h3>
							<form
								onSubmit={async e => {
									e.preventDefault()
									try {
										const updated = await updateTest(editingTest._id, {
											title: editForm.title,
											description: editForm.description,
											isActive: editForm.isActive,
										})
										setTests(tests.map(t => (t._id === updated._id ? updated : t)))
										setShowEditModal(false)
										setEditingTest(null)
										success('Test został zaktualizowany')
									} catch (err) {
										let msg = 'Błąd przy aktualizacji testu'
										if (typeof err === 'object' && err !== null && 'response' in err) {
											const apiErr = err as any
											msg = apiErr.response?.data?.message || msg
										}
										showError(msg)
									}
								}}
								className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Tytuł</label>
									<input
										value={editForm.title}
										onChange={e => setEditForm({ ...editForm, title: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
									<textarea
										value={editForm.description}
										onChange={e => setEditForm({ ...editForm, description: e.target.value })}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg"
										rows={3}
										required
									/>
								</div>
								<div className="flex items-center gap-3">
									<label className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={editForm.isActive}
											onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
											className="w-5 h-5"
										/>
										<span>Test aktywny</span>
									</label>
									<div className="ml-auto flex gap-2">
										<button
											type="button"
											onClick={() => {
												setShowEditModal(false)
												setEditingTest(null)
											}}
											className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg">
											Anuluj
										</button>
										<button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
											Zapisz
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Tests Grid */}
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<div className="text-gray-600">Ładowanie testów...</div>
					</div>
				) : tests.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-gray-600 mb-4">Nie masz jeszcze żadnych testów</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
							Utwórz swój pierwszy test
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{tests.map(test => (
							<div
								key={test._id}
								className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 cursor-pointer"
								onClick={() => navigate(`/test/${test._id}/builder`)}
								role="button"
								tabIndex={0}>
								<h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
								<p className="text-gray-600 mb-4 line-clamp-3">{test.description}</p>
								<div className="mb-4 flex items-center gap-2">
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
										}`}>
										{test.isActive ? 'Aktywny' : 'Nieaktywny'}
									</span>
								</div>
								<div className="flex gap-2">
									<button
										onClick={e => {
											e.stopPropagation()
											setEditingTest(test)
											setEditForm({ title: test.title, description: test.description, isActive: test.isActive })
											setShowEditModal(true)
										}}
										className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
										Edytuj
									</button>
									<button
										onClick={e => {
											e.stopPropagation()
											handleDeleteTest(test._id, test.title)
										}}
										className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
										Usuń
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
