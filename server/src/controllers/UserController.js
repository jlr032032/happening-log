const Joi = require('joi')
const User = require('../models/User')
const auth = require('../helpers/Auth')
const mailer = require('../helpers/Mailer')
const { string } = Joi.types()

const errorStatus = {
	INVALID_CREDENTIALS: 401
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
				const { ip, body: { email, password } } = request
				let user = await User.findByCredentials(email, password)
				const accessToken = await auth.accessToken(ip, user._id)
				const refreshToken = await auth.refreshToken(ip, user._id)
				response
					.status(204)
					.cookie('accessToken', accessToken, internal.authCookiesOptions)
					.cookie('refreshToken', refreshToken, internal.authCookiesOptions)
					.end()
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
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
				let { accessToken: access, refreshToken } = request.cookies
				access = await auth.tokenData(access)
				const refresh = await auth.tokenData(refreshToken)
				const tokensGiven = access && refresh
				const ipsMatch = tokensGiven && request.ip===access.ip && access.ip===refresh.ip
				if ( ipsMatch && refresh.refresh ) {
					const newAccessToken = await auth.accessToken(access.ip, access.userId)
					response
						.status(204)
						.cookie('accessToken', newAccessToken, internal.authCookiesOptions)
						.cookie('refreshToken', refreshToken, internal.authCookiesOptions)
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
					.clearCookie('accessToken', internal.authCookiesOptions)
					.clearCookie('refreshToken', internal.authCookiesOptions)
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
				if ( tokenData ) {
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
				response.render('SignupConfirmation', { title, message })
			}
		} catch ( error ) {
			console.log(error)
			title = 'Aviso'
			message = 'La operación no puede ser procesada en este momento.'
			response.render('SignupConfirmation', { title, message })
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
				const userData = { email }
				const updateOptions = { overwrite: false }
				const updated = await User.update(userId, userData, updateOptions)
				response.status(200).json(updated.clientFields({ keep: ['email'] }))
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	}

}

const internal = {

	authCookiesOptions: {
		httpOnly: true,
		secure: false,
		sameSite: 'Strict'
	},

	async signUserUp(options) {
		const { email, password } = options
		const newUser = {
			email,
			password,
			blocked: false,
			notConfirmed: true,
			signinAttempts: 0
		}
		await User.create(newUser)
		const expiresAt = Date.now() + 1200000 // In 20 minutes
		const token = await auth.sign({ email, expiresAt })
		const confirmationUrl = `${process.env.BASE_URL}/user/confirmation/${token}`
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
