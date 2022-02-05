const Joi = require('joi')
const User = require('../models/User')
const Label = require('../models/Label')
const Happening = require('../models/Happening')
const Record = require('../models/Record')
const auth = require('../helpers/Auth')
const mailer = require('../helpers/Mailer')
const { string } = Joi.types()

const errorStatus = {
	NOT_CONFIRMED_USER: 409,
	INVALID_CREDENTIALS: 401,
	JUST_BLOCKED_USER: 401,
	BLOCKED_USER: 403,
	USED_EMAIL: 409,
	WRONG_PASSWORD: 401,
	UNREGISTERED_EMAIL: 422
}

const UserController = {

	async generateToken(request, response, next) {
		try {
			const requestSchema = Joi.object({
				email: string.email().required(),
				password: string.required()
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				response.status(400).json({ message: badBody.details[0].message })
			} else {
				const { email, password } = request.body
				const user = await User.signIn(email, password)
				const { accessToken, refreshToken } = await auth.token(user.id)
				response
					.status(204)
					.cookie('accessToken', accessToken, internal.accessCookieOptions)
					.cookie('refreshToken', refreshToken, internal.refreshCookieOptions)
					.end()
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			if ( code ) {
				let errorData = { message: error.message }
				code===401 && ( errorData.code = error.code )
				response.status(code).json(errorData)
			} else {
				next(error)
			}
		}
	},

	async refreshToken(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				let { accessToken: access, refreshToken: refresh } = request.cookies
				access = await auth.tokenData(access)
				refresh = await auth.tokenData(refresh)
				const validTokens =
					access && access.access &&
					refresh && refresh.refresh &&
					access.id===refresh.id
				if ( validTokens ) {
					const { accessToken, refreshToken } = await auth.token(refresh.userId)
					response
						.status(204)
						.cookie('accessToken', accessToken, internal.accessCookieOptions)
						.cookie('refreshToken', refreshToken, internal.refreshCookieOptions)
						.end()
				} else {
					response.status(401).end()
				}
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	deleteToken(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				response
					.clearCookie('accessToken', internal.accessCookieOptions)
					.clearCookie('refreshToken', internal.refreshCookieOptions)
					.status(204)
					.end()
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async signUp(request, response, next) {
		try {
			const requestSchema = Joi.object({
				email: string.email().required(),
				password: string.required()
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				response.status(400).json({ message: badBody.details[0].message })
			} else {
				const { email, password } = request.body
				const user = await User.findByEmail(email)
				if ( user ) {
					if ( user.notConfirmed ) {
						await internal.signUserUp({ email, password })
						response.status(204).end()
					} else {
						response.status(409).json({ message: 'Email address already used' })
					}
				} else {
					await internal.signUserUp({ email, password })
					response.status(204).end()
				}
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async confirmSignup(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				let title, message
				const tokenData = await auth.tokenData(request.params.token)
				if ( tokenData && tokenData.action==='signup' ) {
					if ( tokenData.expiresAt > Date.now() ) {
						let user = await User.findByEmail(tokenData.email)
						const { email } = user
						if ( user.notConfirmed ) {
							user = user.toObject()
							delete user.notConfirmed
							const updateOptions = { overwrite: true }
							await User.update(user._id, user, updateOptions)
							title = 'Confirmado'
							message = `El registro de usuario asociado al email ${email} fue confirmado exitosamente.`
						} else {
							title = 'Usuario activo'
							message = `El registro del usuario asociado al email ${email} ya se confirmó previamente.`
						}
					} else {
						title = 'Enlace caducado'
						message = 'Este enlace de confirmación de registro ya caducó. Por favor, generar uno nuevo volviendo a hacer el registro.'
					}
				} else {
					title = 'Enlace inválido'
					message = 'Por favor, hacer el registro mediante un enlace válido generado a través del formulario de registro de la vista de inicio.'
				}
				response.render('Notification', { title, message })
			}
		} catch ( error ) {
			console.log(error)
			title = 'Aviso'
			message = 'La operación no puede ser procesada en este momento.'
			response.render('Notification', { title, message })
		}
	},
	
	async getUser(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				const user = await User.readOne(request.userId)
				response.status(200).json(user.clientFields({ keep: ['email'] }))
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async updateEmail(request, response, next) {
		try {
			const requestSchema = Joi.object({
				email: string.email().required()
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				const { userId, body: { email } } = request
				const updated = await User.updateEmail(userId, email)
				response.status(200).json(updated.clientFields({ keep: ['email'] }))
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async updatePassword(request, response, next) {
		try {
			const requestSchema = Joi.object({
				password: string,
				newPassword: string
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				const { userId, body: { password, newPassword } } = request
				const updated = await User.updatePassword(userId, password, newPassword)
				response.status(200).json(updated.clientFields({ keep: ['email'] }))
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async delete(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				const { userId } = request
				const [ user ] = await Promise.all([
					User.delete(userId),
					Label.deleteByUserId(userId),
					Happening.deleteByUserId(userId),
					Record.deleteByUserId(userId)
				])
				response
					.clearCookie('accessToken', internal.accessCookieOptions)
					.clearCookie('refreshToken', internal.refreshCookieOptions)
					.status(200)
					.json(user.clientFields({ keep: ['email'] }))
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async resetPassword(request, response, next) {
		try {
			const requestSchema = Joi.object({
				email: string.email().required()
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				const user = await User.resetPassword(request.body.email)
				response.status(200).json(user.clientFields({ keep: ['email'] }))
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async sendUnblockingEmail(request, response, next) {
		try {
			const requestSchema = Joi.object({
				email: string.email().required()
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				const { email } = request.body
				const user = await User.findByEmail(email)
				if ( user ) {
					const expiresAt = Date.now() + 1200000 // In 20 minutes
					const payload = { expiresAt, email, action: 'unblock' }
					const token = await auth.sign(payload)
					const unblockingUrl = `${process.env.BASE_URL}/usuario/desbloqueo/${token}`
					const mailContent = 'El desbloqueo de usuario se debe realizar a través del '
						+ `siguiente enlace:<br/><br/><a href="${unblockingUrl}">${unblockingUrl}</a>`
					mailer.send({
						subject: 'App de Registro de Sucesos | Desbloqueo de usuario',
						to: email,
						content: mailContent
					})
					response.status(200).json({ email })
				} else {
					response.status(422).json({ message: `No such user with email ${email}` })
				}
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async unblock(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { message } = badBody.details[0]
				response.status(400).json({ message })
			} else {
				let title, message
				const tokenData = await auth.tokenData(request.params.token)
				if ( tokenData && tokenData.action==='unblock' ) {
					if ( tokenData.expiresAt > Date.now() ) {
						const { email } = tokenData
						await User.unblock(email)
						title = 'Desbloqueado'
						message = `El usuario asociado al email ${email} fue desbloqueado `
							+ 'exitosamente.'
					} else {
						title = 'Enlace caducado'
						message = 'Este enlace de desbloqueo ya caducó. Por favor, generar'
							+ 'uno nuevo volviendo a intentar hacer un inicio de sesión con '
							+ 'el usuario bloqueado.'
					}
				} else {
					title = 'Enlace inválido'
					message = 'Por favor, hacer el desbloqueo mediante un enlace válido '
					 + 'generado por la aplicación al intentar iniciar sesión con un '
					 + 'usuario bloqueado.'
				}
				response.render('Notification', { title, message })
			}
		} catch ( error ) {
			console.log(error)
			title = 'Aviso'
			message = 'La operación no puede ser procesada en este momento.'
			response.render('Notification', { title, message })
		}
	}

}

const internal = {

	accessCookieOptions: {
		httpOnly: true,
		secure: true,
		sameSite: 'None'
	},

	refreshCookieOptions: {
		httpOnly: true,
		secure: true,
		sameSite: 'None',
		path: '/auth/refreshing'
	},

	async signUserUp(options) {
		const { email, password } = options
		const newUser = {
			email,
			password,
			notConfirmed: true
		}
		await User.create(newUser)
		const expiresAt = Date.now() + 1200000 // In 20 minutes
		const payload = { expiresAt, email, action: 'signup' }
		const token = await auth.sign(payload)
		const confirmationUrl = `${process.env.BASE_URL}/usuario/confirmacion/${token}`
		const mailContent = 'La confirmación del registro se debe realizar a través del '
			+ `siguiente enlace:<br/><br/><a href="${confirmationUrl}">${confirmationUrl}</a>`
		mailer.send({
			subject: 'App de Registro de Sucesos | Confirmación de registro de usuario',
			to: email,
			content: mailContent
		})
	}

}

module.exports = UserController
