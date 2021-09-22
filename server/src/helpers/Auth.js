const util = require('util')
const jwt = require('jsonwebtoken')
const jwtSign = util.promisify(jwt.sign)
const jwtVerify = util.promisify(jwt.verify)

const auth = {

	async accessToken(ip, userId) {
		return await this.sign({
			ip,
			userId,
			exp: Date.now() + process.env.TOKEN_SECONDS * 1000,
			access: true
		})
	},

	getAccessToken(request) {
		const header = request.headers.authorization
		const token = header && /^Bearer [a-zA-Z0-9-._˜+/]+=*$/.test(header) && header.split(' ')[1]
		return token || null
	},

	async refreshToken(ip, userId) {
		return await this.sign({
			userId,
			refresh: true,
			ip
		})
	},

	async sign(payload) {
		return await jwtSign(payload, process.env.JWT_SYMMETRIC_KEY)
	},

	async tokenData(token) {
		try {
			return await jwtVerify(token, process.env.JWT_SYMMETRIC_KEY)
		} catch (error) {
			return null
		}
	}

}

module.exports = auth
