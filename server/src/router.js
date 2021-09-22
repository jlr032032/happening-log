const express = require('express')
const UserController = require('./controllers/UserController')

// Public access routes

const publicRouter = express.Router()

publicRouter.post('/auth/token', UserController.generateToken)

module.exports = { publicRouter }
