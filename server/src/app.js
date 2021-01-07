const express = require('express')
const router = require('./router')
const app = express()
const dotenv = require('dotenv')
const dbConnectionHandler = require('./dbConnectionHandler')

dotenv.config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)

const port = process.env.PORT
dbConnectionHandler.connect()
	.then( () => app.listen(port, () => console.log(`Listening on port ${port}`)) )
	.then( server => server.on('error', error => {
		console.log(error)
		dbConnectionHandler
			.disconnect()
			.then( () => process.exit(0) )
	}))
	.catch( dbConnectionError => console.log(dbConnectionError) )
