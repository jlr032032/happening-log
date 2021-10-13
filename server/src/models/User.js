const mongoose = require('mongoose')

let UserOdm

class User {

	constructor() {
		let userSchema = {
			email: { type: String, required: true, unique: true },
			password: { type: String, required: true }
		}
		userSchema = new mongoose.Schema(userSchema, { versionKey: false })
		UserOdm = mongoose.model('User', userSchema)
	}

	async findByCredentials(email, password) {
		let user = await UserOdm.findOne({ email, password })
		return user || internal.error('INVALID_CREDENTIALS')
	}

}

const internal = {

	error(code) {
		const message = {
			INVALID_CREDENTIALS: 'Invalid email address and password combination'
		}
		let error = { code, message: message[code] }
		Error.captureStackTrace(error)
		Object.defineProperty(error, 'stack', { enumerable: true })
		throw error
	}

}

module.exports = new User()
