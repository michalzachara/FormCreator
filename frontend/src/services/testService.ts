import axios from './axiosInstance'

const API_URL = '/api/test'

export interface Test {
	_id: string
	userId: string
	title: string
	description: string
	uniqueLink: string
	isActive: boolean
	createdAt: string
	updatedAt: string
	questions?: any[]
}

export const getAllTests = async (): Promise<Test[]> => {
	const response = await axios.get(`${API_URL}/all`)
	return response.data
}

export const getTestById = async (id: string): Promise<Test> => {
	const response = await axios.get(`${API_URL}/${id}`)
	return response.data
}

export const createTest = async (data: { title: string; description: string }) => {
	const response = await axios.post(`${API_URL}/new`, data)
	return response.data
}

export const updateTest = async (id: string, data: { title?: string; description?: string; isActive?: boolean }) => {
	const response = await axios.put(`${API_URL}/${id}`, data)
	return response.data
}

export const deleteTest = async (id: string) => {
	const response = await axios.delete(`${API_URL}/${id}`)
	return response.data
}
