const express = require('express')
const router = require('./router')
const app = express()
const dotenv = require('dotenv')

dotenv.config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)

const port = process.env.PORT
app.listen(port, () => console.log(`Running at http://localhost:${port}`))