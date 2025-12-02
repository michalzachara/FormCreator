import axios from './axiosInstance'

const API_URL = '/api/auth'

export interface LoginData {
	email: string
	password: string
}

export interface RegisterData {
	email: string
	password: string
	name: string
	surname: string
}

export interface AuthResponse {
	message: string
	token: string
	user: {
		_id: string
		email: string
		name: string
		surname: string
		createdAt: string
	}
}

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
	const response = await axios.post(`${API_URL}/login`, data)
	return response.data
}

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
	const response = await axios.post(`${API_URL}/register`, data)
	return response.data
}

export const setAuthToken = (token: string) => {
	if (token) {
		axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
		localStorage.setItem('token', token)
	} else {
		delete axios.defaults.headers.common['Authorization']
		localStorage.removeItem('token')
	}
}
