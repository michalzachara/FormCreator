import axios from 'axios'

const instance = axios.create({
	baseURL: 'http://localhost:3000',
	headers: {
		'Content-Type': 'application/json',
	},
})

// Ensure Authorization header is present for each request (reads from localStorage)
instance.interceptors.request.use(config => {
	try {
		const token = localStorage.getItem('token')
		if (token) {
			if (!config.headers) config.headers = {}
			config.headers['Authorization'] = `Bearer ${token}`
		}
	} catch (e) {
		// ignore
	}
	return config
})

export default instance
