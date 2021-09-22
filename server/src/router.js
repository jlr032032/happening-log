const express = require('express')
const authorization = require('./middleware/Authorization')
const UserController = require('./controllers/UserController')
const LabelController = require('./controllers/LabelController')

// Public access routes

const publicRouter = express.Router()

publicRouter.post('/auth/token', UserController.generateToken)
publicRouter.post('/auth/refreshing', UserController.refreshToken)

// Private access routes

const privateRouter = express.Router()
privateRouter.use(authorization)

privateRouter.post('/labels', LabelController.create)
privateRouter.get('/labels', LabelController.readAll)

module.exports = { publicRouter, privateRouter }
