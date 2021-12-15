function ErrorHandler(error, request, response, next) {
	console.log(error)
	response.status(500).json({ message: 'The request cannot be processed at this time' })
}

module.exports = ErrorHandler