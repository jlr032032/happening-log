const auth = require('../helpers/Auth')

async function AuthorizationMiddleware(request, response, next) {
	let token = request.cookies.accessToken
	if ( token ) {
		token = await auth.tokenData(token)
		if ( token && token.access ) {
			if ( Date.now()<token.exp ) {
				request.userId = token.userId
				await next()
			} else {
				response.status(401).json({ code: 'EXPIRED_ACCESS_TOKEN' })
			}
		} else {
			response.status(401).json({ code: 'ACCESS_TOKEN_REQUIRED' })
		}
	} else {
		response.status(401).json({ code: 'ACCESS_TOKEN_REQUIRED' })
	}
}

module.exports = AuthorizationMiddleware
