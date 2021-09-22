const express = require('express')
const authorization = require('./middleware/Authorization')
const UserController = require('./controllers/UserController')

// Public access routes

const publicRouter = express.Router()

publicRouter.post('/auth/token', UserController.generateToken)
publicRouter.post('/auth/refreshing', UserController.refreshToken)

// Private access routes

const privateRouter = express.Router()
privateRouter.use(authorization)

module.exports = { publicRouter, privateRouter }
