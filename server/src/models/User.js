const mongoose = require('mongoose')

let UserOdm

class User {

	constructor() {
		let userSchema = {
			email: { type: String, required: true, unique: true },
			password: { type: String, required: true },
			blocked: Boolean,
			notConfirmed: Boolean,
			signinAttempts: Number
		}
		userSchema = new mongoose.Schema(userSchema, { versionKey: false })
		UserOdm = mongoose.model('User', userSchema)
	}

	async create(userData) {
		const { email } = userData
		const queryOptions = { upsert: true, overwrite: true, new: true }
		return await UserOdm.findOneAndUpdate({ email }, userData, queryOptions)
	}

	async findByCredentials(email, password) {
		let user = await UserOdm.findOne({ email, password })
		return user || internal.error('INVALID_CREDENTIALS')
	}

	async findByEmail(email) {
		return await UserOdm.findOne({ email })
	}

	async update(userData) {
		const { email } = userData
		const queryOptions = { overwrite: true, new: true }
		return await UserOdm.findOneAndUpdate({ email }, userData, queryOptions)
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
