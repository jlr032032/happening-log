const Joi = require('joi')
const labelIdSchema = Joi.string().pattern(/^[\da-f]{24}(.\d+)*$/)

const idsSchemas = Joi.object({
	labelId: labelIdSchema.rule({ message: 'No label with such id' })
})

function UriIdsCheck(request, response, next) {
	const badId = idsSchemas.validate(request.params).error
	if ( badId ) {
		response.status(404).json({ message: badId.details[0].message })
	} else {
		next()
	}
}

module.exports = UriIdsCheck
