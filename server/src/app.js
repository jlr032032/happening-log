require('dotenv').config()
const express = require('express')
const router = require('./router')
const dbConnectionHandler = require('./dbConnectionHandler')

const app = express()
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
