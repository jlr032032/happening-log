import axios from 'axios'

export default {

	async get(path) {
		return await internal.request(path, 'get')
	},

	async post(path, body) {
		return await internal.request(path, 'post', body)
	},

	async put(path, body) {
		return await internal.request(path, 'put', body)
	},

	async delete(path) {
		return await internal.request(path, 'delete')
	}

}

const internal = {

	async request(url, method, body) {
		try {
			let requestConfig = {
				url,
				method,
				baseURL: 'http://localhost:3000',
				withCredentials: true
			}
			body && ( requestConfig.data = body )
			return await axios(requestConfig)
		} catch ( error ) {
			if ( error.response ) {
				// Response status code that falls out of the range of 2xx
				return error.response
			} else if ( error.request ) {
				// Request was sent but no response was received
				return null
			} else {
				// Something happened in setting up the request that triggered an error
				console.log(error)
				return null
			}
		}
	}

}
