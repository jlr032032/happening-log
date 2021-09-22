const Joi = require('joi')

const idsSchemas = Joi.object({})

function UriIdsCheck(request, response, next) {
	const badId = idsSchemas.validate(request.params).error
	if ( badId ) {
		response.status(404).json({ message: badId.details[0].message })
	} else {
		next()
	}
}

module.exports = UriIdsCheck
