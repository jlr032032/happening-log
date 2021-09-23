const Joi = require('joi')
const { string, array } = Joi.types()
const Happening = require('../models/Happening')
const Label = require('../models/Label')

const errorStatus = {
	INVALID_HAPPENING_ID: 404,
	INVALID_LABEL_ID: 422
}

const HappeningController = {

	async create(request, response, next) {
		try {
			const requestSchema = Joi.object({
				name: string.required(),
				labelsIds: array.min(1).items(
					string.pattern(/^[\da-f]{24}(.\d+)*$/).message('No such label with id {#value}')
				),
				fields: array.min(1).items( Joi.object({
					name: string.required(),
					type: string.required().valid('text', 'number', 'date', 'time')
				}))
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { path, message } = badBody.details[0]
				const code = path[0]==='labelsIds' ? 422 : 400
				response.status(code).json({ message })
			} else {
				const { userId, body, body: { labelsIds } } = request
				labelsIds && ( body.labels = await Label.findMany(labelsIds, userId) )
				const created = await Happening.create(userId, body)
				response.status(201).json(created.clientFields({ remove: ['userId'] }))
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},
	
	async readAll(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				response.status(400).json({ message: badBody.details[0].message })
			} else {
				let happenings = await Happening.readAll(request.userId)
				happenings = happenings.map( happening => happening.clientFields({ remove: ['userId'] }) )
				response.status(200).json(happenings)
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async update(request, response, next) {
		try {
			const happeningId = request.params.happeningId
			const requestSchema = Joi.object({
				id: string.valid(happeningId).messages({ 'any.only': 'Happening ids in request URI and body must match' }),
				name: string.required(),
				labelsIds: array.min(1).items(
					string.pattern(/^[\da-f]{24}(.\d+)*$/).message('No such label with id {#value}')
				),
				fields: array.min(1).items( Joi.object({
					name: string.required(),
					type: string.required().valid('text', 'number', 'date', 'time')
				}))
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { path, message } = badBody.details[0]
				const code = path[0]==='labelsIds' ? 422 : 400
				response.status(code).json({ message })
			} else {
				const { userId, body, body: { labelsIds } } = request
				labelsIds && ( body.labels = await Label.findMany(labelsIds, userId) )
				const updated = await Happening.update(userId, happeningId, body)
				response.status(200).json(updated.clientFields({ remove: ['userId'] }))
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	}

}

module.exports = HappeningController
