require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
const router = require('./router')
const errorHandler = require('./middleware/ErrorHandler')
const dbConnectionHandler = require('./dbConnectionHandler')

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(cors({ origin: true, credentials: true }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json())
app.use(router)
app.use(express.static(path.join(__dirname, 'static')))
app.use(errorHandler)

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
