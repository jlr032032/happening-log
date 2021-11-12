const Joi = require('joi')
const User = require('../models/User')
const auth = require('../helpers/Auth')
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
	}

}

const internal = {

	authCookiesOptions: {
		httpOnly: true,
		secure: false,
		sameSite: 'Strict'
	}

}

module.exports = UserController
