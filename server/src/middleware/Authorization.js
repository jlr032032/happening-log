const auth = require('../helpers/Auth')

async function AuthorizationMiddleware(request, response, next) {
	let token = request.cookies.accessToken
	token = token && await auth.tokenData(token)
	if ( token && Date.now()<token.exp && token.ip===request.ip && token.access ) {
		request.userId = token.userId
		await next()
	} else {
		response.status(401).end()
	}
}

module.exports = AuthorizationMiddleware
