const Joi = require('joi')
const { string } = Joi.types()
const Label = require('../models/Label')

const errorStatus = {
	INVALID_PARENT_ID: 422
}

const LabelController = {

	async create(request, response, next) {
		try {
			const requestSchema = Joi.object({
				name: string.required(),
				color: string.hex().length(6),
				parentId: string.pattern(/^[\da-f]{24}(.\d+)*$/).rule({ message: 'No such label with id {#value}' })
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { path, message } = badBody.details[0]
				const code = path[0]==='parentId' ? 422 : 400
				response.status(code).json({ message })
			} else {
				const created = await Label.create(request.userId, request.body)
				response.status(201).json(created.clientFields({ remove: ['userId'] }))
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	}

}

module.exports = LabelController
