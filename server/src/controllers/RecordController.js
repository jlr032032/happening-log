const Joi = require('joi')
const Record = require('../models/Record')
const Happening = require('../models/Happening')
const dataTypes = require('../helpers/DataTypes')
const { number, string, array, any } = Joi.types()

const errorStatus = {
	INVALID_HAPPENING_ID: 422,
	INVALID_FIELD: 400,
	INVALID_FIELD_TYPE: 400,
	INVALID_RECORD_ID: 404
}

const RecordController = {

	async create(request, response, next) {
		try {
			const { happeningId } = request.params
			const requestSchema = Joi.object({
				happeningId: string.valid(happeningId)
					.messages({ 'any.only': 'Happening ids in request URI and body must match' }),
				fields: array.min(1).items({
					id: number.required(),
					value: any.required()
				})
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { path, message } = badBody.details[0]
				const code = path[0]==='happeningId' ? 422 : 400
				response.status(code).json({ message })
			} else {
				let { userId, body: { fields } } = request
				const happening = await Happening.find(userId, happeningId)
				fields = internal.castData(happening, fields)
				const record = await Record.create(userId, happening, fields)
				response.status(201).json(record.clientFields({ remove: ['userId'] }))
			}
		} catch (error) {
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
				const { userId, params: { recordId } } = request
				const deleted = await Record.delete(userId, recordId)
				response.status(200).json(deleted.clientFields({ remove: ['userId'] }))
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async readByHappeningId(request, response, next) {
		try {
			const requestSchema = Joi.object({})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				response.status(400).json({ message: badBody.details[0].message })
			} else {
				const { userId, params: { happeningId } } = request
				let records = await Record.readByHappeningId(userId, happeningId)
				records = records.map( record => record.clientFields({ remove: ['userId'] }))
				response.status(200).json(records)
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	},

	async update(request, response, next) {
		try {
			const { happeningId, recordId } = request.params
			const requestSchema = Joi.object({
				id: string.valid(recordId).messages({ 'any.only': 'Record ids in request URI and body must match' }),
				happeningId: string.valid(happeningId)
					.messages({ 'any.only': 'Happening ids in request URI and body must match' }),
				fields: array.min(1).items( Joi.object({
					id: number.required(),
					value: any.required()
				})),
			})
			const badBody = requestSchema.validate(request.body).error
			if ( badBody ) {
				const { path, message } = badBody.details[0]
				const code = path[0]==='happeningId' ? 422 : 400
				response.status(code).json({ message })
			} else {
				let { userId, body: { fields } } = request
				const happening = await Happening.find(userId, happeningId)
				fields = internal.castData(happening, fields)
				const record = await Record.update(userId, happening, recordId, fields)
				response.status(200).json(record.clientFields({ remove: ['userId'] }))
			}
		} catch (error) {
			const code = errorStatus[error.code]
			code ? response.status(code).json({ message: error.message }) : next(error)
		}
	}

}

const internal = {

	castData(happening, recordData) {
		const { fields } = happening
		return recordData
			.map( data => {
				const field = fields.find( field => data.id===field._id )
				field || this.error({ code: 'INVALID_FIELD', fieldId: data.id, happeningId: happening._id })
				const { value, error } = dataTypes.cast(data.value, field.type)
				error && this.error({ code: 'INVALID_FIELD_TYPE', fieldId: field._id, subMessage: error })
				data.value = value
				return data
			})
			.reverse()
			.filter( ({ name }, index, reversed) => index===reversed.findIndex( data => name===data.name ) )
			.reverse()
	},

	error({code, fieldId, happeningId, subMessage}) {
		const message = {
			INVALID_FIELD: `Happening with id ${happeningId} doesn't accept field with id ${fieldId}`,
			INVALID_FIELD_TYPE: `Value error of field with id ${fieldId}: ${subMessage}`
		}
		let error = { code, message: message[code] }
		Error.captureStackTrace(error)
		Object.defineProperty(error, 'stack', { enumerable: true })
		throw error
	}

}

module.exports = RecordController
