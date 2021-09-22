const express = require('express')
const UserController = require('./controllers/UserController')

// Public access routes

const publicRouter = express.Router()

publicRouter.post('/auth/token', UserController.generateToken)
publicRouter.post('/auth/refreshing', UserController.refreshToken)

module.exports = { publicRouter }
