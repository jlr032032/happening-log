const Joi = require('joi')
const { string } = Joi.types()
const Label = require('../models/Label')
const Happening = require('../models/Happening')

const errorStatus = {
	INVALID_LABEL_ID: 404,
	INVALID_PARENT_ID: 422,
	RECURSIVE_LABEL_NESTING: 422
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
	},

	async delete(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				response.status(400).json({ message: badBody.details[0].message })
			} else {
				const { userId, params: { labelId } } = request
				const { deleted, deletedIds } = await Label.delete(userId, labelId)
				await Happening.deleteLabels(userId, deletedIds)
				response.status(200).json(deleted.clientFields({ remove: ['userId'] }))
			}
		} catch (error) {
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
				let labels = await Label.readAll(request.userId)
				labels = labels.map( label => label.clientFields({ remove: ['userId'] }) )
				response.status(200).json(labels)
			}
		} catch ( error ) {
			next(error)
		}
	},

	async update(request, response, next) {
		try {
			const labelId = request.params.labelId
			const requestSchema = Joi.object({
				id: string.valid(labelId).messages({ 'any.only': 'Label ids in request URI and body must match' }),
				name: string.required(),
				color: string.hex().length(6),
				parentId: string.pattern(/^[\da-f]{24}(.\d+)*$/).allow(null).rule({ message: 'No such label with id {#value}' })
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { path, message } = badBody.details[0]
				const code = path[0]==='parentId' ? 422 : 400
				response.status(code).json({ message })
			} else {
				const { userId, body, params: { labelId } } = request
				const updated = await Label.update(userId, labelId, body)
				await Happening.updateLabels(userId, updated)
				label = updated[0].newData.clientFields({ remove: ['userId'] })
				response.status(200).json(label)
			}
		} catch ( error ) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	}

}

module.exports = LabelController
