const mongoose = require('mongoose')
const clientFieldsPlugin = require('./plugins/ClientFields')

let RecordOdm

class Record {

	constructor() {
		let recordSchema = {
			userId: { type: mongoose.ObjectId, required: true },
			happeningId: { type: mongoose.ObjectId, required: true },
			fields: Array
		}
		recordSchema = new mongoose.Schema(recordSchema, { versionKey: false })
		recordSchema.plugin(clientFieldsPlugin)
		RecordOdm = mongoose.model('Record', recordSchema)
	}

	async create(userId, happening, recordData) {
		const record = new RecordOdm({ userId, happeningId: happening._id, fields: recordData })
		return await record.save()
	}

	async readByHappeningId(userId, happeningId) {
		return await RecordOdm.find({ userId, happeningId })
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
