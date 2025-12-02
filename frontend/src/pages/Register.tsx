import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/apiService'
import { useToast } from '../hooks/useToast'

export default function Register() {
	const [formData, setFormData] = useState({
		name: '',
		surname: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { success, error: showError } = useToast()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		// Walidacja
		if (!formData.name || !formData.surname || !formData.email || !formData.password) {
			setError('Wszystkie pola są wymagane')
			setLoading(false)
			return
		}

		if (formData.password.length < 6) {
			setError('Hasło musi mieć co najmniej 6 znaków')
			setLoading(false)
			return
		}

		if (formData.password !== formData.confirmPassword) {
			setError('Hasła się nie zgadzają')
			setLoading(false)
			return
		}

		try {
			const response = await registerUser({
				name: formData.name,
				surname: formData.surname,
				email: formData.email,
				password: formData.password,
			})
			success(response.message)
			navigate('/login')
		} catch (err) {
			let errorMessage = 'Coś poszło nie tak'
			if (err instanceof Error) {
				errorMessage = err.message
			} else if (typeof err === 'object' && err !== null && 'response' in err) {
				const apiError = err as any
				errorMessage = apiError.response?.data?.message || 'Błąd rejestracji'
			}
			setError(errorMessage)
			showError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-xl p-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Rejestracja</h2>

					{error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
									Imię
								</label>
								<input
									id="name"
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									placeholder="Jan"
									required
									disabled={loading}
								/>
							</div>

							<div>
								<label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
									Nazwisko
								</label>
								<input
									id="surname"
									type="text"
									name="surname"
									value={formData.surname}
									onChange={handleChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									placeholder="Kowalski"
									required
									disabled={loading}
								/>
							</div>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<input
								id="email"
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								placeholder="twój@email.com"
								required
								disabled={loading}
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
								Hasło
							</label>
							<input
								id="password"
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								placeholder="••••••••"
								required
								disabled={loading}
							/>
						</div>

						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
								Potwierdź hasło
							</label>
							<input
								id="confirmPassword"
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								placeholder="••••••••"
								required
								disabled={loading}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
							{loading ? 'Rejestrowanie...' : 'Zarejestruj się'}
						</button>
					</form>

					<p className="mt-6 text-center text-gray-600">
						Już masz konto?{' '}
						<Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
							Zaloguj się
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
