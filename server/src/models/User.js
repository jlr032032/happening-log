const mongoose = require('mongoose')
const clientFieldsPlugin = require('./plugins/ClientFields')

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
		userSchema.plugin(clientFieldsPlugin)
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

	async update(userId, userData, options) {
		const { overwrite } = options || {}
		const queryFilter = { _id: userId }
		const queryOptions = { overwrite, new: true }
		return await UserOdm.findOneAndUpdate(queryFilter, userData, queryOptions)
	}

	async readOne(userId) {
		return await UserOdm.findOne({ _id: userId })
	}

	async updatePassword(userId, password, newPassword) {
		let user = await UserOdm.findOne({ _id: userId, password })
		if ( user ) {
			user.password = newPassword
			return await user.save()
		} else {
			throw { code: 'WRONG_PASSWORD', message: 'Wrong password' }
		}
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
