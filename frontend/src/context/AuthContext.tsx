import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { setAuthToken } from '../services/apiService'

export interface User {
	_id: string
	email: string
	name: string
	surname: string
	createdAt: string
}

interface AuthContextType {
	user: User | null
	token: string | null
	isLoading: boolean
	login: (user: User, token: string) => void
	logout: () => void
	setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	// Załaduj dane z localStorage przy montażu
	useEffect(() => {
		const storedToken = localStorage.getItem('token')
		const storedUser = localStorage.getItem('user')

		if (storedToken && storedUser) {
			setToken(storedToken)
			setUser(JSON.parse(storedUser))
			setAuthToken(storedToken)
		}
		setIsLoading(false)
	}, [])

	const login = (userData: User, authToken: string) => {
		setUser(userData)
		setToken(authToken)
		setAuthToken(authToken)
		localStorage.setItem('user', JSON.stringify(userData))
	}

	const logout = () => {
		setUser(null)
		setToken(null)
		setAuthToken('')
		localStorage.removeItem('user')
	}

	return (
		<AuthContext.Provider value={{ user, token, isLoading, login, logout, setUser }}>{children}</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
