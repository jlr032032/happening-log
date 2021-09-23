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

}

module.exports = new Happening()
