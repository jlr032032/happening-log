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
			const badBody = requestSchema.validate().error
			if ( badBody ) {
				response.status(400).json({ message: badBody.details[0].message })
			} else {
				const { ip, body: { email, password } } = request
				let user = await User.findByCredentials(email, password)
				const accessToken = await auth.accessToken(request.ip, user._id)
				const refreshToken = await auth.refreshToken(request.ip, user._id)
				response.status(200).json({ accessToken, refreshToken })
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async refreshToken(request, response, next) {
		try {
			const requestSchema = Joi.object({
				refreshToken: string.pattern(/^[a-zA-Z0-9-._˜+/]+=*$/).required(),
			})
			const badBody = requestSchema.validate().error
			if ( badBody ) {
				const { path, message } = badBody.details[0]
				const code = path[0]==='refreshToken' ? 401 : 400
				response.status(code).json({ message })
			} else {
				const { refreshToken } = request.body
				let access = auth.getAccessToken(request)
				access = await auth.tokenData(access)
				const refresh = await auth.tokenData(refreshToken)
				const tokensGiven = access && refresh
				const ipsMatch = tokensGiven && request.ip===access.ip && access.ip===refresh.ip
				if ( ipsMatch && refresh.refresh ) {
					response.status(200).json({
						accessToken: await auth.accessToken(access.ip, access.userId),
						refreshToken
					})
				} else {
					response.status(401).end()
				}
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	}

}

module.exports = UserController
