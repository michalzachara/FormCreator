import axios from './axiosInstance'

const API_URL = '/api/questions'

export interface Question {
	_id: string
	testId: string
	questionText: string
	media: Array<{
		type: 'text' | 'image' | 'youtube'
		url?: string
		content?: string
	}>
	answers: string[]
	correctAnswers: string[]
	order: number
	createdAt: string
	updatedAt: string
}

export const addQuestion = async (
	testId: string,
	data: Omit<Question, '_id' | 'testId' | 'createdAt' | 'updatedAt'>
) => {
	const response = await axios.post(`/api/test/${testId}/questions`, data)
	return response.data
}

export const editQuestion = async (
	questionId: string,
	data: Partial<Omit<Question, '_id' | 'testId' | 'createdAt' | 'updatedAt'>>
) => {
	const response = await axios.put(`${API_URL}/${questionId}`, data)
	return response.data
}

export const deleteQuestion = async (questionId: string) => {
	const response = await axios.delete(`${API_URL}/${questionId}`)
	return response.data
}
