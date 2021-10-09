const mongoose = require('mongoose')
const clientFieldsPlugin = require('./plugins/ClientFields')

let RecordOdm

class Record {

	constructor() {
		let fieldSchema = {
			_id: { type: Number, required: true },
			value: { type: mongoose.Mixed, required: true }
		}
		fieldSchema = new mongoose.Schema(fieldSchema, { versionKey: false })
		fieldSchema.plugin(clientFieldsPlugin)
		let recordSchema = {
			userId: { type: mongoose.ObjectId, required: true },
			happeningId: { type: mongoose.ObjectId, required: true },
			fields: { type: [ fieldSchema ] }
		}
		recordSchema = new mongoose.Schema(recordSchema, { versionKey: false })
		recordSchema.plugin(clientFieldsPlugin, { nestedDocumentFields: ['fields'] })
		RecordOdm = mongoose.model('Record', recordSchema)
	}

	async create(userId, happening, recordData) {
		const fields = recordData.map( field => ({ _id: field.id, ...field }) )
		const record = new RecordOdm({ userId, happeningId: happening._id, fields })
		return await record.save()
	}

	async delete(userId, recordId) {
		const deleted = await RecordOdm.findOneAndDelete({ _id: recordId, userId })
		deleted || internal.error('INVALID_RECORD_ID', recordId)
		return deleted
	}

	async readByHappeningId(userId, happeningId) {
		return await RecordOdm.find({ userId, happeningId })
	}

	async update(userId, happening, recordId, recordData) {
		const deleted = await RecordOdm.findOneAndDelete({ _id: recordId, userId })
		deleted || internal.error('INVALID_RECORD_ID', recordId)
		const fields = recordData.map( field => ({ _id: field.id, ...field }) )
		const record = new RecordOdm({ _id: recordId, userId, happeningId: happening._id, fields })
		return await record.save()
	}

}

const internal = {

	error(code, recordId) {
		const message = {
			INVALID_RECORD_ID: `No such record with id ${recordId}`
		}
		let error = { code, message: message[code] }
		Error.captureStackTrace(error)
		Object.defineProperty(error, 'stack', { enumerable: true })
		throw error
	}

}

module.exports = new Record()
