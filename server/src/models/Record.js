const mongoose = require('mongoose')
const clientFieldsPlugin = require('./plugins/ClientFields')
const dataTypes = require('../helpers/DataTypes')

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

	async deleteByHappeningId(userId, happeningId) {
		await RecordOdm.deleteMany({ userId, happeningId })
	}

	async readByHappeningId(userId, happeningId, last) {
		if ( last ) {
			return await RecordOdm
				.find({ userId, happeningId })
				.sort({ _id: -1 })
				.limit(last)
		} else {
			return await RecordOdm
				.find({ userId, happeningId })
				.sort({ _id: -1 })
		}
	}

	async update(userId, happening, recordId, recordData) {
		const deleted = await RecordOdm.findOneAndDelete({ _id: recordId, userId })
		deleted || internal.error('INVALID_RECORD_ID', recordId)
		const fields = recordData.map( field => ({ _id: field.id, ...field }) )
		const record = new RecordOdm({ _id: recordId, userId, happeningId: happening._id, fields })
		return await record.save()
	}

	async updateFields(userId, happeningId, updates) {
		if ( updates && updates.length ) {
			const sample = updates[0]
			const isTypeUpdate = sample.old.type!==sample.latest.type
			if ( isTypeUpdate ) {
				let records = await RecordOdm.find({ userId, happeningId })
				let changes = []
				records.forEach( record => {
					updates.forEach( ({ old, latest }) => {
						let { fields } = record
						let found = fields.find( ({ _id }) => latest._id===_id )
						if ( found ) {
							found.value = dataTypes.changeType(found.value, old.type, latest.type)
						}
					})
					record.fields = fields.filter( ({ value }) => value!==null && value!==undefined )
					if ( record.fields.length ) {
						changes.push(record.save())
					} else {
						changes.push(RecordOdm.findOneAndDelete({ _id: record._id }))
					}
				})
				await Promise.all(changes)
			}
		}
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
