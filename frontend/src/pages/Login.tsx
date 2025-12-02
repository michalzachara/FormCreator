import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { login } = useAuth()
	const { success, error: showError } = useToast()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const response = await loginUser({ email, password })
			login(response.user, response.token)
			success(response.message)
			navigate('/')
		} catch (err) {
			let errorMessage = 'Coś poszło nie tak'
			if (err instanceof Error) {
				errorMessage = err.message
			} else if (typeof err === 'object' && err !== null && 'response' in err) {
				const apiError = err as any
				errorMessage = apiError.response?.data?.message || 'Błąd logowania'
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
					<h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Logowanie</h2>

					{error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
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
								value={password}
								onChange={e => setPassword(e.target.value)}
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
							{loading ? 'Logowanie...' : 'Zaloguj się'}
						</button>
					</form>

					<p className="mt-6 text-center text-gray-600">
						Nie masz konta?{' '}
						<Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
							Zarejestruj się
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
