const Joi = require('joi')
const { string, array, number } = Joi.types()
const Happening = require('../models/Happening')
const Label = require('../models/Label')
const Record = require('../models/Record')

const errorStatus = {
	INVALID_HAPPENING_ID: 404,
	INVALID_LABEL_ID: 422,
	INVALID_FIELD_ID: 422,
	INVALID_HAPPENING_ID: 422
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
					type: string.required().valid('date', 'datetime', 'number', 'text')
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

	async delete(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				response.status(400).json({ message: badBody.details[0].message })
			} else {
				const { userId, params: { happeningId} } = request
				const deletedHappening = await Happening.delete(userId, happeningId)
				if ( deletedHappening ) {
					await Record.deleteByHappeningId(userId, happeningId)
					response.status(200).json(deletedHappening.clientFields({ remove: ['userId'] }))
				} else {
					response.status(404).json({ message: 'No happening with such id' })
				}
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

	async readOne(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				response.status(400).json({ message: badBody.details[0].message })
			} else {
				const { userId, params: { happeningId } } = request
				let happening = await Happening.find(userId, happeningId)
				response.status(200).json( happening.clientFields({ remove: ['userId'] }) )
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
					id: number,
					name: string.required(),
					type: string.required().valid('date', 'datetime', 'number', 'text')
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
				const { happening: updated, fields, errors } = await Happening.update(userId, happeningId, body)
				await Record.updateFields(userId, happeningId, fields)
				if ( errors ) {
					let responseBody = [ { status: 200, happening: updated.clientFields({ remove: ['userId'] }) } ]
					errors.map( error => responseBody.push({ status: errorStatus[error.code], message: error.message }) )
					response.status(207).json(responseBody)
				} else {
					response.status(200).json(updated.clientFields({ remove: ['userId'] }))
				}
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	}

}

module.exports = HappeningController
