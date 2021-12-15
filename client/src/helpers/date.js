const date = {
	
	innerFormat(date) {
		const { pad } = this
		date = new Date(date)
		const YY = date.getFullYear()
		const MM = pad(date.getMonth()+1, 2)
		const DD = pad(date.getDate(), 2)
		return `${YY}-${MM}-${DD}`
	},

	pad(fragment, targetLength) {
		fragment = String(fragment)
		while ( fragment.length < targetLength ) {
			fragment = `0${fragment}`
		}
		return fragment
	},

	utcAndLocal(date) {
		date = new Date(date)
		return {
			utc: date.toJSON(),
			local: internals.getLocalDate(date)
		}
	}

}

const internals = {

	getLocalDate(utc) {
		const { pad } = date
		utc = new Date(utc)
		const YY = pad(utc.getFullYear(), 2)
		const MM = pad(utc.getMonth()+1, 2)
		const DD = pad(utc.getDate(), 2)
		const hh = pad(utc.getHours(), 2)
		const mm = pad(utc.getMinutes(), 2)
		const ss = pad(utc.getSeconds(), 2)
		const uuu = pad(utc.getMilliseconds(), 3)
		let offset = utc.getTimezoneOffset()
		const offsetSign = offset>0 ? '-' : '+'
		const offsetHours = pad( Math.floor( Math.abs(offset)/60 ), 2 )
		const offsetMinutes = pad( Math.abs(offset)%60, 2 )
		offset = `${offsetSign}${offsetHours}:${offsetMinutes}`
		return `${YY}-${MM}-${DD}T${hh}:${mm}:${ss}.${uuu}${offset}`
	}

}

export default date
