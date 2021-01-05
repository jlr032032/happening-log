const express = require('express')
const router = require('./router')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)

app.listen(port, () => console.log(`Running at http://localhost:${port}`))