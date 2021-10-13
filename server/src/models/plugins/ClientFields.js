const Joi = require('joi')
const { array, string } = Joi.types()

function clientFieldsPlugin(schema, options) {
	let nestedDocumentFields = options && options.nestedDocumentFields || []
	const invalid = array.items( string ).validate(nestedDocumentFields).error
	if ( invalid ) {
		throw new Error(invalid.details[0].message)
	}
	schema.method('_nestedDocumentFields', () => nestedDocumentFields)
	schema.method('clientFields', internal.clientFields)
}

const internal = {

	clientFields(options) {
		const nestedDocumentFields = this._nestedDocumentFields()
		const { formatId, keep, remove } = options || {}
		if ( keep && remove ) {
			throw new Error('"keep" and "remove" options cannot be used simultaneously')
		}
		let document = this.toObject()
		if ( typeof formatId==='undefined' || formatId ) {
			const id = document._id
			delete document._id
			document = { id, ...document }
		}
		if ( Array.isArray(remove) ) {
			nestedDocumentFields.forEach( field => {
				if ( this[field] && !remove.includes(field) ) {
					if ( Array.isArray(this[field]) ) {
						document[field] = this[field].map( subDoc => subDoc.clientFields(options) )
					} else {
						document[field] = this[field].clientFields(options)
					}
				}
			})
			remove.forEach( key => delete document[key] )
		}
		if ( Array.isArray(keep) ) {
			let entries = Object.entries(document)
			entries = entries.filter( entry => keep.includes(entry[0]) )
			document = Object.fromEntries(entries)
			nestedDocumentFields.forEach( field => {
				if ( this[field] && keep.includes(field) ) {
					if ( Array.isArray(this[field]) ) {
						document[field] = this[field].map( subDoc => subDoc.clientFields(options) )
					} else {
						document[field] = this[field].clientFields(options)
					}
				}
			})
		}
		return document
	}

}

module.exports = clientFieldsPlugin
