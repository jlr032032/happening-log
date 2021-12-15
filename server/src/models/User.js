const mongoose = require('mongoose')
const clientFieldsPlugin = require('./plugins/ClientFields')
const mailer = require('../helpers/Mailer')

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

	async updateEmail(userId, newEmail) {
		let [ user, anotherUser ] = await Promise.all([
			UserOdm.findOne({ _id: userId }),
			UserOdm.findOne({ email: newEmail })
		])
		if ( anotherUser && userId!==anotherUser._id.toString() ) {
			throw { code: 'USED_EMAIL', message: 'Already used email' }
		} else {
			user.email = newEmail
			return await user.save()
		}
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

	async delete(userId) {
		return await UserOdm.findOneAndDelete({ _id: userId })
	}

	async resetPassword(email) {
		let user = await UserOdm.findOne({ email })
		if ( user ) {
			const newPassword = internal.randomPassword(8)
			user.password = newPassword
			await user.save()
			const mailContent = 'La nueva contraseña para acceder a su cuenta es:'
				+ `<br/><br/>${newPassword}<br/><br/>Al iniciar sesión, se recomienda`
				+ ' ir a la sección de perfil y actualizarla a una más fácil de usar.'
			mailer.send({
				subject: 'App de Registro de Sucesos | Reinicio de contraseña',
				to: email,
				content: mailContent
			})
			return user
		} else {
			throw { code: 'UNREGISTERED_EMAIL', message: 'Unregistered email' }
		}
	}

	async signIn(email, password) {
		let user = await UserOdm.findOne({ email })
		if ( user ) {
			const queryFilter = { _id: user._id }
			const queryOptions = { overwrite: true }
			if ( user.notConfirmed ) {
				throw { code: 'NOT_CONFIRMED_USER', message: 'Not confirmed user' }
			}
			else if ( user.blocked ) {
				throw { code: 'BLOCKED_USER', message: 'Blocked user' }
			}
			else if ( user.password===password ) {
				user = user.toObject()
				delete user.signinAttempts
				return await UserOdm.findOneAndUpdate(queryFilter, user, queryOptions)
			}
			else if ( user.signinAttempts===2 ) {
				user = user.toObject()
				delete user.signinAttempts
				user.blocked = true
				await UserOdm.findOneAndUpdate(queryFilter, user, queryOptions)
				throw { code: 'JUST_BLOCKED_USER', message: 'User was blocked' }
			}
			else {
				user.signinAttempts = ( user.signinAttempts || 0 ) + 1
				await user.save()
				const message = 'Invalid email address and password combination'
				throw { code: 'INVALID_CREDENTIALS', message }
			}
		} else {
			const message = 'Invalid email address and password combination'
			throw { code: 'INVALID_CREDENTIALS', message }
		}
	}

	async unblock(email) {
		let queryFilter = { email }
		let user = await UserOdm.findOne(queryFilter)
		if ( user ) {
			user = user.toObject()
			delete user.blocked
			queryFilter = { _id: user._id }
			const queryOptions = { overwrite: true }
			await UserOdm.findOneAndUpdate(queryFilter, user, queryOptions)
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
	},

	randomPassword(length) {
		const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'
			+ '234567892345678923456789234567892345678923456789'
		let password = ''
		const factor = chars.length - 1
		for ( let i=0; i<length; i++ ) {
			let randomIndex = Math.round(factor*Math.random())
			password += chars[randomIndex]
		}
		return password
	}

}

module.exports = new User()
