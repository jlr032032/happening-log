const mongoose = require('mongoose')
const clientFieldsPlugin = require('./plugins/ClientFields')

let HappeningOdm

class Happening {

	constructor() {
		let labelSchema = {
			_id: { type: String, required: true },
			name: { type: String, required: true },
			color: String
		}
		labelSchema = new mongoose.Schema(labelSchema, { versionKey: false })
		labelSchema.plugin(clientFieldsPlugin)
		let happeningSchema = {
			userId: { type: mongoose.ObjectId, required: true },
			name: { type: String, required: true },
			labels: { type: [ labelSchema ], default: undefined },
			fields: { type: Array, default: undefined }
		}
		happeningSchema = new mongoose.Schema(happeningSchema, { versionKey: false })
		happeningSchema.plugin(clientFieldsPlugin, { nestedDocumentFields: ['labels'] })
		HappeningOdm = mongoose.model('Happening', happeningSchema)
	}

	async create(userId, happeningData) {
		const { labels } = happeningData
		if ( labels ) {
			happeningData.labels = labels
				.filter( (label, index, labels) => index===labels.indexOf(label) )
				.map( label => label.clientFields({ formatId: false, remove: ['userId', 'subLabels'] }) )
		}
		happeningData.userId = userId
		const created = new HappeningOdm(happeningData)
		return await created.save()
	}

	async delete(userId, happeningId) {
		const deleted = await HappeningOdm.findOneAndDelete({ _id: happeningId, userId })
		return deleted || internal.error('INVALID_HAPPENING_ID', happeningId)
	}

	async readAll(userId) {
		return await HappeningOdm.find({ userId })
	}

	async update(userId, happeningId, happeningData) {
		const { labels } = happeningData
		if ( labels ) {
			happeningData.labels = labels
				.filter( (label, index, labels) => index===labels.indexOf(label) )
				.map( label => label.clientFields({ formatId: false, remove: ['userId', 'subLabels'] }) )
		}
		happeningData.userId = userId
		const filter = { _id: happeningId, userId }
		const updated = await HappeningOdm.findOneAndReplace(filter, happeningData, { new: true })
		return updated || internal.error('INVALID_HAPPENING_ID', happeningId)
	}

}

const internal = {

	error(code, happeningId) {
		const message = {
			INVALID_HAPPENING_ID: `No such happening with id ${happeningId}`
		}
		let error = { code, message: message[code] }
		Error.captureStackTrace(error)
		Object.defineProperty(error, 'stack', { enumerable: true })
		throw error
	}

}

module.exports = new Happening()
