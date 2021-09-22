const mongoose = require('mongoose')
const clientFieldsPlugin = require('./plugins/ClientFields')
const Joi = require('joi')
const { string, object } = Joi.types()
const { ObjectId } = mongoose.Types

let SubLabelOdm, LabelOdm

class Label {

	constructor() {
		let subLabelSchema = new mongoose.Schema(null, { versionKey: false })
		subLabelSchema
			.plugin(clientFieldsPlugin, { nestedDocumentFields: ['subLabels'] })
			.add({
				_id: { type: String, required: true },
				name: { type: String, required: true },
				color: String,
				subLabels: { type: [ subLabelSchema ], default: undefined }
			})
		SubLabelOdm = mongoose.model('SubLabel', subLabelSchema)
		let labelSchema = {
			_id: { type: String, required: true },
			userId: { type: mongoose.ObjectId, required: true },
			name: { type: String, required: true },
			color: String,
			subLabels: { type: [ subLabelSchema ], default: undefined }
		}
		labelSchema = new mongoose.Schema(labelSchema, { versionKey: false })
		labelSchema.plugin(clientFieldsPlugin, { nestedDocumentFields: ['subLabels'] })
		LabelOdm = mongoose.model('Label', labelSchema)
	}

	async create(userId, labelData) {
		const { parentId } = labelData
		if ( parentId ) {
			const to = await internal.find({ labelId: parentId, userId })
			to.notFound && internal.error('INVALID_PARENT_ID', parentId)
			labelData._id = ''
			const [ created ] = internal.addSubLabel(to.label, new SubLabelOdm(labelData))
			await to.root.save()
			return created.newData
		} else {
			const created = new LabelOdm({ _id: ObjectId(), userId, ...labelData })
			await created.save()
			return created
		}
	}

	async readAll(userId) {
		return await LabelOdm.find({ userId })
	}

}

const internal = {

	addSubLabel(parentLabel, newSubLabel) {
		const oldId = newSubLabel._id
		let added
		if ( Array.isArray(parentLabel.subLabels) ) {
			let newSubId = 1
			for ( let subLabel of parentLabel.subLabels ) {
				let subId = Number( subLabel._id.match(/\.([^.]+)$/)[1] )
				subId>=newSubId && ( newSubId = subId+1 )
			}
			newSubLabel._id = `${parentLabel._id}.${newSubId}`
			parentLabel.subLabels.push(newSubLabel)
			added = parentLabel.subLabels.slice(-1)[0]
		} else {
			newSubLabel._id = `${parentLabel._id}.1`
			parentLabel.subLabels = [ newSubLabel ]
			added = parentLabel.subLabels[0]
		}
		let updated = [ { _id: oldId, newData: added } ]
		this.updateSubIds(added, updated)
		return updated
	},
	
	descendant(root, id) {
		let label = root
		let parent, index
		for ( let i=0; i<id.length-1; i++ ) {
			let nextId = `${label._id}.${[id[i+1]]}`
			parent = label
			label = label.subLabels && label.subLabels.find( (label, i) => {
				if ( nextId===label._id ) {
					index = i
					return true
				}
			})
			if ( !label ) {
				return {}
			}
		}
		return { label, parent, index }
	},

	error(code, labelId) {
		const message = {
			INVALID_PARENT_ID: `No such label with id ${labelId}`
		}
		let error = { code, message: message[code] }
		Error.captureStackTrace(error)
		Object.defineProperty(error, 'stack', { enumerable: true })
		throw error
	},

	async find({ labelId, userId, root }) {
		const badOptions = Joi
			.object({ labelId: string.required(), userId: string, root: object })
			.or('userId', 'root')
			.validate(arguments[0]).error
		if ( badOptions ) {
			throw new Error(badOptions[0].message)
		}
		const idArray = labelId.split('.')
		const isRoot = idArray.length===1
		root || ( root = await LabelOdm.findOne({ userId, _id: idArray[0] }) )
		if ( root ) {
			if ( isRoot ) {
				return { label: root, root, isRoot }
			} else {
				const { label, parent, index } = this.descendant(root, idArray)
				if ( label ) {
					return { label, root, isRoot, parent, index }
				}
			}
		}
		return { notFound: true }
	},

	updateSubIds(label, updated) {
		Array.isArray(label.subLabels) && label.subLabels.forEach( (subLabel, index) => {
			const oldSubId = subLabel._id
			subLabel._id = `${label._id}.${index+1}`
			updated.push({ _id: oldSubId, newData: { _id: subLabel._id } })
			this.updateSubIds(subLabel, updated)
		})
	}

}

module.exports = new Label()
