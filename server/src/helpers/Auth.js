const util = require('util')
const jwt = require('jsonwebtoken')
const jwtSign = util.promisify(jwt.sign)

const auth = {

	async accessToken(ip, userId) {
		return await this.sign({
			ip,
			userId,
			exp: Date.now() + process.env.TOKEN_SECONDS * 1000,
			access: true
		})
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
	}

}

module.exports = auth
