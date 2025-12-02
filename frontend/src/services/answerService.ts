import axios from './axiosInstance'

const API_URL = '/api/test'

export interface Answer {
	_id: string
	testId: string
	studentName: string
	studentSurname: string
	studentClass: string
	answers: number[]
	score: number
	submittedAt: string
	createdAt: string
	updatedAt: string
}

export const getAnswers = async (testId: string): Promise<Answer[]> => {
	const response = await axios.get(`${API_URL}/${testId}/submission`)
	return response.data
}

export const submitAnswer = async (
	link: string,
	data: {
		name: string
		surname: string
		className: string
		answers: number[]
	}
) => {
	const response = await axios.post(`http://localhost:3000/api/public/test/${link}`, data)
	return response.data
}
