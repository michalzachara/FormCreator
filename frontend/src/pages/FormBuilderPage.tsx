import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FormBuilder from '../components/FormBuilder'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'

export default function FormBuilderPage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user, isLoading } = useAuth()
	const { error } = useToast()

	useEffect(() => {
		if (isLoading) return
		if (!user) {
			navigate('/login')
		}
	}, [user, isLoading, navigate])

	if (!id) return null

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-indigo-600">Dodaj pytania</h1>
					<button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">
						Powrót
					</button>
				</div>

				<FormBuilder testId={id} onClose={() => navigate(-1)} onSaved={() => navigate(`/test/${id}`)} inline />
			</div>
		</div>
	)
}
