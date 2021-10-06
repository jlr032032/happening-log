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
		return deleted || internal.error({ code: 'INVALID_HAPPENING_ID', happeningId })
	}

	async deleteLabels(userId, deletedIds) {
		const queryFilter = { userId, 'labels._id': { $in: deletedIds } }
		const happenings = await HappeningOdm.find(queryFilter)
		if ( happenings ) {
			deletedIds.forEach( id => {
				happenings.forEach( happening => {
					const index = happening.labels.findIndex( label => label._id===id )
					index>-1 && happening.labels.splice(index, 1)
				})
			})
			let deletions = []
			happenings.forEach( happening => {
				happening.labels.length || ( happening.labels = undefined )
				deletions.push(happening.save())
			})
			await Promise.all(deletions)
		}
	}

	async find(userId, happeningId) {
		const [ happening ] = await HappeningOdm.find({ _id: happeningId, userId })
		happening || internal.error({ code: 'INVALID_HAPPENING_ID', happeningId })
		return happening
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
		return updated || internal.error({ code: 'INVALID_HAPPENING_ID', happeningId })
	}

	async updateLabels(userId, updated) {
		const ids = updated.map( data => data._id )
		const queryFilter = { userId, 'labels._id': { $in: ids } }
		const happenings = await HappeningOdm.find(queryFilter)
		if ( happenings ) {
			updated.forEach( ({ _id, newData }) => {
				newData = newData.clientFields({ formatId: false, remove: ['userId', 'subLabels'] })
				happenings.forEach( happening => {
					let label = happening.labels.find( label => _id===label._id )
					label && label.set(newData)
				})
			})
			const changes = happenings.map( happening => happening.save() )
			await Promise.all(changes)
		}
	}

}

const internal = {

	error(options) {
		const { code, happeningId } = options
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
