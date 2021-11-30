import axios from 'axios'
import store from '../store'
import router from '../router'

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
		const response = await this.useAxios(url, method, body)
		const { status, data } = response || { data: {} }
		if ( status===401 ) {
			switch ( data.code ) {
				case 'EXPIRED_ACCESS_TOKEN':
					const refreshing = await this.useAxios('/auth/refreshing', 'post')
					if ( refreshing && refreshing.status===204 ) {
						return await this.useAxios(url, method, body)
					}
				case 'ACCESS_TOKEN_REQUIRED':
					store.commit('setSignedIn', false)
					router.push('/')
					break
				default:
					return response
			}
		}
		return response
	},

	async useAxios(url, method, body) {
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
