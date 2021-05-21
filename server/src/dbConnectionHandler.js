const mongoose = require('mongoose')

const dbConnectionHandler = {
	async connect() {
		mongoose.connection.on('open', () =>	console.log('Connected to MongoDB server'))
		mongoose.connection.on('close', () =>	console.log('Closing MongoDB connection'))
		mongoose.connection.on('error', () =>	console.log('MongoDB connection error'))
		const connectionString = process.env.DB_CONN_STRING
		const connectionOptions = {
			useUnifiedTopology: true,
			useNewUrlParser: true
		}
		await mongoose.connect(connectionString, connectionOptions)
	},
	async disconnect() {
		await mongoose.connection.close()
	}
}

module.exports = dbConnectionHandler