const Joi = require('joi')
const labelIdSchema = Joi.string().pattern(/^[\da-f]{24}(.\d+)*$/)
const hexIdSchema = Joi.string().pattern(/^[\da-f]{24}$/)

const idsSchemas = Joi.object({
	labelId: labelIdSchema.rule({ message: 'No such label with id {#value}' }),
	happeningId: hexIdSchema.rule({ message: 'No such happening with id {#value}' }),
	recordId: hexIdSchema.rule({ message: 'No such record with id {#value}' })
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
