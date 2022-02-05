const util = require('util')
const jwt = require('jsonwebtoken')
const jwtSign = util.promisify(jwt.sign)
const jwtVerify = util.promisify(jwt.verify)

const auth = {

	async token(userId) {
		const id = internals.generateId(10)
		const [ accessToken, refreshToken ] = await Promise.all([
			this.sign({
				id,
				userId,
				exp: Date.now() + process.env.TOKEN_MINUTES * 60000,
				access: true
			}),
			this.sign({
				id,
				userId,
				refresh: true
			})
		])
		return { accessToken, refreshToken }
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

const internals = {

	generateId(length) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz'
			+ '01234567890123456789012345678901234567890123456789'
		let id = ''
		const factor = chars.length - 1
		for ( let i=0; i<length; i++ ) {
			let randomIndex = Math.round(factor*Math.random())
			id += chars[randomIndex]
		}
		return id
	}

}

module.exports = auth
