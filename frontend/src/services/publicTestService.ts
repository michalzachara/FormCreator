import axios from './axiosInstance'

const API_URL = '/api/public/test'

export interface PublicTest {
	ok: boolean
	test?: {
		_id: string
		title: string
		description: string
		uniqueLink: string
		questions: Array<{
			_id: string
			questionText: string
			media: any[]
			answers: string[]
			order: number
		}>
	}
	message?: string
}

export interface SubmitResult {
	ok: boolean
	score?: number
	total?: number
	percentage?: number
	answerId?: string
	message?: string
}

export const getPublicTest = async (link: string): Promise<PublicTest> => {
	const response = await axios.get(`${API_URL}/${link}`)
	return response.data
}

export const submitPublicTest = async (
	link: string,
	data: {
		name: string
		surname: string
		className: string
		answers: number[]
	}
): Promise<SubmitResult> => {
	const response = await axios.post(`${API_URL}/${link}`, data)
	return response.data
}
