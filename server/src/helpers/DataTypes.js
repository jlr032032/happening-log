const Joi = require('joi')
const { string, number } = Joi.types()

const DataTypes = {

	cast(value, type) {
		try {
			let schema
			switch ( type ) {
				case 'date':
				case 'datetime':
					internal.validateDatetime(value)
					value.utc = new Date(value.utc)
					break
				case 'number':
					schema = number.strict()
					schema.validate(value).error && internal.error('Invalid value for type "number"')
					value = Number(value)
					break
				case 'text':
					schema = string.strict()
					schema.validate(value).error && internal.error('Invalid value for type "text"')
					value = value.trim()
					break
				default:
					return { error: `Invalid type "${type}"` }
			}
			return { value }
		} catch ( error ) {
			return { error }
		}
	},
	
	changeType(value, oldType, newType) {
		if ( oldType===newType ) {
			return value
		}
		switch ( newType ) {
			case 'date':
			case 'datetime':
				return ['date', 'datetime'].includes(oldType) ? value : null
			case 'number':
				value = Number(value)
				return Number.isNaN(value) ? null : value
			case 'text':
				return oldType==='number' ? String(value) : null
			default:
				internal.error(`Invalid type "${newType}"`)
		}
	},

	equals(a, b) {
		const type = typeof a
		if ( type === typeof b ) {
			switch ( type ) {
				case 'string':
				case 'number':
					return a===b
				case 'object':
					a = Object.entries(a).sort( (a,b) => a[0]>b[0] ? 1 : -1 )
					b = Object.entries(b).sort( (a,b) => a[0]>b[0] ? 1 : -1 )
					if ( a.length===b.length ) {
						for ( let i = 0; i<a.length; i++ ) {
							const [ aProp, aValue ] = a[i]
							const [ bProp, bValue ] = b[i]
							if ( aProp!==bProp || !this.equals(aValue, bValue) ) {
								return false
							}
						}
						return true
					}
					return false
			}
		}
		return false
	}

}

const internal = {

	error(message) {
		throw message
	},

	validateDatePart(year, month, day) {
		( 1<=month && month<=12 ) || this.error('Invalid month')
		if ( [1, 3, 5, 7, 8, 10, 12].includes(month) ) {
			return day<=31 || this.error('Invalid day')
		}
		if ( [4, 6, 9, 11].includes(month) ) {
			return day<=30 || this.error('Invalid day')
		}
		const maxFebruaryDay = year%4 || ( !(year%100) && year%400 ) ? 28 : 29
		return day<=maxFebruaryDay || this.error('Invalid day')
	},

	validateDatetime(value) {
		const typeSchema = Joi.object({
			local: string.required(),
			utc: string.isoDate().required()
		})
		const badType = typeSchema.validate(value).error
		badType && this.error(badType.details[0].message)
		const { local, utc } = value
		let parts = local.match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).\d{3}[+-](\d\d):(\d\d)$/)
		parts || this.error('Invalid local date format')
		parts = parts.slice(1).map( part => Number(part) )
		this.validateDatePart(...parts.slice(0, 3))
		this.validateTimePart(...parts.slice(3, 6))
		this.validateOffsetPart(...parts.slice(6))
		new Date(local).toJSON()===utc || this.error('Local and UTC dates are not equivalent')
		return true
	},

	validateOffsetPart(hour, minute) {
		hour<24 || this.error('Invalid offset hour')
		minute<60 || this.error('Invalid offset minute')
		return true
	},

	validateTimePart(hour, minute, second) {
		hour<24 || this.error('Invalid hour')
		minute<60 || this.error('Invalid minute')
		second<60 || this.error('Invalid second')
		return true
	}

}

module.exports = DataTypes
