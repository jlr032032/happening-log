const mongoose = require('mongoose')
const clientFieldsPlugin = require('./plugins/ClientFields')
const Joi = require('joi')
const { string, object, number } = Joi.types()
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

	async delete(userId, labelId) {
		const isRoot = labelId.split('.').length===1
		if ( isRoot ) {
			const deleted = await LabelOdm.findOneAndDelete({ _id: labelId, userId })
			deleted || internal.error('INVALID_LABEL_ID', labelId)
			let deletedIds = []
			internal.descendantsIds(deleted, deletedIds)
			return { deleted, deletedIds }
		} else {
			const found = await internal.find({ labelId, userId })
			found.notFound && internal.error('INVALID_LABEL_ID', labelId)
			internal.removeSubLabel({ parentLabel: found.parent, index: found.index })
			await found.root.save()
			let deletedIds = []
			internal.descendantsIds(found.label, deletedIds)
			return { deleted: found.label, deletedIds }
		}
	}

	async deleteByUserId(userId) {
		await LabelOdm.deleteMany({ userId })
	}

	async findMany(labelsIds, userId) {
		let found = []
		if ( !labelsIds.length ) {
			return []
		}
		labelsIds = labelsIds.map( id => {
			const splitId = id.split('.')
			return { whole: id, root: splitId[0], split: splitId }
		})
		const rootsIds = labelsIds
			.map( id => id.root )
			.filter( (id, index, ids) => ids.indexOf(id)===index )
		const roots = await LabelOdm.find({ _id: { $in: rootsIds }, userId })
		for ( let id of labelsIds ) {
			let root = roots.find( root => root._id===id.root )
			let label = root && internal.descendant(root, id.split).label
			label ? found.push(label) : internal.error('INVALID_LABEL_ID', id.whole)
		}
		return found
	}

	async readAll(userId) {
		return await LabelOdm.find({ userId })
	}

	async update(userId, labelId, labelData) {
		let found = await internal.find({ labelId, userId })
		let { parent, isRoot, root, notFound } = found
		notFound && internal.error('INVALID_LABEL_ID', labelId)
		const { parentId } = labelData
		const move = ( parentId && ( !parent || parentId!==parent._id ) ) || ( parentId===null && !isRoot )
		if ( move ) {
			const movementCase = internal.movementCase(parentId, isRoot, root)
			let updated, to, result
			switch ( movementCase ) {
				case 'ROOT_TO_NESTED':
					found.label.set(labelData)
					to = await internal.find({ labelId: parentId, userId })
					to.notFound && internal.error('INVALID_PARENT_ID', parentId)
					parentId.includes(labelId) && internal.error('RECURSIVE_LABEL_NESTING')
					updated = internal.addSubLabel(to.label, found.label)
					await LabelOdm.findOneAndDelete({ _id: labelId, userId })
					await to.root.save()
					return updated
				case 'NESTED_TO_ROOT':
					const oldId = found.label._id
					labelData._id = ObjectId()
					found.label.set(labelData)
					updated = [ { _id: oldId, newData: found.label } ]
					internal.updateSubIds(found.label, updated)
					internal.removeSubLabel({ parentLabel: found.parent, index: found.index })
					await found.root.save()
					root = new LabelOdm({ ...found.label.toObject(), userId })
					await root.save()
					return updated
				case 'NEST_IN_SAME_ROOT':
					found.label.set(labelData)
					to = await internal.find({ labelId: parentId, root: found.root })
					to.notFound && internal.error('INVALID_PARENT_ID', parentId)
					parentId.includes(labelId) && internal.error('RECURSIVE_LABEL_NESTING')
					updated = internal.addSubLabel(to.label, found.label)
					internal.removeSubLabel({ parentLabel: found.parent, index: found.index })
					await to.root.save()
					return updated
				case 'NEST_IN_ANOTHER_ROOT':
					found.label.set(labelData)
					to = await internal.find({ labelId: parentId, userId })
					to.notFound && internal.error('INVALID_PARENT_ID', parentId)
					parentId.includes(labelId) && internal.error('RECURSIVE_LABEL_NESTING')
					internal.removeSubLabel({ parentLabel: found.parent, index: found.index })
					await found.root.save()
					updated = internal.addSubLabel(to.label, found.label)
					await to.root.save()
					return updated
				case 'RECURSIVE_LABEL_NESTING':
					to = await internal.find({ labelId: parentId, userId })
					to.notFound && internal.error('INVALID_PARENT_ID', parentId)
					internal.error('RECURSIVE_LABEL_NESTING')
				default:
					throw new Error(`Unsupported label movement case: ${movementCase}`)
			}
		} else {
			found.label.set(labelData)
			const { label, label: { _id } } = found
			await found.root.save()
			return [{ _id, newData: label }]
		}
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

	descendantsIds(label, ids) {
		ids.push(label._id)
		Array.isArray(label.subLabels) && label.subLabels.forEach( subLabel => {
			this.descendantsIds(subLabel, ids)
		})
	},

	error(code, labelId) {
		const message = {
			INVALID_LABEL_ID: `No such label with id ${labelId}`,
			INVALID_PARENT_ID: `No such label with id ${labelId}`,
			RECURSIVE_LABEL_NESTING: `Labels cannot be nested in itself or its descendants`
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

	movementCase(newParentId, isRoot, root) {
		let movementCase
		const equalRoots = newParentId && root._id===newParentId.split('.')[0]
		const setAsRoot = newParentId===null
		newParentId && isRoot && !equalRoots && ( movementCase = 'ROOT_TO_NESTED' )
		newParentId && !isRoot && equalRoots && ( movementCase = 'NEST_IN_SAME_ROOT' )
		newParentId && !isRoot && !equalRoots && ( movementCase = 'NEST_IN_ANOTHER_ROOT' )
		setAsRoot && !isRoot && ( movementCase = 'NESTED_TO_ROOT' )
		newParentId && isRoot && equalRoots && ( movementCase = 'RECURSIVE_LABEL_NESTING' )
		return movementCase
	},

	removeSubLabel({ parentLabel, labelId, index }) {
		const badOptions = Joi
			.object({ parentLabel: object, labelId: string, index: number })
			.xor('labelId', 'index')
			.validate(arguments[0]).error
		if ( badOptions ) {
			throw new Error(badOptions.details[0].message)
		}
		if ( parentLabel && Array.isArray(parentLabel.subLabels) ) {
			labelId && ( index = parentLabel.findIndex( subLabel => labelId===subLabel._id ) )
			parentLabel.subLabels.splice(index, 1)
			parentLabel.subLabels.length || ( parentLabel.subLabels = undefined )
		}
	},

	updateSubIds(label, updated) {
		Array.isArray(label.subLabels) && label.subLabels.forEach( (subLabel, index) => {
			const oldSubId = subLabel._id
			subLabel._id = `${label._id}.${index+1}`
			updated.push({ _id: oldSubId, newData: subLabel })
			this.updateSubIds(subLabel, updated)
		})
	}

}

module.exports = new Label()
