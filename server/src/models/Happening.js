const mongoose = require('mongoose')
const dataTypes = require('../helpers/dataTypes')
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
		let fieldSchema = {
			_id: { type: Number, required: true },
			name: { type: String, required: true },
			type: { type: String, enum: ['date', 'datetime', 'number', 'text'], required: true }
		}
		fieldSchema = new mongoose.Schema(fieldSchema, { versionKey: false })
		fieldSchema.plugin(clientFieldsPlugin)
		let happeningSchema = {
			userId: { type: mongoose.ObjectId, required: true },
			name: { type: String, required: true },
			labels: { type: [ labelSchema ], default: undefined },
			fields: { type: [ fieldSchema ], default: undefined }
		}
		happeningSchema = new mongoose.Schema(happeningSchema, { versionKey: false })
		happeningSchema.plugin(clientFieldsPlugin, { nestedDocumentFields: ['labels', 'fields'] })
		HappeningOdm = mongoose.model('Happening', happeningSchema)
	}

	async create(userId, happeningData) {
		const { fields, labels } = happeningData
		happeningData.fields = fields.map( (field, index) => ({ _id: index+1, ...field }) )
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
		const filter = { _id: happeningId, userId }
		const oldHappening = await HappeningOdm.findOne(filter)
		const oldFields = oldHappening.fields
		const { labels, fields: newFields } = happeningData
		const fieldUpdates = internal.updateFields(newFields, oldFields, happeningId)
		happeningData.fields = fieldUpdates.fields
		if ( labels ) {
			happeningData.labels = labels
				.filter( (label, index, labels) => index===labels.indexOf(label) )
				.map( label => label.clientFields({ formatId: false, remove: ['userId', 'subLabels'] }) )
		}
		happeningData.userId = userId
		const happening = await HappeningOdm.findOneAndReplace(filter, happeningData, { new: true })
		happening || internal.error({ code: 'INVALID_HAPPENING_ID', happeningId })
		let returnValue = { happening, fields: fieldUpdates.updated }
		fieldUpdates.errors && ( returnValue.errors = fieldUpdates.errors )
		return returnValue
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
	},

	updateFields(newFields, oldFields, happeningId) {
		oldFields || ( oldFields = [] )
		let newId = 1
		let updated = []
		let errors = []
		oldFields.forEach( ({ _id }) => _id>=newId && ( newId = _id+1 ) )
		let fields = []
		for ( let newField of newFields ) {
			const fieldExists = newField.id
			if ( fieldExists ) {
				const oldField = oldFields.find( ({ _id }) => newField.id===_id )
				if ( oldField ) {
					newField._id = newField.id
					delete newField.id
					dataTypes.equals(oldField.toObject(), newField) || updated.push({ old: oldField, latest: newField })
					fields.push(newField)
				} else {
					errors.push({
						code: 'INVALID_FIELD_ID',
						message: `No such field with id ${newField.id} in happening with id ${happeningId}`
					})
				}
			} else {
				newField._id = newId
				newId++
				fields.push(newField)
			}
		}
		return errors.length ? { fields, updated, errors } : { fields, updated }
	}

}

module.exports = new Happening()
